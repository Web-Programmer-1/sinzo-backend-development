import AppError from "../app/shared/ApiError";
import httpStatus from "http-status";
import { prisma } from "../app/shared/Prisma";

type TFraudCheckPayload = {
  ipAddress?: string;
  deviceId?: string;
};

export const validateOrderFraudCheck = async (
  payload: TFraudCheckPayload = {}
) => {
  const { ipAddress, deviceId } = payload;

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  if (ipAddress && ipAddress !== "UNKNOWN_IP") {
    const sameIpTodayCount = await prisma.order.count({
      where: {
        ipAddress,
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    if (sameIpTodayCount >= 5) {
      throw new AppError(
        httpStatus.TOO_MANY_REQUESTS,
        "This IP address has reached the daily order limit"
      );
    }
  }

  if (deviceId && deviceId !== "UNKNOWN_DEVICE") {
    const sameDeviceTodayCount = await prisma.order.count({
      where: {
        deviceId,
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    if (sameDeviceTodayCount >= 3) {
      throw new AppError(
        httpStatus.TOO_MANY_REQUESTS,
        "This device has reached the daily order limit"
      );
    }
  }
};