import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { CheckoutDraftService } from "./checkoutdraf.service";

const createCheckoutDraft = catchAsync(async (req: Request, res: Response) => {
  const result = await CheckoutDraftService.createCheckoutDraft(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Checkout draft created successfully",
    data: result,
  });
});

const updateCheckoutDraft = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params ;

  const result = await CheckoutDraftService.updateCheckoutDraft( id as string, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Checkout draft updated successfully",
    data: result,
  });
});

const getAllCheckoutDrafts = catchAsync(async (req: Request, res: Response) => {
  const result = await CheckoutDraftService.getAllCheckoutDrafts(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Checkout drafts fetched successfully",
    data: result.data,
    meta: result.meta,
  });
});
const deleteCheckoutDraft = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  await CheckoutDraftService.deleteCheckoutDraft(id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Checkout draft deleted successfully",
    data: null,
  });
});

export const CheckoutDraftController = {
  createCheckoutDraft,
  updateCheckoutDraft,
  getAllCheckoutDrafts,
  deleteCheckoutDraft,
};