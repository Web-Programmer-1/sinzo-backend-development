import {
  Prisma,
  CustomerBadge,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  CourierOrderStatus,
  DeliveryAreaType,
} from "@prisma/client";
import { prisma } from "../../shared/Prisma";
import { getDateRange } from "../../../util/GetDataRange";

const LOW_STOCK_THRESHOLD = 2;

const getOverview = async (query: Record<string, unknown>) => {
  const { range, startDate, endDate } = getDateRange(query.range as string);
  const lowStockThreshold = LOW_STOCK_THRESHOLD;

  const orderWhere: Prisma.OrderWhereInput = {
    createdAt: {
      gte: startDate,
      lte: endDate,
    },
  };

  const deliveredRevenueWhere: Prisma.OrderWhereInput = {
    createdAt: {
      gte: startDate,
      lte: endDate,
    },
    orderStatus: OrderStatus.DELIVERED,
  };

  const [
    totalOrders,
    deliveredOrders,
    pendingOrders,
    processingOrders,
    cancelledOrders,
    returnedOrders,
    paidOrders,
    totalRevenueAgg,
    todayOrders,
    todayRevenueAgg,
    totalCustomers,
    totalProducts,
    lowStockProductsCount,
    outOfStockProductsCount,
    totalReviews,
    avgProductRatingAgg,
    recentOrders,
    lowStockProducts,
    topCustomers,
    customerBadgeCounts,
    paymentStatusCounts,
    paymentMethodCounts,
    orderStatusCounts,
    courierStatusCounts,
    deliveryAreaCounts,
    topProductsRaw,
    revenueTrendRaw,
    ordersTrendRaw,
  ] = await Promise.all([
    prisma.order.count({
      where: orderWhere,
    }),

    prisma.order.count({
      where: {
        ...orderWhere,
        orderStatus: OrderStatus.DELIVERED,
      },
    }),

    prisma.order.count({
      where: {
        ...orderWhere,
        orderStatus: OrderStatus.PENDING,
      },
    }),

    prisma.order.count({
      where: {
        ...orderWhere,
        orderStatus: OrderStatus.PROCESSING,
      },
    }),

    prisma.order.count({
      where: {
        ...orderWhere,
        orderStatus: OrderStatus.CANCELLED,
      },
    }),

    prisma.order.count({
      where: {
        ...orderWhere,
        orderStatus: OrderStatus.RETURNED,
      },
    }),

    prisma.order.count({
      where: {
        ...orderWhere,
        paymentStatus: PaymentStatus.PAID,
      },
    }),

    prisma.order.aggregate({
      where: deliveredRevenueWhere,
      _sum: {
        totalAmount: true,
      },
    }),

    prisma.order.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lte: new Date(),
        },
      },
    }),

    prisma.order.aggregate({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lte: new Date(),
        },
        orderStatus: OrderStatus.DELIVERED,
      },
      _sum: {
        totalAmount: true,
      },
    }),

    prisma.customerRanking.count(),

    prisma.product.count(),

    prisma.product.count({
      where: {
        stock: {
          gt: 0,
          lte: lowStockThreshold,
        },
      },
    }),

    prisma.product.count({
      where: {
        stock: 0,
      },
    }),

    prisma.review.count(),

    prisma.product.aggregate({
      _avg: {
        averageRating: true,
      },
    }),

    prisma.order.findMany({
      where: orderWhere,
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
      select: {
        id: true,
        orderNumber: true,
        fullName: true,
        phone: true,
        totalAmount: true,
        paymentStatus: true,
        orderStatus: true,
        createdAt: true,
      },
    }),

    prisma.product.findMany({
      where: {
        stock: {
          gt: 0,
          lte: lowStockThreshold,
        },
      },
      orderBy: [{ stock: "asc" }, { updatedAt: "desc" }],
      take: 5,
      select: {
        id: true,
        title: true,
        stock: true,
        productCardImage: true,
        category: {
          select: {
            title: true,
          },
        },
      },
    }),

    prisma.customerRanking.findMany({
      orderBy: [
        { totalSpent: "desc" },
        { deliveredOrders: "desc" },
        { totalOrders: "desc" },
      ],
      take: 5,
      select: {
        id: true,
        fullName: true,
        phone: true,
        totalOrders: true,
        deliveredOrders: true,
        totalSpent: true,
        badge: true,
      },
    }),

    prisma.customerRanking.groupBy({
      by: ["badge"],
      _count: {
        badge: true,
      },
    }),

    prisma.order.groupBy({
      by: ["paymentStatus"],
      where: orderWhere,
      _count: {
        paymentStatus: true,
      },
    }),

    prisma.order.groupBy({
      by: ["paymentMethod"],
      where: orderWhere,
      _count: {
        paymentMethod: true,
      },
    }),

    prisma.order.groupBy({
      by: ["orderStatus"],
      where: orderWhere,
      _count: {
        orderStatus: true,
      },
    }),

    prisma.order.groupBy({
      by: ["courierStatus"],
      where: orderWhere,
      _count: {
        courierStatus: true,
      },
    }),

    prisma.order.groupBy({
      by: ["deliveryArea"],
      where: orderWhere,
      _count: {
        deliveryArea: true,
      },
    }),

    prisma.orderItem.groupBy({
      by: ["productId", "productTitle"],
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: {
        quantity: true,
        lineTotal: true,
      },
      orderBy: {
        _sum: {
          quantity: "desc",
        },
      },
      take: 5,
    }),

    prisma.order.groupBy({
      by: ["createdAt"],
      where: deliveredRevenueWhere,
      _sum: {
        totalAmount: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    }),

    prisma.order.groupBy({
      by: ["createdAt"],
      where: orderWhere,
      _count: {
        id: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    }),
  ]);

  const totalRevenue = totalRevenueAgg._sum.totalAmount ?? 0;
  const todayRevenue = todayRevenueAgg._sum.totalAmount ?? 0;

  const averageOrderValue =
    totalOrders > 0 ? Number((totalRevenue / totalOrders).toFixed(2)) : 0;

  const cancelRate =
    totalOrders > 0
      ? Number(((cancelledOrders / totalOrders) * 100).toFixed(2))
      : 0;

  const deliverySuccessRate =
    totalOrders > 0
      ? Number(((deliveredOrders / totalOrders) * 100).toFixed(2))
      : 0;

  const paidOrderRate =
    totalOrders > 0
      ? Number(((paidOrders / totalOrders) * 100).toFixed(2))
      : 0;

  const orderStatus = normalizeOrderStatusCounts(orderStatusCounts);
  const paymentStatus = normalizePaymentStatusCounts(paymentStatusCounts);
  const paymentMethod = normalizePaymentMethodCounts(paymentMethodCounts);
  const courierStatus = normalizeCourierStatusCounts(courierStatusCounts);
  const deliveryArea = normalizeDeliveryAreaCounts(deliveryAreaCounts);
  const customerBadge = normalizeCustomerBadgeCounts(customerBadgeCounts);

  const stockHealth = {
    IN_STOCK: totalProducts - lowStockProductsCount - outOfStockProductsCount,
    LOW_STOCK: lowStockProductsCount,
    OUT_OF_STOCK: outOfStockProductsCount,
  };

  const topProducts = topProductsRaw.map((item) => ({
    productId: item.productId,
    title: item.productTitle,
    sold: item._sum.quantity ?? 0,
    revenue: item._sum.lineTotal ?? 0,
  }));

  const revenueTrend = formatRevenueTrend(range, revenueTrendRaw, startDate);
  const ordersTrend = formatOrdersTrend(range, ordersTrendRaw, startDate);

  return {
    meta: {
      range,
      generatedAt: new Date().toISOString(),
      lowStockThreshold,
    },
    kpi: {
      totalRevenue,
      todayRevenue,
      totalOrders,
      todayOrders,
      deliveredOrders,
      pendingOrders,
      processingOrders,
      cancelledOrders,
      returnedOrders,
      totalCustomers,
      totalProducts,
      lowStockProducts: lowStockProductsCount,
      outOfStockProducts: outOfStockProductsCount,
      totalReviews,
      averageRating: Number(
        (avgProductRatingAgg._avg.averageRating ?? 0).toFixed(2)
      ),
      averageOrderValue,
      cancelRate,
      deliverySuccessRate,
      paidOrderRate,
    },
    graphs: {
      revenueTrend,
      ordersTrend,
      topProducts,
    },
    charts: {
      orderStatus,
      paymentStatus,
      paymentMethod,
      courierStatus,
      deliveryArea,
      customerBadge,
      stockHealth,
    },
    tables: {
      recentOrders,
      topCustomers,
      lowStockProducts: lowStockProducts.map((item) => ({
        id: item.id,
        title: item.title,
        stock: item.stock,
        productCardImage: item.productCardImage,
        category: item.category.title,
      })),
      topProducts,
    },
    alerts: {
      pendingOrders,
      lowStockProducts: lowStockProductsCount,
      outOfStockProducts: outOfStockProductsCount,
      failedCourier: courierStatus.FAILED,
      highCancelRate: cancelRate >= 20,
    },
  };
};

