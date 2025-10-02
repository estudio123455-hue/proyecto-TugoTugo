-- Migration: Create Post table
-- Run this SQL in your production database (Vercel Postgres)

CREATE TABLE IF NOT EXISTS "Post" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "title" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "price" DOUBLE PRECISION,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "likes" INTEGER NOT NULL DEFAULT 0,
  "views" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "establishmentId" TEXT NOT NULL,
  CONSTRAINT "Post_establishmentId_fkey" FOREIGN KEY ("establishmentId") REFERENCES "Establishment"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "Post_establishmentId_idx" ON "Post"("establishmentId");
CREATE INDEX IF NOT EXISTS "Post_createdAt_idx" ON "Post"("createdAt");

-- Verify table was created
SELECT table_name FROM information_schema.tables WHERE table_name = 'Post';
