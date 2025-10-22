import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'month'

    // Calculate date range based on period
    const now = new Date()
    let startDate: Date

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1)
        break
      default:
        startDate = new Date(0) // All time
    }

    // Get user orders within the period
    const orders = await prisma.order.findMany({
      where: {
        userId: session.user.id,
        status: 'COMPLETED',
        createdAt: period === 'all' ? undefined : {
          gte: startDate,
        },
      },
      include: {
        pack: {
          include: {
            establishment: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Calculate impact metrics
    const totalPacksSaved = orders.length
    const totalFoodSaved = orders.reduce((sum, order) => {
      // Estimate food weight based on pack price (rough calculation)
      const estimatedWeight = (order.pack.discountedPrice / 10) * 0.5 // kg per $10, adjusted
      return sum + estimatedWeight
    }, 0)

    const totalCO2Avoided = totalFoodSaved * 2.1 // 2.1 kg CO2 per kg of food waste avoided
    const totalMoneySaved = orders.reduce((sum, order) => {
      return sum + (order.pack.originalPrice - order.pack.discountedPrice)
    }, 0)

    // Calculate trees equivalent (1 tree absorbs ~21 kg CO2 per year)
    const treesEquivalent = Math.round(totalCO2Avoided / 21)
    
    // Calculate meals provided (average meal = 0.4 kg)
    const mealsProvided = Math.round(totalFoodSaved / 0.4)

    // Calculate streaks
    const { currentStreak, longestStreak } = calculateStreaks(orders)

    // Get user registration date for days of impact
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { createdAt: true },
    })

    const daysOfImpact = user ? 
      Math.floor((now.getTime() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)) : 0

    // Get achievements
    const achievements = await getUserAchievements(session.user.id, {
      totalPacksSaved,
      totalFoodSaved,
      totalCO2Avoided,
      currentStreak,
      longestStreak,
    })

    // Get monthly progress for the last 6 months
    const monthlyProgress = await getMonthlyProgress(session.user.id)

    const impact = {
      totalPacksSaved,
      totalFoodSaved: Math.round(totalFoodSaved * 10) / 10,
      totalCO2Avoided: Math.round(totalCO2Avoided * 10) / 10,
      totalMoneySaved: Math.round(totalMoneySaved),
      treesEquivalent,
      mealsProvided,
      daysOfImpact,
      currentStreak,
      longestStreak,
      achievements,
      monthlyProgress,
    }

    return NextResponse.json(impact)
  } catch (error) {
    console.error('Error fetching user impact:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function calculateStreaks(orders: any[]) {
  if (orders.length === 0) {
    return { currentStreak: 0, longestStreak: 0 }
  }

  // Sort orders by date
  const sortedOrders = orders.sort((a, b) => 
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  )

  let currentStreak = 0
  let longestStreak = 0
  let tempStreak = 1

  const today = new Date()
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)

  // Check if user has ordered recently for current streak
  const lastOrderDate = new Date(sortedOrders[sortedOrders.length - 1].createdAt)
  const daysSinceLastOrder = Math.floor((today.getTime() - lastOrderDate.getTime()) / (1000 * 60 * 60 * 24))

  if (daysSinceLastOrder <= 1) {
    currentStreak = 1
    
    // Calculate current streak by going backwards
    for (let i = sortedOrders.length - 2; i >= 0; i--) {
      const currentDate = new Date(sortedOrders[i + 1].createdAt)
      const prevDate = new Date(sortedOrders[i].createdAt)
      const daysDiff = Math.floor((currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysDiff <= 7) { // Within a week counts as maintaining streak
        currentStreak++
      } else {
        break
      }
    }
  }

  // Calculate longest streak
  for (let i = 1; i < sortedOrders.length; i++) {
    const currentDate = new Date(sortedOrders[i].createdAt)
    const prevDate = new Date(sortedOrders[i - 1].createdAt)
    const daysDiff = Math.floor((currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysDiff <= 7) {
      tempStreak++
    } else {
      longestStreak = Math.max(longestStreak, tempStreak)
      tempStreak = 1
    }
  }
  
  longestStreak = Math.max(longestStreak, tempStreak, currentStreak)

  return { currentStreak, longestStreak }
}

async function getUserAchievements(userId: string, metrics: any) {
  const achievements = []

  // First Pack Achievement
  if (metrics.totalPacksSaved >= 1) {
    achievements.push({
      id: 'first-pack',
      title: 'Primer Rescate',
      description: 'Salvaste tu primer pack',
      icon: '🌱',
      unlockedAt: new Date(),
      category: 'saver'
    })
  }

  // Pack Saver Achievements
  if (metrics.totalPacksSaved >= 5) {
    achievements.push({
      id: 'pack-saver-5',
      title: 'Rescatista',
      description: '5 packs salvados',
      icon: '🏅',
      unlockedAt: new Date(),
      category: 'saver'
    })
  }

  if (metrics.totalPacksSaved >= 25) {
    achievements.push({
      id: 'pack-saver-25',
      title: 'Héroe Ambiental',
      description: '25 packs salvados',
      icon: '🦸‍♂️',
      unlockedAt: new Date(),
      category: 'champion'
    })
  }

  if (metrics.totalPacksSaved >= 100) {
    achievements.push({
      id: 'pack-saver-100',
      title: 'Guardián del Planeta',
      description: '100 packs salvados',
      icon: '🌍',
      unlockedAt: new Date(),
      category: 'champion'
    })
  }

  // Streak Achievements
  if (metrics.currentStreak >= 7) {
    achievements.push({
      id: 'streak-7',
      title: 'Semana Verde',
      description: '7 días de racha',
      icon: '🔥',
      unlockedAt: new Date(),
      category: 'streak'
    })
  }

  if (metrics.longestStreak >= 30) {
    achievements.push({
      id: 'streak-30',
      title: 'Mes Sostenible',
      description: '30 días de racha',
      icon: '⚡',
      unlockedAt: new Date(),
      category: 'streak'
    })
  }

  // CO2 Achievements
  if (metrics.totalCO2Avoided >= 50) {
    achievements.push({
      id: 'co2-saver-50',
      title: 'Protector Climático',
      description: '50kg CO₂ evitados',
      icon: '🌿',
      unlockedAt: new Date(),
      category: 'champion'
    })
  }

  return achievements
}

async function getMonthlyProgress(userId: string) {
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

  const orders = await prisma.order.findMany({
    where: {
      userId,
      status: 'COMPLETED',
      createdAt: {
        gte: sixMonthsAgo,
      },
    },
    include: {
      pack: true,
    },
  })

  // Group by month
  const monthlyData: { [key: string]: { packsSaved: number; co2Avoided: number; foodSaved: number } } = {}

  orders.forEach(order => {
    const monthKey = order.createdAt.toISOString().substring(0, 7) // YYYY-MM
    
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { packsSaved: 0, co2Avoided: 0, foodSaved: 0 }
    }
    
    monthlyData[monthKey].packsSaved++
    
    const estimatedWeight = (order.pack.discountedPrice / 10) * 0.5
    monthlyData[monthKey].foodSaved += estimatedWeight
    monthlyData[monthKey].co2Avoided += estimatedWeight * 2.1
  })

  // Convert to array and format
  return Object.entries(monthlyData)
    .map(([month, data]) => ({
      month: new Date(month + '-01').toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }),
      ...data
    }))
    .sort((a, b) => a.month.localeCompare(b.month))
}
