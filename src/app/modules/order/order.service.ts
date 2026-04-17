import AppError from "../../shared/ApiError";
import httpStatus from "http-status";
import { prisma } from "../../shared/Prisma";

import axios from "axios";

// services/OrderService.ts
import PDFDocument from "pdfkit";

import {

  DeliveryAreaType,
  ManualPaymentVerificationStatus,
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
import { CustomerBadge, TCustomerRankingItem, TPlaceOrderPayload } from "./order.interface";

const getDeliveryCharge = (deliveryArea: DeliveryAreaType) => {
  if (deliveryArea === "INSIDE_CITY") return 80;
  if (deliveryArea === "OUTSIDE_CITY") return 140;

  throw new AppError(httpStatus.BAD_REQUEST, "Invalid delivery area");
};

const generateOrderNumber = () => {
  return `SNZ-${Date.now()}`;
};














// const placeOrder = async (guestId: string, payload: any,   ) => {

//   if (!guestId) {
//     throw new AppError(httpStatus.UNAUTHORIZED, "Guest ID is required");
//   }

//   const {
//     fullName,
//     phone,
//     email,
//     country,
//     city,
//     area,
//     addressLine,
//     note,
//     deliveryArea,
//     paymentMethod,
//   } = payload;



//   if (!fullName || !phone || !addressLine || !deliveryArea) {
//     throw new AppError(
//       httpStatus.BAD_REQUEST,
//       "Full name, phone, address line and delivery area are required"
//     );
//   }







//   const cartItems = await prisma.cart.findMany({
//     where: { guestId },
//     include: { product: true },
//   });

//   if (!cartItems.length) {
//     throw new AppError(httpStatus.BAD_REQUEST, "Cart is empty");
//   }

//   for (const item of cartItems) {
//     if (!item.product) {
//       throw new AppError(httpStatus.NOT_FOUND, "Product not found");
//     }

//     if (item.product.stock < item.quantity) {
//       throw new AppError(
//         httpStatus.BAD_REQUEST,
//         `Not enough stock for: ${item.product.title}`
//       );
//     }
//   }

//   const subtotal = cartItems.reduce(
//     (sum, item) => sum + item.product.price * item.quantity,
//     0
//   );

//   const deliveryCharge = getDeliveryCharge(deliveryArea as DeliveryAreaType);
//   const totalAmount = subtotal + deliveryCharge;
//   const orderNumber = generateOrderNumber();

//   const createdOrder = await prisma.$transaction(async (tx) => {

//     const order = await tx.order.create({
//       data: {
//         orderNumber,
//         guestId,
//         fullName,
//         phone,
//         email,
//         country,
//         city,
//         area,
//         addressLine,
//         note,
//         deliveryArea,
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


//     await updateCustomerRanking({
//   userId: order.userId,
//   fullName: order.fullName,
//   phone: order.phone,
//   totalAmount: order.totalAmount,
//   orderStatus: order.orderStatus,
//   createdAt: order.createdAt,
// });

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

//     await tx.orderStatusHistory.create({
//       data: {
//         orderId: order.id,
//         status: OrderStatus.PENDING,
//         note: "Order placed successfully",
//       },
//     });

//     await Promise.all(
//       cartItems.map((item) =>
//         tx.product.update({
//           where: { id: item.productId },
//           data: {
//             stock: {
//               decrement: item.quantity,
//             },
//           },
//         })
//       )
//     );

//     await tx.cart.deleteMany({
//       where: { guestId },
//     });

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










const placeOrder = async (guestId: string, payload: TPlaceOrderPayload) => {
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
    manualPayment,
  } = payload;

  if (!fullName || !phone || !addressLine || !deliveryArea) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Full name, phone, address line and delivery area are required"
    );
  }

  const finalPaymentMethod =
    paymentMethod || PaymentMethod.CASH_ON_DELIVERY;

  // manual payment validation
  if (finalPaymentMethod === PaymentMethod.ONLINE_PAYMENT) {
    if (
      !manualPayment ||
      !manualPayment.gateway ||
      !manualPayment.senderNumber ||
      !manualPayment.transactionId
    ) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Manual payment info is required for online payment"
      );
    }
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
    const initialPaymentStatus =
      finalPaymentMethod === PaymentMethod.ONLINE_PAYMENT
        ? PaymentStatus.PENDING
        : PaymentStatus.UNPAID;

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
        paymentMethod: finalPaymentMethod,
        paymentStatus: initialPaymentStatus,
        orderStatus: OrderStatus.PENDING,
        subtotal,
        discountAmount: 0,
        vatAmount: 0,
        totalAmount,
        paidAmount: 0,
        dueAmount: totalAmount,
      },
    });

    // customer ranking update
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

    // create manual payment submission if online payment
    if (
      finalPaymentMethod === PaymentMethod.ONLINE_PAYMENT &&
      manualPayment
    ) {
      await tx.manualPaymentSubmission.create({
        data: {
          orderId: order.id,
          gateway: manualPayment.gateway,
          senderNumber: manualPayment.senderNumber,
          transactionId: manualPayment.transactionId,
          paidAmount: manualPayment.paidAmount ?? null,
          note: manualPayment.note ?? null,
          verificationStatus: ManualPaymentVerificationStatus.PENDING,
        },
      });
    }

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
      manualPayment: true,
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
      manualPayment:true,
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
      manualPayment:true,
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
      manualPayment:true,
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
        manualPayment:true,
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

