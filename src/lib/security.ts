import { prisma } from './prisma'

export interface SecurityCheckResult {
  requiresVerification: boolean
  reason?: string
}

// Determine if login requires email verification
export async function shouldRequireEmailVerification(
  email: string,
  // userAgent?: string,
  // ip?: string
): Promise<SecurityCheckResult> {
  try {
    // Get user's last login info
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        role: true,
        createdAt: true,
        sessions: {
          orderBy: { expires: 'desc' },
          take: 5, // Last 5 sessions
        },
      },
    })

    if (!user) {
      return { requiresVerification: false }
    }

    // Factors that might require verification:

    // 1. New account (less than 7 days old)
    const accountAge = Date.now() - user.createdAt.getTime()
    const isNewAccount = accountAge < 7 * 24 * 60 * 60 * 1000 // 7 days

    // 2. Establishment accounts (higher security)
    const isEstablishment = user.role === 'ESTABLISHMENT'

    // 3. Random security check (configurable percentage)
    const randomCheck = Math.random() < 0.1 // 10% chance

    // 4. No recent sessions (hasn't logged in recently)
    const hasRecentSession = user.sessions.some(
      session => session.expires > new Date()
    )

    // Determine if verification is required
    if (isNewAccount) {
      return {
        requiresVerification: true,
        reason: 'Cuenta nueva - verificación adicional requerida',
      }
    }

    if (isEstablishment && randomCheck) {
      return {
        requiresVerification: true,
        reason: 'Verificación de seguridad para cuenta de restaurante',
      }
    }

    if (!hasRecentSession && randomCheck) {
      return {
        requiresVerification: true,
        reason: 'Verificación de seguridad - primera sesión en mucho tiempo',
      }
    }

    // Default: no verification required
    return { requiresVerification: false }
  } catch (error) {
    console.error('Error checking security requirements:', error)
    // If there's an error, err on the side of caution
    return {
      requiresVerification: false,
      reason: 'Error en verificación de seguridad',
    }
  }
}

// Alternative: Simple configuration-based approach
export function getVerificationSettings() {
  return {
    // Always require for new accounts
    requireForNewAccounts: true,
    newAccountThresholdDays: 7,
    
    // Require for establishments
    requireForEstablishments: true,
    establishmentVerificationChance: 0.3, // 30%
    
    // Random verification for extra security
    randomVerificationChance: 0.05, // 5%
    
    // Require after suspicious activity
    requireAfterFailedAttempts: true,
    failedAttemptsThreshold: 3,
  }
}

// Simple version: just based on user role and random chance
export function shouldRequireVerificationSimple(
  userRole: string,
  isNewAccount: boolean = false
): boolean {
  const settings = getVerificationSettings()
  
  // Always require for new accounts
  if (isNewAccount) {
    return true
  }
  
  // Higher chance for establishments
  if (userRole === 'ESTABLISHMENT') {
    return Math.random() < settings.establishmentVerificationChance
  }
  
  // Random chance for customers
  return Math.random() < settings.randomVerificationChance
}
