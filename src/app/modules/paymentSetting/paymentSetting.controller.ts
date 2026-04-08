import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { PaymentSettingService } from "./paymentSetting.service";

const createPaymentSetting = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentSettingService.createPaymentSetting(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Payment setting created successfully",
    data: result,
  });
});

const getPaymentSetting = catchAsync(async (_req: Request, res: Response) => {
  const result = await PaymentSettingService.getPaymentSetting();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Payment setting fetched successfully",
    data: result,
  });
});

const getPaymentSettingById = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentSettingService.getPaymentSettingById(req.params.id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Payment setting fetched successfully",
    data: result,
  });
});

const updatePaymentSetting = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentSettingService.updatePaymentSetting(
    req.params.id as string,
    req.body
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Payment setting updated successfully",
    data: result,
  });
});

const deletePaymentSetting = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentSettingService.deletePaymentSetting(req.params.id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Payment setting deleted successfully",
    data: result,
  });
});



export const PaymentSettingController = {
  createPaymentSetting,
  getPaymentSetting,
  getPaymentSettingById,
  updatePaymentSetting,
  deletePaymentSetting,
};