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

    let where = {}
    // Temporalmente deshabilitado hasta que exista la columna isApproved
    // if (status === 'pending') {
    //   where = { isApproved: false, isActive: true }
    // } else if (status === 'approved') {
    //   where = { isApproved: true }
    // }
    // Por ahora, mostrar todos los establecimientos activos
    if (status === 'pending' || status === 'approved') {
      where = { isActive: true }
    }

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
