'use client'

import React, { useState, useCallback, useRef } from 'react'

interface CreateEstablishmentModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

interface GeocodingResult {
  lat: string
  lon: string
  display_name: string
}

export default function CreateEstablishmentModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateEstablishmentModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    latitude: '',
    longitude: '',
    phone: '',
    email: '',
    category: 'RESTAURANT',
    businessType: '',
    taxId: '',
  })
  const [loading, setLoading] = useState(false)
  const [geocoding, setGeocoding] = useState(false)
  const [suggestions, setSuggestions] = useState<GeocodingResult[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const geocodingTimeout = useRef<NodeJS.Timeout | null>(null)

  // Geocodificación con Nominatim (OpenStreetMap) - 100% gratis
  const geocodeAddress = useCallback(async (address: string) => {
    if (!address || address.length < 5) {
      setSuggestions([])
      return
    }

    setGeocoding(true)
    try {
      // Nominatim API - gratis, sin API key
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
        `q=${encodeURIComponent(address)}, Bogotá, Colombia&` +
        `format=json&` +
        `limit=5&` +
        `addressdetails=1`,
        {
          headers: {
            'User-Agent': 'TugoTugo-App', // Requerido por Nominatim
          },
        }
      )

      if (response.ok) {
        const results: GeocodingResult[] = await response.json()
        setSuggestions(results)
        setShowSuggestions(results.length > 0)
      }
    } catch (error) {
      console.error('Error geocoding:', error)
    } finally {
      setGeocoding(false)
    }
  }, [])

  // Debounced geocoding
  const handleAddressChange = (address: string) => {
    setFormData({ ...formData, address })
    
    // Clear previous timeout
    if (geocodingTimeout.current) {
      clearTimeout(geocodingTimeout.current)
    }

    // Set new timeout
    geocodingTimeout.current = setTimeout(() => {
      geocodeAddress(address)
    }, 500) // Wait 500ms after user stops typing
  }

  // Select suggestion
  const selectSuggestion = (suggestion: GeocodingResult) => {
    setFormData({
      ...formData,
      address: suggestion.display_name,
      latitude: suggestion.lat,
      longitude: suggestion.lon,
    })
    setShowSuggestions(false)
    setSuggestions([])
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/admin/establishments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude),
        }),
      })

      const data = await res.json()

      if (data.success) {
        alert('Restaurante creado exitosamente')
        onSuccess()
        onClose()
        setFormData({
          name: '',
          description: '',
          address: '',
          latitude: '',
          longitude: '',
          phone: '',
          email: '',
          category: 'RESTAURANT',
          businessType: '',
          taxId: '',
        })
      } else {
        alert(data.message || 'Error al crear restaurante')
      }
    } catch (error) {
      console.error('Error creating establishment:', error)
      alert('Error al crear restaurante')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Crear Restaurante</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900"
                  placeholder="Nombre del restaurante"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900"
                  placeholder="correo@ejemplo.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900"
                  placeholder="3001234567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoría *
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900"
                >
                  <option value="RESTAURANT">Restaurante</option>
                  <option value="CAFE">Café</option>
                  <option value="BAKERY">Panadería</option>
                  <option value="SUPERMARKET">Supermercado</option>
                  <option value="GROCERY">Tienda</option>
                  <option value="OTHER">Otro</option>
                </select>
              </div>
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dirección * {geocoding && <span className="text-xs text-blue-500">(buscando...)</span>}
              </label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => handleAddressChange(e.target.value)}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900"
                placeholder="Ej: Calle 72 #10-34, Bogotá"
                autoComplete="off"
              />
              
              {/* Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => selectSuggestion(suggestion)}
                      className="w-full text-left px-3 py-2 hover:bg-green-50 border-b border-gray-100 last:border-b-0 transition-colors"
                    >
                      <div className="text-sm text-gray-900">{suggestion.display_name}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        📍 {suggestion.lat}, {suggestion.lon}
                      </div>
                    </button>
                  ))}
                </div>
              )}
              
              <p className="text-xs text-gray-500 mt-1">
                💡 Escribe la dirección y selecciona una sugerencia para autocompletar las coordenadas
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Latitud *
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={formData.latitude}
                  onChange={(e) =>
                    setFormData({ ...formData, latitude: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900"
                  placeholder="4.7110"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Longitud *
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={formData.longitude}
                  onChange={(e) =>
                    setFormData({ ...formData, longitude: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900"
                  placeholder="-74.0721"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900"
                placeholder="Descripción del restaurante..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Negocio
                </label>
                <input
                  type="text"
                  value={formData.businessType}
                  onChange={(e) =>
                    setFormData({ ...formData, businessType: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900"
                  placeholder="Restaurante, Cafetería, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  NIT/RUT
                </label>
                <input
                  type="text"
                  value={formData.taxId}
                  onChange={(e) =>
                    setFormData({ ...formData, taxId: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900"
                  placeholder="900123456-7"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Creando...' : 'Crear Restaurante'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
