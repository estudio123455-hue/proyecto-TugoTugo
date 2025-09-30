import { NextRequest, NextResponse } from 'next/server'
import { verifyCode } from '@/lib/verification'
import { verifyCodeFallback } from '@/lib/verification-fallback'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { email, code, type, userData } = await request.json()

    // Validate input
    if (!email || !code || !type) {
      return NextResponse.json(
        { message: 'Email, código y tipo son requeridos' },
        { status: 400 }
      )
    }

    if (!['REGISTRATION', 'LOGIN', 'PASSWORD_RESET'].includes(type)) {
      return NextResponse.json(
        { message: 'Tipo de verificación inválido' },
        { status: 400 }
      )
    }

    // Verify the code - try main function first, fallback if table doesn't exist
    let result
    try {
      result = await verifyCode(email, code, type)
    } catch (error: any) {
      // If table doesn't exist, use fallback
      if (error.code === 'P2021' || error.message?.includes('does not exist')) {
        console.log('EmailVerification table not found, using fallback method')
        result = await verifyCodeFallback(email, code, type)
      } else {
        throw error
      }
    }

    if (!result.success) {
      return NextResponse.json(
        { message: result.message },
        { status: 400 }
      )
    }

    // Handle different verification types
    switch (type) {
      case 'REGISTRATION': {
        // For registration, create the user account
        if (!userData || !userData.name || !userData.password || !userData.role) {
          return NextResponse.json(
            { message: 'Datos de usuario incompletos' },
            { status: 400 }
          )
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(userData.password, 12)

        // Create user
        const user = await prisma.user.create({
          data: {
            name: userData.name,
            email: email,
            password: hashedPassword,
            role: userData.role,
            emailVerified: new Date(),
          },
        })

        // Remove password from response
        const { password: _, ...userWithoutPassword } = user

        return NextResponse.json({
          message: 'Cuenta creada y verificada correctamente',
          success: true,
          user: userWithoutPassword,
          verified: true,
        })
      }

      case 'LOGIN': {
        // For login, just confirm verification
        return NextResponse.json({
          message: 'Email verificado correctamente',
          success: true,
          verified: true,
        })
      }

      case 'PASSWORD_RESET': {
        // For password reset, return success - password change will be handled separately
        return NextResponse.json({
          message: 'Código verificado. Ahora puedes cambiar tu contraseña',
          success: true,
          verified: true,
        })
      }

      default:
        return NextResponse.json(
          { message: 'Tipo de verificación no soportado' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Error verifying code:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
