-- CreateEnum
CREATE TYPE "CourierProvider" AS ENUM ('STEADFAST');

-- CreateEnum
CREATE TYPE "CourierOrderStatus" AS ENUM ('NOT_SENT', 'SENT', 'FAILED');

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "consignmentId" TEXT,
ADD COLUMN     "courierNote" TEXT,
ADD COLUMN     "courierProvider" "CourierProvider",
ADD COLUMN     "courierRawResponse" JSONB,
ADD COLUMN     "courierSentAt" TIMESTAMP(3),
ADD COLUMN     "courierStatus" "CourierOrderStatus" NOT NULL DEFAULT 'NOT_SENT',
ADD COLUMN     "trackingCode" TEXT;
