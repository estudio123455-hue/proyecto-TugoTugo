import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendVerificationEmail } from '@/lib/email'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

// Simple, reliable verification system
export async function POST(request: NextRequest) {
  try {
    const { action, email, code, type, userData } = await request.json()

    if (action === 'send') {
      // SEND CODE
      console.log('SIMPLE-VERIFY: Sending code to', email)
      
      const verificationCode = crypto.randomInt(100000, 999999).toString()
      const expires = new Date(Date.now() + 15 * 60 * 1000)
      const identifier = `${email}-${type}-${Date.now()}`

      // Store in VerificationToken (reliable)
      await prisma.verificationToken.create({
        data: {
          identifier,
          token: verificationCode,
          expires,
        },
      })

      // Send email
      await sendVerificationEmail({
        to: email,
        userName: userData?.name || 'Usuario',
        code: verificationCode,
        type: type as 'REGISTRATION' | 'LOGIN' | 'PASSWORD_RESET',
      })

      console.log('SIMPLE-VERIFY: Code sent successfully to', email)

      return NextResponse.json({
        success: true,
        message: 'Código enviado correctamente',
      })
    }

    if (action === 'verify') {
      // VERIFY CODE
      console.log('SIMPLE-VERIFY: Verifying code for', email, 'code:', code)

      // Find valid code
      const verification = await prisma.verificationToken.findFirst({
        where: {
          identifier: {
            startsWith: `${email}-${type}`,
          },
          token: code,
          expires: {
            gt: new Date(),
          },
        },
        orderBy: {
          expires: 'desc',
        },
      })

      if (!verification) {
        console.log('SIMPLE-VERIFY: Code not found or expired for', email)
        return NextResponse.json(
          { message: 'Código inválido o expirado' },
          { status: 400 }
        )
      }

      // Remove used code
      await prisma.verificationToken.delete({
        where: {
          identifier_token: {
            identifier: verification.identifier,
            token: verification.token,
          },
        },
      })

      console.log('SIMPLE-VERIFY: Code verified successfully for', email)

      // Handle registration
      if (type === 'REGISTRATION' && userData) {
        const hashedPassword = await bcrypt.hash(userData.password, 12)

        const user = await prisma.user.upsert({
          where: { email },
          update: {
            name: userData.name,
            password: hashedPassword,
            role: userData.role,
            emailVerified: new Date(),
          },
          create: {
            name: userData.name,
            email: email,
            password: hashedPassword,
            role: userData.role,
            emailVerified: new Date(),
          },
        })

        return NextResponse.json({
          success: true,
          message: 'Cuenta creada correctamente',
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          },
        })
      }

      return NextResponse.json({
        success: true,
        message: 'Código verificado correctamente',
      })
    }

    return NextResponse.json(
      { message: 'Acción no válida' },
      { status: 400 }
    )
  } catch (error) {
    console.error('SIMPLE-VERIFY ERROR:', error)
    return NextResponse.json(
      { 
        message: 'Error en verificación',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
