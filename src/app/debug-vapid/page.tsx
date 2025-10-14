'use client'

import { useState, useEffect } from 'react'

export default function DebugVapidPage() {
  const [envVars, setEnvVars] = useState<{[key: string]: string}>({})
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [...prev, `[${timestamp}] ${message}`])
    console.log(`🐛 [Debug] ${message}`)
  }

  useEffect(() => {
    addLog('🔍 Iniciando diagnóstico de variables VAPID...')
    
    // Verificar variables de entorno del cliente
    const clientEnvVars = {
      'NEXT_PUBLIC_VAPID_PUBLIC_KEY': process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'NO DEFINIDA',
      'NODE_ENV': process.env.NODE_ENV || 'NO DEFINIDA',
    }
    
    setEnvVars(clientEnvVars)
    
    Object.entries(clientEnvVars).forEach(([key, value]) => {
      if (value === 'NO DEFINIDA') {
        addLog(`❌ ${key}: NO DEFINIDA`)
      } else if (key.includes('VAPID_PUBLIC_KEY')) {
        addLog(`✅ ${key}: ${value.substring(0, 20)}... (${value.length} chars)`)
      } else {
        addLog(`✅ ${key}: ${value}`)
      }
    })
  }, [])

  const testVapidKey = async () => {
    addLog('🧪 Probando procesamiento de clave VAPID...')
    
    try {
      const { getVapidPublicKey, urlBase64ToUint8Array } = await import('@/lib/notifications')
      
      addLog('📦 Módulo de notificaciones importado')
      
      const vapidKey = getVapidPublicKey()
      addLog(`🔑 Clave obtenida: ${vapidKey.substring(0, 20)}...`)
      
      const keyArray = urlBase64ToUint8Array(vapidKey)
      addLog(`✅ Conversión exitosa: ${keyArray.length} bytes`)
      
      // Probar conversión a ArrayBuffer
      const applicationServerKey = keyArray.buffer.slice(keyArray.byteOffset, keyArray.byteOffset + keyArray.byteLength) as ArrayBuffer
      addLog(`✅ ArrayBuffer creado: ${applicationServerKey.byteLength} bytes`)
      
    } catch (error) {
      addLog(`❌ Error: ${error instanceof Error ? error.message : 'Error desconocido'}`)
      console.error('Error completo:', error)
    }
  }

  const checkServiceWorker = async () => {
    addLog('🔧 Verificando Service Worker...')
    
    if ('serviceWorker' in navigator) {
      addLog('✅ Service Worker soportado')
      
      try {
        const registration = await navigator.serviceWorker.register('/sw.js')
        addLog('✅ Service Worker registrado')
        
        if ('PushManager' in window) {
          addLog('✅ PushManager disponible')
          
          const permission = Notification.permission
          addLog(`📋 Permiso de notificaciones: ${permission}`)
          
        } else {
          addLog('❌ PushManager no disponible')
        }
        
      } catch (error) {
        addLog(`❌ Error registrando SW: ${error instanceof Error ? error.message : 'Error desconocido'}`)
      }
    } else {
      addLog('❌ Service Worker no soportado')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            🐛 Diagnóstico VAPID - Debug
          </h1>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Variables de Entorno */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800">Variables de Entorno</h2>
              
              <div className="bg-gray-100 p-4 rounded-lg">
                {Object.entries(envVars).map(([key, value]) => (
                  <div key={key} className="mb-2">
                    <span className="font-mono text-sm">
                      <strong>{key}:</strong> {
                        value === 'NO DEFINIDA' 
                          ? <span className="text-red-600">NO DEFINIDA</span>
                          : key.includes('VAPID_PUBLIC_KEY')
                            ? `${value.substring(0, 30)}... (${value.length} chars)`
                            : value
                      }
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <button
                  onClick={testVapidKey}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  🧪 Probar Clave VAPID
                </button>
                
                <button
                  onClick={checkServiceWorker}
                  className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  🔧 Verificar Service Worker
                </button>
              </div>
            </div>

            {/* Logs de Debug */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Logs de Diagnóstico</h2>
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg h-96 overflow-y-auto font-mono text-sm">
                {logs.map((log, index) => (
                  <div key={index} className="mb-1">
                    {log}
                  </div>
                ))}
                {logs.length === 0 && (
                  <div className="text-gray-500">Esperando diagnóstico...</div>
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

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-semibold text-yellow-800 mb-2">💡 Instrucciones de Debug</h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>1. Verifica que NEXT_PUBLIC_VAPID_PUBLIC_KEY esté definida</li>
              <li>2. Prueba la conversión de clave VAPID</li>
              <li>3. Verifica el soporte de Service Worker</li>
              <li>4. Revisa los logs de la consola del navegador</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
