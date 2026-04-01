import { Request, Response } from "express";
import httpStatus from "http-status";

import { UserServices } from "./user.service";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { AuthRequest } from "../../middlewares/AuthGurd";

const registerUser = catchAsync(async (req: Request, res: Response) => {
  const result = await UserServices.registerUser(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "User registered successfully",
    data: result,
  });
});



const loginUser = catchAsync(async (req: Request, res: Response) => {
  const result = await UserServices.loginUser(req.body);

  res.cookie("accessToken", result.accessToken, {
    httpOnly: true,
    secure: false, // production এ true
    sameSite: "lax", // production cross-site হলে "none"
    maxAge: 150 * 24 * 60 * 60 * 1000, // 150 days
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User logged in successfully",
    data: result,
  });
});






const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  const result = await UserServices.forgotPassword(req.body.email);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Forgot password request processed",
    data: result,
  });
});

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await UserServices.getAllUsers();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Users fetched successfully",
    data: result,
  });
});

const getUserById = catchAsync(async (req: Request, res: Response) => {
  const result = await UserServices.getUserById(req.params.id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User fetched successfully",
    data: result,
  });
});


const getMe = catchAsync(async (req: AuthRequest, res: Response) => {
  const result = await UserServices.getMe(req.user!.userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Profile fetched successfully",
    data: result,
  });
});


const updateUser = catchAsync(async (req: Request, res: Response) => {
  const payload = { ...req.body };

  if (req.file) {
    payload.profileImage = (req.file as Express.MulterS3.File).location;
  }

  const result = await UserServices.updateUser(req.params.id as string, payload);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User updated successfully",
    data: result,
  });
});

const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const result = await UserServices.deleteUser(req.params.id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User deleted successfully",
    data: result,
  });
});

const blockUser = catchAsync(async (req: Request, res: Response) => {
  const result = await UserServices.blockUser(req.params.id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User blocked successfully",
    data: result,
  });
});

const unblockUser = catchAsync(async (req: Request, res: Response) => {
  const result = await UserServices.unblockUser(req.params.id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User unblocked successfully",
    data: result,
  });
});

export const UserControllers = {
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