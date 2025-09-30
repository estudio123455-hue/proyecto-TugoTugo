import { NextRequest, NextResponse } from 'next/server'
import { cleanupExpiredCodes } from '@/lib/verification'

export async function GET(request: NextRequest) {
  try {
    // Verify this is a legitimate cron job request
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    // Clean up expired verification codes
    const deletedCount = await cleanupExpiredCodes()

    return NextResponse.json({
      success: true,
      message: `Cleaned up ${deletedCount} expired verification codes`,
      deletedCount,
    })
  } catch (error) {
    console.error('Cleanup cron job error:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to cleanup expired codes',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Allow this endpoint to be called by cron services
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
