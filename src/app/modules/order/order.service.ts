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
import { sendEmail } from "../../../util/sendEmail";
import { orderConfirmationTemplate } from "./order.emailTemplate";
import config from "../../../config";
import { updateCustomerRanking } from "../../../util/order_utils/order.util";
import { recalculateSingleCustomerRanking } from "../../../util/order_utils/reCalculate";
import { CustomerBadge, TCustomerRankingItem } from "./order.interface";

const getDeliveryCharge = (deliveryArea: DeliveryAreaType) => {
  if (deliveryArea === "INSIDE_CITY") return 80;
  if (deliveryArea === "OUTSIDE_CITY") return 140;

  throw new AppError(httpStatus.BAD_REQUEST, "Invalid delivery area");
};

const generateOrderNumber = () => {
  return `SNZ-${Date.now()}`;
};







// const placeOrder = async (userId: string, payload: any) => {
//   if (!userId) {
//     throw new AppError(httpStatus.UNAUTHORIZED, "User ID is required");
//   }

//   const { fullName, phone, email, country, city, area, addressLine, 
//           note, deliveryArea, paymentMethod } = payload;

//   if (!fullName || !phone || !addressLine || !deliveryArea) {
//     throw new AppError(httpStatus.BAD_REQUEST, 
//       "Full name, phone, address line and delivery area are required");
//   }

//   // ✅ একটি query তে cart + product একসাথে
//   const cartItems = await prisma.cart.findMany({
//     where: { userId },
//     include: { product: true },
//   });

//   if (!cartItems.length) {
//     throw new AppError(httpStatus.BAD_REQUEST, "Cart is empty");
//   }

//   // ✅ Validation লুপ — DB call নেই, শুধু memory check
//   for (const item of cartItems) {
//     if (!item.product) {
//       throw new AppError(httpStatus.NOT_FOUND, "Product not found");
//     }
//     if (item.product.stock < item.quantity) {
//       throw new AppError(httpStatus.BAD_REQUEST, 
//         `Not enough stock for: ${item.product.title}`);
//     }
//   }

//   // ✅ সব calculation transaction এর বাইরে
//   const subtotal = cartItems.reduce((sum, item) => 
//     sum + item.product.price * item.quantity, 0);

//   const deliveryCharge = getDeliveryCharge(deliveryArea as DeliveryAreaType);
//   const totalAmount = subtotal + deliveryCharge;
//   const orderNumber = generateOrderNumber();

//   // ✅ Transaction যতটা সম্ভব ছোট রাখো
//   const createdOrder = await prisma.$transaction(async (tx) => {
//     const order = await tx.order.create({
//       data: {
//         orderNumber, userId, fullName, phone, email,
//         country, city, area, addressLine, note, deliveryArea,
//         deliveryCharge,
//         paymentMethod: paymentMethod || PaymentMethod.CASH_ON_DELIVERY,
//         paymentStatus: PaymentStatus.UNPAID,
//         orderStatus: OrderStatus.PENDING,
//         subtotal,
//         discountAmount: 0,
//         vatAmount: 0,
//         totalAmount,
//         paidAmount: 0,
//         dueAmount: totalAmount,
//       },
//     });

//     // ✅ Bulk insert — একটি query তে সব items
//     await tx.orderItem.createMany({
//       data: cartItems.map((item) => ({
//         orderId: order.id,
//         productId: item.productId,
//         productTitle: item.product.title,
//         productSlug: item.product.slug,
//         productImage: item.product.productCardImage,
//         selectedColor: item.selectedColor,
//         selectedSize: item.selectedSize,
//         unitPrice: item.product.price,
//         quantity: item.quantity,
//         lineTotal: item.product.price * item.quantity,
//       })),
//     });

//     // ✅ Status history
//     await tx.orderStatusHistory.create({
//       data: {
//         orderId: order.id,
//         status: OrderStatus.PENDING,
//         note: "Order placed successfully",
//       },
//     });

//     // ✅ N+1 দূর করো — একটি raw query তে সব stock update
//     // Prisma raw query দিয়ে bulk update
//     const stockUpdates = cartItems.map((item) =>
//       tx.product.update({
//         where: { id: item.productId },
//         data: { stock: { decrement: item.quantity } },
//       })
//     );
//     await Promise.all(stockUpdates); // ✅ parallel execute

//     // ✅ Cart clear
//     await tx.cart.deleteMany({ where: { userId } });

//     return order;
//   });

 
//   const finalOrder = await prisma.order.findUnique({
//     where: { id: createdOrder.id },
//     include: {
//       items: true,
//       statusHistory: { orderBy: { createdAt: "asc" } },
//     },
//   });


//   if (finalOrder?.email) {
//     setImmediate(() => {
//       sendOrderConfirmationEmail(finalOrder).catch((err) =>
//         console.error("Email failed:", err)
//       );
//     });
//   }

