import httpStatus from "http-status";
import { prisma } from "../../shared/Prisma";
import AppError from "../../shared/ApiError";

const createPaymentSetting = async (payload: {
  bkashNumber?: string;
  nagadNumber?: string;
}) => {
  const existing = await prisma.paymentSetting.findFirst();

  if (existing) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Payment setting already exists. Please update it instead."
    );
  }

  const result = await prisma.paymentSetting.create({
    data: {
      bkashNumber: payload?.bkashNumber || null,
      nagadNumber: payload?.nagadNumber || null,
    },
  });

  return result;
};

const getPaymentSetting = async () => {
  const result = await prisma.paymentSetting.findFirst({
    orderBy: {
      createdAt: "desc",
    },
  });

  return result;
};

const getPaymentSettingById = async (id: string) => {
  const result = await prisma.paymentSetting.findUnique({
    where: { id },
  });

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "Payment setting not found");
  }

  return result;
};

const updatePaymentSetting = async (
  id: string,
  payload: {
    bkashNumber?: string;
    nagadNumber?: string;
  }
) => {
  const existing = await prisma.paymentSetting.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new AppError(httpStatus.NOT_FOUND, "Payment setting not found");
  }

  const result = await prisma.paymentSetting.update({
    where: { id },
    data: {
      ...(payload.bkashNumber !== undefined && {
        bkashNumber: payload.bkashNumber,
      }),
      ...(payload.nagadNumber !== undefined && {
        nagadNumber: payload.nagadNumber,
      }),
    },
  });

  return result;
};

const deletePaymentSetting = async (id: string) => {
  const existing = await prisma.paymentSetting.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new AppError(httpStatus.NOT_FOUND, "Payment setting not found");
  }

  const result = await prisma.paymentSetting.delete({
    where: { id },
  });

  return result;
};

export const PaymentSettingService = {
  createPaymentSetting,
  getPaymentSetting,
  getPaymentSettingById,
  updatePaymentSetting,
  deletePaymentSetting,
};