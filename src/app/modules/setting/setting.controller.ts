import httpStatus from "http-status";
import { Request, Response } from "express";

import { SettingService } from "./setting.service";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import AppError from "../../shared/ApiError";

const getSetting = catchAsync(async (req: Request, res: Response) => {
  const result = await SettingService.getSetting();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Setting fetched successfully",
    data: result,
  });
});

const createLogo = catchAsync(async (req: Request, res: Response) => {
  if (!req.file) {
    throw new AppError(httpStatus.BAD_REQUEST, "Logo image is required");
  }

  const result = await SettingService.createLogo(req.file);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Logo created successfully",
    data: result,
  });
});

const updateLogo = catchAsync(async (req: Request, res: Response) => {
  if (!req.file) {
    throw new AppError(httpStatus.BAD_REQUEST, "Logo image is required");
  }

  const result = await SettingService.updateLogo(req.file);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Logo updated successfully",
    data: result,
  });
});

const deleteSetting = catchAsync(async (req: Request, res: Response) => {
  const result = await SettingService.deleteSetting();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Setting deleted successfully",
    data: result,
  });
});

export const SettingController = {
  getSetting,
  createLogo,
  updateLogo,
  deleteSetting,
};