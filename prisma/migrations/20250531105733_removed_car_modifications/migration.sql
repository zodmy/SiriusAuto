/*
  Warnings:

  - You are about to drop the column `carModificationId` on the `compatibility` table. All the data in the column will be lost.
  - You are about to drop the `car_modifications` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[productId,carMakeId,carModelId,carYearId,carBodyTypeId,carEngineId]` on the table `compatibility` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `compatibility` table without a default value. This is not possible if the table is not empty.
  - Made the column `carBodyTypeId` on table `compatibility` required. This step will fail if there are existing NULL values in that column.
  - Made the column `carEngineId` on table `compatibility` required. This step will fail if there are existing NULL values in that column.
  - Made the column `carYearId` on table `compatibility` required. This step will fail if there are existing NULL values in that column.
  - Made the column `carModelId` on table `compatibility` required. This step will fail if there are existing NULL values in that column.
  - Made the column `carMakeId` on table `compatibility` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "car_modifications" DROP CONSTRAINT "car_modifications_engineId_fkey";

-- DropForeignKey
ALTER TABLE "compatibility" DROP CONSTRAINT "compatibility_carBodyTypeId_fkey";

-- DropForeignKey
ALTER TABLE "compatibility" DROP CONSTRAINT "compatibility_carEngineId_fkey";

-- DropForeignKey
ALTER TABLE "compatibility" DROP CONSTRAINT "compatibility_carMakeId_fkey";

-- DropForeignKey
ALTER TABLE "compatibility" DROP CONSTRAINT "compatibility_carModelId_fkey";

-- DropForeignKey
ALTER TABLE "compatibility" DROP CONSTRAINT "compatibility_carModificationId_fkey";

-- DropForeignKey
ALTER TABLE "compatibility" DROP CONSTRAINT "compatibility_carYearId_fkey";

-- DropForeignKey
ALTER TABLE "compatibility" DROP CONSTRAINT "compatibility_productId_fkey";

-- DropIndex
DROP INDEX "compatibility_productId_carModificationId_carBodyTypeId_car_key";

-- AlterTable
ALTER TABLE "compatibility" DROP COLUMN "carModificationId",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "carBodyTypeId" SET NOT NULL,
ALTER COLUMN "carEngineId" SET NOT NULL,
ALTER COLUMN "carYearId" SET NOT NULL,
ALTER COLUMN "carModelId" SET NOT NULL,
ALTER COLUMN "carMakeId" SET NOT NULL;

-- DropTable
DROP TABLE "car_modifications";

-- CreateIndex
CREATE UNIQUE INDEX "compatibility_productId_carMakeId_carModelId_carYearId_carB_key" ON "compatibility"("productId", "carMakeId", "carModelId", "carYearId", "carBodyTypeId", "carEngineId");

-- AddForeignKey
ALTER TABLE "compatibility" ADD CONSTRAINT "compatibility_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compatibility" ADD CONSTRAINT "compatibility_carMakeId_fkey" FOREIGN KEY ("carMakeId") REFERENCES "car_makes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compatibility" ADD CONSTRAINT "compatibility_carModelId_fkey" FOREIGN KEY ("carModelId") REFERENCES "car_models"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compatibility" ADD CONSTRAINT "compatibility_carYearId_fkey" FOREIGN KEY ("carYearId") REFERENCES "car_years"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compatibility" ADD CONSTRAINT "compatibility_carBodyTypeId_fkey" FOREIGN KEY ("carBodyTypeId") REFERENCES "car_body_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compatibility" ADD CONSTRAINT "compatibility_carEngineId_fkey" FOREIGN KEY ("carEngineId") REFERENCES "car_engines"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
