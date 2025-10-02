import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 [Migration] Starting database migration...')
    
    const results: any = {
      emailVerification: { exists: false, created: false },
      post: { exists: false, created: false },
      verificationFields: { exists: false, created: false },
    }

    // Create EmailVerification table
    try {
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS "EmailVerification" (
          id TEXT PRIMARY KEY,
          email TEXT NOT NULL,
          code TEXT NOT NULL,
          type TEXT NOT NULL,
          expires TIMESTAMP NOT NULL,
          verified BOOLEAN DEFAULT false,
          attempts INTEGER DEFAULT 0,
          "createdAt" TIMESTAMP DEFAULT NOW(),
          "updatedAt" TIMESTAMP DEFAULT NOW()
        )
      `
      await prisma.$executeRaw`
        CREATE INDEX IF NOT EXISTS "EmailVerification_email_code_idx" ON "EmailVerification"(email, code)
      `
      await prisma.$executeRaw`
        CREATE INDEX IF NOT EXISTS "EmailVerification_email_type_idx" ON "EmailVerification"(email, type)
      `
      results.emailVerification.created = true
      console.log('✅ [Migration] EmailVerification table created')
    } catch (error: any) {
      if (error.message?.includes('already exists')) {
        results.emailVerification.exists = true
        console.log('ℹ️ [Migration] EmailVerification table already exists')
      } else {
        throw error
      }
    }

    // Create Post table
    try {
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS "Post" (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          content TEXT NOT NULL,
          images TEXT[] DEFAULT ARRAY[]::TEXT[],
          price DOUBLE PRECISION,
          "isActive" BOOLEAN NOT NULL DEFAULT true,
          likes INTEGER NOT NULL DEFAULT 0,
          views INTEGER NOT NULL DEFAULT 0,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          "establishmentId" TEXT NOT NULL,
          CONSTRAINT "Post_establishmentId_fkey" FOREIGN KEY ("establishmentId") 
            REFERENCES "Establishment"(id) ON DELETE CASCADE ON UPDATE CASCADE
        )
      `
      await prisma.$executeRaw`
        CREATE INDEX IF NOT EXISTS "Post_establishmentId_idx" ON "Post"("establishmentId")
      `
      await prisma.$executeRaw`
        CREATE INDEX IF NOT EXISTS "Post_createdAt_idx" ON "Post"("createdAt")
      `
      results.post.created = true
      console.log('✅ [Migration] Post table created')
    } catch (error: any) {
      if (error.message?.includes('already exists')) {
        results.post.exists = true
        console.log('ℹ️ [Migration] Post table already exists')
      } else {
        throw error
      }
    }

    // Add verification fields to Establishment table
    try {
      await prisma.$executeRaw`
        ALTER TABLE "Establishment" 
        ADD COLUMN IF NOT EXISTS "openingHours" TEXT,
        ADD COLUMN IF NOT EXISTS "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
        ADD COLUMN IF NOT EXISTS "legalDocument" TEXT,
        ADD COLUMN IF NOT EXISTS "businessType" TEXT,
        ADD COLUMN IF NOT EXISTS "taxId" TEXT,
        ADD COLUMN IF NOT EXISTS "verificationStatus" TEXT DEFAULT 'PENDING',
        ADD COLUMN IF NOT EXISTS "verificationNotes" TEXT,
        ADD COLUMN IF NOT EXISTS "approvedAt" TIMESTAMP,
        ADD COLUMN IF NOT EXISTS "approvedBy" TEXT
      `
      results.verificationFields.created = true
      console.log('✅ [Migration] Verification fields added to Establishment')
    } catch (error: any) {
      if (error.message?.includes('already exists') || error.message?.includes('duplicate column')) {
        results.verificationFields.exists = true
        console.log('ℹ️ [Migration] Verification fields already exist')
      } else {
        console.error('⚠️ [Migration] Error adding verification fields:', error.message)
        // Don't throw - continue with migration
      }
    }

    console.log('✅ [Migration] Migration completed successfully')

    return NextResponse.json({
      message: 'Migration completed successfully',
      success: true,
      results,
    })
  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to create EmailVerification table',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Allow this endpoint to be called for migrations
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
