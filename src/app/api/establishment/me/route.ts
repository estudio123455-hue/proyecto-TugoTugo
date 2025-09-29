import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (session.user.role !== 'ESTABLISHMENT') {
      return NextResponse.json(
        { message: 'Access denied' },
        { status: 403 }
      )
    }

    const establishment = await prisma.establishment.findUnique({
      where: {
        userId: session.user.id,
      },
    })

    if (!establishment) {
      return NextResponse.json(
        { message: 'Establishment not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(establishment)
  } catch (error) {
    console.error('Error fetching establishment:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
