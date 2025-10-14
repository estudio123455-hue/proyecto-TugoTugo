import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendPushNotification } from '@/lib/notifications-server'

export async function POST(request: NextRequest) {
  try {
    console.log('📱 [Send to User] Iniciando envío de notificación...')
    
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { message: 'No autorizado' },
        { status: 401 }
      )
    }

    const { userId, title, body, data, icon, actions } = await request.json()
    
    if (!userId || !title || !body) {
      return NextResponse.json(
        { message: 'userId, title y body son requeridos' },
        { status: 400 }
      )
    }

    console.log('📱 [Send to User] Enviando a usuario:', userId)
    console.log('📱 [Send to User] Título:', title)

    // Buscar todas las suscripciones del usuario
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId: userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    if (subscriptions.length === 0) {
      console.log('📱 [Send to User] Usuario no tiene suscripciones activas')
      return NextResponse.json(
        { message: 'Usuario no tiene notificaciones habilitadas' },
        { status: 404 }
      )
    }

    console.log(`📱 [Send to User] Encontradas ${subscriptions.length} suscripciones`)

    const notification = {
      title,
      body,
      icon: icon || '/icon-192x192.png',
      badge: '/badge-72x72.png',
      data: {
        url: '/',
        userId,
        timestamp: Date.now(),
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

    // Enviar notificación a todas las suscripciones del usuario
    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          const subscription = {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth
            }
          }

          await sendPushNotification(subscription, notification)
          console.log(`✅ [Send to User] Enviado a dispositivo: ${sub.id}`)
          
          return { success: true, subscriptionId: sub.id }
        } catch (error) {
          console.error(`❌ [Send to User] Error en dispositivo ${sub.id}:`, error)
          
          // Si la suscripción es inválida, eliminarla
          if (error instanceof Error && (
            error.message.includes('410') || 
            error.message.includes('invalid')
          )) {
            await prisma.pushSubscription.delete({
              where: { id: sub.id }
            })
            console.log(`🗑️ [Send to User] Suscripción inválida eliminada: ${sub.id}`)
          }
          
          return { success: false, subscriptionId: sub.id, error: error instanceof Error ? error.message : 'Error desconocido' }
        }
      })
    )

    const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length
    const failed = results.length - successful

    console.log(`📊 [Send to User] Resultados: ${successful} exitosos, ${failed} fallidos`)

    return NextResponse.json({
      success: true,
      message: `Notificación enviada a ${successful} dispositivos`,
      results: {
        total: results.length,
        successful,
        failed,
        user: subscriptions[0]?.user
      }
    })

  } catch (error) {
    console.error('❌ [Send to User] Error:', error)
    return NextResponse.json(
      { 
        success: false,
        message: 'Error al enviar notificación',
        error: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
}
