/**
 * Sistema de notificaciones push - SOLO CLIENTE
 * Este archivo contiene solo las funciones que se usan en el cliente
 */

// Configurar VAPID keys
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''

export interface PushSubscription {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

export interface NotificationPayload {
  title: string
  body: string
  icon?: string
  badge?: string
  data?: any
  actions?: Array<{
    action: string
    title: string
    icon?: string
  }>
}

// Las funciones de envío de notificaciones están en notifications-server.ts

/**
 * Tipos de notificaciones
 */
export const NotificationTypes = {
  NEW_ORDER: 'new_order',
  ORDER_CONFIRMED: 'order_confirmed',
  ORDER_READY: 'order_ready',
  PACK_EXPIRING: 'pack_expiring',
  NEW_PACK_NEARBY: 'new_pack_nearby',
  REVIEW_RECEIVED: 'review_received',
  ESTABLISHMENT_APPROVED: 'establishment_approved',
  ESTABLISHMENT_REJECTED: 'establishment_rejected',
} as const

/**
 * Plantillas de notificaciones
 */
export function getNotificationTemplate(
  type: string,
  data: any
): NotificationPayload {
  const templates: Record<string, NotificationPayload> = {
    new_order: {
      title: '🎉 Nueva Orden Recibida',
      body: `${data.customerName} ha realizado una orden de ${data.quantity} pack(s)`,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      data: { orderId: data.orderId, url: `/dashboard/orders/${data.orderId}` },
      actions: [
        { action: 'view', title: 'Ver Orden' },
        { action: 'close', title: 'Cerrar' },
      ],
    },
    order_confirmed: {
      title: '✅ Orden Confirmada',
      body: `Tu orden en ${data.establishmentName} ha sido confirmada. Recógela ${data.pickupTime}`,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      data: { orderId: data.orderId, url: `/orders/${data.orderId}` },
      actions: [
        { action: 'view', title: 'Ver Detalles' },
        { action: 'close', title: 'Cerrar' },
      ],
    },
    order_ready: {
      title: '🍽️ Tu Orden Está Lista',
      body: `Tu pack en ${data.establishmentName} está listo para recoger`,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      data: { orderId: data.orderId, url: `/orders/${data.orderId}` },
      actions: [
        { action: 'view', title: 'Ver Orden' },
        { action: 'close', title: 'Cerrar' },
      ],
    },
    pack_expiring: {
      title: '⏰ Pack Por Expirar',
      body: `Tu pack "${data.packTitle}" expira en ${data.hoursLeft} horas. ¡No lo pierdas!`,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      data: { packId: data.packId, url: `/packs/${data.packId}` },
      actions: [
        { action: 'view', title: 'Ver Pack' },
        { action: 'close', title: 'Cerrar' },
      ],
    },
    new_pack_nearby: {
      title: '📍 Nuevo Pack Cerca de Ti',
      body: `${data.establishmentName} tiene un nuevo pack disponible a ${data.distance}`,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      data: { packId: data.packId, url: `/packs/${data.packId}` },
      actions: [
        { action: 'view', title: 'Ver Pack' },
        { action: 'close', title: 'Cerrar' },
      ],
    },
    review_received: {
      title: '⭐ Nueva Reseña',
      body: `${data.customerName} dejó una reseña de ${data.rating} estrellas`,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      data: { reviewId: data.reviewId, url: '/dashboard/reviews' },
      actions: [
        { action: 'view', title: 'Ver Reseña' },
        { action: 'close', title: 'Cerrar' },
      ],
    },
    establishment_approved: {
      title: '🎉 ¡Restaurante Aprobado!',
      body: 'Tu restaurante ha sido aprobado. Ya puedes empezar a publicar packs',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      data: { url: '/dashboard' },
      actions: [
        { action: 'view', title: 'Ir al Dashboard' },
        { action: 'close', title: 'Cerrar' },
      ],
    },
    establishment_rejected: {
      title: '❌ Solicitud Rechazada',
      body: 'Tu solicitud de restaurante ha sido rechazada. Revisa los detalles',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      data: { url: '/profile' },
      actions: [
        { action: 'view', title: 'Ver Detalles' },
        { action: 'close', title: 'Cerrar' },
      ],
    },
  }

  return templates[type] || {
    title: 'Notificación',
    body: data.message || 'Tienes una nueva notificación',
    icon: '/icons/icon-192x192.png',
  }
}

/**
 * Verificar si las notificaciones están soportadas
 */
export function isPushNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window
}

/**
 * Solicitar permiso para notificaciones
 */
export async function requestNotificationPermission(): Promise<'granted' | 'denied' | 'default'> {
  if (!isPushNotificationSupported()) {
    throw new Error('Push notifications are not supported')
  }

  return await Notification.requestPermission()
}

/**
 * Obtener la clave pública VAPID
 */
export function getVapidPublicKey(): string {
  console.log('🔑 Obteniendo clave VAPID pública...')
  console.log('🔑 Variable de entorno NEXT_PUBLIC_VAPID_PUBLIC_KEY:', VAPID_PUBLIC_KEY ? `${VAPID_PUBLIC_KEY.substring(0, 20)}... (${VAPID_PUBLIC_KEY.length} chars)` : 'NO DEFINIDA')
  
  if (!VAPID_PUBLIC_KEY || VAPID_PUBLIC_KEY.trim() === '') {
    console.error('❌ NEXT_PUBLIC_VAPID_PUBLIC_KEY no está configurada')
    throw new Error('Clave VAPID pública no configurada. Verifica las variables de entorno.')
  }
  
  return VAPID_PUBLIC_KEY
}

/**
 * Convertir base64 a Uint8Array para VAPID
 * Maneja automáticamente la conversión a formato raw si es necesario
 */
export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  try {
    // Verificar que la clave existe
    if (!base64String || base64String.trim() === '') {
      console.error('❌ Clave VAPID vacía o undefined')
      throw new Error('Clave VAPID no proporcionada')
    }
    
    console.log(`🔑 Procesando clave VAPID: ${base64String.substring(0, 20)}... (${base64String.length} chars)`)
    
    // Verificar si necesita conversión a formato raw
    let processedKey = base64String
    
    // Decodificar para verificar formato
    const buffer = Buffer.from(base64String, 'base64url')
    
    console.log(`📏 Buffer decodificado: ${buffer.length} bytes`)
    
    if (buffer.length === 65 && buffer[0] === 0x04) {
      // Formato sin comprimir: convertir a raw (64 bytes)
      const rawBuffer = buffer.slice(1)
      processedKey = rawBuffer.toString('base64url')
      console.log('🔧 Clave convertida a formato raw (64 bytes)')
      console.log(`🔧 Nueva clave: ${processedKey.substring(0, 20)}...`)
    } else if (buffer.length === 64) {
      console.log('✅ Clave ya está en formato raw')
    } else {
      console.warn(`⚠️ Longitud de clave inesperada: ${buffer.length} bytes`)
      console.warn(`⚠️ Primeros bytes: ${Array.from(buffer.slice(0, 5)).map(b => b.toString(16)).join(' ')}`)
    }
    
    const padding = '='.repeat((4 - (processedKey.length % 4)) % 4)
    const base64 = (processedKey + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/')

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    
    console.log(`📏 Array final: ${outputArray.length} bytes`)
    return outputArray
  } catch (error) {
    console.error('❌ Error al procesar clave VAPID:', error)
    console.error('❌ Clave recibida:', base64String)
    console.error('❌ Tipo de clave:', typeof base64String)
    throw new Error(`Formato de clave VAPID inválido: ${error instanceof Error ? error.message : 'Error desconocido'}`)
  }
}
