import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/authorization'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// GET - Obtener estadísticas generales
export async function GET() {
  try {
    // Verificar autorización (solo ADMIN)
    const authResult = await requireAdmin()
    if (authResult instanceof NextResponse) {
      return authResult // Retorna error de autorización
    }

    const [
      totalUsers,
      totalEstablishments,
      totalPosts,
      totalPacks,
      totalOrders,
      activeEstablishments,
      pendingEstablishments,
      recentOrders,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.establishment.count(),
      prisma.post.count(),
      prisma.pack.count(),
      prisma.order.count(),
      prisma.establishment.count({ where: { isActive: true } }),
      prisma.establishment.count({ where: { verificationStatus: 'PENDING' } }),
      prisma.order.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Últimos 7 días
          },
        },
      }),
    ])

    const usersByRole = await prisma.user.groupBy({
      by: ['role'],
      _count: {
        role: true,
      },
    })

    const ordersByStatus = await prisma.order.groupBy({
      by: ['status'],
      _count: {
        status: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalEstablishments,
          totalPosts,
          totalPacks,
          totalOrders,
          activeEstablishments,
          pendingEstablishments,
          recentOrders,
        },
        usersByRole: usersByRole.reduce((acc, item) => {
          acc[item.role] = item._count.role
          return acc
        }, {} as Record<string, number>),
        ordersByStatus: ordersByStatus.reduce((acc, item) => {
          acc[item.status] = item._count.status
          return acc
        }, {} as Record<string, number>),
      },
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { success: false, message: 'Error al obtener estadísticas' },
      { status: 500 }
    )
  }
}
