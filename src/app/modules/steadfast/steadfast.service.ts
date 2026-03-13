import axios from "axios";
import httpStatus from "http-status";
import AppError from "../../shared/ApiError";
import { prisma } from "../../shared/Prisma";
import { CourierOrderStatus, CourierProvider, Prisma } from "@prisma/client";

const baseURL = process.env.STEADFAST_BASE_URL as string;
const apiKey = process.env.STEADFAST_API_KEY as string;
const secretKey = process.env.STEADFAST_SECRET_KEY as string;

const steadfastClient = axios.create({
  baseURL,
  headers: {
    "Api-Key": apiKey,
    "Secret-Key": secretKey,
    "Content-Type": "application/json",
  },
});

const buildRecipientPhone = (phone: string) => {
  let cleaned = phone.replace(/\s+/g, "").trim();

  if (cleaned.startsWith("+880")) {
    cleaned = "0" + cleaned.slice(4);
  } else if (cleaned.startsWith("880")) {
    cleaned = "0" + cleaned.slice(3);
  }

  return cleaned;
};

const buildRecipientAddress = (order: any) => {
  return [order.addressLine, order.area, order.city, order.country]
    .filter(Boolean)
    .join(", ")
    .slice(0, 250);
};

const buildSteadfastPayloadFromOrder = (order: any) => {
  return {
    invoice: order.orderNumber,
    recipient_name: order.fullName,
    recipient_phone: buildRecipientPhone(order.phone),
    alternative_phone: "",
    recipient_email: order.email || "",
    recipient_address: buildRecipientAddress(order),
    cod_amount: order.totalAmount,
    note: order.note || "",
    item_description: order.items?.map((i: any) => i.productTitle).join(", ").slice(0, 255) || "Order items",
    total_lot: order.items?.reduce((sum: number, i: any) => sum + i.quantity, 0) || 1,
    delivery_type: 0,
  };
};

const sendSingleOrderToSteadfast = async (orderId: string) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
    },
  });

  if (!order) {
    throw new AppError(httpStatus.NOT_FOUND, "Order not found");
  }

  if (order.courierStatus === "SENT" && order.consignmentId) {
    throw new AppError(httpStatus.BAD_REQUEST, "Order already sent to Steadfast");
  }

  const payload = buildSteadfastPayloadFromOrder(order);

  try {
    const { data } = await steadfastClient.post("/create_order", payload);

    const consignment = data?.consignment;

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        courierProvider: CourierProvider.STEADFAST,
        courierStatus: CourierOrderStatus.SENT,
        consignmentId: consignment?.consignment_id?.toString() || null,
        trackingCode: consignment?.tracking_code || null,
        courierNote: consignment?.status || null,
        courierRawResponse: data,
        courierSentAt: new Date(),
      },
    });

    return {
      steadfastResponse: data,
      order: updatedOrder,
    };
  } catch (error: any) {
  console.log("STEADFAST ERROR STATUS:", error?.response?.status);
  console.log("STEADFAST ERROR DATA:", error?.response?.data);
  console.log("STEADFAST ERROR MESSAGE:", error?.message);

  await prisma.order.update({
    where: { id: orderId },
    data: {
      courierProvider: CourierProvider.STEADFAST,
      courierStatus: CourierOrderStatus.FAILED,
      courierRawResponse: error?.response?.data || { message: error.message },
    },
  });

  throw new AppError(
    httpStatus.BAD_REQUEST,
    error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      "Failed to send order to Steadfast"
  );
}
};

const sendBulkOrdersToSteadfast = async (orderIds: string[]) => {
  if (!orderIds?.length) {
    throw new AppError(httpStatus.BAD_REQUEST, "Order IDs are required");
  }

  if (orderIds.length > 500) {
    throw new AppError(httpStatus.BAD_REQUEST, "Maximum 500 orders allowed at a time");
  }

  const orders = await prisma.order.findMany({
    where: {
      id: { in: orderIds },
    },
    include: {
      items: true,
    },
  });

  if (!orders.length) {
    throw new AppError(httpStatus.NOT_FOUND, "No orders found");
  }

  const payloadData = orders.map((order) => buildSteadfastPayloadFromOrder(order));

  try {
    const { data } = await steadfastClient.post("/create_order/bulk-order", {
      data: JSON.stringify(payloadData),
    });

    const resultArray = Array.isArray(data) ? data : data?.data || [];

    await prisma.$transaction(
      resultArray.map((item: any) => {
        const matchedOrder = orders.find((o) => o.orderNumber === item.invoice);

        if (!matchedOrder) {
          return prisma.$executeRaw`SELECT 1`;
        }

        return prisma.order.update({
          where: { id: matchedOrder.id },
          data: {
            courierProvider: CourierProvider.STEADFAST,
            courierStatus:
              item.status === "success"
                ? CourierOrderStatus.SENT
                : CourierOrderStatus.FAILED,
            consignmentId: item.consignment_id?.toString() || null,
            trackingCode: item.tracking_code || null,
            courierNote: item.status || null,
            courierRawResponse: item,
            courierSentAt: item.status === "success" ? new Date() : null,
          },
        });
      })
    );

    return resultArray;
  } catch (error: any) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      error?.response?.data?.message || "Failed to send bulk orders to Steadfast"
    );
  }
};

const checkSteadfastStatusByInvoice = async (invoice: string) => {
  try {
    const { data } = await steadfastClient.get(`/status_by_invoice/${invoice}`);
    return data;
  } catch (error: any) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      error?.response?.data?.message || "Failed to fetch Steadfast status"
    );
  }
};

const syncOrderCourierStatus = async (orderId: string) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    throw new AppError(httpStatus.NOT_FOUND, "Order not found");
  }

  if (!order.orderNumber) {
    throw new AppError(httpStatus.BAD_REQUEST, "Order number not found");
  }

  const statusResponse = await checkSteadfastStatusByInvoice(order.orderNumber);

  await prisma.order.update({
    where: { id: orderId },
    data: {
      courierRawResponse: statusResponse,
      courierNote: statusResponse?.delivery_status || null,
    },
  });

  return statusResponse;
};

export const SteadfastService = {
  sendSingleOrderToSteadfast,
  sendBulkOrdersToSteadfast,
  checkSteadfastStatusByInvoice,
  syncOrderCourierStatus,
};