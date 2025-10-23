'use client'

import { useEffect, useState } from 'react'
import { WifiOff, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(false)

  useEffect(() => {
    // Check initial online status
    setIsOnline(navigator.onLine)

    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const handleRefresh = () => {
    window.location.reload()
  }

  const handleRetry = () => {
    if (navigator.onLine) {
      window.history.back()
    } else {
      alert('Aún no tienes conexión a internet. Inténtalo de nuevo cuando tengas conexión.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="mb-8">
          <div className="mx-auto w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
            <WifiOff className="w-12 h-12 text-gray-500" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Sin conexión a internet
        </h1>

        {/* Description */}
        <p className="text-gray-600 mb-8">
          Parece que no tienes conexión a internet. Algunas funciones pueden no estar disponibles.
        </p>

        {/* Status */}
        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-8 ${
          isOnline 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          <div className={`w-2 h-2 rounded-full mr-2 ${
            isOnline ? 'bg-green-500' : 'bg-red-500'
          }`} />
          {isOnline ? 'Conectado' : 'Sin conexión'}
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <button
            onClick={handleRefresh}
            className="w-full bg-emerald-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-emerald-600 transition-colors flex items-center justify-center"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Intentar de nuevo
          </button>

          <button
            onClick={handleRetry}
            className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
          >
            Volver atrás
          </button>

          <Link
            href="/"
            className="w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center"
          >
            <Home className="w-5 h-5 mr-2" />
            Ir al inicio
          </Link>
        </div>

        {/* Offline features */}
        <div className="mt-12 p-6 bg-white rounded-lg border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">
            Funciones disponibles sin conexión:
          </h3>
          <ul className="text-sm text-gray-600 space-y-2 text-left">
            <li>• Ver packs guardados en caché</li>
            <li>• Revisar órdenes anteriores</li>
            <li>• Navegar por el historial</li>
            <li>• Usar el chat bot básico</li>
          </ul>
        </div>

        {/* Tips */}
        <div className="mt-8 text-sm text-gray-500">
          <p className="mb-2">💡 Consejos:</p>
          <ul className="space-y-1">
            <li>• Verifica tu conexión WiFi o datos móviles</li>
            <li>• Intenta moverte a una zona con mejor señal</li>
            <li>• Reinicia tu router si usas WiFi</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
