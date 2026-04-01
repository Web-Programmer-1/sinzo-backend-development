/*
  Warnings:

  - You are about to drop the column `colors` on the `products` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ProductColor" AS ENUM ('BLACK', 'WHITE', 'BLUE', 'RED', 'GREEN', 'YELLOW', 'GRAY', 'BROWN', 'NAVY', 'PINK', 'PURPLE', 'ORANGE');

-- AlterTable
ALTER TABLE "products" DROP COLUMN "colors",
ADD COLUMN     "colorVariants" JSONB;
