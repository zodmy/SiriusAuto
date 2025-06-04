/*
  Warnings:

  - You are about to drop the column `telegramId` on the `users` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "users_telegramId_key";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "telegramId";
