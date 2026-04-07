import { DeliveryAreaType, ManualPaymentGateway, PaymentMethod } from "@prisma/client";

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
 export type TPlaceOrderPayload = {
  fullName: string;
  phone: string;
  email?: string;
  country?: string;
  city?: string;
  area?: string;
  addressLine: string;
  note?: string;
  deliveryArea: DeliveryAreaType;
  paymentMethod?: PaymentMethod;
  manualPayment?: {
    gateway: ManualPaymentGateway;
    senderNumber: string;
    transactionId: string;
    paidAmount?: number;
    note?: string;
  };
};