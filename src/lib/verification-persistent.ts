import { prisma } from './prisma'
import { sendVerificationEmail } from './email'
import crypto from 'crypto'

export interface VerificationResult {
  success: boolean
  message: string
  verified?: boolean
}

// Generate a 6-digit verification code
export function generateVerificationCode(): string {
  return crypto.randomInt(100000, 999999).toString()
}

// Send verification code using NextAuth's VerificationToken table as fallback
export async function sendVerificationCodePersistent(
  email: string,
  userName: string,
  type: 'REGISTRATION' | 'LOGIN' | 'PASSWORD_RESET'
): Promise<VerificationResult> {
  try {
    // Clean up expired codes for this email
    const identifier = `${email}-${type}`
    
    try {
      await prisma.verificationToken.deleteMany({
        where: {
          identifier,
          expires: {
            lt: new Date(),
          },
        },
      })
    } catch (error) {
      console.log('Could not clean up verification tokens:', error)
    }

    // Check if there's a recent code (prevent spam)
    try {
      const recentCode = await prisma.verificationToken.findFirst({
        where: {
          identifier,
          expires: {
            gt: new Date(),
          },
        },
        orderBy: {
          expires: 'desc',
        },
      })

      if (recentCode) {
        const timeLeft = Math.ceil((recentCode.expires.getTime() - Date.now()) / 1000 / 60)
        return {
          success: false,
          message: `Ya se envió un código. Espera ${timeLeft} minutos antes de solicitar otro.`,
        }
      }
    } catch (error) {
      console.log('Could not check recent codes:', error)
    }

    // Generate new code
    const code = generateVerificationCode()
    const expires = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

    // Store in VerificationToken table (more reliable)
    try {
      await prisma.verificationToken.create({
        data: {
          identifier,
          token: code,
          expires,
        },
      })
    } catch (error) {
      console.error('Error storing verification code:', error)
      return {
        success: false,
        message: 'Error al generar código de verificación. Inténtalo de nuevo.',
      }
    }

    // Send email
    try {
      await sendVerificationEmail({
        to: email,
        userName,
        code,
        type,
      })
    } catch (emailError) {
      console.error('Error sending verification email:', emailError)
      // Clean up the code if email fails
      await prisma.verificationToken.deleteMany({
        where: {
          identifier,
          token: code,
        },
      })
      return {
        success: false,
        message: 'Error al enviar el email de verificación. Inténtalo de nuevo.',
      }
    }

    return {
      success: true,
      message: 'Código de verificación enviado correctamente.',
    }
  } catch (error) {
    console.error('Error sending verification code (persistent):', error)
    return {
      success: false,
      message: 'Error al enviar el código de verificación. Inténtalo de nuevo.',
    }
  }
}

// Verify the code using VerificationToken table
export async function verifyCodePersistent(
  email: string,
  code: string,
  type: 'REGISTRATION' | 'LOGIN' | 'PASSWORD_RESET'
): Promise<VerificationResult> {
  try {
    const identifier = `${email}-${type}`

    // Find the verification record
    const verification = await prisma.verificationToken.findFirst({
      where: {
        identifier,
        token: code,
      },
      orderBy: {
        expires: 'desc',
      },
    })

    if (!verification) {
      return {
        success: false,
        message: 'Código de verificación inválido.',
      }
    }

    // Check if expired
    if (verification.expires < new Date()) {
      // Clean up expired code
      await prisma.verificationToken.deleteMany({
        where: {
          identifier,
          token: code,
        },
      })
      
      return {
        success: false,
        message: 'El código de verificación ha expirado. Solicita uno nuevo.',
      }
    }

    // Code is valid, remove it (one-time use)
    await prisma.verificationToken.deleteMany({
      where: {
        identifier,
        token: code,
      },
    })

    // If registration verification, mark user as verified
    if (type === 'REGISTRATION') {
      try {
        await prisma.user.update({
          where: {
            email,
          },
          data: {
            emailVerified: new Date(),
          },
        })
      } catch (error) {
        console.log('Could not update user verification status:', error)
      }
    }

    // Clean up other codes for this email and type
    await prisma.verificationToken.deleteMany({
      where: {
        identifier,
      },
    })

    return {
      success: true,
      message: 'Código verificado correctamente.',
      verified: true,
    }
  } catch (error) {
    console.error('Error verifying code (persistent):', error)
    return {
      success: false,
      message: 'Error al verificar el código. Inténtalo de nuevo.',
    }
  }
}
