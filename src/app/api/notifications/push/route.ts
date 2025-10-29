import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Usuario no autenticado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { type, title, message, data = {} } = body

    // Crear notificación en la base de datos
    const notification = await prisma.userNotification.create({
      data: {
        userId: session.user.id,
        type: type || 'INFO',
        title: title || 'Nueva notificación',
        message: message || '',
        data: JSON.stringify(data),
        read: false,
      }
    })

    // En un entorno real, aquí enviarías la notificación push
    // usando servicios como Firebase Cloud Messaging, OneSignal, etc.
    
    // Simulación de envío de notificación push
    const pushNotification = {
      id: notification.id,
      title: notification.title,
      body: notification.message,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-192x192.png',
      data: {
        notificationId: notification.id,
        type: notification.type,
        ...data
      },
      actions: [
        {
          action: 'view',
          title: 'Ver',
          icon: '/icons/view.png'
        },
        {
          action: 'dismiss',
          title: 'Descartar',
          icon: '/icons/dismiss.png'
        }
      ]
    }

    return NextResponse.json({
      success: true,
      message: 'Notificación enviada exitosamente',
      data: {
        notification,
        pushNotification
      }
    })

  } catch (error) {
    console.error('❌ Error enviando notificación:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error enviando notificación',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// GET - Obtener notificaciones del usuario
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Usuario no autenticado' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    const unreadOnly = searchParams.get('unreadOnly') === 'true'

    const where = {
      userId: session.user.id,
      ...(unreadOnly && { read: false })
    }

    const notifications = await prisma.userNotification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    })

    const totalCount = await prisma.userNotification.count({ where })
    const unreadCount = await prisma.userNotification.count({
      where: { userId: session.user.id, read: false }
    })

    return NextResponse.json({
      success: true,
      data: {
        notifications,
        totalCount,
        unreadCount,
        hasMore: offset + limit < totalCount
      }
    })

  } catch (error) {
    console.error('❌ Error obteniendo notificaciones:', error)
    return NextResponse.json(
      { success: false, message: 'Error obteniendo notificaciones' },
      { status: 500 }
    )
  }
}

// PUT - Marcar notificación como leída
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Usuario no autenticado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { notificationId, markAllAsRead = false } = body

    if (markAllAsRead) {
      // Marcar todas las notificaciones como leídas
      await prisma.userNotification.updateMany({
        where: { 
          userId: session.user.id,
          read: false 
        },
        data: { read: true }
      })

      return NextResponse.json({
        success: true,
        message: 'Todas las notificaciones marcadas como leídas'
      })
    } else if (notificationId) {
      // Marcar una notificación específica como leída
      const notification = await prisma.userNotification.update({
        where: { 
          id: notificationId,
          userId: session.user.id // Verificar que pertenece al usuario
        },
        data: { read: true }
      })

      return NextResponse.json({
        success: true,
        message: 'Notificación marcada como leída',
        data: notification
      })
    } else {
      return NextResponse.json(
        { success: false, message: 'notificationId requerido' },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('❌ Error actualizando notificación:', error)
    return NextResponse.json(
      { success: false, message: 'Error actualizando notificación' },
      { status: 500 }
    )
  }
}
