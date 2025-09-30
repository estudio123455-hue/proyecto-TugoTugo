import { NextRequest, NextResponse } from 'next/server'
import { sendVerificationCodePersistent } from '@/lib/verification-persistent'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { email, type } = await request.json()

    // Validate input
    if (!email || !type) {
      return NextResponse.json(
        { message: 'Email y tipo son requeridos' },
        { status: 400 }
      )
    }

    if (!['REGISTRATION', 'LOGIN', 'PASSWORD_RESET'].includes(type)) {
      return NextResponse.json(
        { message: 'Tipo de verificación inválido' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: 'Formato de email inválido' },
        { status: 400 }
      )
    }

    // For registration, check if user already exists
    if (type === 'REGISTRATION') {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      })

      if (existingUser) {
        return NextResponse.json(
          { message: 'Ya existe una cuenta con este email' },
          { status: 400 }
        )
      }
    }

    // For login and password reset, check if user exists
    if (type === 'LOGIN' || type === 'PASSWORD_RESET') {
      const user = await prisma.user.findUnique({
        where: { email },
      })

      if (!user) {
        return NextResponse.json(
          { message: 'No existe una cuenta con este email' },
          { status: 404 }
        )
      }
    }

    // Get user name for email
    let userName = 'Usuario'
    if (type !== 'REGISTRATION') {
      const user = await prisma.user.findUnique({
        where: { email },
        select: { name: true },
      })
      userName = user?.name || 'Usuario'
    }

    // Send verification code using persistent method (VerificationToken table)
    const result = await sendVerificationCodePersistent(email, userName, type)

    if (!result.success) {
      return NextResponse.json(
        { message: result.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: result.message,
      success: true,
    })
  } catch (error) {
    console.error('Error sending verification code:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
