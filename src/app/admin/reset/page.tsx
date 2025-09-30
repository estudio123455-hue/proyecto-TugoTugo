'use client'

import React, { useState } from 'react'
import Link from 'next/link'

export default function ResetDatabasePage() {
  const [secretKey, setSecretKey] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [success, setSuccess] = useState(false)

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!confirm('⚠️ ¿ESTÁS SEGURO? Esto borrará TODOS los usuarios y datos. Esta acción NO se puede deshacer.')) {
      return
    }

    setIsLoading(true)
    setMessage('')
    setSuccess(false)

    try {
      const response = await fetch('/api/admin/reset-users', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          secretKey,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        setMessage(`✅ ${data.message}\n\nEliminados:\n- ${data.deleted.users} usuarios\n- ${data.deleted.establishments} restaurantes\n- ${data.deleted.posts} publicaciones\n- ${data.deleted.packs} packs\n- ${data.deleted.orders} órdenes`)
      } else {
        setMessage(`❌ ${data.message}`)
      }
    } catch (error) {
      setMessage('❌ Error de conexión. Inténtalo de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 via-red-500 to-orange-400 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">🗑️</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Reset Database
          </h1>
          <p className="text-red-600 font-semibold">
            ⚠️ PELIGRO: Esto borrará TODOS los datos
          </p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            success 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <p className={`text-sm whitespace-pre-line ${success ? 'text-green-700' : 'text-red-700'}`}>
              {message}
            </p>
          </div>
        )}

        {!success ? (
          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Clave Secreta
              </label>
              <input
                type="password"
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="reset-database-123"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Por defecto: <code className="bg-gray-100 px-1 rounded">reset-database-123</code>
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Borrando...' : '🗑️ Borrar Todos los Datos'}
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <Link
              href="/auth"
              className="block w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold text-center"
            >
              Crear Primera Cuenta (Serás Admin)
            </Link>
          </div>
        )}

        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-xs text-yellow-800">
            <strong>⚠️ Importante:</strong> Después de borrar los datos, el primer usuario que se registre será automáticamente ADMIN.
          </p>
        </div>

        <div className="mt-4 text-center">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  )
}
