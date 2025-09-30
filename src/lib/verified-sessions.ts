import crypto from 'crypto'

// Temporary storage for verified login sessions
const verifiedSessions = new Map<string, {
  email: string
  role: string
  accountType: string
  expires: Date
  verified: boolean
}>()

// Create a verified session token
export function createVerifiedSession(email: string, role: string, accountType: string): string {
  const sessionToken = crypto.randomBytes(32).toString('hex')
  const expires = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes to complete login
  
  verifiedSessions.set(sessionToken, {
    email,
    role,
    accountType,
    expires,
    verified: true,
  })
  
  // Clean up expired sessions
  cleanupExpiredSessions()
  
  return sessionToken
}

// Validate and consume a verified session
export function validateVerifiedSession(sessionToken: string): {
  valid: boolean
  email?: string
  role?: string
  accountType?: string
} {
  const sessionData = verifiedSessions.get(sessionToken)
  
  if (!sessionData) {
    return { valid: false }
  }
  
  if (sessionData.expires < new Date()) {
    verifiedSessions.delete(sessionToken)
    return { valid: false }
  }
  
  if (!sessionData.verified) {
    return { valid: false }
  }
  
  // Session is valid, remove it (one-time use)
  verifiedSessions.delete(sessionToken)
  
  return {
    valid: true,
    email: sessionData.email,
    role: sessionData.role,
    accountType: sessionData.accountType,
  }
}

// Mark session as verified (after code verification)
export function markSessionVerified(sessionToken: string): boolean {
  const sessionData = verifiedSessions.get(sessionToken)
  
  if (!sessionData || sessionData.expires < new Date()) {
    return false
  }
  
  sessionData.verified = true
  verifiedSessions.set(sessionToken, sessionData)
  
  return true
}

// Clean up expired sessions
function cleanupExpiredSessions() {
  const now = new Date()
  const entries = Array.from(verifiedSessions.entries())
  
  for (const [token, data] of entries) {
    if (data.expires < now) {
      verifiedSessions.delete(token)
    }
  }
}
