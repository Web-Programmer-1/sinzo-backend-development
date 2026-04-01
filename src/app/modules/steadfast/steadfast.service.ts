import axios from "axios";
import httpStatus from "http-status";
import AppError from "../../shared/ApiError";
import { prisma } from "../../shared/Prisma";
import { CourierOrderStatus, CourierProvider, Prisma } from "@prisma/client";
import PDFDocument from "pdfkit";
import { mapSteadfastDeliveryStatusToCourierStatus } from "../../../util/Mappping";

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
  const deliveryStatus = statusResponse?.delivery_status || null;

  await prisma.order.update({
    where: { id: orderId },
    data: {
      courierRawResponse: statusResponse,
      courierNote: deliveryStatus,
      courierStatus: mapSteadfastDeliveryStatusToCourierStatus(deliveryStatus),
    },
  });

  return statusResponse;
};




const getSteadfastHistory = async (query: Record<string, any>) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const searchTerm = query.searchTerm || "";
  const courierStatus = query.courierStatus as CourierOrderStatus | undefined;
  const startDate = query.startDate;
  const endDate = query.endDate;

  const andConditions: Prisma.OrderWhereInput[] = [
    {
      courierProvider: CourierProvider.STEADFAST,
    },
  ];

  if (searchTerm) {
    andConditions.push({
      OR: [
        {
          orderNumber: {
            contains: searchTerm,
            mode: "insensitive",
          },
        },
        {
          fullName: {
            contains: searchTerm,
            mode: "insensitive",
          },
        },
        {
          phone: {
            contains: searchTerm,
            mode: "insensitive",
          },
        },
        {
          trackingCode: {
            contains: searchTerm,
            mode: "insensitive",
          },
        },
        {
          consignmentId: {
            contains: searchTerm,
            mode: "insensitive",
          },
        },
      ],
    });
  }

  if (courierStatus) {
    andConditions.push({
      courierStatus,
    });
  }

  if (startDate && endDate) {
    andConditions.push({
      courierSentAt: {
        gte: new Date(`${startDate}T00:00:00.000Z`),
        lte: new Date(`${endDate}T23:59:59.999Z`),
      },
    });
  } else if (startDate) {
    andConditions.push({
      courierSentAt: {
        gte: new Date(`${startDate}T00:00:00.000Z`),
      },
    });
  } else if (endDate) {
    andConditions.push({
      courierSentAt: {
        lte: new Date(`${endDate}T23:59:59.999Z`),
      },
    });
  }

  const whereConditions: Prisma.OrderWhereInput = {
    AND: andConditions,
  };

  const [result, total] = await Promise.all([
    prisma.order.findMany({
      where: whereConditions,
      select: {
        id: true,
        orderNumber: true,
        fullName: true,
        phone: true,
        totalAmount: true,
        dueAmount: true,
        orderStatus: true,
        paymentStatus: true,
        courierProvider: true,
        courierStatus: true,
        consignmentId: true,
        trackingCode: true,
        courierNote: true,
        courierSentAt: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        courierSentAt: "desc",
      },
      skip,
      take: limit,
    }),

    prisma.order.count({
      where: whereConditions,
    }),
  ]);

  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
    data: result,
  };
};

