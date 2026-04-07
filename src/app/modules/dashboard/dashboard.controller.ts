import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { DashboardService } from "./dashboard.service";

const getOverview = catchAsync(async (req: Request, res: Response) => {
  const result = await DashboardService.getOverview(req.query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Dashboard analytics fetched successfully",
    data: result,
  });
});

export const DashboardController = {
  getOverview,
};