import httpStatus from "http-status";
import AppError from "../../shared/ApiError";
import { prisma } from "../../shared/Prisma";


type TSubmitManualPaymentPayload = {
  gateway: "BKASH" | "NAGAD" | "ROCKET" | "BANK";
  senderNumber: string;
  transactionId: string;
  paidAmount?: number;
  note?: string;
};

type TGetAllManualPaymentsQuery = {
  searchTerm?: string;
  verificationStatus?: "PENDING" | "VERIFIED" | "REJECTED";
  gateway?: "BKASH" | "NAGAD" | "ROCKET" | "BANK";
  page?: string | number;
  limit?: string | number;
};

const submitManualPayment = async (
  orderId: string,
  payload: TSubmitManualPaymentPayload
) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      manualPayment: true,
    },
  });

  if (!order) {
    throw new AppError(httpStatus.NOT_FOUND, "Order not found");
  }

  if (order.paymentMethod !== "ONLINE_PAYMENT") {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Manual payment is allowed only for online payment orders"
    );
  }

  if (order.manualPayment) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Manual payment already submitted for this order"
    );
  }

  if (!payload.gateway) {
    throw new AppError(httpStatus.BAD_REQUEST, "Gateway is required");
  }

  if (!payload.senderNumber) {
    throw new AppError(httpStatus.BAD_REQUEST, "Sender number is required");
  }

  if (!payload.transactionId) {
    throw new AppError(httpStatus.BAD_REQUEST, "Transaction ID is required");
  }

  const result = await prisma.$transaction(async (tx) => {
    const manualPayment = await tx.manualPaymentSubmission.create({
      data: {
        orderId,
        gateway: payload.gateway,
        senderNumber: payload.senderNumber,
        transactionId: payload.transactionId,
        paidAmount: payload.paidAmount,
        note: payload.note,
      },
    });

    await tx.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: "PENDING",
      },
    });

    return manualPayment;
  });

  return result;
};

const getMySubmissionByOrder = async (orderId: string) => {
  const result = await prisma.manualPaymentSubmission.findUnique({
    where: { orderId },
    include: {
      order: {
        select: {
          id: true,
          orderNumber: true,
          paymentMethod: true,
          paymentStatus: true,
          totalAmount: true,
          paidAmount: true,
          dueAmount: true,
        },
      },
    },
  });

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "Manual payment not found");
  }

  return result;
};

const getAllPayments = async (query: TGetAllManualPaymentsQuery) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const andConditions: any[] = [];

  if (query.searchTerm) {
    andConditions.push({
      OR: [
        { senderNumber: { contains: query.searchTerm, mode: "insensitive" } },
        { transactionId: { contains: query.searchTerm, mode: "insensitive" } },
        {
          order: {
            orderNumber: { contains: query.searchTerm, mode: "insensitive" },
          },
        },
        {
          order: {
            fullName: { contains: query.searchTerm, mode: "insensitive" },
          },
        },
        {
          order: {
            phone: { contains: query.searchTerm, mode: "insensitive" },
          },
        },
      ],
    });
  }

  if (query.verificationStatus) {
    andConditions.push({
      verificationStatus: query.verificationStatus,
    });
  }

  if (query.gateway) {
    andConditions.push({
      gateway: query.gateway,
    });
  }

  const whereCondition =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const [data, total] = await Promise.all([
    prisma.manualPaymentSubmission.findMany({
      where: whereCondition,
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            fullName: true,
            phone: true,
            totalAmount: true,
            paymentStatus: true,
            orderStatus: true,
          },
        },
        verifiedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    }),
    prisma.manualPaymentSubmission.count({
      where: whereCondition,
    }),
  ]);

  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
    data,
  };
};

const getSinglePayment = async (id: string) => {
  const result = await prisma.manualPaymentSubmission.findUnique({
    where: { id },
    include: {
      order: {
        select: {
          id: true,
          orderNumber: true,
          fullName: true,
          phone: true,
          addressLine: true,
          paymentMethod: true,
          paymentStatus: true,
          totalAmount: true,
          paidAmount: true,
          dueAmount: true,
          orderStatus: true,
        },
      },
      verifiedBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "Manual payment not found");
  }

  return result;
};

const verifyPayment = async (
  id: string,
  adminUserId: string,
  payload: { adminNote?: string }
) => {
  const payment = await prisma.manualPaymentSubmission.findUnique({
    where: { id },
    include: {
      order: true,
    },
  });

  if (!payment) {
    throw new AppError(httpStatus.NOT_FOUND, "Manual payment not found");
  }

  if (payment.verificationStatus === "VERIFIED") {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Payment is already verified"
    );
  }

  const result = await prisma.$transaction(async (tx) => {
    const updatedPayment = await tx.manualPaymentSubmission.update({
      where: { id },
      data: {
        verificationStatus: "VERIFIED",
        adminNote: payload.adminNote || "Verified successfully",
        verifiedAt: new Date(),
        rejectedAt: null,
        verifiedById: adminUserId,
      },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            paymentStatus: true,
            paidAmount: true,
            dueAmount: true,
          },
        },
      },
    });

    await tx.order.update({
      where: { id: payment.orderId },
      data: {
        paymentStatus: "PAID",
        paidAmount: payment.paidAmount ?? payment.order.totalAmount,
        dueAmount: 0,
      },
    });

    const finalPayment = await tx.manualPaymentSubmission.findUnique({
      where: { id },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            paymentStatus: true,
            paidAmount: true,
            dueAmount: true,
          },
        },
        verifiedBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return finalPayment;
  });

  return result;
};

const rejectPayment = async (
  id: string,
  adminUserId: string,
  payload: { adminNote?: string }
) => {
  const payment = await prisma.manualPaymentSubmission.findUnique({
    where: { id },
    include: {
      order: true,
    },
  });

  if (!payment) {
    throw new AppError(httpStatus.NOT_FOUND, "Manual payment not found");
  }

  if (payment.verificationStatus === "REJECTED") {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Payment is already rejected"
    );
  }

  const result = await prisma.$transaction(async (tx) => {
    await tx.manualPaymentSubmission.update({
      where: { id },
      data: {
        verificationStatus: "REJECTED",
        adminNote: payload.adminNote || "Payment rejected",
        rejectedAt: new Date(),
        verifiedAt: null,
        verifiedById: adminUserId,
      },
    });

    await tx.order.update({
      where: { id: payment.orderId },
      data: {
        paymentStatus: "UNPAID",
        paidAmount: 0,
        dueAmount: payment.order.totalAmount,
      },
    });

    const finalPayment = await tx.manualPaymentSubmission.findUnique({
      where: { id },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            paymentStatus: true,
            paidAmount: true,
            dueAmount: true,
          },
        },
        verifiedBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return finalPayment;
  });

  return result;
};

export const ManualPaymentService = {
  submitManualPayment,
  getMySubmissionByOrder,
  getAllPayments,
  getSinglePayment,
  verifyPayment,
  rejectPayment,
};