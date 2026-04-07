import { Request, Response } from "express";
import httpStatus from "http-status";
import { SystemService } from "./systrem.service";

export const runCleanup = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return res.status(httpStatus.UNAUTHORIZED).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const result = await SystemService.cleanupOldData();

    return res.status(httpStatus.OK).json({
      success: true,
      message: "Cleanup completed successfully",
      data: result,
    });
  } catch (error) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Cleanup failed",
      error,
    });
  }
};