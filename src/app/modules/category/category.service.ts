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

const getAllCategories = async () => {
  const result = await prisma.category.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return result;
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