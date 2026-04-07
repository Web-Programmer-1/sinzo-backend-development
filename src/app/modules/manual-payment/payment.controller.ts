import httpStatus from "http-status";
import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { ManualPaymentService } from "./payment.service";

const submitManualPayment = catchAsync(async (req: Request, res: Response) => {
  const { orderId } = req.params;

  const result = await ManualPaymentService.submitManualPayment(
    orderId as string,
    req.body
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Manual payment submitted successfully",
    data: result,
  });
});

const getMySubmissionByOrder = catchAsync(
  async (req: Request, res: Response) => {
    const { orderId } = req.params;

    const result = await ManualPaymentService.getMySubmissionByOrder(orderId as string);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Manual payment fetched successfully",
      data: result,
    });
  }
);

const getAllPayments = catchAsync(async (req: Request, res: Response) => {
  const result = await ManualPaymentService.getAllPayments(req.query as any);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Manual payments fetched successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getSinglePayment = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await ManualPaymentService.getSinglePayment(id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Manual payment fetched successfully",
    data: result,
  });
});

const verifyPayment = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const adminUserId = (req as any).user?.id;

  const result = await ManualPaymentService.verifyPayment(
    id as string,
    adminUserId,
    req.body
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Payment verified successfully",
    data: result,
  });
});

const rejectPayment = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const adminUserId = (req as any).user?.id;

  const result = await ManualPaymentService.rejectPayment(
    id as string,
    adminUserId,
    req.body
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Payment rejected successfully",
    data: result,
  });
});

export const ManualPaymentController = {
  submitManualPayment,
  getMySubmissionByOrder,
  getAllPayments,
  getSinglePayment,
  verifyPayment,
  rejectPayment,
};