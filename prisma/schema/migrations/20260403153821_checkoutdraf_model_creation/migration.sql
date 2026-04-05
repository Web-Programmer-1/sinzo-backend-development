-- CreateTable
CREATE TABLE "checkout_drafts" (
    "id" TEXT NOT NULL,
    "guestId" TEXT,
    "fullName" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "addressLine" TEXT,
    "deliveryArea" "DeliveryAreaType",
    "paymentMethod" "PaymentMethod",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "checkout_drafts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "checkout_drafts_guestId_idx" ON "checkout_drafts"("guestId");

-- CreateIndex
CREATE INDEX "checkout_drafts_phone_idx" ON "checkout_drafts"("phone");
