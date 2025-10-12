import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Función para analizar comportamiento del usuario
async function analyzeBehavior(userId: string) {
  try {
    console.log(`🧠 [Behavior] Analyzing behavior for user ${userId}`)

    // Obtener datos del usuario
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        orders: {
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        establishment: true,
        reviews: true,
        favorites: true
      }
    })

    if (!user) {
      return { trustScore: 0, status: 'PENDING', reasons: ['Usuario no encontrado'] }
    }

    let trustScore = user.trustScore
    const reasons: string[] = []
    const penalties: string[] = []

    // 1. ANÁLISIS DE ACTIVIDAD
    const daysSinceRegistration = Math.floor(
      (Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    )

    if (daysSinceRegistration >= 7) {
      trustScore += 0.1
      reasons.push('Usuario activo por más de 7 días')
    }

    if (daysSinceRegistration >= 30) {
      trustScore += 0.1
      reasons.push('Usuario activo por más de 30 días')
    }

    // 2. ANÁLISIS DE ÓRDENES
    const orderCount = user.orders.length
    const completedOrders = user.orders.filter(order => order.status === 'COMPLETED').length

    if (orderCount >= 3) {
      trustScore += 0.15
      reasons.push(`${orderCount} órdenes realizadas`)
    }

    if (completedOrders >= 2) {
      trustScore += 0.1
      reasons.push(`${completedOrders} órdenes completadas exitosamente`)
    }

    // Verificar patrones sospechosos en órdenes
    const recentOrders = user.orders.filter(order => 
      Date.now() - order.createdAt.getTime() < 24 * 60 * 60 * 1000 // Últimas 24 horas
    )

    if (recentOrders.length > 5) {
      trustScore -= 0.2
      penalties.push('Demasiadas órdenes en 24 horas')
    }

    // 3. ANÁLISIS DE INTERACCIONES SOCIALES
    const reviewCount = user.reviews.length
    const favoriteCount = user.favorites.length

    if (reviewCount >= 2) {
      trustScore += 0.1
      reasons.push(`${reviewCount} reseñas escritas`)
    }

    if (favoriteCount >= 3) {
      trustScore += 0.05
      reasons.push(`${favoriteCount} restaurantes favoritos`)
    }

    // 4. ANÁLISIS DE ESTABLECIMIENTO (si es restaurante)
    if (user.establishment) {
      const establishment = user.establishment
      
      if (establishment.verificationStatus === 'APPROVED' || establishment.verificationStatus === 'AUTO_VERIFIED') {
        trustScore += 0.2
        reasons.push('Propietario de restaurante verificado')
      }

      // Verificar packs creados
      const packs = await prisma.pack.count({
        where: { establishmentId: establishment.id }
      })

      if (packs >= 3) {
        trustScore += 0.1
        reasons.push(`${packs} packs creados como restaurante`)
      }
    }

    // 5. ANÁLISIS DE PATRONES DE LOGIN
    if (user.loginCount >= 10) {
      trustScore += 0.15
      reasons.push(`${user.loginCount} inicios de sesión`)
    }

    // Verificar actividad reciente
    if (user.lastActivity && Date.now() - user.lastActivity.getTime() < 7 * 24 * 60 * 60 * 1000) {
      trustScore += 0.1
      reasons.push('Actividad reciente en los últimos 7 días')
    }

    // 6. VERIFICACIONES COMPLETADAS
    if (user.emailVerified) {
      trustScore += 0.15
      reasons.push('Email verificado')
    }

    if (user.googleVerified) {
      trustScore += 0.1
      reasons.push('Google OAuth verificado')
    }

    if (user.profilePhoto) {
      trustScore += 0.05
      reasons.push('Foto de perfil agregada')
    }

    if (user.realName) {
      trustScore += 0.05
      reasons.push('Nombre real proporcionado')
    }

    // 7. REPUTACIÓN CRUZADA
    if (user.totalRatings >= 5) {
      if (user.reputationScore >= 4.5) {
        trustScore += 0.2
        reasons.push(`Excelente reputación (${user.reputationScore.toFixed(1)}/5.0)`)
      } else if (user.reputationScore >= 4.0) {
        trustScore += 0.15
        reasons.push(`Buena reputación (${user.reputationScore.toFixed(1)}/5.0)`)
      } else if (user.reputationScore >= 3.5) {
        trustScore += 0.1
        reasons.push(`Reputación aceptable (${user.reputationScore.toFixed(1)}/5.0)`)
      } else if (user.reputationScore < 2.5) {
        trustScore -= 0.15
        penalties.push(`Reputación baja (${user.reputationScore.toFixed(1)}/5.0)`)
      }
    }

    // Limitar trustScore entre 0 y 1
    trustScore = Math.max(0, Math.min(1, trustScore))

    // Determinar nuevo estado basado en trustScore y verificaciones
    let newStatus = user.verificationStatus

    // Lógica de promoción automática
    if (trustScore >= 0.8) {
      if (user.verificationStatus === 'IDENTITY_VERIFIED') {
        newStatus = 'TRUSTED_USER'
        reasons.push('Alcanzó nivel de usuario confiable (80%+ confianza)')
      } else if (user.verificationStatus === 'EMAIL_VERIFIED' && (user.googleVerified || user.profilePhoto)) {
        newStatus = 'IDENTITY_VERIFIED'
        reasons.push('Promovido a identidad verificada por buen comportamiento')
      }
    } else if (trustScore >= 0.6) {
      if (user.verificationStatus === 'PENDING' && user.emailVerified) {
        newStatus = 'EMAIL_VERIFIED'
        reasons.push('Auto-promovido por buen comportamiento')
      } else if (user.verificationStatus === 'EMAIL_VERIFIED' && user.googleVerified && user.profilePhoto) {
        newStatus = 'IDENTITY_VERIFIED'
        reasons.push('Identidad verificada por múltiples factores')
      }
    }

    return {
      trustScore,
      status: newStatus,
      reasons,
      penalties,
      analysis: {
        daysSinceRegistration,
        orderCount,
        completedOrders,
        reviewCount,
        favoriteCount,
        hasEstablishment: !!user.establishment,
        loginCount: user.loginCount
      }
    }
  } catch (error) {
    console.error('❌ Error analyzing behavior:', error)
    return { trustScore: 0, status: 'PENDING', reasons: ['Error en análisis'] }
  }
}

