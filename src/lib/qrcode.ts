import QRCode from 'qrcode'
import crypto from 'crypto'

/**
 * Genera un código de verificación único
 */
export function generateVerificationCode(): string {
  // Genera un código alfanumérico de 12 caracteres
  return crypto.randomBytes(6).toString('hex').toUpperCase()
}

/**
 * Genera un código QR como imagen base64
 * @param orderId - ID de la orden
 * @param verificationCode - Código de verificación
 * @returns Promise con la imagen QR en formato base64
 */
export async function generateOrderQRCode(
  orderId: string,
  verificationCode: string
): Promise<string> {
  try {
    // Datos que contendrá el QR
    const qrData = JSON.stringify({
      orderId,
      code: verificationCode,
      timestamp: new Date().toISOString(),
    })

    // Genera el QR como base64
    const qrCodeDataURL = await QRCode.toDataURL(qrData, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    })

    return qrCodeDataURL
  } catch (error) {
    console.error('Error generating QR code:', error)
    throw new Error('Failed to generate QR code')
  }
}

/**
 * Verifica si un código de verificación es válido
 * @param code - Código a verificar
 * @returns boolean
 */
export function isValidVerificationCode(code: string): boolean {
  // Verifica que sea un código hexadecimal de 12 caracteres
  return /^[A-F0-9]{12}$/.test(code)
}
