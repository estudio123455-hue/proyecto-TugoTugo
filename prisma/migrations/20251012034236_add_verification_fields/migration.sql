-- AlterTable
ALTER TABLE "Establishment" ADD COLUMN     "documentPhotos" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "frontPhoto" TEXT,
ADD COLUMN     "googlePlaceId" TEXT,
ADD COLUMN     "googleVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "interiorPhoto" TEXT,
ADD COLUMN     "locationVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "verificationDocs" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "verificationType" TEXT;
