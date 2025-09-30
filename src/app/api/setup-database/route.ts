import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    console.log('Starting database setup for EmailVerification table...')

    // Create the EmailVerification table using raw SQL
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "EmailVerification" (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
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

    console.log('EmailVerification table created')

    // Create indexes for performance
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "EmailVerification_email_code_idx" ON "EmailVerification"(email, code)
    `

    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "EmailVerification_email_type_idx" ON "EmailVerification"(email, type)
    `

    console.log('Indexes created successfully')

    // Test the table by inserting and deleting a test record
    const testId = 'test-' + Date.now()
    await prisma.$executeRaw`
      INSERT INTO "EmailVerification" (id, email, code, type, expires)
      VALUES (${testId}, 'test@example.com', '123456', 'REGISTRATION', NOW() + INTERVAL '15 minutes')
    `

    await prisma.$executeRaw`
      DELETE FROM "EmailVerification" WHERE id = ${testId}
    `

    console.log('Table test successful')

    return NextResponse.json({
      success: true,
      message: 'EmailVerification table created and tested successfully',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Database setup error:', error)
    
    // Return detailed error information
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to setup database',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}

// Also allow POST for manual trigger
export async function POST() {
  return GET()
}

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
