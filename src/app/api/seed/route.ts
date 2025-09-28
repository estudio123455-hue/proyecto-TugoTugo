import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST() {
  try {
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
      }
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
      }
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
        availableFrom: new Date(`${today.toISOString().split('T')[0]}T12:00:00`),
        availableUntil: new Date(`${today.toISOString().split('T')[0]}T14:00:00`),
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
        availableFrom: new Date(`${today.toISOString().split('T')[0]}T18:00:00`),
        availableUntil: new Date(`${today.toISOString().split('T')[0]}T20:00:00`),
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
        availableFrom: new Date(`${tomorrow.toISOString().split('T')[0]}T12:00:00`),
        availableUntil: new Date(`${tomorrow.toISOString().split('T')[0]}T14:00:00`),
        pickupTimeStart: '12:00',
        pickupTimeEnd: '14:00',
        establishmentId: demoEstablishment.id,
      }
    ]

    for (const packData of demoPacks) {
      await prisma.pack.upsert({
        where: {
          id: `demo-${packData.pickupTimeStart}-${packData.availableFrom.toISOString().split('T')[0]}-${demoEstablishment.id}`
        },
        update: packData,
        create: {
          id: `demo-${packData.pickupTimeStart}-${packData.availableFrom.toISOString().split('T')[0]}-${demoEstablishment.id}`,
          ...packData
        }
      })
    }

    return NextResponse.json({
      message: 'Demo data created successfully!',
      demoCredentials: {
        restaurant: {
          email: 'demo.restaurant@foodsave.com',
          password: '123456',
          dashboard: '/dashboard'
        }
      }
    })
  } catch (error) {
    console.error('Error creating demo data:', error)
    return NextResponse.json(
      { message: 'Error creating demo data', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
