import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Test basic database connection
    console.log('Testing database connection...')
    await prisma.$connect()
    console.log('Database connected successfully')
    
    // Get simple counts
    const userCount = await prisma.user.count()
    const establishmentCount = await prisma.establishment.count()
    const packCount = await prisma.pack.count()
    
    return NextResponse.json({
      status: 'ok',
      database: 'connected',
      data: {
        users: userCount,
        establishments: establishmentCount,
        packs: packCount,
      },
      message: 'Database connection successful',
    })
  } catch (error) {
    console.error('Database connection error:', error)
    
    return NextResponse.json(
      {
        status: 'error',
        database: 'disconnected',
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    // Verificar token de seguridad
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    
    const SEED_TOKEN = process.env.SEED_TOKEN || 'dev-seed-token-123'
    
    if (token !== SEED_TOKEN) {
      return NextResponse.json(
        { message: 'Unauthorized. Invalid token.' },
        { status: 401 }
      )
    }

    console.log('🌱 Starting simple database seed...')

    // Test database connection first
    await prisma.$connect()
    console.log('✅ Database connected successfully')

    // Try to create a simple user first
    console.log('Creating simple test user...')
    
    const testUser = await prisma.user.upsert({
      where: { email: 'test@example.com' },
      update: {},
      create: {
        name: 'Test User',
        email: 'test@example.com',
        role: 'CUSTOMER',
      },
    })
    
    console.log('✅ Test user created:', testUser.id)

    return NextResponse.json({
      message: 'Simple seed completed successfully! 🎉',
      data: {
        testUserId: testUser.id,
      },
    })
  } catch (error) {
    console.error('❌ Error in simple seed:', error)
    
    const errorDetails = {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
    }
    
    console.error('Error details:', JSON.stringify(errorDetails, null, 2))
    
    return NextResponse.json(
      {
        message: 'Error in simple seed',
        error: errorDetails.message,
        details: errorDetails,
      },
      { status: 500 }
    )
  }
}
