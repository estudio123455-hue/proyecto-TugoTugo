'use client'

import { useState, useEffect } from 'react'
import { getVapidPublicKey, urlBase64ToUint8Array } from '@/lib/notifications'

export default function TestVapidPage() {
  const [subscription, setSubscription] = useState<PushSubscription | null>(null)
  const [isSupported, setIsSupported] = useState(false)
  const [permission, setPermission] = useState<'default' | 'granted' | 'denied'>('default')
  const [logs, setLogs] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [...prev, `[${timestamp}] ${message}`])
    console.log(`🧪 [VAPID Test] ${message}`)
  }

  useEffect(() => {
    // Verificar soporte
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true)
      addLog('✅ Service Worker y Push Manager soportados')
    } else {
      addLog('❌ Service Worker o Push Manager no soportados')
    }

    // Verificar permisos
    if ('Notification' in window) {
      setPermission(Notification.permission)
      addLog(`📋 Permiso actual: ${Notification.permission}`)
    }

    // Verificar claves VAPID
    const vapidKey = getVapidPublicKey()
    if (vapidKey) {
      addLog(`🔑 Clave VAPID encontrada: ${vapidKey.substring(0, 20)}...`)
      
      // Verificar formato
      try {
        const buffer = Buffer.from(vapidKey, 'base64url')
        addLog(`📏 Longitud de clave: ${buffer.length} bytes`)
        
        if (buffer.length === 65 && buffer[0] === 0x04) {
          addLog('✅ Formato: Sin comprimir (65 bytes, prefijo 04)')
          addLog('🔧 Se convertirá automáticamente a RAW cuando sea necesario')
        } else if (buffer.length === 64) {
          addLog('✅ Formato: RAW (64 bytes) - Perfecto!')
        } else {
          addLog(`⚠️ Formato inesperado: ${buffer.length} bytes`)
        }
      } catch (error) {
        addLog(`❌ Error al verificar formato: ${error}`)
      }
    } else {
      addLog('❌ Clave VAPID no encontrada')
    }
  }, [])

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      addLog('❌ Notificaciones no soportadas')
      return
    }

    const permission = await Notification.requestPermission()
    setPermission(permission)
    addLog(`📋 Permiso ${permission === 'granted' ? 'concedido' : 'denegado'}`)
  }

  const subscribeToNotifications = async () => {
    if (!isSupported) {
      addLog('❌ Push notifications no soportadas')
      return
    }

    setIsLoading(true)
    addLog('🔄 Iniciando suscripción...')

    try {
      // Registrar service worker
      addLog('📝 Registrando service worker...')
      const registration = await navigator.serviceWorker.register('/sw.js')
      await navigator.serviceWorker.ready
      addLog('✅ Service worker registrado')

      // Obtener clave VAPID
      const vapidPublicKey = getVapidPublicKey()
      if (!vapidPublicKey) {
        throw new Error('Clave VAPID no encontrada')
      }

      addLog('🔑 Convirtiendo clave VAPID a formato correcto...')
      
      // Esta función maneja automáticamente la conversión a RAW
      const keyArray = urlBase64ToUint8Array(vapidPublicKey)
      addLog(`📏 Clave convertida: ${keyArray.length} bytes`)
      
      // Convertir a ArrayBuffer para compatibilidad con PushManager
      const applicationServerKey = keyArray.buffer.slice(keyArray.byteOffset, keyArray.byteOffset + keyArray.byteLength) as ArrayBuffer

      // Suscribirse
      addLog('📱 Creando suscripción push...')
      const pushSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey,
      })

      setSubscription(pushSubscription)
      addLog('✅ Suscripción creada exitosamente')
      addLog(`🔗 Endpoint: ${pushSubscription.endpoint.substring(0, 50)}...`)

      // Guardar en servidor
      addLog('💾 Guardando suscripción en servidor...')
      const response = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          endpoint: pushSubscription.endpoint,
          keys: {
            p256dh: btoa(String.fromCharCode(...new Uint8Array(pushSubscription.getKey('p256dh')!))),
            auth: btoa(String.fromCharCode(...new Uint8Array(pushSubscription.getKey('auth')!))),
          },
        }),
      })

      if (response.ok) {
        addLog('✅ Suscripción guardada en servidor')
      } else {
        addLog('⚠️ Error al guardar suscripción en servidor')
      }

    } catch (error) {
      addLog(`❌ Error en suscripción: ${error}`)
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const sendTestNotification = async () => {
    if (!subscription) {
      addLog('❌ No hay suscripción activa')
      return
    }

    setIsLoading(true)
    addLog('🚀 Enviando notificación de prueba...')

    try {
      const response = await fetch('/api/test-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription: {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')!))),
              auth: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')!))),
            },
          },
        }),
      })

      const result = await response.json()

      if (result.success) {
        addLog('✅ Notificación enviada exitosamente')
        addLog(`🆔 Test ID: ${result.testId}`)
      } else {
        addLog(`❌ Error: ${result.message}`)
        if (result.errorType === 'vapid_key_format') {
          addLog('🔧 Error de formato ECDSA P-256 detectado')
        }
      }

    } catch (error) {
      addLog(`❌ Error al enviar notificación: ${error}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            🧪 Prueba de Notificaciones VAPID - ECDSA P-256 Raw
          </h1>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Panel de Control */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800">Panel de Control</h2>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${isSupported ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  <span>Soporte Push: {isSupported ? 'Sí' : 'No'}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${
                    permission === 'granted' ? 'bg-green-500' : 
                    permission === 'denied' ? 'bg-red-500' : 'bg-yellow-500'
                  }`}></span>
                  <span>Permisos: {permission}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${subscription ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                  <span>Suscripción: {subscription ? 'Activa' : 'Inactiva'}</span>
                </div>
              </div>

              <div className="space-y-2">
                {permission !== 'granted' && (
                  <button
                    onClick={requestPermission}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    🔔 Solicitar Permisos
                  </button>
                )}
                
                {permission === 'granted' && !subscription && (
                  <button
                    onClick={subscribeToNotifications}
                    disabled={isLoading}
                    className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    {isLoading ? '🔄 Suscribiendo...' : '📱 Suscribirse'}
                  </button>
                )}
                
                {subscription && (
                  <button
                    onClick={sendTestNotification}
                    disabled={isLoading}
                    className="w-full bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    {isLoading ? '🚀 Enviando...' : '🧪 Enviar Prueba'}
                  </button>
                )}
              </div>
            </div>

            {/* Logs */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Logs de Prueba</h2>
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg h-96 overflow-y-auto font-mono text-sm">
                {logs.map((log, index) => (
                  <div key={index} className="mb-1">
                    {log}
                  </div>
                ))}
                {logs.length === 0 && (
                  <div className="text-gray-500">Esperando logs...</div>
                )}
              </div>
              
              <button
                onClick={() => setLogs([])}
                className="mt-2 text-sm text-gray-500 hover:text-gray-700"
              >
                🗑️ Limpiar logs
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
