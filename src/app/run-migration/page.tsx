'use client'

import { useState } from 'react'

export default function RunMigrationPage() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const runMigration = async () => {
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch('/api/migrate', {
        method: 'POST',
      })

      const data = await response.json()
      
      if (response.ok) {
        setResult(data)
      } else {
        setError(data.message || 'Error en la migración')
      }
    } catch (err) {
      setError('Error de red: ' + (err instanceof Error ? err.message : 'Unknown'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          🔄 Ejecutar Migración de Base de Datos
        </h1>
        
        <p className="text-gray-600 mb-6">
          Esta migración creará las tablas necesarias en tu base de datos:
        </p>

        <ul className="list-disc list-inside mb-6 text-gray-700">
          <li>Tabla <code className="bg-gray-100 px-2 py-1 rounded">Post</code> - Para publicaciones</li>
          <li>Tabla <code className="bg-gray-100 px-2 py-1 rounded">EmailVerification</code> - Para verificación de emails</li>
        </ul>

        <button
          onClick={runMigration}
          disabled={loading}
          className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white font-bold py-4 px-6 rounded-lg text-lg transition-colors"
        >
          {loading ? '⏳ Ejecutando migración...' : '▶️ Ejecutar Migración Ahora'}
        </button>

        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="font-bold text-red-900 mb-2">❌ Error</h3>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {result && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-bold text-green-900 mb-2">✅ Migración Exitosa</h3>
            <p className="text-green-700 mb-4">{result.message}</p>
            
            <div className="bg-white rounded p-4 border border-green-200">
              <h4 className="font-semibold mb-2">Resultados:</h4>
              <pre className="text-sm overflow-auto">
                {JSON.stringify(result.results, null, 2)}
              </pre>
            </div>

            <div className="mt-4 bg-blue-50 border border-blue-200 rounded p-4">
              <p className="text-blue-900 font-semibold">🎉 ¡Listo!</p>
              <p className="text-blue-800 text-sm mt-2">
                Ahora puedes crear publicaciones desde el dashboard del restaurante.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