// const getOrderById = async (orderId: string) => {
//   const order = await prisma.order.findUnique({
//     where: {
//       id: orderId,
//     },
//     include: {
//       user: {
//         select: {
//           id: true,
//           name: true,
//           email: true,
//           phone: true,
//         },
//       },

//       items: true,
//       manualPayment:true,
//       statusHistory: {
//         orderBy: {
//           createdAt: "asc",
//         },
//       },
//     },
//   });

//   if (!order) {
//     throw new AppError(httpStatus.NOT_FOUND, "Order not found");
//   }

//   return order;
// };







const getOrderById = async (orderId: string) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      // ── Core identifiers ──────────────────────────
      id: true,
      orderNumber: true,
      serialNumber: true,
 
      // ── Customer info ─────────────────────────────
      userId: true,
      guestId: true,
      fullName: true,
      phone: true,
      email: true,
      country: true,
      city: true,
      area: true,
      addressLine: true,
      note: true,
 
      // ── Delivery ─────────────────────────────────
      deliveryArea: true,
      deliveryCharge: true,
 
      // ── Payment ──────────────────────────────────
      paymentMethod: true,
      paymentStatus: true,
      orderType: true,
      orderStatus: true,
 
      // ── Amounts ──────────────────────────────────
      subtotal: true,
      discountAmount: true,
      vatAmount: true,
      totalAmount: true,
      paidAmount: true,
      dueAmount: true,
 
      // ── Courier ──────────────────────────────────
      courierProvider: true,
      courierStatus: true,
      consignmentId: true,
      trackingCode: true,
      courierNote: true,
      courierSentAt: true,
      // courierRawResponse excluded — heavy JSON, not needed in UI
 
      // ── Receipt ──────────────────────────────────
      receiptPdfPath: true,
 
      // ── Timestamps ───────────────────────────────
      createdAt: true,
      updatedAt: true,
 
      // ── Relations ────────────────────────────────
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
 
      items: {
        select: {
          id: true,
          productId: true,
          productTitle: true,
          productSlug: true,
          productImage: true,
          selectedColor: true,
          selectedSize: true,
          unitPrice: true,
          quantity: true,
          lineTotal: true,
        },
      },
 
      manualPayment: {
        select: {
          id: true,
          gateway: true,
          senderNumber: true,
          transactionId: true,
          paidAmount: true,
          note: true,
          verificationStatus: true,
          adminNote: true,
          verifiedAt: true,
          rejectedAt: true,
          createdAt: true,
          // verifiedById / verifiedBy excluded — not shown in order detail UI
        },
      },
 
      statusHistory: {
        orderBy: { createdAt: "asc" },
        // Limit to last 20 — prevents unbounded fetch on orders with many updates
        take: 20,
        select: {
          id: true,
          status: true,
          note: true,
          createdAt: true,
          updatedBy: {
            select: {
              id: true,
              name: true,
            },
          },
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









const updateOrderCustomerInfo = async (
  adminId: string,
  orderId: string,
  payload: {
    fullName?: string;
    phone?: string;
    email?: string;
    country?: string;
    city?: string;
    area?: string;
    addressLine?: string;
    deliveryArea?: DeliveryAreaType;
    note?: string;
  },
) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    throw new AppError(httpStatus.NOT_FOUND, "Order not found");
  }

  // Check if order is already sent to courier
  if (order.courierStatus === "SENT") {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Cannot update customer info: Order already sent to courier",
    );
  }

  const updatedOrder = await prisma.$transaction(async (tx) => {
    const updated = await tx.order.update({
      where: { id: orderId },
      data: {
        ...payload,
      },
    });

    // Add status history log
    await tx.orderStatusHistory.create({
      data: {
        orderId,
        status: order.orderStatus,
        note: `Customer information updated by admin. Fields: ${Object.keys(payload).join(", ")}`,
        updatedById: adminId,
      },
    });

    return updated;
  });

  return updatedOrder;
};





