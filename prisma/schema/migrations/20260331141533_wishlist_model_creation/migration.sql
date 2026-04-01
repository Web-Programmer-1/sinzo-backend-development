-- CreateTable
CREATE TABLE "wishlists" (
    "id" TEXT NOT NULL,
    "guestId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "selectedColor" TEXT,
    "selectedSize" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wishlists_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "wishlists_guestId_idx" ON "wishlists"("guestId");

-- CreateIndex
CREATE UNIQUE INDEX "wishlists_guestId_productId_selectedColor_selectedSize_key" ON "wishlists"("guestId", "productId", "selectedColor", "selectedSize");

-- AddForeignKey
ALTER TABLE "wishlists" ADD CONSTRAINT "wishlists_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
