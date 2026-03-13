import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { AuthRequest } from "../../middlewares/AuthGurd";
import { OrderService } from "./order.service";
import { get } from "http";

const placeOrder = catchAsync(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;

  const result = await OrderService.placeOrder(userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Order placed successfully",
    data: result,
  });
});

const getMyOrders = catchAsync(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;

  const result = await OrderService.getMyOrders(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "My orders fetched successfully",
    data: result,
  });
});

const getMySingleOrder = catchAsync(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const { id } = req.params;

  const result = await OrderService.getMySingleOrder(userId, id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Order details fetched successfully",
    data: result,
  });
});










const trackOrder = catchAsync(async (req: Request, res: Response) => {
  const { orderNumber } = req.params as { orderNumber: string };

  const result = await OrderService.trackOrder(orderNumber);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Order tracking data fetched successfully",
    data: result,
  });
});



//---------------------- ADMIN API-------------------------------



const getAllOrders = catchAsync(async (req: Request, res: Response) => {
  const result = await OrderService.getAllOrders(req.query as Record<string, any>);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Orders fetched successfully",
    data: {
      orders: result?.data,
      summary: result?.summary
    },
    meta: result?.meta,
    
  });
});



const getOrderById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await OrderService.getOrderById(id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Order fetched successfully",
    data: result,
  });
});







const updateOrderStatus = catchAsync(async (req: AuthRequest, res: Response) => {
  const adminId = req.user!.userId;
  const { id } = req.params;

  const result = await OrderService.updateOrderStatus(adminId, id as string, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Order status updated successfully",
    data: result,
  });
});




const updatePaymentStatus = catchAsync(async (req: any, res: Response) => {
  const { id } = req.params;

  const result = await OrderService.updatePaymentStatus(id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Payment status updated successfully",
    data: result,
  });
});



export const OrderController = {
  placeOrder,
  getMyOrders,
  getMySingleOrder,
  updateOrderStatus,
  trackOrder,
  getAllOrders,
  updatePaymentStatus,
  getOrderById,
};