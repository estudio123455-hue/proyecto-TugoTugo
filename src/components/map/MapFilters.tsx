'use client'

import { useState } from 'react'
import { MapPin, Filter, X } from 'lucide-react'

interface MapFiltersProps {
  onDistanceChange: (distance: number | undefined) => void
  onAvailableOnlyChange: (availableOnly: boolean) => void
  userLocation: { lat: number; lng: number } | null
  onRequestLocation: () => void
}

export default function MapFilters({
  onDistanceChange,
  onAvailableOnlyChange,
  userLocation,
  onRequestLocation,
}: MapFiltersProps) {
  const [showFilters, setShowFilters] = useState(false)
  const [selectedDistance, setSelectedDistance] = useState<number | undefined>(undefined)
  const [availableOnly, setAvailableOnly] = useState(false)

  const distances = [
    { value: 1, label: '1 km' },
    { value: 2, label: '2 km' },
    { value: 5, label: '5 km' },
    { value: 10, label: '10 km' },
    { value: undefined, label: 'Todas' },
  ]

  const handleDistanceChange = (distance: number | undefined) => {
    setSelectedDistance(distance)
    onDistanceChange(distance)
  }

  const handleAvailableOnlyChange = (checked: boolean) => {
    setAvailableOnly(checked)
    onAvailableOnlyChange(checked)
  }

  const clearFilters = () => {
    setSelectedDistance(undefined)
    setAvailableOnly(false)
    onDistanceChange(undefined)
    onAvailableOnlyChange(false)
  }

  const hasActiveFilters = selectedDistance !== undefined || availableOnly

  return (
    <div className="absolute top-4 right-4 z-[1000]">
      {/* Filter Button */}
      <button
        onClick={() => setShowFilters(!showFilters)}
        className={`
          flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 rounded-lg shadow-lg font-medium transition-colors text-sm sm:text-base
          ${hasActiveFilters ? 'bg-green-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}
        `}
      >
        <Filter className="w-4 h-4 sm:w-5 sm:h-5" />
        <span className="hidden sm:inline">Filtros</span>
        {hasActiveFilters && (
          <span className="bg-white text-green-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
            {(selectedDistance !== undefined ? 1 : 0) + (availableOnly ? 1 : 0)}
          </span>
        )}
      </button>

      {/* Filters Panel */}
      {showFilters && (
        <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-xl p-4 w-80 max-w-[calc(100vw-2rem)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Filtros del Mapa</h3>
            <button
              onClick={() => setShowFilters(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Location Filter */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📍 Cerca de mí
            </label>
            {!userLocation ? (
              <button
                onClick={onRequestLocation}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <MapPin className="w-4 h-4" />
                Activar mi ubicación
              </button>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-green-600 mb-2">✓ Ubicación activada</p>
                <div className="grid grid-cols-2 gap-2">
                  {distances.map((dist) => (
                    <button
                      key={dist.label}
                      onClick={() => handleDistanceChange(dist.value)}
                      className={`
                        px-3 py-2 rounded-lg text-sm font-medium transition-colors
                        ${
                          selectedDistance === dist.value
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }
                      `}
                    >
                      {dist.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Available Only Filter */}
          <div className="mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={availableOnly}
                onChange={(e) => handleAvailableOnlyChange(e.target.checked)}
                className="rounded border-gray-300 text-green-500 focus:ring-green-500"
              />
              <span className="text-sm text-gray-700">
                Solo mostrar con packs disponibles
              </span>
            </label>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      )}
    </div>
  )
}
