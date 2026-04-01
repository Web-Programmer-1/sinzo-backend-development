import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

type TOrderForPdf = {
  orderNumber: string;
  fullName: string;
  phone: string;
  addressLine: string;
  city?: string | null;
  area?: string | null;
  totalAmount: number;
  deliveryCharge: number;
  note?: string | null;
  trackingCode?: string | null;
  consignmentId?: string | null;
  items: {
    productTitle: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
    selectedColor?: string | null;
    selectedSize?: string | null;
  }[];
};

export const generateBulkOrderPdf = async (
  orders: TOrderForPdf[]
): Promise<{ fileName: string; filePath: string }> => {
  return new Promise((resolve, reject) => {
    try {
      const uploadDir = path.join(process.cwd(), "uploads", "steadfast");

      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const fileName = `bulk-orders-${Date.now()}.pdf`;
      const filePath = path.join(uploadDir, fileName);

      const doc = new PDFDocument({ size: "A4", margin: 40 });
      const stream = fs.createWriteStream(filePath);

      doc.pipe(stream);

      orders.forEach((order, index) => {
        if (index > 0) doc.addPage();

        doc.fontSize(16).text("Steadfast Bulk Order", { align: "center" });
        doc.moveDown();

        doc.fontSize(11).text(`Order No: ${order.orderNumber}`);
        doc.text(`Customer: ${order.fullName}`);
        doc.text(`Phone: ${order.phone}`);
        doc.text(
          `Address: ${order.addressLine}, ${order.area || ""}, ${order.city || ""}`
        );
        doc.text(`COD: ${order.totalAmount}`);
        doc.text(`Tracking Code: ${order.trackingCode || "-"}`);
        doc.text(`Consignment ID: ${order.consignmentId || "-"}`);
        doc.moveDown();

        doc.text("Items:");
        order.items.forEach((item, i) => {
          doc.text(
            `${i + 1}. ${item.productTitle} | Qty: ${item.quantity} | Total: ${item.lineTotal}`
          );
        });
      });

      doc.end();

      stream.on("finish", () => {
        resolve({ fileName, filePath });
      });

      stream.on("error", reject);
    } catch (error) {
      reject(error);
    }
  });
};