import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { validatePackData, sanitizeHtml, createRateLimit } from '@/lib/validation'
import { ensureApiInit } from '@/lib/api-init'

export async function GET() {
  try {
    // Initialize database if needed
    await ensureApiInit()
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'ESTABLISHMENT') {
      return NextResponse.json({ message: 'Access denied' }, { status: 403 })
    }

    // Get establishment
    const establishment = await prisma.establishment.findUnique({
      where: {
        userId: session.user.id,
      },
    })

    if (!establishment) {
      return NextResponse.json(
        { message: 'Establishment not found' },
        { status: 404 }
      )
    }

    const packs = await prisma.pack.findMany({
      where: {
        establishmentId: establishment.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(packs)
  } catch (error) {
    console.error('Error fetching packs:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Rate limiting: 10 requests per minute per user
const rateLimit = createRateLimit(10, 60 * 1000)

export async function POST(request: NextRequest) {
  try {
    // Initialize database if needed
    await ensureApiInit()
    
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'ESTABLISHMENT') {
      return NextResponse.json({ message: 'Access denied' }, { status: 403 })
    }

    // Rate limiting
    if (!rateLimit(session.user.id)) {
      return NextResponse.json(
        { message: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    const data = await request.json()

    // Validate pack data
    const validation = validatePackData(data)
    if (!validation.isValid) {
      return NextResponse.json(
        { message: 'Validation failed', errors: validation.errors },
        { status: 400 }
      )
    }

    // Get establishment
    const establishment = await prisma.establishment.findUnique({
      where: {
        userId: session.user.id,
      },
    })

    if (!establishment) {
      return NextResponse.json(
        { message: 'Establishment not found' },
        { status: 404 }
      )
    }

    // Sanitize HTML content
    const sanitizedDescription = sanitizeHtml(data.description)

    const pack = await prisma.pack.create({
      data: {
        title: data.title.trim(),
        description: sanitizedDescription,
        originalPrice: data.originalPrice,
        discountedPrice: data.discountedPrice,
        quantity: data.quantity,
        availableFrom: new Date(data.availableFrom),
        availableUntil: new Date(data.availableUntil),
        pickupTimeStart: data.pickupTimeStart,
        pickupTimeEnd: data.pickupTimeEnd,
        isActive: true, // Make packs active by default
        establishmentId: establishment.id,
      },
    })

    // Emit real-time event (in a real implementation, you'd use WebSocket server)
    // This would trigger notifications to subscribed clients
    console.log('📢 Pack created:', {
      id: pack.id,
      title: pack.title,
      establishmentId: establishment.id,
      establishmentName: establishment.name,
    })

    return NextResponse.json(pack, { status: 201 })
  } catch (error) {
    console.error('Error creating pack:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
