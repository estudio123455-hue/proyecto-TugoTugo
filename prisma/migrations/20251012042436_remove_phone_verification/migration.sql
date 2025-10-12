/*
  Warnings:

  - You are about to drop the column `phone` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `phoneVerificationCode` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `phoneVerificationExpires` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `phoneVerified` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "phone",
DROP COLUMN "phoneVerificationCode",
DROP COLUMN "phoneVerificationExpires",
DROP COLUMN "phoneVerified";
