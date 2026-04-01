import { Request, Response } from "express";
import { CartService } from "./cart.service";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { getGuestId } from "../../../helper/guestIdGenerator";

const addToCart = catchAsync(async (req: Request, res: Response) => {
  const guestId = getGuestId(req, res);

  const result = await CartService.addToCart(guestId, req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Product added to cart successfully",
    data: result,
  });
});

const getMyCart = catchAsync(async (req: Request, res: Response) => {
  const guestId = getGuestId(req as Request, res  as Response);

  const result = await CartService.getMyCart(guestId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Cart fetched successfully",
    data: result,
  });
});

const updateCartItem = catchAsync(async (req: Request, res: Response) => {
  const guestId = getGuestId(req as Request, res as Response);
  const { cartId } = req.params as { cartId: string };

  const result = await CartService.updateCartItem(guestId, cartId, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Cart item updated successfully",
    data: result,
  });
});

const removeCartItem = catchAsync(async (req: Request, res: Response) => {
  const guestId = getGuestId(req as Request, res as Response);
  const { cartId } = req.params as { cartId: string };

  await CartService.removeCartItem(guestId, cartId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Cart item removed successfully",
    data: null,
  });
});

const clearMyCart = catchAsync(async (req: Request, res: Response) => {
  const guestId = getGuestId(req as Request, res as Response);

  await CartService.clearMyCart(guestId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Cart cleared successfully",
    data: null,
  });
});

export const CartController = {
  addToCart,
  getMyCart,
  updateCartItem,
  removeCartItem,
  clearMyCart,
};