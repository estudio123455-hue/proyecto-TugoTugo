import { NextRequest, NextResponse } from 'next/server'
import { sendNotification } from '@/lib/notifications-server'

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 [Test Notification] Iniciando prueba...')
    
    const { subscription } = await request.json()
    
    if (!subscription) {
      return NextResponse.json(
        { message: 'Suscripción requerida' },
        { status: 400 }
      )
    }
    
    console.log('📱 [Test Notification] Suscripción recibida:', {
      endpoint: subscription.endpoint.substring(0, 50) + '...',
      hasP256dh: !!subscription.keys?.p256dh,
      hasAuth: !!subscription.keys?.auth
    })
    
    // Crear notificación de prueba
    const testNotification = {
      title: '🎉 ¡Prueba VAPID Exitosa!',
      body: 'Las claves ECDSA P-256 funcionan perfectamente. Formato raw detectado y convertido automáticamente.',
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      data: {
        url: '/',
        timestamp: Date.now(),
        testId: 'vapid-test-' + Math.random().toString(36).substr(2, 9)
      },
      actions: [
        {
          action: 'view',
          title: '👀 Ver App'
        },
        {
          action: 'dismiss',
          title: '❌ Cerrar'
        }
      ]
    }
    
    console.log('📦 [Test Notification] Payload creado:', testNotification.title)
    
    // Enviar notificación
    const result = await sendNotification(subscription, testNotification)
    
    console.log('✅ [Test Notification] Notificación enviada exitosamente')
    
    return NextResponse.json({
      success: true,
      message: 'Notificación de prueba enviada exitosamente',
      testId: testNotification.data.testId,
      timestamp: testNotification.data.timestamp
    })
    
  } catch (error) {
    console.error('❌ [Test Notification] Error:', error)
    
    // Analizar el tipo de error
    let errorMessage = 'Error desconocido'
    let errorType = 'unknown'
    
    if (error instanceof Error) {
      if (error.message.includes('invalid key') || error.message.includes('ECDSA')) {
        errorType = 'vapid_key_format'
        errorMessage = 'Error de formato de clave VAPID/ECDSA P-256'
      } else if (error.message.includes('endpoint')) {
        errorType = 'endpoint_error'
        errorMessage = 'Error de endpoint de notificación'
      } else {
        errorMessage = error.message
      }
    }
    
    return NextResponse.json(
      { 
        success: false,
        message: 'Error al enviar notificación de prueba',
        error: errorMessage,
        errorType,
        details: error instanceof Error ? error.stack : String(error)
      },
      { status: 500 }
    )
  }
}