export const generateInvoice = async (orderId: string): Promise<Buffer> => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
      user: { select: { name: true, email: true, phone: true } },
    },
  });

  if (!order) {
    throw new AppError(httpStatus.NOT_FOUND, "Order not found");
  }

  return new Promise(async (resolve, reject) => {
    const doc = new PDFDocument({ 
      size: "A4", 
      margins: {
        top: 40,
        bottom: 40,
        left: 40,
        right: 40
      },
    });
    
    const buffers: Buffer[] = [];
    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", reject);

    try {
      const colors = {
        primary: "#1e40af",
        secondary: "#3b82f6",
        accent: "#f59e0b",
        dark: "#1f2937",
        gray: "#6b7280",
        lightGray: "#f3f4f6",
        border: "#e5e7eb",
        success: "#10b981",
      };

      const pageWidth = doc.page.width;
      const pageHeight = doc.page.height;
      const margin = 40;
      const contentWidth = pageWidth - (margin * 2);

      const drawHeader = (yPos: number) => {
        doc.rect(margin, yPos, contentWidth, 6)
           .fill(colors.primary);
        
        doc.rect(margin, yPos + 10, contentWidth, 55)
           .fill(colors.lightGray);
        
        doc.fontSize(20)
           .font("Helvetica-Bold")
           .fillColor(colors.primary)
           .text("SINZO", margin + 8, yPos + 12, { width: 180 });
        
        doc.fontSize(8)
           .fillColor(colors.gray)
           .text("Premium E-Commerce Solutions", margin + 8, yPos + 30, { width: 180 });
        
        const invoiceTitleWidth = 100;
        doc.fontSize(20)
           .font("Helvetica-Bold")
           .fillColor(colors.dark)
           .text("INVOICE", pageWidth - margin - invoiceTitleWidth, yPos + 12, { 
             align: "right",
             width: invoiceTitleWidth 
           });
        
        doc.fontSize(9)
           .fillColor(colors.gray)
           .text(`#${order.orderNumber}`, pageWidth - margin - invoiceTitleWidth, yPos + 32, { 
             align: "right",
             width: invoiceTitleWidth 
           });
        
        doc.moveTo(margin, yPos + 72)
           .lineTo(pageWidth - margin, yPos + 72)
           .strokeColor(colors.border)
           .lineWidth(0.5)
           .stroke();
        
        return yPos + 78;
      };

      const drawInfoSection = (yPos: number) => {
        const boxWidth = (contentWidth / 2) - 15;
        const boxHeight = 75; // Increased height to accommodate consignment ID
        
        doc.rect(margin, yPos, boxWidth, boxHeight)
           .strokeColor(colors.border)
           .lineWidth(0.5)
           .stroke();
        
        doc.fontSize(8)
           .font("Helvetica-Bold")
           .fillColor(colors.primary)
           .text("INVOICE DETAILS", margin + 6, yPos + 6, { width: boxWidth - 12 });
        
        doc.fontSize(7)
           .font("Helvetica")
           .fillColor(colors.dark)
           .text(`Invoice: ${order.orderNumber}`, margin + 6, yPos + 18, { width: boxWidth - 12 })
           .text(`Date: ${new Date(order.createdAt).toLocaleDateString("en-BD", { 
             year: 'numeric', 
             month: 'short', 
             day: 'numeric' 
           })}`, margin + 6, yPos + 28, { width: boxWidth - 12 })
           .text(`Due: ${new Date(Date.now() + 14*24*60*60*1000).toLocaleDateString("en-BD", { 
             year: 'numeric', 
             month: 'short', 
             day: 'numeric' 
           })}`, margin + 6, yPos + 38, { width: boxWidth - 12 });
        
        // Tracking Code
        if (order.trackingCode) {
          doc.text(`Tracking: ${order.trackingCode}`, margin + 6, yPos + 48, { width: boxWidth - 12 });
        }
        
        // Consignment ID - NEW
        if (order.consignmentId) {
          const consignmentY = order.trackingCode ? yPos + 58 : yPos + 48;
          doc.fontSize(7)
             .fillColor(colors.secondary)
             .text(`Consignment: ${order.consignmentId}`, margin + 6, consignmentY, { width: boxWidth - 12 });
        }
        
        const statusColors: Record<string, string> = {
          pending: colors.accent,
          processing: colors.secondary,
          completed: colors.success,
          cancelled: "#ef4444"
        };
        
        const statusColor = statusColors[order.orderStatus?.toLowerCase()] || colors.gray;
        const badgeWidth = 75;
        const badgeHeight = 22;
        const badgeX = pageWidth - margin - badgeWidth;
        
        doc.roundedRect(badgeX, yPos, badgeWidth, badgeHeight, 4)
           .fill(statusColor);
        
        doc.fontSize(8)
           .font("Helvetica-Bold")
           .fillColor("#ffffff")
           .text(order.orderStatus?.toUpperCase() || "PENDING", badgeX + 4, yPos + 6, { 
             align: "center",
             width: badgeWidth - 8 
           });
        
        const billX = (pageWidth / 2) + 8;
        const billWidth = (pageWidth / 2) - margin - 12;
        
        doc.fontSize(8)
           .font("Helvetica-Bold")
           .fillColor(colors.primary)
           .text("BILL TO:", billX, yPos + 6, { width: billWidth });
        
        doc.fontSize(9)
           .font("Helvetica-Bold")
           .fillColor(colors.dark)
           .text(order.fullName, billX, yPos + 16, { width: billWidth });
        
        doc.fontSize(7)
           .font("Helvetica")
           .fillColor(colors.gray)
           .text(`Phone: ${order.phone}`, billX, yPos + 27, { width: billWidth })
           .text(`${order.email || "N/A"}`, billX, yPos + 36, { width: billWidth })
           .text(`${order.addressLine}`, billX, yPos + 45, { 
             width: billWidth,
             ellipsis: true
           });
        
        return yPos + boxHeight + 8;
      };

      const drawImagePlaceholder = (x: number, y: number, width: number, height: number) => {
        doc.rect(x, y, width, height)
           .strokeColor(colors.border)
           .lineWidth(0.5)
           .stroke();
        doc.moveTo(x, y)
           .lineTo(x + width, y + height)
           .strokeColor(colors.border)
           .lineWidth(0.3)
           .stroke();
        doc.moveTo(x + width, y)
           .lineTo(x, y + height)
           .strokeColor(colors.border)
           .lineWidth(0.3)
           .stroke();
      };

      const drawItemsTable = async (yPos: number) => {
        let currentY = yPos;
        const tableWidth = contentWidth;
        
        const colImage = { x: margin, width: 40 };
        const colDesc = { x: margin + 45, width: contentWidth - 230 };
        const colQty = { x: pageWidth - margin - 170, width: 40 };
        const colPrice = { x: pageWidth - margin - 120, width: 55 };
        const colTotal = { x: pageWidth - margin - 60, width: 60 };
        
        doc.rect(margin, currentY, tableWidth, 24)
           .fill(colors.primary);
        
        doc.fontSize(8)
           .font("Helvetica-Bold")
           .fillColor("#ffffff")
           .text("ITEM", colImage.x + 3, currentY + 8, { width: colImage.width });
        
        doc.text("DESCRIPTION", colDesc.x, currentY + 8, { width: colDesc.width });
        doc.text("QTY", colQty.x, currentY + 8, { width: colQty.width, align: "center" });
        doc.text("PRICE", colPrice.x, currentY + 8, { width: colPrice.width, align: "right" });
        doc.text("TOTAL", colTotal.x, currentY + 8, { width: colTotal.width, align: "right" });
        
        currentY += 26;
        
        const maxItemsPerPage = 8;
        const itemsToShow = order.items.slice(0, maxItemsPerPage);
        
        for (let i = 0; i < itemsToShow.length; i++) {
          const item = itemsToShow[i];
          const rowHeight = 48;
          
          if (i % 2 === 0) {
            doc.rect(margin, currentY, tableWidth, rowHeight)
               .fill(colors.lightGray);
          }
          
          doc.rect(margin, currentY, tableWidth, rowHeight)
             .strokeColor(colors.border)
             .lineWidth(0.3)
             .stroke();
          
          if (item.productImage) {
            try {
              const imageResponse = await axios.get(item.productImage, {
                responseType: "arraybuffer",
                timeout: 3000,
              });
              const imageBuffer = Buffer.from(imageResponse.data);
              doc.image(imageBuffer, colImage.x + 3, currentY + 4, { 
                width: 32, 
                height: 32,
                fit: [32, 32] as [number, number]
              });
            } catch (imgError) {
              drawImagePlaceholder(colImage.x + 3, currentY + 4, 32, 32);
            }
          } else {
            drawImagePlaceholder(colImage.x + 3, currentY + 4, 32, 32);
          }
          
          doc.fontSize(8)
             .font("Helvetica-Bold")
             .fillColor(colors.dark)
             .text(item.productTitle, colDesc.x, currentY + 6, { 
               width: colDesc.width - 8,
               ellipsis: true 
             });
          
          doc.fontSize(6)
             .font("Helvetica")
             .fillColor(colors.gray)
             .text(`Size: ${item.selectedSize || "N/A"}`, colDesc.x, currentY + 17, { width: colDesc.width - 8 })
             .text(`Color: ${item.selectedColor || "N/A"}`, colDesc.x, currentY + 25, { width: colDesc.width - 8 });
          
          doc.fontSize(8)
             .font("Helvetica-Bold")
             .fillColor(colors.dark)
             .text(item.quantity.toString(), colQty.x, currentY + 18, { 
               width: colQty.width,
               align: "center"
             });
          
          doc.fontSize(7)
             .fillColor(colors.gray)
             .text(`${item.unitPrice} Tk`, colPrice.x, currentY + 18, { 
               width: colPrice.width,
               align: "right"
             });
          
          doc.fontSize(9)
             .font("Helvetica-Bold")
             .fillColor(colors.primary)
             .text(`${item.lineTotal} Tk`, colTotal.x, currentY + 18, { 
               width: colTotal.width,
               align: "right"
             });
          
          currentY += rowHeight;
        }
        
        if (order.items.length > maxItemsPerPage) {
          const remainingItems = order.items.length - maxItemsPerPage;
          doc.fontSize(7)
             .fillColor(colors.gray)
             .text(`+ ${remainingItems} more item(s)`, margin + 6, currentY + 4, { width: contentWidth - 12 });
          currentY += 12;
        }
        
        return currentY + 8;
      };

      const drawTotals = (yPos: number) => {
        const tableWidth = 180;
        const tableX = pageWidth - margin - tableWidth;
        
        doc.fontSize(8)
           .font("Helvetica")
           .fillColor(colors.dark)
           .text("Subtotal:", tableX, yPos);
        
        doc.fontSize(8)
           .fillColor(colors.dark)
           .text(`${order.subtotal} Tk`, tableX + 90, yPos, { 
             align: "right",
             width: 80 
           });
        
        const deliveryY = yPos + 18;
        doc.fontSize(8)
           .fillColor(colors.dark)
           .text("Delivery:", tableX, deliveryY);
        
        doc.fontSize(8)
           .fillColor(colors.dark)
           .text(`${order.deliveryCharge} Tk`, tableX + 90, deliveryY, { 
             align: "right",
             width: 80 
           });
        
        const totalY = deliveryY + 24;
        doc.roundedRect(tableX, totalY, tableWidth, 42, 6)
           .fill(colors.primary);
        
        doc.fontSize(10)
           .font("Helvetica-Bold")
           .fillColor("#ffffff")
           .text("TOTAL AMOUNT", tableX + 8, totalY + 10, { width: tableWidth - 16 });
        
        doc.fontSize(16)
           .text(`${order.totalAmount} Tk`, tableX + 8, totalY + 24, { width: tableWidth - 16 });
        
        return totalY + 50;
      };

      const drawFooter = (yPos: number) => {
        const notesWidth = contentWidth;
        
        doc.fontSize(8)
           .font("Helvetica-Bold")
           .fillColor(colors.primary)
           .text("NOTES:", margin, yPos, { width: notesWidth });
        
        doc.fontSize(6)
           .fillColor(colors.gray)
           .text("Thank you for your business! For queries: sinzowear@gmail.com", margin, yPos + 10, { width: notesWidth })
           .text("Please include invoice number in payment reference", margin, yPos + 17, { width: notesWidth });
      };

      let yPos = margin;
      yPos = drawHeader(yPos);
      yPos = drawInfoSection(yPos);
      yPos = await drawItemsTable(yPos);
      yPos = drawTotals(yPos);
      drawFooter(yPos);

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
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
  updateOrderCustomerInfo,
  generateInvoice,
};
