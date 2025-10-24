import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getMessaging } from 'firebase-admin/messaging'

// Inicializar Firebase Admin solo una vez
if (!getApps().length) {
  try {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    })
  } catch (error) {
    console.error('Error inicializando Firebase Admin:', error)
  }
}

// Función para enviar notificación push
export async function sendPushNotification({
  token,
  title,
  body,
  data = {}
}: {
  token: string
  title: string
  body: string
  data?: Record<string, string>
}) {
  try {
    const messaging = getMessaging()
    
    const message = {
      token,
      notification: {
        title,
        body,
      },
      data,
      webpush: {
        fcmOptions: {
          link: process.env.NEXTAUTH_URL || 'https://tugotugo.vercel.app'
        }
      }
    }

    const response = await messaging.send(message)
    console.log('Notificación enviada exitosamente:', response)
    return { success: true, messageId: response }
  } catch (error) {
    console.error('Error enviando notificación:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
  }
}

// Función para enviar notificación a múltiples dispositivos
export async function sendMulticastNotification({
  tokens,
  title,
  body,
  data = {}
}: {
  tokens: string[]
  title: string
  body: string
  data?: Record<string, string>
}) {
  try {
    const messaging = getMessaging()
    
    const message = {
      tokens,
      notification: {
        title,
        body,
      },
      data,
      webpush: {
        fcmOptions: {
          link: process.env.NEXTAUTH_URL || 'https://tugotugo.vercel.app'
        }
      }
    }

    const response = await messaging.sendEachForMulticast(message)
    console.log('Notificaciones multicast enviadas:', {
      successCount: response.successCount,
      failureCount: response.failureCount
    })
    
    return { 
      success: true, 
      successCount: response.successCount,
      failureCount: response.failureCount,
      responses: response.responses
    }
  } catch (error) {
    console.error('Error enviando notificaciones multicast:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
  }
}

// Templates de notificaciones
export const notificationTemplates = {
  orderConfirmed: (orderNumber: string) => ({
    title: '🎉 ¡Orden confirmada!',
    body: `Tu orden ${orderNumber} está lista para recoger`,
    data: {
      type: 'order_confirmed',
      orderNumber
    }
  }),

  orderReady: (restaurantName: string) => ({
    title: '📦 ¡Tu pack está listo!',
    body: `Puedes recoger tu pack en ${restaurantName}`,
    data: {
      type: 'order_ready',
      restaurantName
    }
  }),

  pickupReminder: (restaurantName: string, timeLeft: string) => ({
    title: '⏰ Recordatorio de recogida',
    body: `Tienes ${timeLeft} para recoger tu pack en ${restaurantName}`,
    data: {
      type: 'pickup_reminder',
      restaurantName,
      timeLeft
    }
  }),

  newPacksAvailable: (count: number) => ({
    title: '🆕 ¡Nuevos packs disponibles!',
    body: `${count} nuevos packs sorpresa cerca de ti`,
    data: {
      type: 'new_packs',
      count: count.toString()
    }
  })
}

// Función específica para notificar orden confirmada
export async function notifyOrderConfirmed(token: string, orderNumber: string) {
  const template = notificationTemplates.orderConfirmed(orderNumber)
  return await sendPushNotification({
    token,
    ...template
  })
}

// Función específica para notificar pack listo
export async function notifyOrderReady(token: string, restaurantName: string) {
  const template = notificationTemplates.orderReady(restaurantName)
  return await sendPushNotification({
    token,
    ...template
  })
}

// Función específica para recordatorio de recogida
export async function notifyPickupReminder(token: string, restaurantName: string, timeLeft: string) {
  const template = notificationTemplates.pickupReminder(restaurantName, timeLeft)
  return await sendPushNotification({
    token,
    ...template
  })
}
