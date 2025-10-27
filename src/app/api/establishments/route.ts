import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { calculateDistance } from '@/lib/geolocation'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parámetros de búsqueda y filtros
    const query = searchParams.get('query')
    const category = searchParams.get('category')
    const lat = searchParams.get('lat')
    const lng = searchParams.get('lng')
    const maxDistance = searchParams.get('maxDistance')
    
    console.log('🔍 API: Fetching establishments with filters:', {
      query,
      category,
      userLocation: lat && lng ? { lat, lng } : null,
      maxDistance,
    })

    // Construir filtros de Prisma
    const where: any = {
      isActive: true,
      // Mostrar establecimientos aprobados o pendientes (no rechazados)
      verificationStatus: {
        in: ['APPROVED', 'PENDING'],
      },
    }

    // Filtro por categoría
    if (category && category !== 'all') {
      where.category = category
    }

    // Filtro por búsqueda de texto
    if (query) {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { cuisineType: { contains: query, mode: 'insensitive' } },
      ]
    }

    const establishments = await prisma.establishment.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
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
        reviews: {
          select: {
            rating: true,
          },
        },
        _count: {
          select: {
            posts: true,
            packs: true,
            reviews: true,
          },
        },
      },
    })

    // Calcular distancia y rating promedio
    let results = establishments.map(est => {
      // Calcular rating promedio
      const averageRating = est.reviews.length > 0
        ? est.reviews.reduce((sum, r) => sum + r.rating, 0) / est.reviews.length
        : 0

      // Calcular distancia si hay ubicación del usuario
      let distance: number | undefined
      if (lat && lng) {
        distance = calculateDistance(
          { latitude: parseFloat(lat), longitude: parseFloat(lng) },
          { latitude: est.latitude, longitude: est.longitude }
        )
      }

      return {
        ...est,
        distance,
        averageRating: Math.round(averageRating * 10) / 10,
      }
    })

    // Filtrar por distancia máxima
    if (maxDistance && lat && lng) {
      const maxDist = parseFloat(maxDistance)
      results = results.filter(est => est.distance !== undefined && est.distance <= maxDist)
    }

    // Ordenar por distancia si hay ubicación
    if (lat && lng) {
      results.sort((a, b) => (a.distance || 999) - (b.distance || 999))
    }

    console.log(`📊 API: Found ${results.length} establishments`)

    return NextResponse.json(results)
  } catch (error) {
    console.error('Error fetching establishments:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()

    const establishment = await prisma.establishment.create({
      data: {
        name: data.name,
        description: data.description || '',
        address: data.address,
        latitude: data.latitude || 0,
        longitude: data.longitude || 0,
        phone: data.phone || '',
        email: data.email || '',
        category: data.category || 'RESTAURANT',
        isActive: data.isActive !== undefined ? data.isActive : true,
        verificationStatus: 'APPROVED', // Auto-aprobar desde super-admin
        // userId es opcional para super-admin
        ...(data.userId && { userId: data.userId })
      },
    })

    return NextResponse.json(establishment, { status: 201 })
  } catch (error) {
    console.error('Error creating establishment:', error)
    return NextResponse.json(
      { message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
