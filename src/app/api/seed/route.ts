import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// GET endpoint para verificar el estado
export async function GET() {
  try {
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
      message: 'Database is connected. Use POST with ?token=dev-seed-token-123 to seed data.',
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        database: 'disconnected',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    // Verificar token de seguridad (opcional pero recomendado)
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    
    // Puedes configurar un token secreto en las variables de entorno
    const SEED_TOKEN = process.env.SEED_TOKEN || 'dev-seed-token-123'
    
    if (token !== SEED_TOKEN) {
      return NextResponse.json(
        { message: 'Unauthorized. Invalid token.' },
        { status: 401 }
      )
    }

    console.log('🌱 Starting database seed...')

    // Create a demo restaurant user
    const hashedPassword = await bcrypt.hash('123456', 12)

    const demoUser = await prisma.user.upsert({
      where: { email: 'demo.restaurant@foodsave.com' },
      update: {},
      create: {
        name: 'Restaurante Demo',
        email: 'demo.restaurant@foodsave.com',
        password: hashedPassword,
        role: 'ESTABLISHMENT',
      },
    })

    // Create a demo establishment
    const demoEstablishment = await prisma.establishment.upsert({
      where: { userId: demoUser.id },
      update: {},
      create: {
        name: 'Restaurante El Buen Sabor',
        description: 'Comida casera colombiana con sazón tradicional',
        address: 'Carrera 15 #85-20, Zona Rosa, Bogotá',
        latitude: 4.6698,
        longitude: -74.0648,
        phone: '+57 321 459 6837',
        email: 'estudio.123455@gmail.com',
        category: 'RESTAURANT',
        userId: demoUser.id,
      },
    })

    // Create some demo packs (time slots)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const demoPacks = [
      {
        title: 'Pack Almuerzo Sorpresa',
        description: 'Bandeja paisa, arepa, jugo natural y postre casero',
        originalPrice: 35000, // $35,000 COP
        discountedPrice: 18000, // $18,000 COP
        quantity: 5,
        availableFrom: new Date(
          `${today.toISOString().split('T')[0]}T12:00:00`
        ),
        availableUntil: new Date(
          `${today.toISOString().split('T')[0]}T14:00:00`
        ),
        pickupTimeStart: '12:00',
        pickupTimeEnd: '14:00',
        establishmentId: demoEstablishment.id,
      },
      {
        title: 'Pack Cena Especial',
        description: 'Sancocho, arroz, patacón y agua de panela',
        originalPrice: 40000, // $40,000 COP
        discountedPrice: 20000, // $20,000 COP
        quantity: 8,
        availableFrom: new Date(
          `${today.toISOString().split('T')[0]}T18:00:00`
        ),
        availableUntil: new Date(
          `${today.toISOString().split('T')[0]}T20:00:00`
        ),
        pickupTimeStart: '18:00',
        pickupTimeEnd: '20:00',
        establishmentId: demoEstablishment.id,
      },
      {
        title: 'Pack Almuerzo Mañana',
        description: 'Ajiaco bogotano completo con pollo y aguacate',
        originalPrice: 32000, // $32,000 COP
        discountedPrice: 16000, // $16,000 COP
        quantity: 10,
        availableFrom: new Date(
          `${tomorrow.toISOString().split('T')[0]}T12:00:00`
        ),
        availableUntil: new Date(
          `${tomorrow.toISOString().split('T')[0]}T14:00:00`
        ),
        pickupTimeStart: '12:00',
        pickupTimeEnd: '14:00',
        establishmentId: demoEstablishment.id,
      },
    ]

    for (const packData of demoPacks) {
      await prisma.pack.upsert({
        where: {
          id: `demo-${packData.pickupTimeStart}-${packData.availableFrom.toISOString().split('T')[0]}-${demoEstablishment.id}`,
        },
        update: packData,
        create: {
          id: `demo-${packData.pickupTimeStart}-${packData.availableFrom.toISOString().split('T')[0]}-${demoEstablishment.id}`,
          ...packData,
        },
      })
    }

    // Crear más restaurantes
    const restaurant2User = await prisma.user.upsert({
      where: { email: 'pizzeria@demo.com' },
      update: {},
      create: {
        name: 'Pizzería Italiana',
        email: 'pizzeria@demo.com',
        password: hashedPassword,
        role: 'ESTABLISHMENT',
        emailVerified: new Date(),
      },
    })

    const restaurant2 = await prisma.establishment.upsert({
      where: { userId: restaurant2User.id },
      update: {},
      create: {
        name: 'Pizzería Italiana',
        description: 'Auténtica pizza napolitana con ingredientes frescos',
        address: 'Calle 93 #13-24, Bogotá',
        latitude: 4.6764,
        longitude: -74.0537,
        phone: '+57 310 555 1234',
        email: 'pizzeria@demo.com',
        category: 'RESTAURANT',
        userId: restaurant2User.id,
        image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800',
        verificationStatus: 'APPROVED',
        approvedAt: new Date(),
      },
    })

    // Packs para pizzería
    const pizzaPack = await prisma.pack.findFirst({
      where: {
        establishmentId: restaurant2.id,
        title: 'Pack Pizza Sorpresa',
      },
    })

    if (!pizzaPack) {
      await prisma.pack.create({
        data: {
          title: 'Pack Pizza Sorpresa',
          description: 'Pizza grande con ingredientes del día',
          originalPrice: 45000,
          discountedPrice: 22000,
          quantity: 6,
          availableFrom: new Date(`${today.toISOString().split('T')[0]}T19:00:00`),
          availableUntil: new Date(`${today.toISOString().split('T')[0]}T21:00:00`),
          pickupTimeStart: '19:00',
          pickupTimeEnd: '21:00',
          establishmentId: restaurant2.id,
        },
      })
    }

    // Crear usuario cliente de prueba
    const customerUser = await prisma.user.upsert({
      where: { email: 'cliente@demo.com' },
      update: {},
      create: {
        name: 'Cliente Demo',
        email: 'cliente@demo.com',
        password: hashedPassword,
        role: 'CUSTOMER',
        emailVerified: new Date(),
      },
    })

    console.log('✅ Seed completed successfully!')

    return NextResponse.json({
      message: 'Database seeded successfully! 🎉',
      data: {
        users: 3,
        establishments: 2,
        packs: 4,
      },
      credentials: {
        restaurant1: {
          email: 'demo.restaurant@foodsave.com',
          password: '123456',
        },
        restaurant2: {
          email: 'pizzeria@demo.com',
          password: '123456',
        },
        customer: {
          email: 'cliente@demo.com',
          password: '123456',
        },
      },
      instructions: 'Usa estas credenciales para iniciar sesión en tu aplicación',
    })
  } catch (error) {
    console.error('❌ Error creating demo data:', error)
    
    // Log más detallado del error
    const errorDetails = {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
    }
    
    console.error('Error details:', errorDetails)
    
    return NextResponse.json(
      {
        message: 'Error creating demo data',
        error: errorDetails.message,
        details: process.env.NODE_ENV === 'development' ? errorDetails : undefined,
      },
      { status: 500 }
    )
  }
}
