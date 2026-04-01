-- CreateEnum
CREATE TYPE "CustomerBadge" AS ENUM ('NORMAL', 'VIP', 'LOYAL');

-- CreateTable
CREATE TABLE "customer_rankings" (
    "id" TEXT NOT NULL,
    "customerKey" TEXT NOT NULL,
    "userId" TEXT,
    "phone" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "totalOrders" INTEGER NOT NULL DEFAULT 0,
    "deliveredOrders" INTEGER NOT NULL DEFAULT 0,
    "cancelledOrders" INTEGER NOT NULL DEFAULT 0,
    "totalSpent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "badge" "CustomerBadge" NOT NULL DEFAULT 'NORMAL',
    "lastOrderAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_rankings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "customer_rankings_customerKey_key" ON "customer_rankings"("customerKey");

-- CreateIndex
CREATE INDEX "customer_rankings_customerKey_idx" ON "customer_rankings"("customerKey");

-- CreateIndex
CREATE INDEX "customer_rankings_userId_idx" ON "customer_rankings"("userId");

-- CreateIndex
CREATE INDEX "customer_rankings_phone_idx" ON "customer_rankings"("phone");

-- CreateIndex
CREATE INDEX "customer_rankings_badge_idx" ON "customer_rankings"("badge");

-- CreateIndex
CREATE INDEX "customer_rankings_totalOrders_idx" ON "customer_rankings"("totalOrders");

-- CreateIndex
CREATE INDEX "customer_rankings_deliveredOrders_idx" ON "customer_rankings"("deliveredOrders");
