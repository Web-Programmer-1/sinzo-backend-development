import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";
import { buildReceiptHtml } from "./recipt.template";

export const generateReceiptPdf = async (order: any) => {
  const browser = await puppeteer.launch({
    args: chromium.args,
    executablePath: await chromium.executablePath(),
    headless: true,
  });

  try {
    const page = await browser.newPage();

    const html = buildReceiptHtml(order);

    await page.setContent(html, {
      waitUntil: "networkidle0",
    });

    // ⚠️ Vercel এ filesystem write হয় না, তাই filePath বাদ দিয়ে Buffer return করুন
    const pdfBuffer = await page.pdf({
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
      fileName: `${order.orderNumber}.pdf`,
      pdfBuffer, // এটা দিয়ে S3 তে upload বা directly response করুন
    };
  } finally {
    await browser.close();
  }
};