'use client'

import { useState, useEffect } from 'react'
import Navigation from '@/components/Navigation'
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
  const [showMobileFilters, setShowMobileFilters] = useState(false)

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
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        {/* Header - Optimizado para PC */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 lg:sticky lg:top-16 z-30 shadow-sm">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 lg:py-8">
            {/* Título y búsqueda en una fila en PC */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-8 mb-4">
              <div className="lg:min-w-[300px]">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                  🍽️ Explorar Restaurantes
                </h1>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                  Descubre los mejores lugares cerca de ti
                </p>
              </div>
              
              {/* Barra de búsqueda más ancha en PC */}
              <div className="lg:flex-1 lg:max-w-2xl">
                <SearchBar
                  onSearch={setSearchQuery}
                  establishments={establishments}
                  placeholder="Buscar por nombre, tipo de cocina..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 lg:py-8 pb-24">
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
          {/* Panel de filtros - Desktop con diseño mejorado */}
          <aside className="hidden lg:block lg:w-80 xl:w-96 flex-shrink-0">
            <div className="sticky top-32">
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  Filtros
                </h2>
                <FilterPanel
                  onFilterChange={setFilters}
                  userLocation={userLocation}
                />
              </div>
            </div>
          </aside>

          {/* Panel de filtros - Mobile (Drawer) */}
          <div className="lg:hidden">
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="w-full flex items-center justify-between bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 shadow-sm hover:shadow-md transition-shadow"
            >
              <span className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filtros
              </span>
              <svg className={`w-5 h-5 transition-transform ${showMobileFilters ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {showMobileFilters && (
              <div className="mt-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-lg">
                <FilterPanel
                  onFilterChange={setFilters}
                  userLocation={userLocation}
                />
              </div>
            )}
          </div>

          {/* Lista de resultados */}
          <main className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 lg:mb-6">
              <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 font-medium">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                    Cargando...
                  </span>
                ) : (
                  <>
                    <span className="text-green-600 dark:text-green-400 font-bold">{filteredEstablishments.length}</span> restaurante{filteredEstablishments.length !== 1 ? 's' : ''} encontrado{filteredEstablishments.length !== 1 ? 's' : ''}
                  </>
                )}
              </p>

              {/* Toggle de vista - Solo desktop */}
              <div className="hidden sm:flex items-center gap-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-1 shadow-sm">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                  title="Vista de cuadrícula"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                  title="Vista de lista"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Grid/List de establecimientos - Optimizado para PC */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-3 gap-4 lg:gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden animate-pulse">
                    <div className="h-56 lg:h-64 bg-gray-200 dark:bg-gray-700"></div>
                    <div className="p-5 space-y-3">
                      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredEstablishments.length === 0 ? (
              <div className="text-center py-20 lg:py-32 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg">
                <div className="w-24 h-24 lg:w-32 lg:h-32 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-full flex items-center justify-center mx-auto mb-8">
                  <svg className="w-12 h-12 lg:w-16 lg:h-16 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-3">No se encontraron resultados</h3>
                <p className="text-base lg:text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">Intenta ajustar los filtros o realizar una búsqueda diferente</p>
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setFilters({})
                  }}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl hover:scale-105"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Limpiar todos los filtros
                </button>
              </div>
            ) : (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-3 gap-4 lg:gap-6' : 'space-y-4 lg:space-y-6'}>
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
    </>
  )
}

function EstablishmentCard({ establishment, viewMode }: { establishment: any; viewMode: 'grid' | 'list' }) {
  const hasActivePacks = establishment.packs && establishment.packs.length > 0

  if (viewMode === 'list') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 hover:shadow-lg hover:border-green-300 dark:hover:border-green-600 transition-all cursor-pointer group">
        <div className="flex gap-4 sm:gap-6">
          <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden relative">
            {establishment.image ? (
              <img src={establishment.image} alt={establishment.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
            ) : (
              <svg className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            )}
            {hasActivePacks && (
              <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                {establishment.packs.length}
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white truncate group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">{establishment.name}</h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{establishment.category}</p>
              </div>
              {establishment.distance !== undefined && (
                <span className="text-xs sm:text-sm font-semibold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-lg whitespace-nowrap">
                  📍 {formatDistance(establishment.distance)}
                </span>
              )}
            </div>
            
            {establishment.description && (
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">{establishment.description}</p>
            )}
            
            <div className="flex items-center gap-3 text-xs sm:text-sm flex-wrap">
              {establishment.averageRating > 0 && (
                <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/30 px-2 py-1 rounded-lg">
                  <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="font-bold text-yellow-700 dark:text-yellow-400">{establishment.averageRating.toFixed(1)}</span>
                </div>
              )}
              
              {hasActivePacks && (
                <span className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full font-semibold shadow-sm">
                  ✨ {establishment.packs.length} pack{establishment.packs.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-2xl hover:border-green-300 dark:hover:border-green-600 transition-all duration-300 cursor-pointer group transform hover:-translate-y-1">
      <div className="h-56 lg:h-64 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center overflow-hidden relative">
        {establishment.image ? (
          <img src={establishment.image} alt={establishment.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
        ) : (
          <svg className="w-20 h-20 lg:w-24 lg:h-24 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        )}
        {hasActivePacks && (
          <div className="absolute top-4 right-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm lg:text-base font-bold px-4 py-2 rounded-full shadow-xl">
            ✨ {establishment.packs.length} packs
          </div>
        )}
        {establishment.distance !== undefined && (
          <div className="absolute bottom-4 left-4 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm text-green-600 dark:text-green-400 text-sm lg:text-base font-bold px-4 py-2 rounded-full shadow-xl border border-green-200 dark:border-green-700">
            📍 {formatDistance(establishment.distance)}
          </div>
        )}
      </div>
      
      <div className="p-5 lg:p-6">
        <h3 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-2 truncate group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">{establishment.name}</h3>
        <p className="text-base lg:text-lg text-gray-600 dark:text-gray-400 mb-4">{establishment.category}</p>
        
        <div className="flex items-center gap-3">
          {establishment.averageRating > 0 && (
            <div className="flex items-center gap-2 bg-yellow-50 dark:bg-yellow-900/30 px-3 py-2 rounded-xl border border-yellow-200 dark:border-yellow-800">
              <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="font-bold text-base lg:text-lg text-yellow-700 dark:text-yellow-400">{establishment.averageRating.toFixed(1)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
