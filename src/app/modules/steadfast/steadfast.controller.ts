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




const getSteadfastHistory = catchAsync(async (req: Request, res: Response) => {
  const result = await SteadfastService.getSteadfastHistory(
    req.query as Record<string, any>
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Steadfast history fetched successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getSteadfastHistoryById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await SteadfastService.getSteadfastHistoryById(id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Steadfast history details fetched successfully",
    data: result,
  });
});





const downloadSteadfastHistoryPdf = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const pdfBuffer = await SteadfastService.generateSteadfastHistoryPdf(id as string);

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=steadfast-history-${id}.pdf`
  );

  res.status(httpStatus.OK).send(pdfBuffer);
});








const deleteSteadfastHistory = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await SteadfastService.deleteSteadfastHistory(id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Steadfast history deleted successfully",
    data: result,
  });
});





export const SteadfastController = {
  sendSingleOrder,
  sendBulkOrders,
  syncCourierStatus,
  getSteadfastHistory,
  getSteadfastHistoryById,
  deleteSteadfastHistory,
  downloadSteadfastHistoryPdf
};