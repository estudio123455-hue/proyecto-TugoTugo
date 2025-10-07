'use client'

import { useState } from 'react'
import { CATEGORIES, DISTANCE_OPTIONS, PRICE_RANGES, SORT_OPTIONS } from '@/lib/search'

interface FilterPanelProps {
  onFilterChange: (filters: any) => void
  userLocation: { lat: number; lng: number } | null
  className?: string
}

export default function FilterPanel({ onFilterChange, userLocation, className = '' }: FilterPanelProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [filters, setFilters] = useState({
    category: 'all',
    maxDistance: undefined as number | undefined,
    minPrice: undefined as number | undefined,
    maxPrice: undefined as number | undefined,
    sortBy: 'distance' as string,
  })

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handlePriceRangeChange = (min: number | undefined, max: number | undefined) => {
    const newFilters = { ...filters, minPrice: min, maxPrice: max }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const clearFilters = () => {
    const defaultFilters = {
      category: 'all',
      maxDistance: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      sortBy: 'distance',
    }
    setFilters(defaultFilters)
    onFilterChange(defaultFilters)
  }

  const activeFiltersCount = [
    filters.category !== 'all',
    filters.maxDistance !== undefined,
    filters.minPrice !== undefined || filters.maxPrice !== undefined,
  ].filter(Boolean).length

  return (
    <div className={className}>
      {/* Botón para abrir/cerrar filtros en móvil */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden w-full mb-4 px-4 py-3 bg-white border border-gray-300 rounded-lg flex items-center justify-between shadow-sm"
      >
        <span className="flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <span className="font-medium">Filtros</span>
          {activeFiltersCount > 0 && (
            <span className="px-2 py-1 text-xs bg-green-500 text-white rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </span>
        <svg className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Panel de filtros */}
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6 ${isOpen ? 'block' : 'hidden lg:block'}`}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
          {activeFiltersCount > 0 && (
            <button
              onClick={clearFilters}
              className="text-sm text-green-600 hover:text-green-700 font-medium"
            >
              Limpiar todo
            </button>
          )}
        </div>

        {/* Ordenar por */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ordenar por
          </label>
          <select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            {SORT_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Categoría */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Categoría
          </label>
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            {CATEGORIES.map(cat => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* Distancia */}
        {userLocation && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Distancia máxima
            </label>
            <select
              value={filters.maxDistance || ''}
              onChange={(e) => handleFilterChange('maxDistance', e.target.value ? parseFloat(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {DISTANCE_OPTIONS.map((option, index) => (
                <option key={index} value={option.value || ''}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Rango de precio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rango de precio
          </label>
          <div className="space-y-2">
            {PRICE_RANGES.map((range, index) => (
              <label key={index} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="priceRange"
                  checked={filters.minPrice === range.min && filters.maxPrice === range.max}
                  onChange={() => handlePriceRangeChange(range.min, range.max)}
                  className="w-4 h-4 text-green-600 focus:ring-green-500"
                />
                <span className="text-sm text-gray-700">{range.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
