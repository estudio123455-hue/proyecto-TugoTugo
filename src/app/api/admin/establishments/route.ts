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
    const status = searchParams.get('status') // 'pending', 'approved', 'all'

    console.log('🔍 [Admin] Fetching establishments with status:', status)

    // Sin sistema de aprobación, mostrar todos los establecimientos
    // Los filtros ahora solo afectan la visualización en el frontend
    const establishments = await prisma.establishment.findMany({
      where: {}, // Sin filtro - mostrar todos
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
