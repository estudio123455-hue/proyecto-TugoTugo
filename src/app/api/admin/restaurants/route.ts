import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// GET - Obtener todos los restaurantes (solo admin)
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const restaurants = await prisma.user.findMany({
      where: {
        role: 'ESTABLISHMENT'
      },
      select: {
        id: true,
        name: true,
        email: true,
        verificationStatus: true,
        createdAt: true,
        updatedAt: true,
        establishment: {
          select: {
            id: true,
            name: true,
            phone: true,
            address: true,
            latitude: true,
            longitude: true,
            verificationStatus: true,
            _count: {
              select: {
                packs: true
              }
            }
          }
        },
        _count: {
          select: {
            orders: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      restaurants
    })

  } catch (error) {
    console.error('Error fetching restaurants:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST - Crear nuevo restaurante (solo admin)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, email, password, phone, address } = body

    // Validaciones
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Nombre, email y contraseña son requeridos' },
        { status: 400 }
      )
    }

    // Verificar si el email ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Ya existe un usuario con este email' },
        { status: 400 }
      )
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 12)

    // Crear el usuario restaurante
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'ESTABLISHMENT',
        verificationStatus: 'PENDING',
        emailVerified: new Date() // Email verificado por admin
      }
    })

    // Crear el establecimiento asociado
    await prisma.establishment.create({
      data: {
        name,
        address: address || 'Dirección pendiente',
        latitude: 4.7110, // Coordenadas por defecto (Bogotá)
        longitude: -74.0721,
        phone: phone || null,
        email: email,
        category: 'RESTAURANT',
        verificationStatus: 'PENDING',
        userId: user.id
      }
    })

    // Obtener el restaurante completo para la respuesta
    const restaurant = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        verificationStatus: true,
        createdAt: true,
        updatedAt: true,
        establishment: {
          select: {
            id: true,
            name: true,
            phone: true,
            address: true,
            latitude: true,
            longitude: true,
            verificationStatus: true,
            _count: {
              select: {
                packs: true
              }
            }
          }
        },
        _count: {
          select: {
            orders: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Restaurante creado exitosamente',
      restaurant
    })

  } catch (error) {
    console.error('Error creating restaurant:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
