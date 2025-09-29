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

    if (session.user.role !== 'ESTABLISHMENT') {
      return NextResponse.json({ message: 'Access denied' }, { status: 403 })
    }

    const data = await request.json()

    // Check if establishment already exists
    const existingEstablishment = await prisma.establishment.findUnique({
      where: {
        userId: session.user.id,
      },
    })

    if (existingEstablishment) {
      return NextResponse.json(
        { message: 'Establishment already exists' },
        { status: 400 }
      )
    }

    const establishment = await prisma.establishment.create({
      data: {
        name: data.name,
        description: data.description,
        address: data.address,
        latitude: data.latitude,
        longitude: data.longitude,
        phone: data.phone,
        email: data.email,
        category: data.category,
        userId: session.user.id,
      },
    })

    return NextResponse.json(establishment, { status: 201 })
  } catch (error) {
    console.error('Error setting up establishment:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
