-- AlterTable
ALTER TABLE "User" ADD COLUMN     "lastActivity" TIMESTAMP(3),
ADD COLUMN     "loginCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "phoneVerificationCode" TEXT,
ADD COLUMN     "phoneVerificationExpires" TIMESTAMP(3),
ADD COLUMN     "phoneVerified" TIMESTAMP(3),
ADD COLUMN     "suspiciousActivity" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "trustScore" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
ADD COLUMN     "verificationStatus" TEXT NOT NULL DEFAULT 'PENDING';
