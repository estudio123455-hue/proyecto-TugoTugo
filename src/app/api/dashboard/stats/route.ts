import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (session.user.role !== 'ESTABLISHMENT') {
      return NextResponse.json(
        { message: 'Access denied' },
        { status: 403 }
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

    // Get statistics
    const [totalOrders, totalRevenue, activePacks, completedOrders] = await Promise.all([
      // Total orders
      prisma.order.count({
        where: {
          pack: {
            establishmentId: establishment.id,
          },
        },
      }),
      
      // Total revenue
      prisma.order.aggregate({
        where: {
          pack: {
            establishmentId: establishment.id,
          },
          status: {
            in: ['CONFIRMED', 'READY_FOR_PICKUP', 'COMPLETED'],
          },
        },
        _sum: {
          totalAmount: true,
        },
      }),
      
      // Active packs
      prisma.pack.count({
        where: {
          establishmentId: establishment.id,
          isActive: true,
          availableUntil: {
            gte: new Date(),
          },
        },
      }),
      
      // Completed orders
      prisma.order.count({
        where: {
          pack: {
            establishmentId: establishment.id,
          },
          status: 'COMPLETED',
        },
      }),
    ])

    const stats = {
      totalOrders,
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      activePacks,
      completedOrders,
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
