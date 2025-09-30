import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    // Get user statistics
    const [orders, , completedOrders] = await Promise.all([
      // All orders
      prisma.order.findMany({
        where: {
          userId: session.user.id,
        },
        include: {
          pack: true,
        },
      }),

      // Total amount spent
      prisma.order.aggregate({
        where: {
          userId: session.user.id,
          status: {
            in: ['CONFIRMED', 'READY_FOR_PICKUP', 'COMPLETED'],
          },
        },
        _sum: {
          totalAmount: true,
        },
      }),

      // Completed orders count
      prisma.order.count({
        where: {
          userId: session.user.id,
          status: 'COMPLETED',
        },
      }),
    ])

    // Calculate savings (difference between original and discounted prices)
    const totalSaved = orders.reduce((acc, order) => {
      if (
        ['CONFIRMED', 'READY_FOR_PICKUP', 'COMPLETED'].includes(order.status)
      ) {
        const savings =
          (order.pack.originalPrice - order.pack.discountedPrice) *
          order.quantity
        return acc + savings
      }
      return acc
    }, 0)

    // Estimate food saved (assuming average pack saves ~1.5kg of food)
    const foodSaved = Math.round(completedOrders * 1.5)

    const stats = {
      totalOrders: orders.length,
      totalSaved,
      packsCollected: completedOrders,
      foodSaved,
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching profile stats:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
