 export type CustomerBadge = "NORMAL" | "VIP" | "LOYAL";

 export  type TCustomerRankingItem = {
  customerKey: string;
  userId: string | null;
  phone: string;
  fullName: string;
  totalOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalSpent: number;
  badge: CustomerBadge;
  lastOrderAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};
