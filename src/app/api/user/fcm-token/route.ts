import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
// import { prisma } from '@/lib/prisma' // TODO: Uncomment when needed

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId, token } = await request.json()

    if (session.user.id !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // TODO: Save or update FCM token when fcmToken field is added to User model
    // await prisma.user.update({
    //   where: { id: userId },
    //   data: {
    //     fcmToken: token,
    //     fcmTokenUpdatedAt: new Date(),
    //   },
    // })
    
    console.log('FCM token would be saved:', { userId, token })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving FCM token:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // TODO: Remove FCM token when fcmToken field is added to User model
    // await prisma.user.update({
    //   where: { id: session.user.id },
    //   data: {
    //     fcmToken: null,
    //     fcmTokenUpdatedAt: new Date(),
    //   },
    // })
    
    console.log('FCM token would be removed for user:', session.user.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error removing FCM token:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
