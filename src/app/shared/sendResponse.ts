import { Response } from "express";

type IMeta = {
  page: number;
  limit: number;
  total: number;
};

const sendResponse = <T>(
  res: Response,
  jsonData: {
    statusCode: number;
    success: boolean;
    message: string;
    meta?: IMeta;
    data?: T | null;
  }
) => {
  res.status(jsonData.statusCode).json({
    success: jsonData.success,
    message: jsonData.message,
    meta: jsonData.meta ?? null,
    data: jsonData.data ?? null,
  });
};

export default sendResponse;