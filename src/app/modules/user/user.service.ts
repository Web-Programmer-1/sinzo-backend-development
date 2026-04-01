import httpStatus from "http-status";
import AppError from "../../shared/ApiError";
import { comparePassword, hashPassword } from "../../../util/bcryptJs";
import { prisma } from "../../shared/Prisma";
import { createToken } from "../../../util/jwt";
import { UserStatus } from "@prisma/client";

const registerUser = async (payload: any) => {
  const isUserExists = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (isUserExists) {
    throw new AppError(httpStatus.BAD_REQUEST, "User already exists");
  }

  const hashedPassword = await hashPassword(payload.password);

  const result = await prisma.user.create({
    data: {
      ...payload,
      password: hashedPassword,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      fullName: true,
      country: true,
      city: true,
      area: true,
      addressLine: true,
      profileImage: true,
      phone: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return result;
};




const loginUser = async (payload: { email: string; password: string }) => {
  const user = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  if (user.status === UserStatus.BLOCKED) {
    throw new AppError(httpStatus.FORBIDDEN, "User is blocked");
  }

  const isPasswordMatched = await comparePassword(
    payload.password,
    user.password
  );

  if (!isPasswordMatched) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid email or password");
  }

  const accessToken = createToken(
    {
      userId: user.id,
      role: user.role,
    },
    process.env.JWT_ACCESS_SECRET as string ,
    process.env.JWT_ACCESS_EXPIRES_IN || "90d"
  );

  return {
    accessToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      fullName: user.fullName,
      country: user.country,
      city: user.city,
      area: user.area,
      addressLine: user.addressLine,
      profileImage: user.profileImage,
      phone: user.phone,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
  };
};








const forgotPassword = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  return {
    message: "Forgot password flow placeholder. Later email/token add korba.",
  };
};

const getAllUsers = async () => {
  const result = await prisma.user.findMany({
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      fullName: true,
      country: true,
      city: true,
      area: true,
      addressLine: true,
      profileImage: true,
      phone: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return result;
};

const getUserById = async (id: string) => {
  const result = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      fullName: true,
      country: true,
      city: true,
      area: true,
      addressLine: true,
      profileImage: true,
      phone: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  return result;
};

const getMe = async (userId: string) => {
  const result = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      fullName: true,
      country: true,
      city: true,
      area: true,
      addressLine: true,
      profileImage: true,
      phone: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  return result;
};

const updateUser = async (id: string, payload: any) => {
  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  if (payload.password) {
    payload.password = await hashPassword(payload.password);
  }

  const result = await prisma.user.update({
    where: { id },
    data: payload,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      fullName: true,
      country: true,
      city: true,
      area: true,
      addressLine: true,
      profileImage: true,
      phone: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return result;
};

const deleteUser = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  await prisma.user.delete({
    where: { id },
  });

  return null;
};

const blockUser = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  const result = await prisma.user.update({
    where: { id },
    data: {
      status: "BLOCKED",
    },
  });

  return result;
};

const unblockUser = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  const result = await prisma.user.update({
    where: { id },
    data: {
      status: "ACTIVE",
    },
  });

  return result;
};

export const UserServices = {
  registerUser,
  loginUser,
  forgotPassword,
  getAllUsers,
  getUserById,
  getMe,
  updateUser,
  deleteUser,
  blockUser,
  unblockUser,
};