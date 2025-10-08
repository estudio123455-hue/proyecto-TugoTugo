/**
 * Sistema de notificaciones push
 */

import webpush from 'web-push'

// Configurar VAPID keys (debes generarlas con: npx web-push generate-vapid-keys)
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || ''
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:hello@tugotug.com'

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    VAPID_SUBJECT,
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  )
}

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

/**
 * Enviar notificación push a un usuario
 */
export async function sendPushNotification(
  subscription: PushSubscription,
  payload: NotificationPayload
): Promise<boolean> {
  try {
    await webpush.sendNotification(
      subscription as any,
      JSON.stringify(payload)
    )
    return true
  } catch (error: any) {
    console.error('Error sending push notification:', error)
    
    // Si la suscripción expiró o es inválida
    if (error.statusCode === 410 || error.statusCode === 404) {
      console.log('Subscription expired or invalid')
      // Aquí deberías eliminar la suscripción de la DB
    }
    
    return false
  }
}

/**
 * Enviar notificación a múltiples usuarios
 */
export async function sendBulkPushNotifications(
  subscriptions: PushSubscription[],
  payload: NotificationPayload
): Promise<{ sent: number; failed: number }> {
  let sent = 0
  let failed = 0

  const promises = subscriptions.map(async (subscription) => {
    const success = await sendPushNotification(subscription, payload)
    if (success) {
      sent++
    } else {
      failed++
    }
  })

  await Promise.all(promises)

  return { sent, failed }
}

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
  return VAPID_PUBLIC_KEY
}

/**
 * Convertir base64 a Uint8Array para VAPID
 */
export function urlBase64ToUint8Array(base64String: string): BufferSource {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray as BufferSource
}
