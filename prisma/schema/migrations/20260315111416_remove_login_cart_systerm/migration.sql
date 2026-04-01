/*
  Warnings:

  - You are about to drop the column `userId` on the `carts` table. All the data in the column will be lost.
  - Made the column `guestId` on table `carts` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "carts" DROP CONSTRAINT "carts_userId_fkey";

-- DropIndex
DROP INDEX "carts_productId_idx";

-- DropIndex
DROP INDEX "carts_userId_idx";

-- AlterTable
ALTER TABLE "carts" DROP COLUMN "userId",
ALTER COLUMN "guestId" SET NOT NULL;
