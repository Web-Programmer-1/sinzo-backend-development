import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { DashboardService } from "./dashboard.service";

import httpStatus from "http-status";
import { AuthRequest } from "../../middlewares/AuthGurd";
import { getCartOwner } from "../../../helper/getCartOwener";


declare global {
  namespace Express {
    interface Request {
      user?: { userId?: string; role?: string };
    }
  }
}

const getOverview = catchAsync(async (req: Request, res: Response) => {
  const result = await DashboardService.getOverview(req.query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Dashboard analytics fetched successfully",
    data: result,
  });
});








const getCustomerDashboardOverview = catchAsync(
  async (req: AuthRequest, res: Response) => {

    const { userId, guestId } = getCartOwner(req, res); // ✅ FIX

    const result = await DashboardService.getCustomerDashboardOverview({
      userId,
      guestId,
    });

    

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Customer dashboard overview fetched successfully",
      data: result,
    });
  }
);





export const DashboardController = {
  getOverview,
  getCustomerDashboardOverview,
};