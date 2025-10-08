import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { endpoint, keys } = await request.json()

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return NextResponse.json(
        { message: 'Invalid subscription data' },
        { status: 400 }
      )
    }

    // Guardar o actualizar suscripción
    const subscription = await prisma.pushSubscription.upsert({
      where: {
        userId_endpoint: {
          userId: session.user.id,
          endpoint: endpoint,
        },
      },
      update: {
        p256dh: keys.p256dh,
        auth: keys.auth,
      },
      create: {
        userId: session.user.id,
        endpoint: endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
      },
    })

    console.log('✅ Push subscription saved:', subscription.id)

    return NextResponse.json({
      success: true,
      message: 'Subscription saved successfully',
    })
  } catch (error) {
    console.error('Error saving push subscription:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { endpoint } = await request.json()

    if (!endpoint) {
      return NextResponse.json(
        { message: 'Endpoint is required' },
        { status: 400 }
      )
    }

    await prisma.pushSubscription.deleteMany({
      where: {
        userId: session.user.id,
        endpoint: endpoint,
      },
    })

    console.log('✅ Push subscription deleted')

    return NextResponse.json({
      success: true,
      message: 'Subscription deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting push subscription:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