// POST: Ejecutar análisis de comportamiento
export async function POST(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'No autorizado' },
        { status: 401 }
      )
    }

    console.log(`🧠 [Behavior] Starting behavior analysis for user ${session.user.id}`)

    // Ejecutar análisis
    const analysis = await analyzeBehavior(session.user.id)

    // Actualizar usuario con nuevos datos
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        trustScore: analysis.trustScore,
        verificationStatus: analysis.status,
        lastActivity: new Date(),
        suspiciousActivity: (analysis.penalties?.length || 0) > 0
      }
    })

    // Log de auditoría
    await prisma.auditLog.create({
      data: {
        action: 'BEHAVIOR_ANALYSIS',
        entityType: 'USER',
        entityId: session.user.id,
        userId: 'system',
        userName: 'Sistema de Análisis',
        changes: JSON.stringify({
          trustScore: analysis.trustScore,
          verificationStatus: analysis.status,
          suspiciousActivity: (analysis.penalties?.length || 0) > 0
        }),
        metadata: JSON.stringify({
          reasons: analysis.reasons,
          penalties: analysis.penalties,
          analysis: analysis.analysis
        })
      }
    })

    console.log(`✅ [Behavior] Analysis completed. Trust score: ${analysis.trustScore}, Status: ${analysis.status}`)

    return NextResponse.json({
      message: 'Análisis de comportamiento completado',
      success: true,
      trustScore: analysis.trustScore,
      verificationStatus: analysis.status,
      reasons: analysis.reasons,
      penalties: analysis.penalties,
      analysis: analysis.analysis
    })
  } catch (error) {
    console.error('❌ Error in behavior analysis:', error)
    
    return NextResponse.json(
      {
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// GET: Obtener estado actual de confianza
export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'No autorizado' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        verificationStatus: true,
        trustScore: true,
        emailVerified: true,
        suspiciousActivity: true,
        lastActivity: true,
        loginCount: true,
        createdAt: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { message: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      verificationStatus: user.verificationStatus,
      trustScore: user.trustScore,
      emailVerified: !!user.emailVerified,
      suspiciousActivity: user.suspiciousActivity,
      lastActivity: user.lastActivity,
      loginCount: user.loginCount,
      daysSinceRegistration: Math.floor(
        (Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)
      )
    })
  } catch (error) {
    console.error('❌ Error getting trust status:', error)
    
    return NextResponse.json(
      {
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
