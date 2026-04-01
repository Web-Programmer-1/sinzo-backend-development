import fs from "fs";
import path from "path";
import puppeteer from "puppeteer";
import { buildReceiptHtml } from "./recipt.template";

export const generateReceiptPdf = async (order: any) => {
  const browser = await puppeteer.launch({
    headless: true,
  });

  try {
    const page = await browser.newPage();

    const html = buildReceiptHtml(order);

    await page.setContent(html, {
      waitUntil: "networkidle0",
    });

    const receiptsDir = path.join(process.cwd(), "uploads", "receipts");

    if (!fs.existsSync(receiptsDir)) {
      fs.mkdirSync(receiptsDir, { recursive: true });
    }

    const fileName = `${order.orderNumber}.pdf`;
    const filePath = path.join(receiptsDir, fileName);

    await page.pdf({
      path: filePath,
      format: "A4",
      printBackground: true,
      margin: {
        top: "20px",
        right: "20px",
        bottom: "20px",
        left: "20px",
      },
    });

    return {
      html,
      fileName,
      filePath,
    };
  } finally {
    await browser.close();
  }
};