import { NextRequest, NextResponse } from 'next/server'
import { validateVerifiedSession } from '@/lib/verified-sessions'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { sessionToken } = await request.json()

    if (!sessionToken) {
      return NextResponse.json(
        { message: 'Token de sesión requerido' },
        { status: 400 }
      )
    }

    // Validate the verified session token
    const sessionData = validateVerifiedSession(sessionToken)

    if (!sessionData.valid) {
      return NextResponse.json(
        { message: 'Token de sesión inválido o expirado' },
        { status: 400 }
      )
    }

    // Get user data for session creation
    const user = await prisma.user.findUnique({
      where: { email: sessionData.email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { message: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // Return success with user data for client-side session creation
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      redirectUrl: user.role === 'ESTABLISHMENT' ? '/dashboard' : '/packs',
    })
  } catch (error) {
    console.error('Error completing verified login:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
