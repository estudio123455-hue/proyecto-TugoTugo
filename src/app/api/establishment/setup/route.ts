import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendRestaurantConfirmation } from '@/lib/email/restaurant-verification'

export async function POST(request: NextRequest) {
  try {
    console.log('🏪 [Setup] Starting establishment setup...')
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      console.log('❌ [Setup] Unauthorized - no session')
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    console.log('👤 [Setup] User:', session.user.id, 'Role:', session.user.role)

    const data = await request.json()
    console.log('📝 [Setup] Received data:', {
      name: data.name,
      category: data.category,
      address: data.address,
    })

    // Check if establishment already exists
    const existingEstablishment = await prisma.establishment.findUnique({
      where: {
        userId: session.user.id,
      },
    })

    if (existingEstablishment) {
      console.log('⚠️ [Setup] Establishment already exists for user')
      return NextResponse.json(
        { message: 'Establishment already exists' },
        { status: 400 }
      )
    }

    console.log('💾 [Setup] Creating establishment...')
    const establishment = await prisma.establishment.create({
      data: {
        name: data.name,
        description: data.description || '',
        address: data.address,
        latitude: parseFloat(data.latitude),
        longitude: parseFloat(data.longitude),
        phone: data.phone || '',
        email: data.email || '',
        category: data.category,
        userId: session.user.id,
      },
    })

    // Update user role to ESTABLISHMENT
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { role: 'ESTABLISHMENT' },
    })

    console.log('✅ [Setup] Establishment created:', establishment.id)
    console.log('✅ [Setup] User role updated to ESTABLISHMENT')

    // Send confirmation email
    try {
      await sendRestaurantConfirmation(establishment as any, updatedUser as any)
      console.log('📧 [Setup] Confirmation email sent')
    } catch (emailError) {
      console.error('⚠️ [Setup] Failed to send email, but establishment was created:', emailError)
      // Don't fail the request if email fails
    }

    return NextResponse.json(establishment, { status: 201 })
  } catch (error) {
    console.error('❌ [Setup] Error setting up establishment:', error)
    console.error('Error details:', error instanceof Error ? error.message : error)
    console.error('Stack:', error instanceof Error ? error.stack : 'No stack')
    return NextResponse.json(
      { 
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
