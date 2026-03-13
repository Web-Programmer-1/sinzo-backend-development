import AppError from "../../shared/ApiError";
import httpStatus from "http-status";
import { prisma } from "../../shared/Prisma";
import {
  DeliveryAreaType,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  Prisma,
} from "@prisma/client";

const getDeliveryCharge = (deliveryArea: DeliveryAreaType) => {
  if (deliveryArea === "INSIDE_CITY") return 80;
  if (deliveryArea === "OUTSIDE_CITY") return 140;

  throw new AppError(httpStatus.BAD_REQUEST, "Invalid delivery area");
};

const generateOrderNumber = () => {
  return `SNZ-${Date.now()}`;
};

const placeOrder = async (userId: string, payload: any) => {
  if (!userId) {
    throw new AppError(httpStatus.UNAUTHORIZED, "User ID is required");
  }

  const {
    fullName,
    phone,
    email,
    country,
    city,
    area,
    addressLine,
    note,
    deliveryArea,
    paymentMethod,
  } = payload;

  if (!fullName || !phone || !addressLine || !deliveryArea) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Full name, phone, address line and delivery area are required"
    );
  }

  const cartItems = await prisma.cart.findMany({
    where: { userId },
    include: {
      product: true,
    },
  });

  if (!cartItems.length) {
    throw new AppError(httpStatus.BAD_REQUEST, "Cart is empty");
  }

  for (const item of cartItems) {
    if (!item.product) {
      throw new AppError(httpStatus.NOT_FOUND, "Product not found");
    }

    if (item.product.stock < item.quantity) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `Not enough stock for product: ${item.product.title}`
      );
    }
  }

  const subtotal = cartItems.reduce((sum, item) => {
    return sum + item.product.price * item.quantity;
  }, 0);

  const deliveryCharge = getDeliveryCharge(deliveryArea as DeliveryAreaType);
  const discountAmount = 0;
  const vatAmount = 0;
  const totalAmount = subtotal + deliveryCharge + vatAmount - discountAmount;
  const paidAmount = 0;
  const dueAmount = totalAmount - paidAmount;

  const orderNumber = generateOrderNumber();

  const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const createdOrder = await tx.order.create({
      data: {
        orderNumber,
        userId,
        fullName,
        phone,
        email,
        country,
        city,
        area,
        addressLine,
        note,
        deliveryArea,
        deliveryCharge,
        paymentMethod: paymentMethod || PaymentMethod.CASH_ON_DELIVERY,
        paymentStatus: PaymentStatus.UNPAID,
        orderStatus: OrderStatus.PENDING,
        subtotal,
        discountAmount,
        vatAmount,
        totalAmount,
        paidAmount,
        dueAmount,
      },
    });

    await tx.orderItem.createMany({
      data: cartItems.map((item) => ({
        orderId: createdOrder.id,
        productId: item.productId,
        productTitle: item.product.title,
        productSlug: item.product.slug,
        productImage: item.product.productCardImage,
        selectedColor: item.selectedColor,
        selectedSize: item.selectedSize,
        unitPrice: item.product.price,
        quantity: item.quantity,
        lineTotal: item.product.price * item.quantity,
      })),
    });

    await tx.orderStatusHistory.create({
      data: {
        orderId: createdOrder.id,
        status: OrderStatus.PENDING,
        note: "Order placed successfully",
      },
    });

    for (const item of cartItems) {
      await tx.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      });
    }

    await tx.cart.deleteMany({
      where: { userId },
    });

    const finalOrder = await tx.order.findUnique({
      where: { id: createdOrder.id },
      include: {
        items: true,
        statusHistory: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    return finalOrder;
  });

  return result;
};

