'use client'

import { useState } from 'react'
import { useCleanSession } from '@/hooks/useCleanSession'

export default function MakeAdminPage() {
  const { data: session, status } = useCleanSession()
  const [adminCode, setAdminCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  const makeAdmin = async () => {
    if (!adminCode) {
      setMessage('❌ Ingresa el código de administrador')
      return
    }

    setIsLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/admin/make-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ adminCode }),
      })

      const result = await response.json()

      if (result.success) {
        setMessage('✅ ¡Convertido a administrador exitosamente!')
        setIsSuccess(true)
        // Recargar la página después de 2 segundos para actualizar la sesión
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      } else {
        setMessage(`❌ ${result.message}`)
        setIsSuccess(false)
      }

    } catch (error) {
      setMessage(`❌ Error: ${error}`)
      setIsSuccess(false)
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'loading') {
    return <div className="p-8">Cargando...</div>
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-md mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              🔐 Convertirse en Administrador
            </h1>
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              Debes iniciar sesión primero
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-md mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            🔐 Convertirse en Administrador
          </h1>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">
                Usuario actual: <strong>{session.user?.email}</strong>
              </p>
              <p className="text-sm text-gray-600 mb-4">
                Rol actual: <strong>{session.user?.role || 'CUSTOMER'}</strong>
              </p>
            </div>

            {session.user?.role === 'ADMIN' ? (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                ✅ Ya eres administrador. Puedes acceder a /admin/notifications
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Código de Administrador
                  </label>
                  <input
                    type="password"
                    value={adminCode}
                    onChange={(e) => setAdminCode(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ingresa el código"
                    disabled={isLoading}
                  />
                </div>

                <button
                  onClick={makeAdmin}
                  disabled={isLoading || !adminCode}
                  className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  {isLoading ? '🔄 Procesando...' : '🔐 Convertir en Admin'}
                </button>
              </>
            )}

            {message && (
              <div className={`p-3 rounded ${
                isSuccess 
                  ? 'bg-green-100 border border-green-400 text-green-700'
                  : 'bg-red-100 border border-red-400 text-red-700'
              }`}>
                {message}
              </div>
            )}

            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="font-semibold text-yellow-800 mb-2">💡 Información</h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• El código de administrador es: <code className="bg-yellow-200 px-1 rounded">ADMIN2024</code></li>
                <li>• Una vez convertido, podrás acceder a /admin/notifications</li>
                <li>• Este endpoint es temporal y debe eliminarse en producción</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
