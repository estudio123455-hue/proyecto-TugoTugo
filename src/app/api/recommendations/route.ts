import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { AIRecommendationEngine } from '@/lib/ai-recommendations'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const lat = parseFloat(searchParams.get('lat') || '0')
    const lng = parseFloat(searchParams.get('lng') || '0')

    // Get user preferences and order history
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        orders: {
          where: { status: 'COMPLETED' },
          include: {
            pack: {
              include: {
                establishment: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 50, // Last 50 orders for analysis
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Build user preferences from order history
    const orderHistory = user.orders.map(order => ({
      packId: order.pack.id,
      establishmentId: order.pack.establishmentId,
      category: 'general', // TODO: Add category field to Pack model
      price: order.pack.discountedPrice,
      rating: 5, // TODO: Add rating field to Order model
      timestamp: order.createdAt,
    }))

    // Extract favorite categories from order history
    const categoryCount: { [key: string]: number } = {}
    orderHistory.forEach(order => {
      categoryCount[order.category] = (categoryCount[order.category] || 0) + 1
    })

    const favoriteCategories = Object.entries(categoryCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([category]) => category)

    // Calculate average price range
    const prices = orderHistory.map(order => order.price)
    const avgPrice = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 15
    const priceRange = {
      min: Math.max(5, avgPrice * 0.7),
      max: avgPrice * 1.5
    }

    const userPreferences = {
      userId: session.user.id,
      favoriteCategories,
      priceRange,
      dietaryRestrictions: [], // TODO: Get from user profile
      location: { lat, lng },
      orderHistory,
    }

    // Get available packs
    const availablePacks = await prisma.pack.findMany({
      where: {
        isActive: true,
        availableUntil: {
          gt: new Date(),
        },
        quantity: {
          gt: 0,
        },
      },
      include: {
        establishment: true,
        _count: {
          select: {
            orders: {
              where: {
                status: 'COMPLETED',
              },
            },
          },
        },
      },
    })

    // Transform to AI recommendation format
    const packsForAI = availablePacks.map(pack => ({
      id: pack.id,
      title: pack.title,
      description: pack.description,
      category: 'general', // TODO: Add category field to Pack model
      price: pack.discountedPrice,
      originalPrice: pack.originalPrice,
      establishmentId: pack.establishmentId,
      establishmentName: pack.establishment.name,
      location: {
        lat: pack.establishment.latitude || 0,
        lng: pack.establishment.longitude || 0,
      },
      availableUntil: pack.availableUntil,
      tags: [], // TODO: Add tags field to Pack model
      dietaryInfo: [], // TODO: Add dietaryInfo field to Pack model
    }))

    // Get AI recommendations
    const aiEngine = AIRecommendationEngine.getInstance()
    const recommendations = await aiEngine.getRecommendations(
      userPreferences,
      packsForAI,
      limit
    )

    // Get full pack details for recommended packs
    const recommendedPackIds = recommendations.map(r => r.packId)
    const recommendedPacks = await prisma.pack.findMany({
      where: {
        id: {
          in: recommendedPackIds,
        },
      },
      include: {
        establishment: {
          select: {
            id: true,
            name: true,
            address: true,
            latitude: true,
            longitude: true,
            image: true, // Using 'image' instead of 'imageUrl' based on schema
          },
        },
        _count: {
          select: {
            orders: {
              where: {
                status: 'COMPLETED',
              },
            },
          },
        },
      },
    })

    // Combine recommendations with pack details
    const result = recommendations.map(rec => {
      const pack = recommendedPacks.find(p => p.id === rec.packId)
      if (!pack) return null

      return {
        ...pack,
        recommendationScore: rec.score,
        recommendationReasons: rec.reasons,
        distance: lat && lng ? calculateDistance(
          lat, lng,
          pack.establishment?.latitude || 0,
          pack.establishment?.longitude || 0
        ) : null,
      }
    }).filter(Boolean)

    return NextResponse.json({
      recommendations: result,
      userPreferences: {
        favoriteCategories,
        priceRange,
        totalOrders: orderHistory.length,
      },
    })

  } catch (error) {
    console.error('Error generating recommendations:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}
