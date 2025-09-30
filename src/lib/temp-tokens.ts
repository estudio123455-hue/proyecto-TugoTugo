import crypto from 'crypto'

// Temporary storage for login tokens (in production, use Redis)
const loginTokens = new Map<string, {
  email: string
  role: string
  accountType: string
  expires: Date
}>()

// Generate a temporary login token
export function generateLoginToken(email: string, role: string, accountType: string): string {
  const token = crypto.randomBytes(32).toString('hex')
  const expires = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
  
  loginTokens.set(token, {
    email,
    role,
    accountType,
    expires,
  })
  
  // Clean up expired tokens
  cleanupExpiredTokens()
  
  return token
}

// Validate and consume a login token
export function validateLoginToken(token: string): {
  valid: boolean
  email?: string
  role?: string
  accountType?: string
} {
  const tokenData = loginTokens.get(token)
  
  if (!tokenData) {
    return { valid: false }
  }
  
  if (tokenData.expires < new Date()) {
    loginTokens.delete(token)
    return { valid: false }
  }
  
  // Token is valid, remove it (one-time use)
  loginTokens.delete(token)
  
  return {
    valid: true,
    email: tokenData.email,
    role: tokenData.role,
    accountType: tokenData.accountType,
  }
}

// Clean up expired tokens
function cleanupExpiredTokens() {
  const now = new Date()
  const entries = Array.from(loginTokens.entries())
  
  for (const [token, data] of entries) {
    if (data.expires < now) {
      loginTokens.delete(token)
    }
  }
}
