/**
 * Utilidades para manejar claves VAPID en diferentes formatos
 */

/**
 * Convierte una clave pública VAPID a formato raw (64 bytes)
 * @param publicKey - Clave pública en formato base64url
 * @returns Clave en formato raw (64 bytes) como base64url
 */
export function convertToRawFormat(publicKey: string): string {
  try {
    // Convertir de base64url a buffer
    const buffer = Buffer.from(publicKey, 'base64url')
    
    console.log(`📏 Longitud original: ${buffer.length} bytes`)
    
    if (buffer.length === 65 && buffer[0] === 0x04) {
      // Formato sin comprimir: remover el primer byte (04)
      const rawBuffer = buffer.slice(1)
      console.log(`✅ Convertido a formato raw: ${rawBuffer.length} bytes`)
      return rawBuffer.toString('base64url')
    } else if (buffer.length === 64) {
      // Ya está en formato raw
      console.log('✅ Ya está en formato raw')
      return publicKey
    } else if (buffer.length === 33) {
      throw new Error('Clave comprimida no soportada. Use una clave sin comprimir.')
    } else {
      throw new Error(`Longitud de clave no válida: ${buffer.length} bytes`)
    }
  } catch (error) {
    console.error('❌ Error al convertir clave:', error)
    throw error
  }
}

/**
 * Valida que una clave esté en formato raw correcto
 * @param publicKey - Clave pública en formato base64url
 * @returns true si está en formato raw válido
 */
export function validateRawFormat(publicKey: string): boolean {
  try {
    const buffer = Buffer.from(publicKey, 'base64url')
    return buffer.length === 64
  } catch {
    return false
  }
}

/**
 * Obtiene información sobre el formato de una clave
 * @param publicKey - Clave pública en formato base64url
 * @returns Información sobre el formato
 */
export function getKeyInfo(publicKey: string): {
  length: number
  format: string
  isValid: boolean
  needsConversion: boolean
} {
  try {
    const buffer = Buffer.from(publicKey, 'base64url')
    
    if (buffer.length === 65 && buffer[0] === 0x04) {
      return {
        length: 65,
        format: 'Sin comprimir (con prefijo 04)',
        isValid: true,
        needsConversion: true
      }
    } else if (buffer.length === 64) {
      return {
        length: 64,
        format: 'Raw (coordenadas X,Y)',
        isValid: true,
        needsConversion: false
      }
    } else if (buffer.length === 33) {
      return {
        length: 33,
        format: 'Comprimido',
        isValid: false,
        needsConversion: true
      }
    } else {
      return {
        length: buffer.length,
        format: 'Desconocido',
        isValid: false,
        needsConversion: true
      }
    }
  } catch {
    return {
      length: 0,
      format: 'Error al decodificar',
      isValid: false,
      needsConversion: true
    }
  }
}

/**
 * Convierte base64url a Uint8Array para uso en navegador
 * Maneja automáticamente la conversión a formato raw si es necesario
 */
export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  // Asegurar que está en formato raw
  const rawKey = validateRawFormat(base64String) 
    ? base64String 
    : convertToRawFormat(base64String)
  
  const padding = '='.repeat((4 - (rawKey.length % 4)) % 4)
  const base64 = (rawKey + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  
  return outputArray
}
