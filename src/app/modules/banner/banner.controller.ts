import httpStatus from "http-status";
import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { BannerService } from "./banner.service";
import AppError from "../../shared/ApiError";

const createBanner = catchAsync(async (req: Request, res: Response) => {
  const file = req.file;

  if (!file) {
    throw new AppError(httpStatus.BAD_REQUEST, "Banner image is required");
  }

  const result = await BannerService.createBanner(file, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Banner created successfully",
    data: result,
  });
});

const getAllBanners = catchAsync(async (req: Request, res: Response) => {
  const result = await BannerService.getAllBanners();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Banners fetched successfully",
    data: result,
  });
});

const getBannerById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await BannerService.getBannerById(id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Banner fetched successfully",
    data: result,
  });
});

const updateBanner = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await BannerService.updateBanner(id as string, req.file, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Banner updated successfully",
    data: result,
  });
});

const deleteBanner = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await BannerService.deleteBanner(id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Banner deleted successfully",
    data: result,
  });
});

export const BannerController = {
  createBanner,
  getAllBanners,
  getBannerById,
  updateBanner,
  deleteBanner,
};