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
        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
          isSubscribed
            ? 'bg-green-100 text-green-700 hover:bg-green-200'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        } ${isLoading || permission === 'denied' ? 'opacity-50 cursor-not-allowed' : ''}`}
        title={permission === 'denied' ? 'Permisos de notificación denegados' : ''}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Procesando...</span>
          </>
        ) : isSubscribed ? (
          <>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
            </svg>
            <span>Notificaciones Activas</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span>Activar Notificaciones</span>
          </>
        )}
      </button>

      {error && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
          {error}
        </div>
      )}

      {permission === 'denied' && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-2 rounded-lg text-sm">
          Los permisos de notificación están bloqueados. Habilítalos en la configuración del navegador.
        </div>
      )}
    </div>
  )
}
