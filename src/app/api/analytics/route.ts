import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()
    
    const {
      event,
      properties = {},
      userId = session?.user?.id,
      sessionId,
      timestamp = new Date().toISOString()
    } = body

    // Validate required fields
    if (!event) {
      return NextResponse.json(
        { success: false, message: 'Event name is required' },
        { status: 400 }
      )
    }

    // Create analytics event
    const analyticsEvent = await prisma.analyticsEvent.create({
      data: {
        event,
        properties: JSON.stringify(properties),
        userId: userId || null,
        sessionId: sessionId || null,
        timestamp: new Date(timestamp),
        userAgent: request.headers.get('user-agent') || '',
        ipAddress: request.ip || request.headers.get('x-forwarded-for') || '',
        referer: request.headers.get('referer') || '',
      }
    })

    // Update user behavior if user is logged in
    if (userId) {
      await updateUserBehavior(userId, event, properties)
    }

    return NextResponse.json({
      success: true,
      message: 'Event tracked successfully',
      eventId: analyticsEvent.id
    })

  } catch (error) {
    console.error('❌ Error tracking analytics event:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error tracking event',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Usuario no autenticado' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const timeframe = searchParams.get('timeframe') || '7d'
    const event = searchParams.get('event')
    const userId = searchParams.get('userId') || session.user.id

    // Calculate date range
    const now = new Date()
    const daysBack = timeframe === '1d' ? 1 : timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 7
    const startDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000))

    const where = {
      timestamp: {
        gte: startDate,
        lte: now
      },
      ...(userId && { userId }),
      ...(event && { event })
    }

    // Get events
    const events = await prisma.analyticsEvent.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: 1000
    })

    // Generate analytics summary
    const summary = generateAnalyticsSummary(events)

    return NextResponse.json({
      success: true,
      data: {
        events,
        summary,
        timeframe,
        totalEvents: events.length
      }
    })

  } catch (error) {
    console.error('❌ Error fetching analytics:', error)
    return NextResponse.json(
      { success: false, message: 'Error fetching analytics' },
      { status: 500 }
    )
  }
}

// Helper function to update user behavior
async function updateUserBehavior(userId: string, event: string, properties: any) {
  try {
    const behaviorData = {
      lastActivity: new Date(),
      totalEvents: { increment: 1 }
    }

    // Update specific counters based on event type
    switch (event) {
      case 'pack_view':
        behaviorData.totalEvents = { increment: 1 }
        break
      case 'pack_purchase':
        behaviorData.totalEvents = { increment: 1 }
        break
      case 'search':
        behaviorData.totalEvents = { increment: 1 }
        break
      case 'page_view':
        behaviorData.totalEvents = { increment: 1 }
        break
    }

    await prisma.userBehavior.upsert({
      where: { userId },
      update: behaviorData,
      create: {
        userId,
        ...behaviorData,
        totalEvents: 1
      }
    })
  } catch (error) {
    console.error('Error updating user behavior:', error)
  }
}

// Helper function to generate analytics summary
function generateAnalyticsSummary(events: any[]) {
  const eventCounts = events.reduce((acc, event) => {
    acc[event.event] = (acc[event.event] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const hourlyData = events.reduce((acc, event) => {
    const hour = new Date(event.timestamp).getHours()
    acc[hour] = (acc[hour] || 0) + 1
    return acc
  }, {} as Record<number, number>)

  const dailyData = events.reduce((acc, event) => {
    const day = new Date(event.timestamp).toISOString().split('T')[0]
    acc[day] = (acc[day] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const topPages = events
    .filter(e => e.event === 'page_view')
    .reduce((acc, event) => {
      const properties = JSON.parse(event.properties || '{}')
      const page = properties.page || 'unknown'
      acc[page] = (acc[page] || 0) + 1
      return acc
    }, {} as Record<string, number>)

  const topSearches = events
    .filter(e => e.event === 'search')
    .reduce((acc, event) => {
      const properties = JSON.parse(event.properties || '{}')
      const query = properties.query || 'unknown'
      if (query.length > 0) {
        acc[query] = (acc[query] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)

  return {
    eventCounts,
    hourlyData: Object.entries(hourlyData)
      .map(([hour, count]) => ({ hour: parseInt(hour), count }))
      .sort((a, b) => a.hour - b.hour),
    dailyData: Object.entries(dailyData)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date)),
    topPages: Object.entries(topPages)
      .map(([page, count]) => ({ page, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10),
    topSearches: Object.entries(topSearches)
      .map(([query, count]) => ({ query, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10),
    uniqueUsers: new Set(events.filter(e => e.userId).map(e => e.userId)).size,
    totalSessions: new Set(events.filter(e => e.sessionId).map(e => e.sessionId)).size
  }
}
