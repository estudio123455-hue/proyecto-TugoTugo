import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    // Verify this is a legitimate migration request
    const authHeader = request.headers.get('authorization')
    const migrationSecret = process.env.MIGRATION_SECRET || 'dev-secret'
    
    if (authHeader !== `Bearer ${migrationSecret}`) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    // Check if EmailVerification table exists by trying to query it
    let tableExists = true
    try {
      await prisma.emailVerification.findFirst()
    } catch (error: any) {
      if (error.code === 'P2021' || error.message.includes('does not exist')) {
        tableExists = false
      } else {
        throw error
      }
    }

    if (tableExists) {
      return NextResponse.json({
        message: 'EmailVerification table already exists',
        success: true,
        tableExists: true,
      })
    }

    // Create the EmailVerification table using raw SQL
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

    // Create indexes
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "EmailVerification_email_code_idx" ON "EmailVerification"(email, code)
    `
    
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "EmailVerification_email_type_idx" ON "EmailVerification"(email, type)
    `

    return NextResponse.json({
      message: 'EmailVerification table created successfully',
      success: true,
      tableExists: false,
      created: true,
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
