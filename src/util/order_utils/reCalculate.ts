import { CustomerBadge } from "@prisma/client";
import { prisma } from "../../app/shared/Prisma";

const getCustomerBadge = (
  deliveredOrders: number,
  totalSpent: number
): CustomerBadge => {
  if (totalSpent >= 10000) {
    return CustomerBadge.VIP;
  }

  if (totalSpent >= 5000) {
    return CustomerBadge.LOYAL;
  }

  return CustomerBadge.NORMAL;
};

export const recalculateSingleCustomerRanking = async ({
  userId,
  phone,
}: {
  userId?: string | null;
  phone: string;
}) => {
  const customerKey = userId ? `USER-${userId}` : `GUEST-${phone}`;

  const orders = await prisma.order.findMany({
    where: userId
      ? { userId }
      : {
          userId: null,
          phone,
        },
    select: {
      fullName: true,
      phone: true,
      totalAmount: true,
      orderStatus: true,
      createdAt: true,
      userId: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!orders.length) return null;

  const totalOrders = orders.length;
  const deliveredOrders = orders.filter(
    (o) => o.orderStatus === "DELIVERED"
  ).length;
  const cancelledOrders = orders.filter(
    (o) => o.orderStatus === "CANCELLED"
  ).length;

  const totalSpent = orders
    .filter((o) => o.orderStatus === "DELIVERED")
    .reduce((sum, order) => sum + order.totalAmount, 0);

  const latestOrder = orders[0];
  const badge = getCustomerBadge(deliveredOrders, totalSpent);

  return prisma.customerRanking.upsert({
    where: {
      customerKey,
    },
    update: {
      fullName: latestOrder.fullName,
      phone: latestOrder.phone,
      totalOrders,
      deliveredOrders,
      cancelledOrders,
      totalSpent,
      badge,
      lastOrderAt: latestOrder.createdAt,
    },
    create: {
      customerKey,
      userId: latestOrder.userId || null,
      fullName: latestOrder.fullName,
      phone: latestOrder.phone,
      totalOrders,
      deliveredOrders,
      cancelledOrders,
      totalSpent,
      badge,
      lastOrderAt: latestOrder.createdAt,
    },
  });
};