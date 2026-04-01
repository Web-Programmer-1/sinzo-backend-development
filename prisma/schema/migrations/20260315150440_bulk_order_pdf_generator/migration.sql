-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "receiptHtml" TEXT,
ADD COLUMN     "receiptPdfPath" TEXT,
ALTER COLUMN "guestId" DROP NOT NULL;
