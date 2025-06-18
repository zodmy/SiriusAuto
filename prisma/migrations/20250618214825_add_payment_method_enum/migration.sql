/*
  Warnings:

  - The values [CONFIRMED] on the enum `order_statuses` will be removed. If these variants are still used in the database, this will fail.
  - Made the column `customerLastName` on table `orders` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "payment_methods" AS ENUM ('CASH', 'CARD');

-- AlterEnum
BEGIN;
CREATE TYPE "order_statuses_new" AS ENUM ('PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'COMPLETED', 'CANCELLED');
ALTER TABLE "orders" ALTER COLUMN "status" TYPE "order_statuses_new" USING ("status"::text::"order_statuses_new");
ALTER TYPE "order_statuses" RENAME TO "order_statuses_old";
ALTER TYPE "order_statuses_new" RENAME TO "order_statuses";
DROP TYPE "order_statuses_old";
COMMIT;

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "paymentMethod" "payment_methods" NOT NULL DEFAULT 'CARD',
ALTER COLUMN "customerLastName" SET NOT NULL;
