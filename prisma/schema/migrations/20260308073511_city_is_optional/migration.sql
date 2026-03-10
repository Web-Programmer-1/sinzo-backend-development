-- DropIndex
DROP INDEX "users_id_email_idx";

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "city" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");
