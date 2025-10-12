import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET: Obtener métricas del sistema para el panel de admin
export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, message: 'No autorizado' },
        { status: 401 }
      )
    }

    console.log('📊 [Metrics] Generating admin dashboard metrics...')

    // Métricas de usuarios
    const userMetrics = await prisma.user.aggregate({
      _count: { id: true },
      _avg: { 
        trustScore: true,
        reputationScore: true 
      }
    })

    const usersByStatus = await prisma.user.groupBy({
      by: ['verificationStatus'],
      _count: { id: true }
    })

    const suspiciousUsers = await prisma.user.count({
      where: { suspiciousActivity: true }
    })

    const highTrustUsers = await prisma.user.count({
      where: { trustScore: { gte: 0.8 } }
    })

    // Métricas de establecimientos
    const establishmentMetrics = await prisma.establishment.aggregate({
      _count: { id: true }
    })

    const establishmentsByStatus = await prisma.establishment.groupBy({
      by: ['verificationStatus'],
      _count: { id: true }
    })

    // Métricas de reputación
    const reputationMetrics = await prisma.userRating.aggregate({
      _count: { id: true },
      _avg: { rating: true }
    })

    const recentRatings = await prisma.userRating.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Últimos 7 días
        }
      }
    })

    // Métricas de actividad
    const activeUsers = await prisma.user.count({
      where: {
        lastActivity: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Últimos 30 días
        }
      }
    })

    const newUsersThisMonth = await prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      }
    })

    // Usuarios con trust score bajo
    const lowTrustUsers = await prisma.user.findMany({
      where: {
        OR: [
          { trustScore: { lt: 0.3 } },
          { suspiciousActivity: true },
          { reputationScore: { lt: 2.0, gt: 0 } }
        ]
      },
      select: {
        id: true,
        name: true,
        email: true,
        trustScore: true,
        reputationScore: true,
        suspiciousActivity: true,
        verificationStatus: true,
        lastActivity: true,
        createdAt: true
      },
      orderBy: { trustScore: 'asc' },
      take: 10
    })

    // Tendencias de trust score (últimos 30 días)
    const trustScoreTrend = await prisma.auditLog.findMany({
      where: {
        action: 'BEHAVIOR_ANALYSIS',
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      },
      select: {
        createdAt: true,
        changes: true
      },
      orderBy: { createdAt: 'desc' },
      take: 100
    })

    // Procesar tendencias
    const dailyTrustScores = trustScoreTrend.reduce((acc: any, log) => {
      try {
        const changes = JSON.parse(log.changes || '{}')
        const date = log.createdAt.toISOString().split('T')[0]
        
        if (!acc[date]) {
          acc[date] = { total: 0, count: 0 }
        }
        
        if (changes.trustScore) {
          acc[date].total += changes.trustScore
          acc[date].count += 1
        }
      } catch (e) {
        // Ignorar logs con JSON inválido
      }
      return acc
    }, {})

    const trustScoreChart = Object.entries(dailyTrustScores).map(([date, data]: [string, any]) => ({
      date,
      averageTrustScore: data.count > 0 ? data.total / data.count : 0
    })).slice(-7) // Últimos 7 días

    // Métricas de sistema recientes
    const systemMetrics = await prisma.systemMetric.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20
    })

    // Guardar métricas actuales
    await prisma.systemMetric.createMany({
      data: [
        {
          metricType: 'TRUST_SCORE_AVG',
          value: userMetrics._avg.trustScore || 0
        },
        {
          metricType: 'SUSPICIOUS_USERS',
          value: suspiciousUsers
        },
        {
          metricType: 'VERIFICATION_RATE',
          value: userMetrics._count.id > 0 ? (highTrustUsers / userMetrics._count.id) * 100 : 0
        },
        {
          metricType: 'ACTIVE_USERS_30D',
          value: activeUsers
        }
      ]
    })

    return NextResponse.json({
      success: true,
      data: {
        // Resumen general
        summary: {
          totalUsers: userMetrics._count.id,
          totalEstablishments: establishmentMetrics._count.id,
          averageTrustScore: userMetrics._avg.trustScore || 0,
          averageReputationScore: userMetrics._avg.reputationScore || 0,
          suspiciousUsers: suspiciousUsers,
          activeUsers: activeUsers,
          newUsersThisMonth: newUsersThisMonth
        },

        // Distribución por estados
        usersByStatus: usersByStatus.reduce((acc: any, item) => {
          acc[item.verificationStatus] = item._count.id
          return acc
        }, {}),

        establishmentsByStatus: establishmentsByStatus.reduce((acc: any, item) => {
          acc[item.verificationStatus] = item._count.id
          return acc
        }, {}),

        // Métricas de reputación
        reputation: {
          totalRatings: reputationMetrics._count.id,
          averageRating: reputationMetrics._avg.rating || 0,
          recentRatings: recentRatings
        },

        // Usuarios que requieren atención
        alertUsers: lowTrustUsers,

        // Tendencias
        trends: {
          trustScoreChart: trustScoreChart
        },

        // Métricas históricas del sistema
        systemMetrics: systemMetrics,

        // Estadísticas adicionales
        stats: {
          verificationRate: userMetrics._count.id > 0 ? (highTrustUsers / userMetrics._count.id) * 100 : 0,
          suspiciousRate: userMetrics._count.id > 0 ? (suspiciousUsers / userMetrics._count.id) * 100 : 0,
          activeRate: userMetrics._count.id > 0 ? (activeUsers / userMetrics._count.id) * 100 : 0
        }
      }
    })
  } catch (error) {
    console.error('❌ Error generating metrics:', error)
    
    return NextResponse.json(
      {
        success: false,
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// POST: Actualizar métricas manualmente
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, message: 'No autorizado' },
        { status: 401 }
      )
    }

    const { metricType, value, metadata } = await request.json()

    if (!metricType || value === undefined) {
      return NextResponse.json(
        { message: 'metricType y value son requeridos' },
        { status: 400 }
      )
    }

    const metric = await prisma.systemMetric.create({
      data: {
        metricType,
        value,
        metadata: metadata ? JSON.stringify(metadata) : null
      }
    })

    // Log de auditoría
    await prisma.auditLog.create({
      data: {
        action: 'METRIC_CREATED',
        entityType: 'SYSTEM',
        entityId: metric.id,
        userId: session.user.id,
        userName: session.user.name || session.user.email,
        changes: JSON.stringify({ metricType, value }),
        metadata: metadata ? JSON.stringify(metadata) : null
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Métrica creada exitosamente',
      data: metric
    })
  } catch (error) {
    console.error('❌ Error creating metric:', error)
    
    return NextResponse.json(
      {
        success: false,
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
