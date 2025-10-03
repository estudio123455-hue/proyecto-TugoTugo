import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Obtener reportes avanzados
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
    const type = searchParams.get('type') // revenue, growth, popular, waste-saved

    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    switch (type) {
      case 'revenue':
        // Reporte de ingresos por día (últimos 30 días)
        const orders = await prisma.order.findMany({
          where: {
            createdAt: {
              gte: thirtyDaysAgo,
            },
            status: {
              in: ['COMPLETED', 'CONFIRMED', 'READY_FOR_PICKUP'],
            },
          },
          select: {
            totalAmount: true,
            createdAt: true,
          },
        })

        const revenueByDay: Record<string, number> = {}
        orders.forEach((order) => {
          const date = order.createdAt.toISOString().split('T')[0]
          revenueByDay[date] = (revenueByDay[date] || 0) + order.totalAmount
        })

        return NextResponse.json({
          success: true,
          data: {
            labels: Object.keys(revenueByDay).sort(),
            values: Object.keys(revenueByDay)
              .sort()
              .map((date) => revenueByDay[date]),
            total: orders.reduce((sum, order) => sum + order.totalAmount, 0),
          },
        })

      case 'growth':
        // Crecimiento de usuarios y restaurantes
        const userGrowth = await prisma.user.groupBy({
          by: ['createdAt'],
          _count: true,
          where: {
            createdAt: {
              gte: thirtyDaysAgo,
            },
          },
        })

        const establishmentGrowth = await prisma.establishment.groupBy({
          by: ['createdAt'],
          _count: true,
          where: {
            createdAt: {
              gte: thirtyDaysAgo,
            },
          },
        })

        // Agrupar por día
        const usersByDay: Record<string, number> = {}
        const establishmentsByDay: Record<string, number> = {}

        userGrowth.forEach((item) => {
          const date = new Date(item.createdAt).toISOString().split('T')[0]
          usersByDay[date] = (usersByDay[date] || 0) + item._count
        })

        establishmentGrowth.forEach((item) => {
          const date = new Date(item.createdAt).toISOString().split('T')[0]
          establishmentsByDay[date] = (establishmentsByDay[date] || 0) + item._count
        })

        const allDates = Array.from(
          new Set([...Object.keys(usersByDay), ...Object.keys(establishmentsByDay)])
        ).sort()

        return NextResponse.json({
          success: true,
          data: {
            labels: allDates,
            users: allDates.map((date) => usersByDay[date] || 0),
            establishments: allDates.map((date) => establishmentsByDay[date] || 0),
          },
        })

      case 'popular':
        // Packs y restaurantes más populares
        const popularPacks = await prisma.pack.findMany({
          include: {
            establishment: {
              select: {
                name: true,
              },
            },
            _count: {
              select: {
                orders: true,
              },
            },
          },
          orderBy: {
            orders: {
              _count: 'desc',
            },
          },
          take: 10,
        })

        const popularEstablishments = await prisma.establishment.findMany({
          include: {
            _count: {
              select: {
                packs: true,
                posts: true,
              },
            },
            packs: {
              include: {
                _count: {
                  select: {
                    orders: true,
                  },
                },
              },
            },
          },
          take: 10,
        })

        const establishmentsWithOrders = popularEstablishments
          .map((est) => ({
            id: est.id,
            name: est.name,
            totalOrders: est.packs.reduce(
              (sum, pack) => sum + pack._count.orders,
              0
            ),
            totalPacks: est._count.packs,
            totalPosts: est._count.posts,
          }))
          .sort((a, b) => b.totalOrders - a.totalOrders)

        return NextResponse.json({
          success: true,
          data: {
            packs: popularPacks.map((pack) => ({
              id: pack.id,
              title: pack.title,
              establishment: pack.establishment.name,
              orders: pack._count.orders,
              price: pack.discountedPrice,
            })),
            establishments: establishmentsWithOrders,
          },
        })

      case 'waste-saved':
        // Estimación de comida salvada
        const completedOrders = await prisma.order.findMany({
          where: {
            status: 'COMPLETED',
            createdAt: {
              gte: thirtyDaysAgo,
            },
          },
          include: {
            pack: true,
          },
        })

        const totalMealsSaved = completedOrders.reduce(
          (sum, order) => sum + order.quantity,
          0
        )
        const totalMoneySaved = completedOrders.reduce(
          (sum, order) => sum + (order.pack.originalPrice - order.pack.discountedPrice) * order.quantity,
          0
        )
        const estimatedKgSaved = totalMealsSaved * 0.5 // Estimación: 500g por comida

        // Por día
        const wasteByDay: Record<string, { meals: number; kg: number }> = {}
        completedOrders.forEach((order) => {
          const date = order.createdAt.toISOString().split('T')[0]
          if (!wasteByDay[date]) {
            wasteByDay[date] = { meals: 0, kg: 0 }
          }
          wasteByDay[date].meals += order.quantity
          wasteByDay[date].kg += order.quantity * 0.5
        })

        return NextResponse.json({
          success: true,
          data: {
            summary: {
              totalMealsSaved,
              totalMoneySaved,
              estimatedKgSaved,
              co2Saved: estimatedKgSaved * 2.5, // Estimación: 2.5kg CO2 por kg de comida
            },
            byDay: {
              labels: Object.keys(wasteByDay).sort(),
              meals: Object.keys(wasteByDay)
                .sort()
                .map((date) => wasteByDay[date].meals),
              kg: Object.keys(wasteByDay)
                .sort()
                .map((date) => wasteByDay[date].kg),
            },
          },
        })

      case 'overview':
        // Resumen general con métricas clave
        const totalUsers = await prisma.user.count()
        const totalEstablishments = await prisma.establishment.count()
        const totalPacks = await prisma.pack.count()
        const totalPosts = await prisma.post.count()
        const totalOrders = await prisma.order.count()

        const recentUsers = await prisma.user.count({
          where: { createdAt: { gte: sevenDaysAgo } },
        })
        const recentEstablishments = await prisma.establishment.count({
          where: { createdAt: { gte: sevenDaysAgo } },
        })
        const recentOrders = await prisma.order.count({
          where: { createdAt: { gte: sevenDaysAgo } },
        })

        const activeEstablishments = await prisma.establishment.count({
          where: { isActive: true, verificationStatus: 'APPROVED' },
        })
        const pendingEstablishments = await prisma.establishment.count({
          where: { verificationStatus: 'PENDING' },
        })

        const usersByRole = await prisma.user.groupBy({
          by: ['role'],
          _count: true,
        })

        const ordersByStatus = await prisma.order.groupBy({
          by: ['status'],
          _count: true,
        })

        const totalRevenue = await prisma.order.aggregate({
          where: {
            status: {
              in: ['COMPLETED', 'CONFIRMED', 'READY_FOR_PICKUP'],
            },
          },
          _sum: {
            totalAmount: true,
          },
        })

        return NextResponse.json({
          success: true,
          data: {
            overview: {
              totalUsers,
              totalEstablishments,
              totalPacks,
              totalPosts,
              totalOrders,
              activeEstablishments,
              pendingEstablishments,
              recentUsers,
              recentEstablishments,
              recentOrders,
              totalRevenue: totalRevenue._sum.totalAmount || 0,
            },
            usersByRole: Object.fromEntries(
              usersByRole.map((item) => [item.role, item._count])
            ),
            ordersByStatus: Object.fromEntries(
              ordersByStatus.map((item) => [item.status, item._count])
            ),
          },
        })

      default:
        return NextResponse.json(
          { success: false, message: 'Tipo de reporte no válido' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Error generating report:', error)
    return NextResponse.json(
      { success: false, message: 'Error al generar reporte' },
      { status: 500 }
    )
  }
}