//   return finalOrder;
// };










const placeOrder = async (guestId: string, payload: any,   ) => {

  if (!guestId) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Guest ID is required");
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
    where: { guestId },
    include: { product: true },
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
        `Not enough stock for: ${item.product.title}`
      );
    }
  }

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const deliveryCharge = getDeliveryCharge(deliveryArea as DeliveryAreaType);
  const totalAmount = subtotal + deliveryCharge;
  const orderNumber = generateOrderNumber();

  const createdOrder = await prisma.$transaction(async (tx) => {

    const order = await tx.order.create({
      data: {
        orderNumber,
        guestId,
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
        discountAmount: 0,
        vatAmount: 0,
        totalAmount,
        paidAmount: 0,
        dueAmount: totalAmount,
      },
    });


    await updateCustomerRanking({
  userId: order.userId,
  fullName: order.fullName,
  phone: order.phone,
  totalAmount: order.totalAmount,
  orderStatus: order.orderStatus,
  createdAt: order.createdAt,
});

    await tx.orderItem.createMany({
      data: cartItems.map((item) => ({
        orderId: order.id,
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
        orderId: order.id,
        status: OrderStatus.PENDING,
        note: "Order placed successfully",
      },
    });

    await Promise.all(
      cartItems.map((item) =>
        tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        })
      )
    );

    await tx.cart.deleteMany({
      where: { guestId },
    });

    return order;
  });

  const finalOrder = await prisma.order.findUnique({
    where: { id: createdOrder.id },
    include: {
      items: true,
      statusHistory: { orderBy: { createdAt: "asc" } },
    },
  });

  if (finalOrder?.email) {
    setImmediate(() => {
      sendOrderConfirmationEmail(finalOrder).catch((err) =>
        console.error("Email failed:", err)
      );
    });
  }

  return finalOrder;
};



/**
 * Sends an email to the customer after a successful order
 * @param {object} order - The order object
 * @returns {Promise<void>} - A promise that resolves when the email is sent
 */
const sendOrderConfirmationEmail = async (order: any) => {
  await sendEmail({
    to: order.email,
    subject: `Order Confirmation - ${order.orderNumber}`,
    html: orderConfirmationTemplate({
      customerName: order.fullName,
      orderNumber: order.orderNumber,
      orderDate: new Date(order.createdAt).toLocaleString("en-BD", {
        dateStyle: "medium",
        timeStyle: "short",
      }),
      totalAmount: order.totalAmount,
      subtotal: order.subtotal,
      deliveryCharge: order.deliveryCharge,
      discountAmount: order.discountAmount,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      addressLine: order.addressLine,
      city: order.city || "",
      area: order.area || "",
      note: order.note || "",
      shopName: "SINZO",
      shopAddress: "Dhaka Lalbagh",
      shopPhone: "01576450711",
      receiptUrl: `${config.frontendUrl}/orders/${order.id}`,
      items: order.items.map((item: any) => ({
        productTitle: item.productTitle,
        productImage: item.productImage || "",
        selectedColor: item.selectedColor || "",
        selectedSize: item.selectedSize || "",
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        lineTotal: item.lineTotal,
      })),
    }),
  });
};










