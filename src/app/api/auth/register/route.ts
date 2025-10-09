import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, role } = await request.json()

    // Validate input
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { message: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { message: 'Este email ya está registrado' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await hash(password, 12)

    // Create user directly
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      }
    })

    return NextResponse.json({
      message: 'Cuenta creada exitosamente',
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
