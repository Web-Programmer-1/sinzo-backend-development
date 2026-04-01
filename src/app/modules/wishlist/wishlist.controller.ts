import httpStatus from "http-status";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { WishlistService } from "./wishlist.service";
import { Request, Response } from "express";

const addToWishlist = catchAsync(async (req, res) => {
  const result = await WishlistService.addToWishlist(req);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Product added to wishlist successfully",
    data: result,
  });
});

const getMyWishlist = catchAsync(async (req, res) => {
  const result = await WishlistService.getMyWishlist(req);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Wishlist retrieved successfully",
    data: result,
  });
});

const removeFromWishlist = catchAsync(async (req, res) => {
  const result = await WishlistService.removeFromWishlist(req);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Wishlist item removed successfully",
    data: result,
  });
});

const removeWishlistByProductId = catchAsync(async (req, res) => {
  const result = await WishlistService.removeWishlistByProductId(req);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Wishlist item removed successfully",
    data: result,
  });
});

const toggleWishlist = catchAsync(async (req:Request, res:Response) => {
  const result = await WishlistService.toggleWishlist(req);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message:
      result.action === "ADDED"
        ? "Product added to wishlist successfully"
        : "Product removed from wishlist successfully",
    data: result,
  });
});

const clearMyWishlist = catchAsync(async (req, res) => {
  await WishlistService.clearMyWishlist(req);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Wishlist cleared successfully",
    data: null,
  });
});

const getWishlistCount = catchAsync(async (req, res) => {
  const result = await WishlistService.getWishlistCount(req);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Wishlist count retrieved successfully",
    data: result,
  });
});

export const WishlistController = {
  addToWishlist,
  getMyWishlist,
  removeFromWishlist,
  removeWishlistByProductId,
  toggleWishlist,
  clearMyWishlist,
  getWishlistCount,
};