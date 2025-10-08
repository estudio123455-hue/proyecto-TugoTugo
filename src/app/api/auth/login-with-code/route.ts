import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { sendVerificationEmail } from '@/lib/email'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email y contraseña son requeridos' },
        { status: 400 }
      )
    }

    // Verify user exists and password is correct
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user || !user.password) {
      return NextResponse.json(
        { message: 'Email o contraseña incorrectos' },
        { status: 401 }
      )
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return NextResponse.json(
        { message: 'Email o contraseña incorrectos' },
        { status: 401 }
      )
    }

    // Generate verification code
    const code = crypto.randomInt(100000, 999999).toString()
    const expires = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
    const identifier = `${email}-LOGIN-${Date.now()}`

    // Store verification code
    await prisma.verificationToken.create({
      data: {
        identifier,
        token: code,
        expires,
      },
    })

    // Send verification email
    await sendVerificationEmail({
      to: email,
      userName: user.name || 'Usuario',
      code,
      type: 'LOGIN',
    })

    return NextResponse.json({
      message: 'Código de verificación enviado',
      success: true,
    })
  } catch (error) {
    console.error('Error in login-with-code:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
