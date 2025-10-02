-- Migration: Add verification fields to Establishment table
-- Run this SQL in your production database (Vercel Postgres)

ALTER TABLE "Establishment" 
ADD COLUMN IF NOT EXISTS "openingHours" TEXT,
ADD COLUMN IF NOT EXISTS "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS "legalDocument" TEXT,
ADD COLUMN IF NOT EXISTS "businessType" TEXT,
ADD COLUMN IF NOT EXISTS "taxId" TEXT,
ADD COLUMN IF NOT EXISTS "verificationStatus" TEXT DEFAULT 'PENDING',
ADD COLUMN IF NOT EXISTS "verificationNotes" TEXT,
ADD COLUMN IF NOT EXISTS "approvedAt" TIMESTAMP,
ADD COLUMN IF NOT EXISTS "approvedBy" TEXT;

-- Verify columns were added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'Establishment' 
AND column_name IN ('openingHours', 'images', 'legalDocument', 'businessType', 'taxId', 'verificationStatus');
