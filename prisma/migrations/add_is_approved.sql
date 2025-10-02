-- Migration: Add isApproved column to Establishment table
-- Run this SQL in your production database (Vercel Postgres)

-- Add the isApproved column with default value false
ALTER TABLE "Establishment" 
ADD COLUMN IF NOT EXISTS "isApproved" BOOLEAN NOT NULL DEFAULT false;

-- Optional: Set existing establishments to approved
-- Uncomment the line below if you want to approve all existing establishments
-- UPDATE "Establishment" SET "isApproved" = true WHERE "isApproved" = false;

-- Verify the column was added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'Establishment' AND column_name = 'isApproved';
