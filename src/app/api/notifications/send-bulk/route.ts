import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendPushNotification } from '@/lib/notifications-server'

export async function POST(request: NextRequest) {
  try {
    console.log('📢 [Bulk Send] Iniciando envío masivo...')
    
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Solo administradores pueden enviar notificaciones masivas' },
        { status: 403 }
      )
    }

    const { 
      userIds, 
      title, 
      body, 
      data, 
      icon, 
      actions,
      filters 
    } = await request.json()
    
    if (!title || !body) {
      return NextResponse.json(
        { message: 'title y body son requeridos' },
        { status: 400 }
      )
    }

    console.log('📢 [Bulk Send] Título:', title)
    console.log('📢 [Bulk Send] Filtros:', filters)

    // Construir query para usuarios
    let whereClause: any = {}
    
    if (userIds && userIds.length > 0) {
      whereClause.userId = { in: userIds }
    }
    
    if (filters) {
      if (filters.role) {
        whereClause.user = { role: filters.role }
      }
      if (filters.createdAfter) {
        whereClause.user = { 
          ...whereClause.user,
          createdAt: { gte: new Date(filters.createdAfter) }
        }
      }
    }

    // Buscar todas las suscripciones que coincidan
    const subscriptions = await prisma.pushSubscription.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    })

    if (subscriptions.length === 0) {
      console.log('📢 [Bulk Send] No se encontraron suscripciones')
      return NextResponse.json(
        { message: 'No se encontraron usuarios con notificaciones habilitadas' },
        { status: 404 }
      )
    }

    console.log(`📢 [Bulk Send] Enviando a ${subscriptions.length} suscripciones`)

    const notification = {
      title,
      body,
      icon: icon || '/icon-192x192.png',
      badge: '/badge-72x72.png',
      data: {
        url: '/',
        timestamp: Date.now(),
        bulk: true,
        ...data
      },
      actions: actions || [
        {
          action: 'view',
          title: '👀 Ver'
        },
        {
          action: 'dismiss',
          title: '❌ Cerrar'
        }
      ]
    }

    // Enviar notificaciones en lotes para evitar sobrecarga
    const batchSize = 50
    const batches = []
    
    for (let i = 0; i < subscriptions.length; i += batchSize) {
      batches.push(subscriptions.slice(i, i + batchSize))
    }

    let totalSuccessful = 0
    let totalFailed = 0
    const userResults: any[] = []

    for (const batch of batches) {
      console.log(`📢 [Bulk Send] Procesando lote de ${batch.length} suscripciones`)
      
      const batchResults = await Promise.allSettled(
        batch.map(async (sub) => {
          try {
            const subscription = {
              endpoint: sub.endpoint,
              keys: {
                p256dh: sub.p256dh,
                auth: sub.auth
              }
            }

            await sendPushNotification(subscription, notification)
            console.log(`✅ [Bulk Send] Enviado a ${sub.user.email}`)
            
            return { 
              success: true, 
              userId: sub.userId,
              user: sub.user,
              subscriptionId: sub.id 
            }
          } catch (error) {
            console.error(`❌ [Bulk Send] Error para ${sub.user.email}:`, error)
            
            // Si la suscripción es inválida, eliminarla
            if (error instanceof Error && (
              error.message.includes('410') || 
              error.message.includes('invalid')
            )) {
              await prisma.pushSubscription.delete({
                where: { id: sub.id }
              })
              console.log(`🗑️ [Bulk Send] Suscripción inválida eliminada: ${sub.id}`)
            }
            
            return { 
              success: false, 
              userId: sub.userId,
              user: sub.user,
              subscriptionId: sub.id,
              error: error instanceof Error ? error.message : 'Error desconocido'
            }
          }
        })
      )

      // Procesar resultados del lote
      batchResults.forEach(result => {
        if (result.status === 'fulfilled') {
          if (result.value.success) {
            totalSuccessful++
          } else {
            totalFailed++
          }
          userResults.push(result.value)
        } else {
          totalFailed++
        }
      })

      // Pequeña pausa entre lotes
      if (batches.length > 1) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }

    console.log(`📊 [Bulk Send] Completado: ${totalSuccessful} exitosos, ${totalFailed} fallidos`)

    return NextResponse.json({
      success: true,
      message: `Notificación enviada a ${totalSuccessful} usuarios`,
      results: {
        total: subscriptions.length,
        successful: totalSuccessful,
        failed: totalFailed,
        uniqueUsers: [...new Set(userResults.map(r => r.userId))].length,
        details: userResults
      }
    })

  } catch (error) {
    console.error('❌ [Bulk Send] Error:', error)
    return NextResponse.json(
      { 
        success: false,
        message: 'Error al enviar notificaciones masivas',
        error: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
}
