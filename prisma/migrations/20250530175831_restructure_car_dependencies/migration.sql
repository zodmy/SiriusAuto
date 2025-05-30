/*
  Warnings:

  - You are about to drop the column `engineId` on the `car_body_types` table. All the data in the column will be lost.
  - You are about to drop the column `yearId` on the `car_engines` table. All the data in the column will be lost.
  - You are about to drop the column `bodyTypeId` on the `car_modifications` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[yearId,name]` on the table `car_body_types` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[bodyTypeId,name]` on the table `car_engines` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[engineId,name]` on the table `car_modifications` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `yearId` to the `car_body_types` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bodyTypeId` to the `car_engines` table without a default value. This is not possible if the table is not empty.
  - Added the required column `engineId` to the `car_modifications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `passwordHash` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "car_body_types" DROP CONSTRAINT "car_body_types_engineId_fkey";

-- DropForeignKey
ALTER TABLE "car_engines" DROP CONSTRAINT "car_engines_yearId_fkey";

-- DropForeignKey
ALTER TABLE "car_modifications" DROP CONSTRAINT "car_modifications_bodyTypeId_fkey";

-- DropIndex
DROP INDEX "car_body_types_engineId_name_key";

-- DropIndex
DROP INDEX "car_engines_yearId_name_key";

-- DropIndex
DROP INDEX "car_modifications_bodyTypeId_name_key";

-- AlterTable
ALTER TABLE "car_body_types" DROP COLUMN "engineId",
ADD COLUMN     "yearId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "car_engines" DROP COLUMN "yearId",
ADD COLUMN     "bodyTypeId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "car_modifications" DROP COLUMN "bodyTypeId",
ADD COLUMN     "engineId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "passwordHash" TEXT NOT NULL,
ALTER COLUMN "telegramId" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "car_body_types_yearId_name_key" ON "car_body_types"("yearId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "car_engines_bodyTypeId_name_key" ON "car_engines"("bodyTypeId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "car_modifications_engineId_name_key" ON "car_modifications"("engineId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "car_body_types" ADD CONSTRAINT "car_body_types_yearId_fkey" FOREIGN KEY ("yearId") REFERENCES "car_years"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "car_engines" ADD CONSTRAINT "car_engines_bodyTypeId_fkey" FOREIGN KEY ("bodyTypeId") REFERENCES "car_body_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "car_modifications" ADD CONSTRAINT "car_modifications_engineId_fkey" FOREIGN KEY ("engineId") REFERENCES "car_engines"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
