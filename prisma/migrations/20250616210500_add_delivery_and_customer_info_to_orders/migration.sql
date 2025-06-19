/*
  Warnings:

  - Added the required column `customerEmail` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customerFirstName` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customerPhone` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deliveryMethod` to the `orders` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "customerEmail" TEXT NOT NULL,
ADD COLUMN     "customerFirstName" TEXT NOT NULL,
ADD COLUMN     "customerLastName" TEXT,
ADD COLUMN     "customerPhone" TEXT NOT NULL,
ADD COLUMN     "deliveryMethod" TEXT NOT NULL,
ADD COLUMN     "deliveryPrice" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN     "novaPoshtaBranch" TEXT,
ADD COLUMN     "novaPoshtaCity" TEXT;
