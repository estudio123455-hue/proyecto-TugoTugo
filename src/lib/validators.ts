import { prisma } from './prisma'

/**
 * Validar formato de email y verificar que no esté en uso
 */
export async function validateUniqueEmail(
  email: string,
  excludeUserId?: string
): Promise<{ isValid: boolean; error?: string }> {
  // Validar formato
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Formato de email inválido' }
  }

  // Verificar duplicados
  const existingUser = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  })

  if (existingUser && existingUser.id !== excludeUserId) {
    return { isValid: false, error: 'Este email ya está registrado' }
  }

  return { isValid: true }
}

/**
 * Validar formato de teléfono colombiano
 */
export function validateColombianPhone(phone: string): {
  isValid: boolean
  formatted?: string
  error?: string
} {
  // Limpiar el teléfono de espacios y caracteres especiales
  const cleaned = phone.replace(/[\s\-()]/g, '')

  // Formatos válidos para Colombia:
  // +573001234567 (con código de país)
  // 3001234567 (celular sin código)
  // 6012345678 (fijo Bogotá con código)
  // 12345678 (fijo sin código de ciudad)

  // Celular con código de país
  if (/^\+57[3][0-9]{9}$/.test(cleaned)) {
    return { isValid: true, formatted: cleaned }
  }

  // Celular sin código de país
  if (/^[3][0-9]{9}$/.test(cleaned)) {
    return { isValid: true, formatted: `+57${cleaned}` }
  }

  // Teléfono fijo con código de ciudad
  if (/^[1-8][0-9]{6,9}$/.test(cleaned)) {
    return { isValid: true, formatted: `+57${cleaned}` }
  }

  return {
    isValid: false,
    error: 'Formato de teléfono inválido. Ejemplo: +573001234567 o 3001234567',
  }
}

/**
 * Validar NIT colombiano
 */
export function validateColombianNIT(nit: string): {
  isValid: boolean
  formatted?: string
  error?: string
} {
  // Limpiar NIT
  const cleaned = nit.replace(/[\s\-\.]/g, '')

  // NIT debe tener 9 o 10 dígitos
  if (!/^\d{9,10}$/.test(cleaned)) {
    return {
      isValid: false,
      error: 'NIT debe tener 9 o 10 dígitos. Ejemplo: 900123456',
    }
  }

  // Calcular dígito de verificación
  const nitNumber = cleaned.slice(0, -1)
  const checkDigit = cleaned.slice(-1)

  const calculatedCheckDigit = calculateNITCheckDigit(nitNumber)

  if (calculatedCheckDigit !== checkDigit) {
    return {
      isValid: false,
      error: 'Dígito de verificación del NIT inválido',
    }
  }

  // Formatear NIT
  const formatted = `${nitNumber}-${checkDigit}`

  return { isValid: true, formatted }
}

/**
 * Calcular dígito de verificación del NIT colombiano
 */
function calculateNITCheckDigit(nit: string): string {
  const primes = [3, 7, 13, 17, 19, 23, 29, 37, 41, 43, 47, 53, 59, 67, 71]
  let sum = 0

  for (let i = 0; i < nit.length; i++) {
    const digit = parseInt(nit[nit.length - 1 - i])
    const prime = primes[i]
    sum += digit * prime
  }

  const remainder = sum % 11
  const checkDigit = remainder > 1 ? 11 - remainder : remainder

  return checkDigit.toString()
}

/**
 * Verificar que el NIT no esté duplicado
 */
export async function validateUniqueNIT(
  nit: string,
  excludeEstablishmentId?: string
): Promise<{ isValid: boolean; error?: string }> {
  // Primero validar formato
  const validation = validateColombianNIT(nit)
  if (!validation.isValid) {
    return { isValid: false, error: validation.error }
  }

  // Verificar duplicados en la base de datos
  const existingEstablishment = await prisma.establishment.findFirst({
    where: {
      taxId: validation.formatted,
    },
  })

  if (
    existingEstablishment &&
    existingEstablishment.id !== excludeEstablishmentId
  ) {
    return { isValid: false, error: 'Este NIT ya está registrado' }
  }

  return { isValid: true }
}

/**
 * Validar dominio de email (verificar que el dominio exista)
 */
export async function validateEmailDomain(email: string): Promise<boolean> {
  try {
    const domain = email.split('@')[1]
    
    // Lista de dominios temporales/desechables comunes
    const disposableDomains = [
      'tempmail.com',
      'guerrillamail.com',
      '10minutemail.com',
      'mailinator.com',
      'throwaway.email',
    ]

    if (disposableDomains.includes(domain.toLowerCase())) {
      return false
    }

    // En producción, podrías hacer una verificación DNS
    // const dns = require('dns').promises
    // await dns.resolveMx(domain)

    return true
  } catch (error) {
    return false
  }
}

/**
 * Validar que el establecimiento no tenga nombre duplicado
 */
export async function validateUniqueEstablishmentName(
  name: string,
  excludeId?: string
): Promise<{ isValid: boolean; error?: string }> {
  const existing = await prisma.establishment.findFirst({
    where: {
      name: {
        equals: name,
        mode: 'insensitive', // Case insensitive
      },
    },
  })

  if (existing && existing.id !== excludeId) {
    return {
      isValid: false,
      error: 'Ya existe un restaurante con este nombre',
    }
  }

  return { isValid: true }
}

/**
 * Validación completa de establecimiento
 */
export async function validateEstablishmentData(data: {
  name: string
  email?: string
  nit?: string
  phone?: string
  excludeId?: string
}): Promise<{ isValid: boolean; errors: string[] }> {
  const errors: string[] = []

  // Validar nombre único
  const nameValidation = await validateUniqueEstablishmentName(
    data.name,
    data.excludeId
  )
  if (!nameValidation.isValid) {
    errors.push(nameValidation.error!)
  }

  // Validar email único
  if (data.email) {
    const emailValidation = await validateUniqueEmail(data.email, data.excludeId)
    if (!emailValidation.isValid) {
      errors.push(emailValidation.error!)
    }

    // Validar dominio de email
    const domainValid = await validateEmailDomain(data.email)
    if (!domainValid) {
      errors.push('Email de dominio temporal o inválido')
    }
  }

  // Validar NIT único
  if (data.nit) {
    const nitValidation = await validateUniqueNIT(data.nit, data.excludeId)
    if (!nitValidation.isValid) {
      errors.push(nitValidation.error!)
    }
  }

  // Validar teléfono
  if (data.phone) {
    const phoneValidation = validateColombianPhone(data.phone)
    if (!phoneValidation.isValid) {
      errors.push(phoneValidation.error!)
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Formatear teléfono colombiano
 */
export function formatColombianPhone(phone: string): string {
  const cleaned = phone.replace(/[\s\-()]/g, '')
  
  // Si es celular (10 dígitos empezando con 3)
  if (/^3\d{9}$/.test(cleaned)) {
    return `+57 ${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`
  }
  
  // Si tiene código de país
  if (/^\+57/.test(cleaned)) {
    const number = cleaned.slice(3)
    if (number.length === 10) {
      return `+57 ${number.slice(0, 3)} ${number.slice(3, 6)} ${number.slice(6)}`
    }
  }
  
  return phone
}

/**
 * Formatear NIT colombiano
 */
export function formatColombianNIT(nit: string): string {
  const cleaned = nit.replace(/[\s\-\.]/g, '')
  
  if (cleaned.length >= 9) {
    const number = cleaned.slice(0, -1)
    const checkDigit = cleaned.slice(-1)
    return `${number}-${checkDigit}`
  }
  
  return nit
}