const normalizeOrderStatusCounts = (
  rows: Array<{ orderStatus: OrderStatus; _count: { orderStatus: number } }>
) => {
  const base = {
    PENDING: 0,
    CONFIRMED: 0,
    PROCESSING: 0,
    PACKED: 0,
    SHIPPED: 0,
    OUT_FOR_DELIVERY: 0,
    DELIVERED: 0,
    CANCELLED: 0,
    RETURNED: 0,
  };

  for (const row of rows) {
    base[row.orderStatus] = row._count.orderStatus;
  }

  return base;
};

const normalizePaymentStatusCounts = (
  rows: Array<{ paymentStatus: PaymentStatus; _count: { paymentStatus: number } }>
) => {
  const base = {
    UNPAID: 0,
    PAID: 0,
    PARTIAL: 0,
    REFUNDED: 0,
  };

  for (const row of rows) {
    base[row.paymentStatus] = row._count.paymentStatus;
  }

  return base;
};

const normalizePaymentMethodCounts = (
  rows: Array<{ paymentMethod: PaymentMethod; _count: { paymentMethod: number } }>
) => {
  const base = {
    CASH_ON_DELIVERY: 0,
    ONLINE_PAYMENT: 0,
  };

  for (const row of rows) {
    base[row.paymentMethod] = row._count.paymentMethod;
  }

  return base;
};

