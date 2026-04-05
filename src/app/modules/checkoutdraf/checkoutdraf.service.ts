import httpStatus from "http-status";

import { prisma } from "../../shared/Prisma";
import AppError from "../../shared/ApiError";

const createCheckoutDraft = async (payload: any) => {
  const result = await prisma.checkoutDraft.create({
    data: {
      guestId: payload.guestId || null,
      fullName: payload.fullName || null,
      phone: payload.phone || null,
      email: payload.email || null,
      addressLine: payload.addressLine || null,
      deliveryArea: payload.deliveryArea || null,
      paymentMethod: payload.paymentMethod || null,
    },
  });

  return result;
};

const updateCheckoutDraft = async (id: string, payload: any) => {
  const existingDraft = await prisma.checkoutDraft.findUnique({
    where: { id },
  });

  if (!existingDraft) {
    throw new AppError(httpStatus.NOT_FOUND, "Checkout draft not found");
  }

  const result = await prisma.checkoutDraft.update({
    where: { id },
    data: {
      guestId: payload.guestId ?? existingDraft.guestId,
      fullName: payload.fullName ?? existingDraft.fullName,
      phone: payload.phone ?? existingDraft.phone,
      email: payload.email ?? existingDraft.email,
      addressLine: payload.addressLine ?? existingDraft.addressLine,
      deliveryArea: payload.deliveryArea ?? existingDraft.deliveryArea,
      paymentMethod: payload.paymentMethod ?? existingDraft.paymentMethod,
    },
  });

  return result;
};


const getAllCheckoutDrafts = async (query: Record<string, any>) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const where: any = {};

  if (query.date) {
    const startDate = new Date(query.date);
    const endDate = new Date(query.date);

    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    where.createdAt = {
      gte: startDate,
      lte: endDate,
    };
  }

  const [result, total] = await Promise.all([
    prisma.checkoutDraft.findMany({
      where,
      orderBy: {
        updatedAt: "desc",
      },
      skip,
      take: limit,
    }),
    prisma.checkoutDraft.count({ where }),
  ]);

  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
    data: result,
  };
};

const deleteCheckoutDraft = async (id: string) => {
  const existingDraft = await prisma.checkoutDraft.findUnique({
    where: { id },
  });

  if (!existingDraft) {
    throw new AppError(httpStatus.NOT_FOUND, "Checkout draft not found");
  }

  await prisma.checkoutDraft.delete({
    where: { id },
  });

  return null;
};

export const CheckoutDraftService = {
  createCheckoutDraft,
  updateCheckoutDraft,
  getAllCheckoutDrafts,
  deleteCheckoutDraft,
};