const getMyOrders = async (userId: string) => {
  const result = await prisma.order.findMany({
    where: { userId },
    include: {
      items: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return result;
};

const getMySingleOrder = async (userId: string, orderId: string) => {
  const result = await prisma.order.findFirst({
    where: {
      id: orderId,
      userId,
    },
    include: {
      items: true,
      statusHistory: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "Order not found");
  }

  return result;
};





const trackOrder = async (orderNumber: string) => {
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: {
      items: true,
      statusHistory: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  if (!order) {
    throw new AppError(httpStatus.NOT_FOUND, "Order not found");
  }

  return order;
};







// --------------------ADMIN-API------------------



const getAllOrders = async (query: Record<string, any>) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const searchTerm = query.searchTerm || "";
  const orderStatus = query.orderStatus;
  const paymentStatus = query.paymentStatus;
  const startDate = query.startDate;
  const endDate = query.endDate;

  const andConditions: Prisma.OrderWhereInput[] = [];

  if (searchTerm) {
    andConditions.push({
      OR: [
        { orderNumber: { contains: searchTerm, mode: "insensitive" } },
        { fullName: { contains: searchTerm, mode: "insensitive" } },
        { phone: { contains: searchTerm, mode: "insensitive" } },
        { email: { contains: searchTerm, mode: "insensitive" } },
      ],
    });
  }

  if (orderStatus) {
    andConditions.push({ orderStatus });
  }

  if (paymentStatus) {
    andConditions.push({ paymentStatus });
  }

  if (startDate && endDate) {
    andConditions.push({
      createdAt: {
        gte: new Date(`${startDate}T00:00:00.000Z`),
        lte: new Date(`${endDate}T23:59:59.999Z`),
      },
    });
  }

  const whereConditions: Prisma.OrderWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where: whereConditions,
      include: {
        user: true,
        items: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    }),

    prisma.order.count({
      where: whereConditions,
    }),
  ]);

  /*
  ---------- SUMMARY CALCULATION ----------
  */

  const [
    pendingOrders,
    confirmedOrders,
    deliveredOrders,
    cancelledOrders,
    totalSales,
  ] = await Promise.all([
    prisma.order.count({
      where: { ...whereConditions, orderStatus: OrderStatus.PENDING },
    }),

    prisma.order.count({
      where: { ...whereConditions, orderStatus: OrderStatus.CONFIRMED },
    }),

    prisma.order.count({
      where: { ...whereConditions, orderStatus: OrderStatus.DELIVERED },
    }),

    prisma.order.count({
      where: { ...whereConditions, orderStatus: OrderStatus.CANCELLED },
    }),

    prisma.order.aggregate({
      _sum: {
        totalAmount: true,
      },
      where: {
        ...whereConditions,
        orderStatus: OrderStatus.DELIVERED,
      },
    }),
  ]);

  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },

    data: orders,

    summary: {
      totalOrdersInRange: total,
      pendingOrders,
      confirmedOrders,
      deliveredOrders,
      cancelledOrders,
      totalSales: totalSales._sum.totalAmount || 0,
    },
  };
};




const getOrderById = async (orderId: string) => {
  const order = await prisma.order.findUnique({
    where: {
      id: orderId,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },

      items: true,

      statusHistory: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  if (!order) {
    throw new AppError(httpStatus.NOT_FOUND, "Order not found");
  }

  return order;
};






const updateOrderStatus = async (
  adminId: string,
  orderId: string,
  payload: { status: OrderStatus; note?: string }
) => {
  const { status, note } = payload;

  const existingOrder = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!existingOrder) {
    throw new AppError(httpStatus.NOT_FOUND, "Order not found");
  }

  const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    // update order status
    const updatedOrder = await tx.order.update({
      where: { id: orderId },
      data: {
        orderStatus: status,
      },
    });

    // create history log
    await tx.orderStatusHistory.create({
      data: {
        orderId,
        status,
        note,
        updatedById: adminId,
      },
    });

    return updatedOrder;
  });

  return result;
};




const updatePaymentStatus = async (
  orderId: string,
  payload: { paymentStatus: PaymentStatus; paidAmount?: number }
) => {
  const { paymentStatus, paidAmount } = payload;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    throw new AppError(httpStatus.NOT_FOUND, "Order not found");
  }

  const newPaidAmount = paidAmount ?? order.paidAmount;
  const newDueAmount = order.totalAmount - newPaidAmount;

  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: {
      paymentStatus,
      paidAmount: newPaidAmount,
      dueAmount: newDueAmount,
    },
  });

  return updatedOrder;
};




export const OrderService = {
  placeOrder,
  getMyOrders,
  getMySingleOrder,
  updateOrderStatus,
  trackOrder,
  getAllOrders,
  getOrderById,
  updatePaymentStatus,
};