const normalizeCourierStatusCounts = (
  rows: Array<{ courierStatus: CourierOrderStatus; _count: { courierStatus: number } }>
) => {
  const base = {
    NOT_SENT: 0,
    SENT: 0,
    FAILED: 0,
  };

  for (const row of rows) {
    base[row.courierStatus] = row._count.courierStatus;
  }

  return base;
};

const normalizeDeliveryAreaCounts = (
  rows: Array<{ deliveryArea: DeliveryAreaType; _count: { deliveryArea: number } }>
) => {
  const base = {
    INSIDE_CITY: 0,
    OUTSIDE_CITY: 0,
  };

  for (const row of rows) {
    base[row.deliveryArea] = row._count.deliveryArea;
  }

  return base;
};

const normalizeCustomerBadgeCounts = (
  rows: Array<{ badge: CustomerBadge; _count: { badge: number } }>
) => {
  const base = {
    NORMAL: 0,
    LOYAL: 0,
    VIP: 0,
  };

  for (const row of rows) {
    base[row.badge] = row._count.badge;
  }

  return base;
};

const formatRevenueTrend = (
  range: string,
  rows: Array<{ createdAt: Date; _sum: { totalAmount: number | null } }>,
  startDate: Date
) => {
  if (range === "12m") {
    const monthMap = new Map<string, number>();

    for (let i = 0; i < 12; i++) {
      const d = new Date(startDate);
      d.setMonth(startDate.getMonth() + i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthMap.set(key, 0);
    }

    for (const row of rows) {
      const d = new Date(row.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthMap.set(key, (monthMap.get(key) ?? 0) + (row._sum.totalAmount ?? 0));
    }

    return Array.from(monthMap.entries()).map(([month, revenue]) => ({
      label: month,
      revenue,
    }));
  }

  const dayMap = new Map<string, number>();
  const totalDays = range === "7d" ? 7 : range === "today" ? 1 : 30;

  for (let i = 0; i < totalDays; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    dayMap.set(key, 0);
  }

  for (const row of rows) {
    const key = new Date(row.createdAt).toISOString().slice(0, 10);
    dayMap.set(key, (dayMap.get(key) ?? 0) + (row._sum.totalAmount ?? 0));
  }

  return Array.from(dayMap.entries()).map(([date, revenue]) => ({
    label: date,
    revenue,
  }));
};

const formatOrdersTrend = (
  range: string,
  rows: Array<{ createdAt: Date; _count: { id: number } }>,
  startDate: Date
) => {
  if (range === "12m") {
    const monthMap = new Map<string, number>();

    for (let i = 0; i < 12; i++) {
      const d = new Date(startDate);
      d.setMonth(startDate.getMonth() + i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthMap.set(key, 0);
    }

    for (const row of rows) {
      const d = new Date(row.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthMap.set(key, (monthMap.get(key) ?? 0) + row._count.id);
    }

    return Array.from(monthMap.entries()).map(([month, orders]) => ({
      label: month,
      orders,
    }));
  }

  const dayMap = new Map<string, number>();
  const totalDays = range === "7d" ? 7 : range === "today" ? 1 : 30;

  for (let i = 0; i < totalDays; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    dayMap.set(key, 0);
  }

  for (const row of rows) {
    const key = new Date(row.createdAt).toISOString().slice(0, 10);
    dayMap.set(key, (dayMap.get(key) ?? 0) + row._count.id);
  }

  return Array.from(dayMap.entries()).map(([date, orders]) => ({
    label: date,
    orders,
  }));
};

export const DashboardService = {
  getOverview,
};