import { Response  , Request } from "express";
import httpStatus from "http-status";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { ReviewServices } from "./review.service";
import { AuthRequest } from "../../middlewares/AuthGurd";
import AppError from "../../shared/ApiError";

const createReview = catchAsync(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    throw new AppError(httpStatus.UNAUTHORIZED,"Unauthorized");
  }

  const result = await ReviewServices.createReview(userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Review created successfully",
    data: result,
  });
});




const getReviewsByProduct = catchAsync(
  async (req: Request, res: Response) => {
    const { productId } = req.params as { productId: string };

    const result = await ReviewServices.getReviewsByProduct(
      productId,
      req.query
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Reviews fetched successfully",
      data: result,
    });
  }
);




const updateReview = catchAsync(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized");
  }

  const result = await ReviewServices.updateReview(
    req.params.reviewId as string,
    userId,
    req.body
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Review updated successfully",
    data: result,
  });
});








const deleteReview = catchAsync(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId ;
  const role = req.user?.role;

  if (!userId || !role) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized");
  }

  await ReviewServices.deleteReview(req.params.reviewId as string, userId, role);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Review deleted successfully",
    data: null,
  });
});









export const ReviewControllers = {
  createReview,
  getReviewsByProduct,
  updateReview,
  deleteReview,
};