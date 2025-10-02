/**
 * Pruebas unitarias para funciones de validación
 */

// Funciones de validación
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (password.length < 6) {
    errors.push('La contraseña debe tener al menos 6 caracteres')
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Debe contener al menos una mayúscula')
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Debe contener al menos un número')
  }
  
  return {
    valid: errors.length === 0,
    errors,
  }
}

export function validatePhone(phone: string): boolean {
  const phoneRegex = /^[0-9]{10}$/
  return phoneRegex.test(phone.replace(/[\s-]/g, ''))
}

// Tests
describe('Validation Functions', () => {
  describe('validateEmail', () => {
    it('should validate correct email formats', () => {
      expect(validateEmail('test@example.com')).toBe(true)
      expect(validateEmail('user.name@domain.co')).toBe(true)
      expect(validateEmail('user+tag@example.com')).toBe(true)
    })

    it('should reject invalid email formats', () => {
      expect(validateEmail('invalid')).toBe(false)
      expect(validateEmail('invalid@')).toBe(false)
      expect(validateEmail('@example.com')).toBe(false)
      expect(validateEmail('test@')).toBe(false)
      expect(validateEmail('')).toBe(false)
    })
  })

  describe('validatePassword', () => {
    it('should accept strong passwords', () => {
      const result = validatePassword('Password123')
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should reject short passwords', () => {
      const result = validatePassword('Pa1')
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('La contraseña debe tener al menos 6 caracteres')
    })

    it('should require uppercase letter', () => {
      const result = validatePassword('password123')
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Debe contener al menos una mayúscula')
    })

    it('should require number', () => {
      const result = validatePassword('Password')
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Debe contener al menos un número')
    })

    it('should return multiple errors', () => {
      const result = validatePassword('pass')
      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(1)
    })
  })

  describe('validatePhone', () => {
    it('should validate correct phone numbers', () => {
      expect(validatePhone('1234567890')).toBe(true)
      expect(validatePhone('123-456-7890')).toBe(true)
      expect(validatePhone('123 456 7890')).toBe(true)
    })

    it('should reject invalid phone numbers', () => {
      expect(validatePhone('123')).toBe(false)
      expect(validatePhone('12345678901')).toBe(false)
      expect(validatePhone('abcdefghij')).toBe(false)
      expect(validatePhone('')).toBe(false)
    })
  })
})
