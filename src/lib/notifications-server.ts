/**
 * Sistema de notificaciones push - SOLO SERVIDOR
 * Este archivo contiene funciones que solo se usan en el servidor
 */

import webpush from 'web-push'

// Configurar VAPID keys
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
