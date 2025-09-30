import { sendVerificationEmail } from './email'
import crypto from 'crypto'

// Temporary in-memory storage for development/fallback
// In production, you should use Redis or similar
const verificationCodes = new Map<string, {
  code: string
  expires: Date
  attempts: number
  type: string
  userName: string
}>()

export interface VerificationResult {
  success: boolean
  message: string
  verified?: boolean
}

// Generate a 6-digit verification code
export function generateVerificationCode(): string {
  return crypto.randomInt(100000, 999999).toString()
}

// Send verification code via email (fallback version)
export async function sendVerificationCodeFallback(
  email: string,
  userName: string,
  type: 'REGISTRATION' | 'LOGIN' | 'PASSWORD_RESET'
): Promise<VerificationResult> {
  try {
    const codeKey = `${email}-${type}`
    
    // Check if there's a recent code (prevent spam)
    const existingCode = verificationCodes.get(codeKey)
    if (existingCode && existingCode.expires > new Date()) {
      const timeLeft = Math.ceil((existingCode.expires.getTime() - Date.now()) / 1000 / 60)
      return {
        success: false,
        message: `Ya se envió un código. Espera ${timeLeft} minutos antes de solicitar otro.`,
      }
    }

    // Generate new code
    const code = generateVerificationCode()
    const expires = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

    // Store in memory (temporary)
    verificationCodes.set(codeKey, {
      code,
      expires,
      attempts: 0,
      type,
      userName,
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
    console.error('Error sending verification code (fallback):', error)
    return {
      success: false,
      message: 'Error al enviar el código de verificación. Inténtalo de nuevo.',
    }
  }
}

// Verify the code (fallback version)
export async function verifyCodeFallback(
  email: string,
  code: string,
  type: 'REGISTRATION' | 'LOGIN' | 'PASSWORD_RESET'
): Promise<VerificationResult> {
  try {
    const codeKey = `${email}-${type}`
    const storedData = verificationCodes.get(codeKey)

    if (!storedData) {
      return {
        success: false,
        message: 'Código de verificación inválido.',
      }
    }

    // Check if expired
    if (storedData.expires < new Date()) {
      verificationCodes.delete(codeKey)
      return {
        success: false,
        message: 'El código de verificación ha expirado. Solicita uno nuevo.',
      }
    }

    // Check attempts limit
    if (storedData.attempts >= 5) {
      verificationCodes.delete(codeKey)
      return {
        success: false,
        message: 'Demasiados intentos fallidos. Solicita un nuevo código.',
      }
    }

    // Check code
    if (storedData.code !== code) {
      storedData.attempts++
      verificationCodes.set(codeKey, storedData)
      return {
        success: false,
        message: 'Código incorrecto. Inténtalo de nuevo.',
      }
    }

    // Code is valid, remove from memory
    verificationCodes.delete(codeKey)

    return {
      success: true,
      message: 'Código verificado correctamente.',
      verified: true,
    }
  } catch (error) {
    console.error('Error verifying code (fallback):', error)
    return {
      success: false,
      message: 'Error al verificar el código. Inténtalo de nuevo.',
    }
  }
}

// Clean up expired codes from memory
export function cleanupExpiredCodesFallback(): number {
  let deletedCount = 0
  const now = new Date()
  
  // Convert to array to iterate
  const entries = Array.from(verificationCodes.entries())
  for (const [key, data] of entries) {
    if (data.expires < now) {
      verificationCodes.delete(key)
      deletedCount++
    }
  }
  
  return deletedCount
}
