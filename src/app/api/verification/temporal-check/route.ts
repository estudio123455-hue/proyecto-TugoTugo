import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Función para verificación temporal automática
async function performTemporalVerification(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        orders: {
          where: {
            createdAt: {
              gte: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000) // Últimos 6 meses
            }
          }
        },
        establishment: true,
        ratingsReceived: {
          where: {
            createdAt: {
              gte: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000)
            }
          }
        }
      }
    })

    if (!user) return { success: false, reason: 'Usuario no encontrado' }

    const now = new Date()
    const sixMonthsAgo = new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000)
    
    let shouldDowngrade = false
    let downgradeReason = ''
    let newStatus = user.verificationStatus

    // Verificar inactividad prolongada
    if (user.lastActivity && user.lastActivity < sixMonthsAgo) {
      shouldDowngrade = true
      downgradeReason = 'Inactividad prolongada (más de 6 meses)'
    }

    // Verificar si cambió información crítica sin re-verificar
    if (user.verificationExpiry && now > user.verificationExpiry) {
      shouldDowngrade = true
      downgradeReason = 'Verificación expirada'
    }

    // Verificar reputación muy baja
    if (user.totalRatings >= 10 && user.reputationScore < 2.0) {
      shouldDowngrade = true
      downgradeReason = 'Reputación muy baja'
    }

    // Verificar actividad sospechosa persistente
    if (user.suspiciousActivity && user.trustScore < 0.3) {
      shouldDowngrade = true
      downgradeReason = 'Actividad sospechosa persistente'
    }

    // Determinar nuevo estado si hay downgrade
    if (shouldDowngrade) {
      if (user.verificationStatus === 'TRUSTED_USER') {
        newStatus = 'EMAIL_VERIFIED'
      } else if (user.verificationStatus === 'IDENTITY_VERIFIED') {
        newStatus = 'EMAIL_VERIFIED'
      }
      // EMAIL_VERIFIED y PENDING se mantienen igual
    }

    // Actualizar usuario si es necesario
    if (shouldDowngrade && newStatus !== user.verificationStatus) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          verificationStatus: newStatus,
          lastVerification: now,
          verificationExpiry: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000) // 6 meses más
        }
      })

      // Crear notificación
      await prisma.userNotification.create({
        data: {
          userId: userId,
          type: 'VERIFICATION_CHANGE',
          title: '🔄 Estado de verificación actualizado',
          message: `Tu estado cambió a ${newStatus} debido a: ${downgradeReason}. Puedes recuperar tu estado anterior manteniéndote activo.`,
          data: JSON.stringify({
            previousStatus: user.verificationStatus,
            newStatus: newStatus,
            reason: downgradeReason
          })
        }
      })

      // Log de auditoría
      await prisma.auditLog.create({
        data: {
          action: 'TEMPORAL_VERIFICATION',
          entityType: 'USER',
          entityId: userId,
          userId: 'system',
          userName: 'Sistema de Verificación Temporal',
          changes: JSON.stringify({
            previousStatus: user.verificationStatus,
            newStatus: newStatus,
            reason: downgradeReason
          }),
          metadata: JSON.stringify({
            lastActivity: user.lastActivity,
            trustScore: user.trustScore,
            reputationScore: user.reputationScore
          })
        }
      })

      console.log(`🔄 [Temporal] User ${userId} downgraded from ${user.verificationStatus} to ${newStatus}: ${downgradeReason}`)
    } else {
      // Solo actualizar fecha de verificación si no hubo downgrade
      await prisma.user.update({
        where: { id: userId },
        data: {
          lastVerification: now
        }
      })

      console.log(`✅ [Temporal] User ${userId} passed temporal verification`)
    }

    return {
      success: true,
      downgraded: shouldDowngrade,
      previousStatus: user.verificationStatus,
      newStatus: newStatus,
      reason: downgradeReason || 'Verificación exitosa'
    }
  } catch (error) {
    console.error('❌ Error in temporal verification:', error)
    return { success: false, reason: 'Error interno' }
  }
}

// POST: Ejecutar verificación temporal para un usuario específico
export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { message: 'userId requerido' },
        { status: 400 }
      )
    }

    const result = await performTemporalVerification(userId)

    return NextResponse.json({
      success: result.success,
      message: result.success ? 'Verificación temporal completada' : 'Error en verificación temporal',
      data: result
    })
  } catch (error) {
    console.error('❌ Error in temporal verification endpoint:', error)
    
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

// GET: Ejecutar verificación temporal masiva (para cron jobs)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    
    // Verificar token de seguridad para cron jobs
    if (token !== process.env.CRON_SECRET_TOKEN) {
      return NextResponse.json(
        { message: 'Token inválido' },
        { status: 401 }
      )
    }

    console.log('🔄 [Temporal] Starting mass temporal verification...')

    // Obtener usuarios que necesitan verificación temporal
    const usersToCheck = await prisma.user.findMany({
      where: {
        OR: [
          // Usuarios sin verificación temporal reciente (más de 1 mes)
          {
            lastVerification: {
              lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            }
          },
          // Usuarios que nunca han tenido verificación temporal
          {
            lastVerification: null
          }
        ],
        // Solo usuarios activos
        verificationStatus: {
          in: ['EMAIL_VERIFIED', 'IDENTITY_VERIFIED', 'TRUSTED_USER']
        }
      },
      select: {
        id: true,
        verificationStatus: true,
        lastVerification: true
      }
    })

    console.log(`🔄 [Temporal] Found ${usersToCheck.length} users to check`)

    const results = {
      total: usersToCheck.length,
      processed: 0,
      downgraded: 0,
      errors: 0
    }

    // Procesar usuarios en lotes para no sobrecargar
    const batchSize = 10
    for (let i = 0; i < usersToCheck.length; i += batchSize) {
      const batch = usersToCheck.slice(i, i + batchSize)
      
      const batchPromises = batch.map(async (user) => {
        try {
          const result = await performTemporalVerification(user.id)
          results.processed++
          
          if (result.downgraded) {
            results.downgraded++
          }
          
          return result
        } catch (error) {
          console.error(`❌ Error processing user ${user.id}:`, error)
          results.errors++
          return { success: false, userId: user.id }
        }
      })

      await Promise.all(batchPromises)
      
      // Pequeña pausa entre lotes
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    // Guardar métricas del sistema
    await prisma.systemMetric.create({
      data: {
        metricType: 'TEMPORAL_VERIFICATION_BATCH',
        value: results.downgraded,
        metadata: JSON.stringify(results)
      }
    })

    console.log(`✅ [Temporal] Mass verification completed:`, results)

    return NextResponse.json({
      success: true,
      message: 'Verificación temporal masiva completada',
      data: results
    })
  } catch (error) {
    console.error('❌ Error in mass temporal verification:', error)
    
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
