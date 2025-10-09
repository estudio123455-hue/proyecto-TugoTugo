'use client'

import { useState } from 'react'
import { useNotifications } from '@/hooks/useNotifications'

export default function NotificationButton() {
  const { isSupported, permission, isSubscribed, isLoading, subscribe, unsubscribe } = useNotifications()
  const [error, setError] = useState<string | null>(null)

  const handleToggle = async () => {
    setError(null)
    try {
      if (isSubscribed) {
        await unsubscribe()
      } else {
        await subscribe()
      }
    } catch (err: any) {
      setError(err.message || 'Error al gestionar notificaciones')
    }
  }

  if (!isSupported) {
    return null
  }

  return (
    <div className="relative">
      <button
        onClick={handleToggle}
        disabled={isLoading || permission === 'denied'}
        className={`flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-emerald-500 hover:text-white text-gray-800 rounded-xl transition font-medium ${
          isLoading || permission === 'denied' ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        title={permission === 'denied' ? 'Permisos de notificación denegados' : ''}
      >
        {isLoading ? (
          <span className="hidden sm:inline">Procesando...</span>
        ) : (
          <>
            🔔 <span className="hidden sm:inline">Activar Notificaciones</span>
          </>
        )}
      </button>

      {error && (
        <div className="absolute top-full mt-2 right-0 w-64 sm:w-auto sm:left-0 sm:right-0 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 px-3 py-2 rounded-lg text-xs sm:text-sm shadow-lg z-50">
          {error}
        </div>
      )}

      {permission === 'denied' && (
        <div className="absolute top-full mt-2 right-0 w-64 sm:w-auto sm:left-0 sm:right-0 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 text-yellow-700 dark:text-yellow-300 px-3 py-2 rounded-lg text-xs sm:text-sm shadow-lg z-50">
          Los permisos de notificación están bloqueados. Habilítalos en la configuración del navegador.
        </div>
      )}
    </div>
  )
}
