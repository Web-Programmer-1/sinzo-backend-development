-- CreateEnum
CREATE TYPE "ManualPaymentGateway" AS ENUM ('BKASH', 'NAGAD', 'ROCKET', 'BANK');

-- CreateEnum
CREATE TYPE "ManualPaymentVerificationStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

-- AlterEnum
ALTER TYPE "PaymentStatus" ADD VALUE 'PENDING';

-- CreateTable
CREATE TABLE "manual_payment_submissions" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "gateway" "ManualPaymentGateway" NOT NULL,
    "senderNumber" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "paidAmount" DOUBLE PRECISION,
    "note" TEXT,
    "verificationStatus" "ManualPaymentVerificationStatus" NOT NULL DEFAULT 'PENDING',
    "adminNote" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "verifiedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "manual_payment_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "manual_payment_submissions_orderId_key" ON "manual_payment_submissions"("orderId");

-- CreateIndex
CREATE INDEX "manual_payment_submissions_gateway_idx" ON "manual_payment_submissions"("gateway");

-- CreateIndex
CREATE INDEX "manual_payment_submissions_senderNumber_idx" ON "manual_payment_submissions"("senderNumber");

-- CreateIndex
CREATE INDEX "manual_payment_submissions_transactionId_idx" ON "manual_payment_submissions"("transactionId");

-- CreateIndex
CREATE INDEX "manual_payment_submissions_verificationStatus_idx" ON "manual_payment_submissions"("verificationStatus");

-- AddForeignKey
ALTER TABLE "manual_payment_submissions" ADD CONSTRAINT "manual_payment_submissions_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manual_payment_submissions" ADD CONSTRAINT "manual_payment_submissions_verifiedById_fkey" FOREIGN KEY ("verifiedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
