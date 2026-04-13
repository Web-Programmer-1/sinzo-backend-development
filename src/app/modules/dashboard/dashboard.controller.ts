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








// const getCustomerDashboardOverview = catchAsync(
//   async (req: AuthRequest, res: Response) => {

//     const { userId, guestId } = getCartOwner(req, res); // ✅ FIX

//     const result = await DashboardService.getCustomerDashboardOverview({
//       userId,
//       guestId,
//     });

    

//     sendResponse(res, {
//       statusCode: httpStatus.OK,
//       success: true,
//       message: "Customer dashboard overview fetched successfully",
//       data: result,
//     });
//   }
// );






const getCustomerDashboardOverview = catchAsync(
  async (req: AuthRequest, res: Response) => {
    
    // ১. ইউজার অথেন্টিকেটেড কিনা চেক করুন
    if (!req.user || !req.user.userId) {
      return sendResponse(res, {
        statusCode: httpStatus.UNAUTHORIZED,
        success: false,
        message: "Unauthorized access",
        data: null,
      });
    }

    const userId = req.user.userId;

    // ২. সার্ভিসে শুধুমাত্র userId পাঠান। guestId null রাখুন।
    const result = await DashboardService.getCustomerDashboardOverview({
      userId: userId,
      guestId: null, 
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