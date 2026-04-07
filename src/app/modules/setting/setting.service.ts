
import httpStatus from "http-status";
import AppError from "../../shared/ApiError";
import { prisma } from "../../shared/Prisma";

const getSetting = async () => {
  return await prisma.setting.findFirst();
};

const createLogo = async (file: Express.Multer.File) => {
  const fileData = file as Express.MulterS3.File;

  if (!fileData?.location) {
    throw new AppError(httpStatus.BAD_REQUEST, "Logo upload failed");
  }

  const existing = await prisma.setting.findFirst();

  if (existing) {
    throw new AppError(httpStatus.BAD_REQUEST, "Setting already exists");
  }

  return await prisma.setting.create({
    data: {
      logo: fileData.location,
    },
  });
};

const updateLogo = async (file: Express.Multer.File) => {
  const fileData = file as Express.MulterS3.File;

  if (!fileData?.location) {
    throw new AppError(httpStatus.BAD_REQUEST, "Logo upload failed");
  }

  const existing = await prisma.setting.findFirst();

  if (!existing) {
    throw new AppError(httpStatus.NOT_FOUND, "Setting not found");
  }

  return await prisma.setting.update({
    where: { id: existing.id },
    data: {
      logo: fileData.location,
    },
  });
};

const deleteSetting = async () => {
  const existing = await prisma.setting.findFirst();

  if (!existing) {
    throw new AppError(httpStatus.NOT_FOUND, "Setting not found");
  }

  return await prisma.setting.delete({
    where: { id: existing.id },
  });
};

export const SettingService = {
  getSetting,
  createLogo,
  updateLogo,
  deleteSetting,
};