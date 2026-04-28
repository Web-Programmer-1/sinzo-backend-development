import httpStatus from "http-status";
import AppError from "../../shared/ApiError";
import { prisma } from "../../shared/Prisma";
import { TCategoryPayload } from "./category.interface";
import redis from "../../../config/redis";
import { invalidateAllCategoriesCache } from "../../../helper/redisCategoryInvalitor";

const createCategory = async (payload: TCategoryPayload) => {
  const { title, thumbnailImage } = payload;

  if (!title) {
    throw new AppError(httpStatus.BAD_REQUEST, "Title is required");
  }

  const existingCategory = await prisma.category.findFirst({
    where: {
      title: {
        equals: title,
        mode: "insensitive",
      },
    },
  });

  if (existingCategory) {
    throw new AppError(httpStatus.BAD_REQUEST, "Category already exists");
  }

  const result = await prisma.category.create({
    data: {
      title,
      thumbnailImage: thumbnailImage || "",
    },
  });
await invalidateAllCategoriesCache();
  return result;
};







const getAllCategories = async (query: Record<string, any>) => {
  const searchTerm = query.searchTerm || "";
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;

  // ✓ clean cache key — undefined/empty value বাদ
  const params = new URLSearchParams(
    Object.entries({ searchTerm, page: String(page), limit: String(limit) })
      .filter(([_, v]) => v !== "" && v !== undefined)
  ).toString();
  const cacheKey = `categories:${params}`;

  try {
    const cachedData = await redis.get(cacheKey);
    if (cachedData) return JSON.parse(cachedData);
  } catch (error) {
    console.error('Redis GET Error:', error);
  }

  const skip = (page - 1) * limit;

  const whereConditions = searchTerm
    ? { title: { contains: searchTerm, mode: "insensitive" as const } }
    : {};

  const [result, total] = await Promise.all([
    prisma.category.findMany({
      where: whereConditions,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.category.count({ where: whereConditions }),
  ]);

  const responseData = {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
    data: result,
  };

  try {
    await redis.setex(cacheKey, 300, JSON.stringify(responseData));
  } catch (error) {
    console.error('Redis SET Error:', error);
  }

  return responseData;
};








const getCategoryById = async (id: string) => {
  const result = await prisma.category.findUnique({
    where: { id },
    include: {
      products: true,
    },
  });

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "Category not found");
  }

  return result;
};

const updateCategory = async (id: string, payload: TCategoryPayload) => {
  const category = await prisma.category.findUnique({
    where: { id },
  });

  if (!category) {
    throw new AppError(httpStatus.NOT_FOUND, "Category not found");
  }

  if (payload.title) {
    const existingCategory = await prisma.category.findFirst({
      where: {
        id: {
          not: id,
        },
        title: {
          equals: payload.title,
          mode: "insensitive",
        },
      },
    });

    if (existingCategory) {
      throw new AppError(httpStatus.BAD_REQUEST, "Category title already exists");
    }
  }

  const result = await prisma.category.update({
    where: { id },
    data: {
      title: payload.title ?? category.title,
      thumbnailImage: payload.thumbnailImage ?? category.thumbnailImage,
    },
  });
await invalidateAllCategoriesCache();
  return result;
};

const deleteCategory = async (id: string) => {
  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      products: true,
    },
  });

  if (!category) {
    throw new AppError(httpStatus.NOT_FOUND, "Category not found");
  }

  if (category.products.length > 0) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "This category has products. Delete products first."
    );
  }

  await prisma.category.delete({
    where: { id },
  });
await invalidateAllCategoriesCache();
  return null;
};

export const CategoryServices = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};