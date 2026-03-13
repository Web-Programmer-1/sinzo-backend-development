import { Request, Response } from "express";
import { CartService } from "./cart.service";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { AuthRequest } from "../../middlewares/AuthGurd";

const addToCart = catchAsync(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;

  const result = await CartService.addToCart(userId, req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Product added to cart successfully",
    data: result,
  });
});

const getMyCart = catchAsync(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;

  const result = await CartService.getMyCart(userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Cart fetched successfully",
    data: result,
  });
});

const updateCartItem = catchAsync(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const { cartId } = req.params as { cartId: string };

  const result = await CartService.updateCartItem(userId, cartId, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Cart item updated successfully",
    data: result,
  });
});

const removeCartItem = catchAsync(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const { cartId } = req.params as { cartId: string };

  await CartService.removeCartItem(userId, cartId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Cart item removed successfully",
    data: null,
  });
});

const clearMyCart = catchAsync(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;

  await CartService.clearMyCart(userId);

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