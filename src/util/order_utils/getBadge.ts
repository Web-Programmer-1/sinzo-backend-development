import { CustomerBadge } from "@prisma/client";

export const getCustomerBadge = (
  deliveredOrders: number,
  totalSpent: number
): CustomerBadge => {

  // VIP if spent >= 10000
  if (totalSpent >= 10000) {
    return CustomerBadge.VIP;
  }

  // Loyal if delivered orders >= 5
  if (deliveredOrders >= 5) {
    return CustomerBadge.LOYAL;
  }

  return CustomerBadge.NORMAL;
};