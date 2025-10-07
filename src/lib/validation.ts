import DOMPurify from 'isomorphic-dompurify'

// Sanitize HTML content to prevent XSS
export const sanitizeHtml = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
    ALLOW_DATA_ATTR: false,
  })
}

// Validate pack data
export const validatePackData = (data: any) => {
  const errors: string[] = []

  // Required fields
  if (!data.title || typeof data.title !== 'string' || data.title.trim().length === 0) {
    errors.push('Title is required')
  } else if (data.title.length > 100) {
    errors.push('Title must be less than 100 characters')
  }

  if (!data.description || typeof data.description !== 'string' || data.description.trim().length === 0) {
    errors.push('Description is required')
  } else if (data.description.length > 1000) {
    errors.push('Description must be less than 1000 characters')
  }

  // Price validation
  if (typeof data.originalPrice !== 'number' || data.originalPrice <= 0) {
    errors.push('Original price must be a positive number')
  }

  if (typeof data.discountedPrice !== 'number' || data.discountedPrice <= 0) {
    errors.push('Discounted price must be a positive number')
  }

  if (data.discountedPrice >= data.originalPrice) {
    errors.push('Discounted price must be less than original price')
  }

  // Quantity validation
  if (typeof data.quantity !== 'number' || data.quantity <= 0 || data.quantity > 1000) {
    errors.push('Quantity must be between 1 and 1000')
  }

  // Date validation
  const now = new Date()
  // Allow dates from today (not just future)
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const availableFrom = new Date(data.availableFrom)
  const availableUntil = new Date(data.availableUntil)

  if (isNaN(availableFrom.getTime())) {
    errors.push('Available from date is invalid')
  } else if (availableFrom < today) {
    errors.push('Available from date cannot be in the past')
  }

  if (isNaN(availableUntil.getTime())) {
    errors.push('Available until date is invalid')
  } else if (availableUntil <= availableFrom) {
    errors.push('Available until date must be after available from date')
  }

  // Time validation
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
  if (!timeRegex.test(data.pickupTimeStart)) {
    errors.push('Pickup start time must be in HH:MM format')
  }

  if (!timeRegex.test(data.pickupTimeEnd)) {
    errors.push('Pickup end time must be in HH:MM format')
  }

  if (data.pickupTimeStart >= data.pickupTimeEnd) {
    errors.push('Pickup end time must be after start time')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

// Validate establishment data
export const validateEstablishmentData = (data: any) => {
  const errors: string[] = []

  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
    errors.push('Name is required')
  } else if (data.name.length > 100) {
    errors.push('Name must be less than 100 characters')
  }

  if (!data.address || typeof data.address !== 'string' || data.address.trim().length === 0) {
    errors.push('Address is required')
  } else if (data.address.length > 200) {
    errors.push('Address must be less than 200 characters')
  }

  if (!data.category || typeof data.category !== 'string') {
    errors.push('Category is required')
  }

  // Coordinate validation
  if (typeof data.latitude !== 'number' || data.latitude < -90 || data.latitude > 90) {
    errors.push('Latitude must be between -90 and 90')
  }

  if (typeof data.longitude !== 'number' || data.longitude < -180 || data.longitude > 180) {
    errors.push('Longitude must be between -180 and 180')
  }

  // Phone validation (optional)
  if (data.phone && typeof data.phone === 'string') {
    const phoneRegex = /^[+]?[1-9][\d]{0,15}$/
    if (!phoneRegex.test(data.phone.replace(/[\s\-()]/g, ''))) {
      errors.push('Phone number format is invalid')
    }
  }

  // Email validation (optional)
  if (data.email && typeof data.email === 'string') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(data.email)) {
      errors.push('Email format is invalid')
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

// Rate limiting helper
export const createRateLimit = (maxRequests: number, windowMs: number) => {
  const requests = new Map<string, number[]>()

  return (identifier: string): boolean => {
    const now = Date.now()
    const userRequests = requests.get(identifier) || []
    
    // Remove old requests outside the window
    const validRequests = userRequests.filter(time => now - time < windowMs)
    
    if (validRequests.length >= maxRequests) {
      return false // Rate limit exceeded
    }
    
    validRequests.push(now)
    requests.set(identifier, validRequests)
    return true
  }
}

// File validation
export const validateFile = (file: File, maxSize: number = 5 * 1024 * 1024, allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/webp']) => {
  const errors: string[] = []

  if (file.size > maxSize) {
    errors.push(`File size must be less than ${maxSize / (1024 * 1024)}MB`)
  }

  if (!allowedTypes.includes(file.type)) {
    errors.push(`File type must be one of: ${allowedTypes.join(', ')}`)
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

// SQL injection prevention
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/['"\\]/g, '') // Remove quotes and backslashes
    .replace(/[;]/g, '') // Remove semicolons
    .replace(/--/g, '') // Remove SQL comments
    .replace(/\/\*/g, '') // Remove block comment starts
    .replace(/\*\//g, '') // Remove block comment ends
    .trim()
}
