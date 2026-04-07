
import httpStatus from "http-status";
import AppError from "../../shared/ApiError";
import { prisma } from "../../shared/Prisma";

const createBanner = async (
  file: Express.Multer.File,
  payload: { sortOrder?: string | number }
) => {
  const fileData = file as Express.MulterS3.File;

  if (!fileData?.location) {
    throw new AppError(httpStatus.BAD_REQUEST, "Image upload failed");
  }

  const result = await prisma.banner.create({
    data: {
      image: fileData.location,
      sortOrder: payload?.sortOrder ? Number(payload.sortOrder) : 0,
    },
  });

  return result;
};

const getAllBanners = async () => {
  const result = await prisma.banner.findMany({
    orderBy: [
      { sortOrder: "asc" },
      { createdAt: "desc" },
    ],
  });

  return result;
};

const getBannerById = async (id: string) => {
  const result = await prisma.banner.findUnique({
    where: {
      id,
    },
  });

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "Banner not found");
  }

  return result;
};

const updateBanner = async (
  id: string,
  file: Express.Multer.File | undefined,
  payload: { sortOrder?: string | number }
) => {
  const existingBanner = await prisma.banner.findUnique({
    where: {
      id,
    },
  });

  if (!existingBanner) {
    throw new AppError(httpStatus.NOT_FOUND, "Banner not found");
  }

  let image = existingBanner.image;

  if (file) {
    const fileData = file as Express.MulterS3.File;

    if (!fileData?.location) {
      throw new AppError(httpStatus.BAD_REQUEST, "Image upload failed");
    }

    image = fileData.location;
  }

  const result = await prisma.banner.update({
    where: {
      id,
    },
    data: {
      image,
      sortOrder:
        payload?.sortOrder !== undefined
          ? Number(payload.sortOrder)
          : existingBanner.sortOrder,
    },
  });

  return result;
};

const deleteBanner = async (id: string) => {
  const existingBanner = await prisma.banner.findUnique({
    where: {
      id,
    },
  });

  if (!existingBanner) {
    throw new AppError(httpStatus.NOT_FOUND, "Banner not found");
  }

  const result = await prisma.banner.delete({
    where: {
      id,
    },
  });

  return result;
};

export const BannerService = {
  createBanner,
  getAllBanners,
  getBannerById,
  updateBanner,
  deleteBanner,
};