/*
  Warnings:

  - You are about to drop the `wishlists` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "wishlists" DROP CONSTRAINT "wishlists_productId_fkey";

-- DropTable
DROP TABLE "wishlists";

-- CreateIndex
CREATE INDEX "order_items_productSlug_idx" ON "order_items"("productSlug");
