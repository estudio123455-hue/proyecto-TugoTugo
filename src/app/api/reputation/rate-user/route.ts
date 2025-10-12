import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST: Calificar a otro usuario
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'No autorizado' },
        { status: 401 }
      )
    }

    const { ratedUserId, rating, comment, context, orderId } = await request.json()

    // Validaciones
    if (!ratedUserId || !rating || !context) {
      return NextResponse.json(
        { message: 'Datos requeridos: ratedUserId, rating, context' },
        { status: 400 }
      )
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { message: 'Rating debe estar entre 1 y 5' },
        { status: 400 }
      )
    }

    if (session.user.id === ratedUserId) {
      return NextResponse.json(
        { message: 'No puedes calificarte a ti mismo' },
        { status: 400 }
      )
    }

    // Verificar que el usuario calificado existe
    const ratedUser = await prisma.user.findUnique({
      where: { id: ratedUserId }
    })

    if (!ratedUser) {
      return NextResponse.json(
        { message: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // Si es por orden, verificar que la orden existe y el usuario participó
    if (orderId) {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          pack: {
            include: {
              establishment: true
            }
          }
        }
      })

      if (!order) {
        return NextResponse.json(
          { message: 'Orden no encontrada' },
          { status: 404 }
        )
      }

      // Verificar que el usuario que califica participó en la orden
      const canRate = order.userId === session.user.id || 
                     order.pack.establishment.userId === session.user.id

      if (!canRate) {
        return NextResponse.json(
          { message: 'No puedes calificar esta orden' },
          { status: 403 }
        )
      }
    }

    console.log(`⭐ [Rating] User ${session.user.id} rating user ${ratedUserId}: ${rating} stars`)

    // Crear o actualizar rating
    const userRating = await prisma.userRating.upsert({
      where: {
        raterId_ratedId_orderId: {
          raterId: session.user.id,
          ratedId: ratedUserId,
          orderId: orderId || null
        }
      },
      update: {
        rating: rating,
        comment: comment || null,
        context: context
      },
      create: {
        raterId: session.user.id,
        ratedId: ratedUserId,
        rating: rating,
        comment: comment || null,
        context: context,
        orderId: orderId || null
      }
    })

    // Recalcular reputación del usuario calificado
    const ratings = await prisma.userRating.findMany({
      where: { ratedId: ratedUserId }
    })

    const totalRatings = ratings.length
    const avgRating = ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings
    const positiveRatings = ratings.filter(r => r.rating >= 4).length
    const negativeRatings = ratings.filter(r => r.rating <= 2).length

    // Actualizar estadísticas del usuario
    await prisma.user.update({
      where: { id: ratedUserId },
      data: {
        reputationScore: avgRating,
        totalRatings: totalRatings,
        positiveRatings: positiveRatings,
        negativeRatings: negativeRatings
      }
    })

    // Crear notificación para el usuario calificado
    await prisma.userNotification.create({
      data: {
        userId: ratedUserId,
        type: 'REPUTATION_UPDATE',
        title: '⭐ Nueva calificación recibida',
        message: `Recibiste una calificación de ${rating} estrellas. Tu reputación promedio es ahora ${avgRating.toFixed(1)}/5.0`,
        data: JSON.stringify({
          raterId: session.user.id,
          rating: rating,
          newAverage: avgRating,
          totalRatings: totalRatings
        })
      }
    })

    // Actualizar trust score si la reputación cambió significativamente
    if (totalRatings >= 5) {
      const currentUser = await prisma.user.findUnique({
        where: { id: ratedUserId },
        select: { trustScore: true, verificationStatus: true }
      })

      if (currentUser) {
        let trustBonus = 0
        
        // Bonus por buena reputación
        if (avgRating >= 4.5) trustBonus = 0.15
        else if (avgRating >= 4.0) trustBonus = 0.1
        else if (avgRating >= 3.5) trustBonus = 0.05
        
        // Penalización por mala reputación
        if (avgRating < 2.5) trustBonus = -0.2
        else if (avgRating < 3.0) trustBonus = -0.1

        const newTrustScore = Math.max(0, Math.min(1, currentUser.trustScore + trustBonus))

        await prisma.user.update({
          where: { id: ratedUserId },
          data: { trustScore: newTrustScore }
        })

        console.log(`📊 [Trust] Updated trust score for user ${ratedUserId}: ${newTrustScore}`)
      }
    }

    // Log de auditoría
    await prisma.auditLog.create({
      data: {
        action: 'USER_RATED',
        entityType: 'USER',
        entityId: ratedUserId,
        userId: session.user.id,
        userName: session.user.name || session.user.email,
        changes: JSON.stringify({
          rating: rating,
          context: context,
          orderId: orderId
        }),
        metadata: JSON.stringify({
          newReputationScore: avgRating,
          totalRatings: totalRatings
        })
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Calificación registrada exitosamente',
      data: {
        ratingId: userRating.id,
        newReputationScore: avgRating,
        totalRatings: totalRatings
      }
    })
  } catch (error) {
    console.error('❌ Error rating user:', error)
    
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

// GET: Obtener calificaciones de un usuario
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { message: 'userId requerido' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        reputationScore: true,
        totalRatings: true,
        positiveRatings: true,
        negativeRatings: true,
        ratingsReceived: {
          include: {
            rater: {
              select: {
                name: true,
                profilePhoto: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 10
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { message: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        reputationScore: user.reputationScore,
        totalRatings: user.totalRatings,
        positiveRatings: user.positiveRatings,
        negativeRatings: user.negativeRatings,
        recentRatings: user.ratingsReceived
      }
    })
  } catch (error) {
    console.error('❌ Error getting user ratings:', error)
    
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
