import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Obtener todos los restaurantes (solo admin)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, message: 'No autorizado' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') // 'pending', 'approved', 'rejected', 'all'
    const search = searchParams.get('search') // Búsqueda por nombre
    const category = searchParams.get('category') // Filtro por categoría

    console.log('🔍 [Admin] Fetching establishments:', { status, search, category })

    // Construir filtros dinámicos
    const where: any = {}
    
    // Filtro por estado de verificación
    if (status === 'pending') {
      where.verificationStatus = 'PENDING'
    } else if (status === 'approved') {
      where.verificationStatus = 'APPROVED'
    } else if (status === 'rejected') {
      where.verificationStatus = 'REJECTED'
    }
    // Si status === 'all', no filtrar por estado
    
    // Búsqueda por nombre
    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive'
      }
    }
    
    // Filtro por categoría
    if (category && category !== 'all') {
      where.category = category
    }

    console.log('🔍 [Admin] Query where:', where)

    const establishments = await prisma.establishment.findMany({
      where,
      include: {
        user: {
          select: {
            email: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            posts: true,
            packs: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    console.log(`✅ [Admin] Found ${establishments.length} establishments`)

    return NextResponse.json({
      success: true,
      data: establishments,
    })
  } catch (error) {
    console.error('Error fetching establishments:', error)
    return NextResponse.json(
      { success: false, message: 'Error al obtener restaurantes' },
      { status: 500 }
    )
  }
}
