import httpStatus from "http-status";
import AppError from "../../shared/ApiError";
import { prisma } from "../../shared/Prisma";
import { TCategoryPayload } from "./category.interface";

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

  return result;
};




const getAllCategories = async (query: Record<string, any>) => {
  const searchTerm = query.searchTerm || "";
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const whereConditions = searchTerm
    ? {
        title: {
          contains: searchTerm,
          mode: "insensitive" as const,
        },
      }
    : {};

  const result = await prisma.category.findMany({
    where: whereConditions,
    orderBy: {
      createdAt: "desc",
    },
    skip,
    take: limit,
  });

  const total = await prisma.category.count({
    where: whereConditions,
  });

  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
    data: result,
  };
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

  return null;
};

export const CategoryServices = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};