-- AlterTable
ALTER TABLE "carts" ADD COLUMN     "guestId" TEXT,
ALTER COLUMN "userId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "carts_userId_idx" ON "carts"("userId");

-- CreateIndex
CREATE INDEX "carts_guestId_idx" ON "carts"("guestId");

-- CreateIndex
CREATE INDEX "carts_productId_idx" ON "carts"("productId");
