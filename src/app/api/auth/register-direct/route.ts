import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, role } = await request.json()

    // Normalizar email (lowercase y trim)
    const normalizedEmail = email.toLowerCase().trim()

    // Validar datos
    if (!name || !normalizedEmail || !password || !role) {
      return NextResponse.json(
        { message: 'Todos los campos son requeridos' },
        { status: 400 }
      )
    }

    console.log('📝 [Register] Attempting to register:', { name, email: normalizedEmail, role })

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    })

    if (existingUser) {
      return NextResponse.json(
        { message: 'Este email ya está registrado' },
        { status: 400 }
      )
    }

    // Hash de la contraseña (usando 12 rounds como en el otro endpoint)
    const hashedPassword = await bcrypt.hash(password, 12)

    // Crear usuario directamente (sin verificación)
    console.log('📝 [Register] Creating user:', { name, email: normalizedEmail, role })
    
    const user = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        password: hashedPassword,
        role,
        emailVerified: new Date(), // Marcar como verificado automáticamente
      },
    })

    console.log('✅ [Register] User created successfully:', user.id, user.email, user.role)

    return NextResponse.json(
      { 
        message: 'Usuario registrado exitosamente',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        }
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error en registro directo:', error)
    return NextResponse.json(
      { message: 'Error al registrar usuario' },
      { status: 500 }
    )
  }
}