const getSteadfastHistoryById = async (id: string) => {
  const result = await prisma.order.findFirst({
    where: {
      id,
      courierProvider: CourierProvider.STEADFAST,
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
    throw new AppError(httpStatus.NOT_FOUND, "Steadfast courier order not found");
  }

  return result;
};



const formatDate = (date: Date | string | null | undefined) => {
  if (!date) return "N/A";

  return new Date(date).toLocaleString("en-BD", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};





// ✅ pdf generate service
const generateSteadfastHistoryPdf = async (id: string): Promise<Buffer> => {
  const order = await prisma.order.findFirst({
    where: {
      id,
      courierProvider: CourierProvider.STEADFAST,
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

  if (!order) {
    throw new AppError(httpStatus.NOT_FOUND, "Steadfast courier order not found");
  }

  const doc = new PDFDocument({
    size: "A4",
    margin: 40,
  });

  const buffers: Buffer[] = [];

  doc.on("data", (chunk: Buffer) => buffers.push(chunk));
  const pdfPromise = new Promise<Buffer>((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", reject);
  });

  // Header
  doc.fontSize(20).text("SteadFast Order Details", { align: "center" });
  doc.moveDown(0.5);
  doc.fontSize(10).text(`Printed At: ${formatDate(new Date())}`, { align: "center" });
  doc.moveDown(1.5);

  // Order info
  doc.fontSize(14).text("Order Information", { underline: true });
  doc.moveDown(0.5);

  doc.fontSize(11);
  doc.text(`Order ID: ${order.id}`);
  doc.text(`Order Number: ${order.orderNumber}`);
  doc.text(`Serial Number: ${order.serialNumber ?? "N/A"}`);
  doc.text(`Courier Provider: ${order.courierProvider ?? "N/A"}`);
  doc.text(`Courier Status: ${order.courierStatus ?? "N/A"}`);
  doc.text(`Consignment ID: ${order.consignmentId ?? "N/A"}`);
  doc.text(`Tracking Code: ${order.trackingCode ?? "N/A"}`);
  doc.text(`Order Status: ${order.orderStatus}`);
  doc.text(`Payment Method: ${order.paymentMethod}`);
  doc.text(`Payment Status: ${order.paymentStatus}`);
  doc.text(`Order Type: ${order.orderType}`);
  doc.text(`Created At: ${formatDate(order.createdAt)}`);
  doc.text(`Updated At: ${formatDate(order.updatedAt)}`);
  doc.moveDown();

  // Customer info
  doc.fontSize(14).text("Customer Information", { underline: true });
  doc.moveDown(0.5);

  doc.fontSize(11);
  doc.text(`Full Name: ${order.fullName ?? "N/A"}`);
  doc.text(`Phone: ${order.phone ?? "N/A"}`);
  doc.text(`Email: ${order.email ?? "N/A"}`);
  doc.text(`Country: ${order.country ?? "N/A"}`);
  doc.text(`City: ${order.city ?? "N/A"}`);
  doc.text(`Area: ${order.area ?? "N/A"}`);
  doc.text(`Address: ${order.addressLine ?? "N/A"}`);
  doc.text(`Note: ${order.note ?? "N/A"}`);
  doc.moveDown();

  // Delivery info
  doc.fontSize(14).text("Delivery Information", { underline: true });
  doc.moveDown(0.5);

  doc.fontSize(11);
  doc.text(`Delivery Area: ${order.deliveryArea ?? "N/A"}`);
  doc.text(`Delivery Charge: ${order.deliveryCharge ?? 0}`);
  doc.text(`Courier Sent At: ${formatDate(order.courierSentAt)}`);
  doc.moveDown();

  // Amount info
  doc.fontSize(14).text("Payment Summary", { underline: true });
  doc.moveDown(0.5);

  doc.fontSize(11);
  doc.text(`Subtotal: ${order.subtotal}`);
  doc.text(`Discount Amount: ${order.discountAmount}`);
  doc.text(`VAT Amount: ${order.vatAmount}`);
  doc.text(`Total Amount: ${order.totalAmount}`);
  doc.text(`Paid Amount: ${order.paidAmount}`);
  doc.text(`Due Amount: ${order.dueAmount}`);
  doc.moveDown();

  // Items
  doc.fontSize(14).text("Ordered Items", { underline: true });
  doc.moveDown(0.5);

  if (order.items?.length) {
    order.items.forEach((item, index) => {
      doc.fontSize(11).text(`${index + 1}. ${item.productTitle}`);
      doc.text(`   Product Slug: ${item.productSlug ?? "N/A"}`);
      doc.text(`   Color: ${item.selectedColor ?? "N/A"}`);
      doc.text(`   Size: ${item.selectedSize ?? "N/A"}`);
      doc.text(`   Unit Price: ${item.unitPrice}`);
      doc.text(`   Quantity: ${item.quantity}`);
      doc.text(`   Line Total: ${item.lineTotal}`);
      doc.moveDown(0.5);
    });
  } else {
    doc.fontSize(11).text("No items found");
  }

  doc.moveDown();
  doc.end();

  return pdfPromise;
};












const deleteSteadfastHistory = async (id: string) => {
  const order = await prisma.order.findUnique({
    where: { id },
  });

  if (!order) {
    throw new AppError(httpStatus.NOT_FOUND, "Order not found");
  }

  if (order.courierProvider !== CourierProvider.STEADFAST) {
    throw new AppError(httpStatus.BAD_REQUEST, "Order was not sent to Steadfast");
  }

  const updatedOrder = await prisma.order.update({
    where: { id },
    data: {
      courierProvider: null,
      courierStatus: "NOT_SENT",
      consignmentId: null,
      trackingCode: null,
      courierNote: null,
      courierRawResponse: null as any,
      courierSentAt: null,
    },
  });

  return updatedOrder;
};







export const SteadfastService = {
  sendSingleOrderToSteadfast,
  sendBulkOrdersToSteadfast,
  checkSteadfastStatusByInvoice,
  syncOrderCourierStatus,
  getSteadfastHistory,
  getSteadfastHistoryById,
  deleteSteadfastHistory,
  generateSteadfastHistoryPdf
};