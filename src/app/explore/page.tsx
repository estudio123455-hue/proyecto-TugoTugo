'use client'

import { useState, useEffect } from 'react'
import SearchBar from '@/components/SearchBar'
import FilterPanel from '@/components/FilterPanel'
import { getCurrentLocation, formatDistance } from '@/lib/geolocation'
import { applyFilters, sortResults } from '@/lib/search'

export default function ExplorePage() {
  const [establishments, setEstablishments] = useState<any[]>([])
  const [filteredEstablishments, setFilteredEstablishments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<any>({})
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Obtener ubicación del usuario
  useEffect(() => {
    getCurrentLocation().then(location => {
      if (location) {
        setUserLocation({ lat: location.latitude, lng: location.longitude })
      }
    })
  }, [])

  // Cargar establecimientos
  useEffect(() => {
    fetchEstablishments()
  }, [userLocation])

  const fetchEstablishments = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      
      if (userLocation) {
        params.append('lat', userLocation.lat.toString())
        params.append('lng', userLocation.lng.toString())
      }

      const response = await fetch(`/api/establishments?${params}`)
      const data = await response.json()
      setEstablishments(data)
      setFilteredEstablishments(data)
    } catch (error) {
      console.error('Error fetching establishments:', error)
    } finally {
      setLoading(false)
    }
  }

  // Aplicar búsqueda y filtros
  useEffect(() => {
    let results = [...establishments]

    // Aplicar búsqueda
    if (searchQuery) {
      results = results.filter(est =>
        est.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        est.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        est.cuisineType?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Aplicar filtros
    results = applyFilters(results, {
      category: filters.category,
      maxDistance: filters.maxDistance,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      isActive: true,
    })

    // Ordenar
    if (filters.sortBy) {
      results = sortResults(results, filters.sortBy)
    }

    setFilteredEstablishments(results)
  }, [searchQuery, filters, establishments])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Explorar Restaurantes
          </h1>
          
          {/* Barra de búsqueda */}
          <SearchBar
            onSearch={setSearchQuery}
            establishments={establishments}
            placeholder="Buscar por nombre, tipo de cocina..."
          />

          {/* Info de ubicación */}
          {userLocation && (
            <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Mostrando resultados cerca de tu ubicación</span>
            </div>
          )}
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Panel de filtros */}
          <aside className="lg:w-64 flex-shrink-0">
            <FilterPanel
              onFilterChange={setFilters}
              userLocation={userLocation}
            />
          </aside>

          {/* Lista de resultados */}
          <main className="flex-1">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">
                {loading ? 'Cargando...' : `${filteredEstablishments.length} restaurantes encontrados`}
              </p>

              {/* Toggle de vista */}
              <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-green-100 text-green-600' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-green-100 text-green-600' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Grid/List de establecimientos */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
                    <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : filteredEstablishments.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron resultados</h3>
                <p className="text-gray-600">Intenta ajustar los filtros o la búsqueda</p>
              </div>
            ) : (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                {filteredEstablishments.map(est => (
                  <EstablishmentCard
                    key={est.id}
                    establishment={est}
                    viewMode={viewMode}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

function EstablishmentCard({ establishment, viewMode }: { establishment: any; viewMode: 'grid' | 'list' }) {
  const hasActivePacks = establishment.packs && establishment.packs.length > 0

  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
        <div className="flex gap-6">
          <div className="w-32 h-32 bg-gray-200 rounded-lg flex-shrink-0 flex items-center justify-center">
            {establishment.image ? (
              <img src={establishment.image} alt={establishment.name} className="w-full h-full object-cover rounded-lg" />
            ) : (
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{establishment.name}</h3>
                <p className="text-sm text-gray-600">{establishment.category}</p>
              </div>
              {establishment.distance !== undefined && (
                <span className="text-sm font-medium text-green-600">
                  {formatDistance(establishment.distance)}
                </span>
              )}
            </div>
            
            {establishment.description && (
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{establishment.description}</p>
            )}
            
            <div className="flex items-center gap-4 text-sm">
              {establishment.averageRating > 0 && (
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="font-medium">{establishment.averageRating.toFixed(1)}</span>
                </div>
              )}
              
              {hasActivePacks && (
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                  {establishment.packs.length} pack{establishment.packs.length !== 1 ? 's' : ''} disponible{establishment.packs.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="h-48 bg-gray-200 flex items-center justify-center">
        {establishment.image ? (
          <img src={establishment.image} alt={establishment.name} className="w-full h-full object-cover" />
        ) : (
          <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900">{establishment.name}</h3>
          {establishment.distance !== undefined && (
            <span className="text-sm font-medium text-green-600">
              {formatDistance(establishment.distance)}
            </span>
          )}
        </div>
        
        <p className="text-sm text-gray-600 mb-3">{establishment.category}</p>
        
        <div className="flex items-center gap-4 text-sm">
          {establishment.averageRating > 0 && (
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="font-medium">{establishment.averageRating.toFixed(1)}</span>
            </div>
          )}
          
          {hasActivePacks && (
            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
              {establishment.packs.length} disponible{establishment.packs.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
