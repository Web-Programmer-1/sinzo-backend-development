import { CustomerBadge, OrderStatus } from "@prisma/client";
import { prisma } from "../../app/shared/Prisma";

type TUpdateCustomerRankingPayload = {
  userId?: string | null;
  fullName: string;
  phone: string;
  totalAmount: number;
  orderStatus: OrderStatus;
  createdAt?: Date;
};


export const getCustomerBadge = (
  deliveredOrders: number,
  totalSpent: number
): CustomerBadge => {

  // VIP if spent >= 10000
  if (totalSpent >= 10000) {
    return CustomerBadge.VIP;
  }

  // Loyal if delivered orders >= 5
  if (totalSpent >= 5000) {
    return CustomerBadge.LOYAL;
  }

  return CustomerBadge.NORMAL;
};
export const updateCustomerRanking = async (
  payload: TUpdateCustomerRankingPayload
) => {
  const { userId, fullName, phone, totalAmount, orderStatus, createdAt } =
    payload;

  const customerKey = userId ? `USER-${userId}` : `GUEST-${phone}`;

  const existingCustomer = await prisma.customerRanking.findUnique({
    where: {
      customerKey,
    },
  });

  const deliveredIncrement = orderStatus === OrderStatus.DELIVERED ? 1 : 0;
  const cancelledIncrement = orderStatus === OrderStatus.CANCELLED ? 1 : 0;
  const spendIncrement = orderStatus === OrderStatus.DELIVERED ? totalAmount : 0;

  if (!existingCustomer) {
    const badge = getCustomerBadge(deliveredIncrement, spendIncrement);

    return prisma.customerRanking.create({
      data: {
        customerKey,
        userId: userId || null,
        fullName,
        phone,
        totalOrders: 1,
        deliveredOrders: deliveredIncrement,
        cancelledOrders: cancelledIncrement,
        totalSpent: spendIncrement,
        badge,
        lastOrderAt: createdAt || new Date(),
      },
    });
  }

  const totalOrders = existingCustomer.totalOrders + 1;
  const deliveredOrders = existingCustomer.deliveredOrders + deliveredIncrement;
  const cancelledOrders = existingCustomer.cancelledOrders + cancelledIncrement;
  const totalSpent = existingCustomer.totalSpent + spendIncrement;

  const badge = getCustomerBadge(deliveredOrders, totalSpent);

  return prisma.customerRanking.update({
    where: {
      customerKey,
    },
    data: {
      fullName,
      phone,
      totalOrders,
      deliveredOrders,
      cancelledOrders,
      totalSpent,
      badge,
      lastOrderAt: createdAt || new Date(),
    },
  });
};