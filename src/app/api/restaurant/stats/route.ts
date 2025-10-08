import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// GET - Obtener estadísticas del restaurante
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ESTABLISHMENT') {
      return NextResponse.json(
        { success: false, message: 'No autorizado' },
        { status: 401 }
      )
    }

    // Obtener establecimiento del usuario
    const establishment = await prisma.establishment.findUnique({
      where: { userId: session.user.id },
    })

    if (!establishment) {
      return NextResponse.json(
        { success: false, message: 'No se encontró establecimiento' },
        { status: 404 }
      )
    }

    // Obtener estadísticas
    const [
      totalPacks,
      activePacks,
      totalPosts,
      orders,
      reviews,
    ] = await Promise.all([
      // Total de packs
      prisma.pack.count({
        where: { establishmentId: establishment.id },
      }),
      // Packs activos
      prisma.pack.count({
        where: {
          establishmentId: establishment.id,
          isActive: true,
          quantity: { gt: 0 },
        },
      }),
      // Total de posts
      prisma.post.count({
        where: { establishmentId: establishment.id },
      }),
      // Órdenes
      prisma.order.findMany({
        where: {
          pack: {
            establishmentId: establishment.id,
          },
        },
        include: {
          pack: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 10,
      }),
      // Reseñas
      prisma.review.findMany({
        where: { establishmentId: establishment.id },
      }),
    ])

    // Calcular estadísticas de órdenes
    const totalOrders = orders.length
    const pendingOrders = orders.filter(
      (o) => o.status === 'PENDING' || o.status === 'CONFIRMED'
    ).length
    const completedOrders = orders.filter((o) => o.status === 'COMPLETED').length
    const totalRevenue = orders
      .filter((o) => o.status === 'COMPLETED' || o.status === 'CONFIRMED')
      .reduce((sum, order) => sum + (order.totalAmount || 0), 0)

    // Calcular estadísticas de reseñas
    const totalReviews = reviews.length
    const averageRating =
      totalReviews > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
        : 0

    return NextResponse.json({
      totalOrders,
      totalRevenue,
      activePacks,
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews,
      pendingOrders,
      completedOrders,
      revenueGrowth: 0, // TODO: Calculate based on previous period
      totalPacks,
      totalPosts,
      recentOrders: orders,
    })
  } catch (error: any) {
    console.error('Error fetching restaurant stats:', error)
    return NextResponse.json(
      { success: false, message: 'Error al obtener estadísticas' },
      { status: 500 }
    )
  }
}
