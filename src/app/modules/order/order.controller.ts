import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { AuthRequest } from "../../middlewares/AuthGurd";
import { OrderService } from "./order.service";
import { getCartOwner } from "../../../helper/getCartOwener";

const placeOrder = catchAsync(async (req: Request, res: Response) => {
  const {  guestId } = getCartOwner(req, res);

  const result = await OrderService.placeOrder(  guestId , req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Order placed successfully",
    data: result,
  });
});


const getMyOrders = catchAsync(async (req: Request, res: Response) => {
  const { guestId } = getCartOwner(req, res);

  const result = await OrderService.getMyOrders(guestId as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "My orders fetched successfully",
    data: result,
  });
});

const getMySingleOrder = catchAsync(async (req: Request, res: Response) => {
  const { guestId } = getCartOwner(req, res);
  const { id } = req.params;

  const result = await OrderService.getMySingleOrder(guestId as string, id as string);

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






const getCustomerRanking = catchAsync(async (req: Request, res: Response) => {
  const result = await OrderService.getCustomerRanking(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Customer ranking fetched successfully",
    meta: result.meta,
    data: result.data,
  });
});


const deleteOrder = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };

  await OrderService.deleteOrder(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Order deleted successfully",
    data: null,
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
  getCustomerRanking,
  deleteOrder,
};