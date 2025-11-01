import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ensureApiInit } from '@/lib/api-init'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Initialize database if needed
    await ensureApiInit()
    
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const category = searchParams.get('category')

    // Base query conditions for active establishments (with or without packs)
    const where: any = {
      isActive: true,
    }

    // Filter by category if provided
    if (category && category !== 'all') {
      where.category = category
    }

    const establishments = await prisma.establishment.findMany({
      where,
      include: {
        packs: {
          where: {
            isActive: true,
            quantity: {
              gt: 0,
            },
            availableFrom: {
              lte: new Date(),
            },
            availableUntil: {
              gte: new Date(),
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: limit,
    })

    // Transform data for the feed
    const feedData = establishments.map(establishment => ({
      id: establishment.id,
      name: establishment.name,
      description: establishment.description,
      address: establishment.address,
      category: establishment.category,
      image: establishment.image,
      phone: establishment.phone,
      email: establishment.email,
      latitude: establishment.latitude,
      longitude: establishment.longitude,
      isActive: establishment.isActive,
      createdAt: establishment.createdAt,
      updatedAt: establishment.updatedAt,
      packs: establishment.packs.map(pack => ({
        id: pack.id,
        title: pack.title,
        description: pack.description,
        originalPrice: pack.originalPrice,
        discountedPrice: pack.discountedPrice,
        quantity: pack.quantity,
        availableFrom: pack.availableFrom,
        availableUntil: pack.availableUntil,
        pickupTimeStart: pack.pickupTimeStart,
        pickupTimeEnd: pack.pickupTimeEnd,
        isActive: pack.isActive,
        createdAt: pack.createdAt,
      })),
      owner: establishment.user,
    }))

    return NextResponse.json({
      success: true,
      data: feedData,
      total: feedData.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error fetching restaurants feed:', error)
    
    // If database connection fails, return empty data instead of error
    return NextResponse.json({
      success: true,
      data: [],
      total: 0,
      timestamp: new Date().toISOString(),
      warning: 'Database connection failed, returning empty data'
    })
  }
}
