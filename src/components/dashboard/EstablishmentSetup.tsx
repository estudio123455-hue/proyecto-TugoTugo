'use client'

import React, { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'

interface EstablishmentSetupProps {
  onSetupComplete: () => void
}

export default function EstablishmentSetup({
  onSetupComplete,
}: EstablishmentSetupProps) {
  const { data: session } = useSession()
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    latitude: 4.711, // Bogotá por defecto
    longitude: -74.0721, // Bogotá por defecto
    phone: '',
    email: session?.user?.email || '',
    category: 'RESTAURANT' as
      | 'RESTAURANT'
      | 'CAFE'
      | 'BAKERY'
      | 'SUPERMARKET'
      | 'GROCERY'
      | 'OTHER',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isGettingLocation, setIsGettingLocation] = useState(false)

  const categories = [
    { value: 'RESTAURANT', label: 'Restaurant' },
    { value: 'CAFE', label: 'Café' },
    { value: 'BAKERY', label: 'Bakery' },
    { value: 'SUPERMARKET', label: 'Supermarket' },
    { value: 'GROCERY', label: 'Grocery Store' },
    { value: 'OTHER', label: 'Other' },
  ]

  const getLocation = () => {
    setIsGettingLocation(true)

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser')
      setIsGettingLocation(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      position => {
        setFormData({
          ...formData,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
        setIsGettingLocation(false)
      },
      error => {
        let errorMessage = 'Error obteniendo ubicación: '
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = '📍 Permiso de ubicación denegado. Por favor, permite el acceso a la ubicación en tu navegador o ingresa las coordenadas manualmente.'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = '📍 Ubicación no disponible. Verifica tu conexión GPS o ingresa las coordenadas manualmente.'
            break
          case error.TIMEOUT:
            errorMessage = '📍 Tiempo de espera agotado. Intenta nuevamente o ingresa las coordenadas manualmente.'
            break
          default:
            errorMessage = '📍 Error desconocido obteniendo ubicación. Puedes ingresar las coordenadas manualmente.'
            break
        }
        
        setError(errorMessage)
        setIsGettingLocation(false)
      }
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (
      !formData.name ||
      !formData.address ||
      !formData.latitude ||
      !formData.longitude
    ) {
      setError('Please fill in all required fields and set your location')
      setIsLoading(false)
      return
    }

    try {
      console.log('🚀 Sending establishment setup request...')
      const response = await fetch('/api/establishment/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          userId: session?.user?.id,
        }),
      })

      console.log('📡 Response status:', response.status)
      const data = await response.json()
      console.log('📦 Response data:', data)

      if (response.ok) {
        console.log('✅ Establishment created successfully')
        onSetupComplete()
      } else {
        const errorMsg = data.error 
          ? `${data.message}: ${data.error}` 
          : data.message || 'Failed to create establishment'
        console.error('❌ Setup failed:', errorMsg)
        setError(errorMsg)
      }
    } catch (error) {
      console.error('❌ Network error:', error)
      setError(`An error occurred: ${error instanceof Error ? error.message : 'Please try again.'}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
        {/* Botón de cerrar sesión */}
        <div className="flex justify-end mb-4">
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: '/' })}
            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <span>🚪</span>
            <span>Cerrar sesión</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* 🏢 Información del negocio */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b-2 border-green-500">
              <span className="text-2xl">🏢</span>
              <h2 className="text-lg font-semibold text-gray-900">Información del negocio</h2>
            </div>
            
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nombre del negocio *
              </label>
              <input
                type="text"
                id="name"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                placeholder="Ej: Restaurante El Buen Sabor"
              />
            </div>

            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Categoría *
              </label>
              <select
                id="category"
                required
                value={formData.category}
                onChange={e =>
                  setFormData({ ...formData, category: e.target.value as any })
                }
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Descripción
              </label>
              <textarea
                id="description"
                rows={3}
                value={formData.description}
                onChange={e =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                placeholder="Cuéntale a tus clientes sobre tu negocio..."
              />
            </div>
          </div>

          {/* 📍 Ubicación */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b-2 border-blue-500">
              <span className="text-2xl">📍</span>
              <h2 className="text-lg font-semibold text-gray-900">Ubicación</h2>
            </div>
            
            <div>
              <label
                htmlFor="address"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Dirección *
              </label>
              <input
                type="text"
                id="address"
                required
                value={formData.address}
                onChange={e =>
                  setFormData({ ...formData, address: e.target.value })
                }
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                placeholder="Ej: Calle 85 #15-20, Bogotá"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Coordenadas *
              </label>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <button
                  type="button"
                  onClick={getLocation}
                  disabled={isGettingLocation}
                  className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors w-full sm:w-auto"
                >
                  {isGettingLocation
                    ? '📍 Obteniendo ubicación...'
                    : '📍 Obtener mi ubicación'}
                </button>
                {formData.latitude && formData.longitude && (
                  <span className="text-sm text-green-600 font-medium">
                    ✓ Ubicación establecida ({formData.latitude.toFixed(4)},{' '}
                    {formData.longitude.toFixed(4)})
                  </span>
                )}
              </div>
              
              {/* Campos manuales para coordenadas */}
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Latitud
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.latitude || ''}
                    onChange={e =>
                      setFormData({ ...formData, latitude: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="4.7110"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Longitud
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.longitude || ''}
                    onChange={e =>
                      setFormData({ ...formData, longitude: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="-74.0721"
                  />
                </div>
              </div>
              
              <p className="text-xs text-gray-500 mt-2">
                💡 Necesitamos tu ubicación para mostrar tu negocio en el mapa. Puedes usar el botón de arriba o ingresar las coordenadas manualmente.
              </p>
            </div>
          </div>

          {/* ☎️ Contacto */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b-2 border-purple-500">
              <span className="text-2xl">☎️</span>
              <h2 className="text-lg font-semibold text-gray-900">Contacto</h2>
            </div>
            
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Teléfono
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={formData.phone}
                  onChange={e =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                  placeholder="+57 321 459 6837"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email de contacto
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={e =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                  placeholder="contacto@mirestaurante.com"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-md p-3">
              {error}
            </div>
          )}

          <div className="pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white font-medium py-3 px-4 rounded-md transition-colors"
            >
              {isLoading ? 'Setting up...' : 'Complete Setup'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
