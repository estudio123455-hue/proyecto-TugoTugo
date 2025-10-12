import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET: Obtener notificaciones del usuario
export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'No autorizado' },
        { status: 401 }
      )
    }

    const notifications = await prisma.userNotification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50
    })

    const unreadCount = await prisma.userNotification.count({
      where: { 
        userId: session.user.id,
        read: false 
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        notifications: notifications,
        unreadCount: unreadCount
      }
    })
  } catch (error) {
    console.error('❌ Error getting notifications:', error)
    
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

// PUT: Marcar notificaciones como leídas
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'No autorizado' },
        { status: 401 }
      )
    }

    const { notificationIds, markAllAsRead } = await request.json()

    if (markAllAsRead) {
      // Marcar todas como leídas
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
    } else if (notificationIds && Array.isArray(notificationIds)) {
      // Marcar específicas como leídas
      await prisma.userNotification.updateMany({
        where: { 
          id: { in: notificationIds },
          userId: session.user.id 
        },
        data: { read: true }
      })

      return NextResponse.json({
        success: true,
        message: 'Notificaciones marcadas como leídas'
      })
    } else {
      return NextResponse.json(
        { message: 'notificationIds o markAllAsRead requerido' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('❌ Error updating notifications:', error)
    
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
