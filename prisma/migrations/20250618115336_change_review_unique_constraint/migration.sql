/*
  Warnings:

  - A unique constraint covering the columns `[productId,userId]` on the table `reviews` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "reviews_productId_userId_orderId_key";

-- CreateIndex
CREATE UNIQUE INDEX "reviews_productId_userId_key" ON "reviews"("productId", "userId");
