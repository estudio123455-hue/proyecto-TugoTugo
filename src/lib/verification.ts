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

// Generate a secure token for link-based verification
export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

// Send verification code via email
export async function sendVerificationCode(
  email: string,
  userName: string,
  type: 'REGISTRATION' | 'LOGIN' | 'PASSWORD_RESET'
): Promise<VerificationResult> {
  try {
    // Clean up expired codes for this email and type
    await prisma.emailVerification.deleteMany({
      where: {
        email,
        type,
        expires: {
          lt: new Date(),
        },
      },
    })

    // Check if there's a recent code (prevent spam)
    const recentCode = await prisma.emailVerification.findFirst({
      where: {
        email,
        type,
        createdAt: {
          gt: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
        },
      },
    })

    if (recentCode) {
      return {
        success: false,
        message: 'Ya se envió un código recientemente. Espera 2 minutos antes de solicitar otro.',
      }
    }

    // Generate new code
    const code = generateVerificationCode()
    const expires = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

    // Save to database
    await prisma.emailVerification.create({
      data: {
        email,
        code,
        type,
        expires,
      },
    })

    // Send email
    await sendVerificationEmail({
      to: email,
      userName,
      code,
      type,
    })

    return {
      success: true,
      message: 'Código de verificación enviado correctamente.',
    }
  } catch (error) {
    console.error('Error sending verification code:', error)
    return {
      success: false,
      message: 'Error al enviar el código de verificación. Inténtalo de nuevo.',
    }
  }
}

// Verify the code
export async function verifyCode(
  email: string,
  code: string,
  type: 'REGISTRATION' | 'LOGIN' | 'PASSWORD_RESET'
): Promise<VerificationResult> {
  try {
    // Find the verification record
    const verification = await prisma.emailVerification.findFirst({
      where: {
        email,
        code,
        type,
        verified: false,
      },
      orderBy: {
        createdAt: 'desc',
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
      return {
        success: false,
        message: 'El código de verificación ha expirado. Solicita uno nuevo.',
      }
    }

    // Check attempts limit (max 5 attempts)
    if (verification.attempts >= 5) {
      return {
        success: false,
        message: 'Demasiados intentos fallidos. Solicita un nuevo código.',
      }
    }

    // Increment attempts
    await prisma.emailVerification.update({
      where: {
        id: verification.id,
      },
      data: {
        attempts: verification.attempts + 1,
      },
    })

    // Code is valid, mark as verified
    await prisma.emailVerification.update({
      where: {
        id: verification.id,
      },
      data: {
        verified: true,
      },
    })

    // If registration verification, mark user as verified
    if (type === 'REGISTRATION') {
      await prisma.user.update({
        where: {
          email,
        },
        data: {
          emailVerified: new Date(),
        },
      })
    }

    // Clean up old verification codes for this email and type
    await prisma.emailVerification.deleteMany({
      where: {
        email,
        type,
        id: {
          not: verification.id,
        },
      },
    })

    return {
      success: true,
      message: 'Código verificado correctamente.',
      verified: true,
    }
  } catch (error) {
    console.error('Error verifying code:', error)
    return {
      success: false,
      message: 'Error al verificar el código. Inténtalo de nuevo.',
    }
  }
}

// Check if email is verified
export async function isEmailVerified(email: string): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { emailVerified: true },
    })

    return !!user?.emailVerified
  } catch (error) {
    console.error('Error checking email verification:', error)
    return false
  }
}

// Clean up expired verification codes (can be called by cron job)
export async function cleanupExpiredCodes(): Promise<number> {
  try {
    const result = await prisma.emailVerification.deleteMany({
      where: {
        expires: {
          lt: new Date(),
        },
      },
    })

    return result.count
  } catch (error) {
    console.error('Error cleaning up expired codes:', error)
    return 0
  }
}