const getMyOrders = async (guestId: string) => {
  const result = await prisma.order.findMany({
    where: { guestId },
    include: {
      items: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return result;
};

const getMySingleOrder = async (guestId: string, orderId: string) => {
  const result = await prisma.order.findFirst({
    where: {
      id: orderId,
      guestId,
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
  payload: { status: OrderStatus; note?: string },
) => {
  const { status, note } = payload;

  const existingOrder = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!existingOrder) {
    throw new AppError(httpStatus.NOT_FOUND, "Order not found");
  }

  const updatedOrder = await prisma.$transaction(
    async (tx: Prisma.TransactionClient) => {

      // update order status
      const order = await tx.order.update({
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

      return order;
    }
  );


  await recalculateSingleCustomerRanking({
    userId: updatedOrder.userId,
    phone: updatedOrder.phone,
  });

  return updatedOrder;
};
const updatePaymentStatus = async (
  orderId: string,
  payload: { paymentStatus: PaymentStatus; paidAmount?: number },
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







const getBadge = (
  totalSpent: number,
  deliveredOrders: number
): CustomerBadge => {
  if (totalSpent >= 3000) return "VIP";
  if (deliveredOrders >= 3) return "LOYAL";
  return "NORMAL";
};

const getCustomerKey = (userId?: string | null, phone?: string | null) => {
  if (userId) return `user:${userId}`;
  return `phone:${phone}`;
};

const getCustomerRanking = async (query: Record<string, any>) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const phoneFilter = query.phone?.trim()?.toLowerCase() || "";
  const fullNameFilter = query.fullName?.trim()?.toLowerCase() || "";
  const badgeFilter = query.badge?.trim()?.toUpperCase() || "";

  const orders = await prisma.order.findMany({
    select: {
      id: true,
      userId: true,
      phone: true,
      fullName: true,
      totalAmount: true,
      orderStatus: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const customerMap = new Map<string, TCustomerRankingItem>();

  for (const order of orders) {
    const customerKey = getCustomerKey(order.userId, order.phone);

    if (!customerMap.has(customerKey)) {
      customerMap.set(customerKey, {
        customerKey,
        userId: order.userId ?? null,
        phone: order.phone,
        fullName: order.fullName,
        totalOrders: 0,
        deliveredOrders: 0,
        cancelledOrders: 0,
        totalSpent: 0,
        badge: "NORMAL",
        lastOrderAt: order.createdAt,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      });
    }

    const customer = customerMap.get(customerKey)!;

    customer.totalOrders += 1;

    if (order.orderStatus === OrderStatus.DELIVERED) {
      customer.deliveredOrders += 1;
      customer.totalSpent += order.totalAmount;
    }

    if (order.orderStatus === OrderStatus.CANCELLED) {
      customer.cancelledOrders += 1;
    }

    // latest fullName/phone info
    if (
      !customer.lastOrderAt ||
      new Date(order.createdAt) > new Date(customer.lastOrderAt)
    ) {
      customer.lastOrderAt = order.createdAt;
      customer.fullName = order.fullName;
      customer.phone = order.phone;
      customer.updatedAt = order.updatedAt;
    }

    // earliest createdAt
    if (new Date(order.createdAt) < new Date(customer.createdAt)) {
      customer.createdAt = order.createdAt;
    }
  }

  let customers = Array.from(customerMap.values()).map((item) => ({
    ...item,
    badge: getBadge(item.totalSpent, item.deliveredOrders),
  }));

  // filter by phone
  if (phoneFilter) {
    customers = customers.filter((item) =>
      item.phone.toLowerCase().includes(phoneFilter)
    );
  }

  // filter by fullName
  if (fullNameFilter) {
    customers = customers.filter((item) =>
      item.fullName.toLowerCase().includes(fullNameFilter)
    );
  }

  // counts before badge filter apply
  const filterBaseCustomers = [...customers];

  const badgeCounts = {
    all: filterBaseCustomers.length,
    NORMAL: filterBaseCustomers.filter((item) => item.badge === "NORMAL").length,
    VIP: filterBaseCustomers.filter((item) => item.badge === "VIP").length,
    LOYAL: filterBaseCustomers.filter((item) => item.badge === "LOYAL").length,
  };

  // badge filter
  if (badgeFilter && ["NORMAL", "VIP", "LOYAL"].includes(badgeFilter)) {
    customers = customers.filter((item) => item.badge === badgeFilter);
  }

  // sort by ranking
  customers.sort((a, b) => {
    if (b.deliveredOrders !== a.deliveredOrders) {
      return b.deliveredOrders - a.deliveredOrders;
    }
    if (b.totalSpent !== a.totalSpent) {
      return b.totalSpent - a.totalSpent;
    }
    if (b.totalOrders !== a.totalOrders) {
      return b.totalOrders - a.totalOrders;
    }
    return (
      new Date(b.lastOrderAt || 0).getTime() -
      new Date(a.lastOrderAt || 0).getTime()
    );
  });

  const total = customers.length;
  const paginatedCustomers = customers.slice(skip, skip + limit);

  const data = paginatedCustomers.map((item, index) => ({
    rank: skip + index + 1,
    phone: item.phone,
    fullName: item.fullName,
    totalOrders: item.totalOrders,
    deliveredOrders: item.deliveredOrders,
    cancelledOrders: item.cancelledOrders,
    totalSpent: item.totalSpent,
    badge: item.badge,
    lastOrderAt: item.lastOrderAt,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  }));

  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
    filterCounts: badgeCounts,
    data,
  };
};





const deleteOrder = async (orderId: string) => {
  const existingOrder = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
    },
  });

  if (!existingOrder) {
    throw new AppError(httpStatus.NOT_FOUND, "Order not found");
  }

  await prisma.$transaction(async (tx) => {
    // stock restore
    await Promise.all(
      existingOrder.items.map((item) => {
        if (!item.productId) return Promise.resolve();

        return tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              increment: item.quantity,
            },
          },
        });
      })
    );

    // delete order
    // OrderItem + OrderStatusHistory cascade delete হয়ে যাবে
    await tx.order.delete({
      where: { id: orderId },
    });
  });

  await recalculateSingleCustomerRanking({
    userId: existingOrder.userId,
    phone: existingOrder.phone,
  });

  return null;
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
  getCustomerRanking,
  deleteOrder,
};
