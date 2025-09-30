import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// BULLETPROOF verification that ALWAYS works
export async function POST(request: NextRequest) {
  try {
    const { email, code, type, userData } = await request.json()

    if (!email || !code || !type) {
      return NextResponse.json(
        { message: 'Email, código y tipo son requeridos' },
        { status: 400 }
      )
    }

    console.log(`[BULLETPROOF] Verifying code for: ${email}, code: ${code}, type: ${type}`)

    let codeValid = false
    let foundMethod = ''

    // STRATEGY 1: Check VerificationToken table
    try {
      const verification = await prisma.verificationToken.findFirst({
        where: {
          identifier: {
            contains: email,
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

      if (verification) {
        codeValid = true
        foundMethod = 'VerificationToken table'
        
        // Remove the used token
        await prisma.verificationToken.delete({
          where: {
            identifier_token: {
              identifier: verification.identifier,
              token: verification.token,
            },
          },
        })
        
        console.log('[BULLETPROOF] Code verified via VerificationToken table')
      }
    } catch (error) {
      console.log('[BULLETPROOF] VerificationToken check failed:', error)
    }

    // STRATEGY 2: Check User table backup (if Strategy 1 failed)
    if (!codeValid) {
      try {
        const user = await prisma.user.findUnique({
          where: { email },
        })

        if (user?.name?.startsWith('VERIFY:')) {
          const parts = user.name.split(':')
          if (parts.length >= 4) {
            const storedCode = parts[1]
            const expiresTime = parseInt(parts[2])
            const originalName = parts.slice(3).join(':')

            if (storedCode === code && expiresTime > Date.now()) {
              codeValid = true
              foundMethod = 'User table backup'
              
              // Restore original name
              await prisma.user.update({
                where: { email },
                data: { name: originalName },
              })
              
              console.log('[BULLETPROOF] Code verified via User table backup')
            } else if (expiresTime <= Date.now()) {
              // Clean up expired code
              await prisma.user.update({
                where: { email },
                data: { name: originalName },
              })
              console.log('[BULLETPROOF] Code expired in User table backup')
            }
          }
        }
      } catch (error) {
        console.log('[BULLETPROOF] User table backup check failed:', error)
      }
    }

    if (!codeValid) {
      console.log('[BULLETPROOF] Code verification failed for ' + email)
      return NextResponse.json(
        { message: 'Código de verificación inválido o expirado' },
        { status: 400 }
      )
    }

    console.log(`[BULLETPROOF] Code verified successfully via: ${foundMethod}`)

    // Handle different verification types
    switch (type) {
      case 'REGISTRATION': {
        if (!userData || !userData.name || !userData.password || !userData.role) {
          return NextResponse.json(
            { message: 'Datos de usuario incompletos' },
            { status: 400 }
          )
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(userData.password, 12)

        // Create or update user
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

        console.log(`[BULLETPROOF] User account created/updated for ${email}`)

        return NextResponse.json({
          message: 'Cuenta verificada y creada correctamente',
          success: true,
          verified: true,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          },
        })
      }

      case 'LOGIN': {
        console.log(`[BULLETPROOF] Login verification completed for ${email}`)
        return NextResponse.json({
          message: 'Email verificado correctamente',
          success: true,
          verified: true,
        })
      }

      case 'PASSWORD_RESET': {
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
    console.error('[BULLETPROOF] Critical verification error:', error)
    return NextResponse.json(
      { 
        message: 'Error crítico en verificación',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
