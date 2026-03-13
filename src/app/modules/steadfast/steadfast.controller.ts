import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { SteadfastService } from "./steadfast.service";

const sendSingleOrder = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  console.log(process.env.STEADFAST_API_KEY);
  console.log(process.env.STEADFAST_SECRET_KEY);

  const result = await SteadfastService.sendSingleOrderToSteadfast(id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Order sent to Steadfast successfully",
    data: result,
  });
});

const sendBulkOrders = catchAsync(async (req: Request, res: Response) => {
  const { orderIds } = req.body;

  const result = await SteadfastService.sendBulkOrdersToSteadfast(orderIds);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Bulk orders sent to Steadfast successfully",
    data: result,
  });
});

const syncCourierStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await SteadfastService.syncOrderCourierStatus(id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Courier status synced successfully",
    data: result,
  });
});

export const SteadfastController = {
  sendSingleOrder,
  sendBulkOrders,
  syncCourierStatus,
};