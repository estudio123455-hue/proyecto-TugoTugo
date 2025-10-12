'use client'

import { useState, useEffect, useCallback } from 'react'
// import { useSession } from 'next-auth/react'
import Navigation from '@/components/Navigation'
import NotificationSystem from '@/components/NotificationSystem'
import Link from 'next/link'
import { useRestaurantsFeed } from '@/hooks/useRestaurantsFeed'

interface Pack {
  id: string
  title: string
  description: string
  originalPrice: number
  discountedPrice: number
  quantity: number
  availableFrom: string
  availableUntil: string
  pickupTimeStart: string
  pickupTimeEnd: string
  isActive: boolean
  createdAt: string
}

interface Restaurant {
  id: string
  name: string
  description: string
  address: string
  category: string
  image: string
  phone?: string
  email?: string
  latitude: number
  longitude: number
  isActive: boolean
  createdAt: string
  updatedAt: string
  packs: Pack[]
  owner: {
    name: string
    email: string
  }
}

const categories = [
  { id: 'all', name: 'Todos', emoji: '🍽️', color: 'bg-gray-100 text-gray-700' },
  { id: 'restaurant', name: 'Restaurante', emoji: '🍽️', color: 'bg-blue-100 text-blue-700' },
  { id: 'bakery', name: 'Panadería', emoji: '🥖', color: 'bg-amber-100 text-amber-700' },
  { id: 'cafe', name: 'Café', emoji: '☕', color: 'bg-amber-100 text-amber-700' },
  { id: 'supermarket', name: 'Supermercado', emoji: '🛒', color: 'bg-green-100 text-green-700' },
  { id: 'pizzeria', name: 'Pizzería', emoji: '🍕', color: 'bg-red-100 text-red-700' },
]

export default function RestaurantsPage() {
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'name'>('newest')

  // Use the new hook with real-time updates
  const { 
    restaurants, 
    lastUpdate, 
    isLoading, 
    isConnected 
  } = useRestaurantsFeed(selectedCategory === 'all' ? undefined : selectedCategory)

  const filterRestaurants = useCallback(() => {
    let filtered = [...restaurants]

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(restaurant =>
        restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        restaurant.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        restaurant.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        restaurant.packs.some(pack => 
          pack.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          pack.description.toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    }

    // Sort results
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        case 'popular':
          return b.packs.length - a.packs.length
        case 'name':
          return a.name.localeCompare(b.name)
        default:
          return 0
      }
    })

    setFilteredRestaurants(filtered)
  }, [restaurants, searchQuery, sortBy])

  useEffect(() => {
    filterRestaurants()
  }, [restaurants, selectedCategory, searchQuery, sortBy, filterRestaurants])

  const getTotalPacks = (restaurant: Restaurant) => {
    return restaurant.packs.length
  }

  const getAvailablePacks = (restaurant: Restaurant) => {
    return restaurant.packs.filter(pack => pack.quantity > 0).length
  }

  const getDiscountPercentage = (pack: Pack) => {
    return Math.round(((pack.originalPrice - pack.discountedPrice) / pack.originalPrice) * 100)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <Navigation />
      <NotificationSystem />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        {/* Header - Diseño completamente nuevo */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-2xl">🏪</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Directorio</p>
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                    Restaurantes Asociados
                  </h1>
                </div>
              </div>
              <p className="text-gray-600 max-w-2xl">
                Explora nuestra red de restaurantes comprometidos con la reducción del desperdicio alimentario
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-400'}`}></div>
                <span className="text-xs font-medium text-gray-600">
                  {isConnected ? 'En vivo' : 'Offline'}
                </span>
              </div>
              {lastUpdate && (
                <span className="text-xs text-gray-400">
                  Actualizado: {new Date(lastUpdate).toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Filters - Diseño lateral */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          {/* Sidebar con filtros */}
          <div className="lg:col-span-1 space-y-4">
            {/* Search */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
              <label className="block text-sm font-semibold text-gray-700 mb-3">Buscar</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Nombre, ubicación..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                />
                <svg className="absolute left-3 top-3 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Category filters */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
              <label className="block text-sm font-semibold text-gray-700 mb-3">Categoría</label>
              <div className="space-y-2">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      selectedCategory === category.id
                        ? 'bg-green-500 text-white shadow-md'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-lg">{category.emoji}</span>
                    <span className="flex-1 text-left">{category.name}</span>
                    {selectedCategory === category.id && (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort options */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
              <label className="block text-sm font-semibold text-gray-700 mb-3">Ordenar por</label>
              <div className="space-y-2">
                <button
                  onClick={() => setSortBy('newest')}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    sortBy === 'newest' ? 'bg-green-50 text-green-700 border-2 border-green-200' : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-2 border-transparent'
                  }`}
                >
                  <span>🆕</span>
                  <span className="flex-1 text-left">Más recientes</span>
                </button>
                <button
                  onClick={() => setSortBy('popular')}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    sortBy === 'popular' ? 'bg-green-50 text-green-700 border-2 border-green-200' : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-2 border-transparent'
                  }`}
                >
                  <span>🔥</span>
                  <span className="flex-1 text-left">Más populares</span>
                </button>
                <button
                  onClick={() => setSortBy('name')}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    sortBy === 'name' ? 'bg-green-50 text-green-700 border-2 border-green-200' : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-2 border-transparent'
                  }`}
                >
                  <span>🔤</span>
                  <span className="flex-1 text-left">Por nombre</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main content area */}
          <div className="lg:col-span-3">
            {filteredRestaurants.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchQuery || selectedCategory !== 'all' 
                ? 'No se encontraron restaurantes' 
                : 'No hay restaurantes disponibles'
              }
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || selectedCategory !== 'all'
                ? 'Intenta con otros filtros o términos de búsqueda'
                : 'Los restaurantes aparecerán aquí cuando publiquen packs'
              }
            </p>
            {(searchQuery || selectedCategory !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('')
                  setSelectedCategory('all')
                }}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-semibold"
              >
                Limpiar filtros
              </button>
            )}
          </div>
            ) : (
              <>
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                      <span className="text-white font-bold text-sm">{filteredRestaurants.length}</span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Resultados encontrados</p>
                      <p className="text-lg font-bold text-gray-900">
                        {filteredRestaurants.length} restaurante{filteredRestaurants.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                  {filteredRestaurants.map(restaurant => (
                    <div
                      key={restaurant.id}
                      className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 hover:border-green-300"
                    >
                      {/* Restaurant Image - Diseño horizontal */}
                      <div className="flex">
                        <div className="relative w-32 h-32 bg-gradient-to-br from-green-400 via-emerald-400 to-teal-400 flex items-center justify-center flex-shrink-0">
                          <span className="text-5xl transform group-hover:scale-110 transition-transform">{restaurant.image || '🍽️'}</span>
                          <div className="absolute top-2 right-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                          </div>
                        </div>

                        {/* Restaurant Info */}
                        <div className="flex-1 p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-green-600 transition-colors">
                                {restaurant.name}
                              </h3>
                              <span className="inline-block bg-gray-100 text-gray-600 text-xs font-medium px-2 py-1 rounded-md">
                                {restaurant.category}
                              </span>
                            </div>
                          </div>

                          <p className="text-gray-600 text-xs mb-3 line-clamp-2">
                            {restaurant.description}
                          </p>

                          <div className="flex items-center text-xs text-gray-500 mb-3">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                            </svg>
                            <span className="truncate">{restaurant.address}</span>
                          </div>
                        </div>
                      </div>

                      {/* Packs Summary - Diseño compacto */}
                      <div className="px-4 pb-4">
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-3 mb-3 border border-green-100">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-gray-700">Packs disponibles</span>
                            <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                              {getAvailablePacks(restaurant)}/{getTotalPacks(restaurant)}
                            </span>
                          </div>
                          
                          <div className="space-y-1.5">
                            {restaurant.packs.slice(0, 2).map(pack => (
                              <div key={pack.id} className="flex justify-between items-center text-xs bg-white rounded-lg p-2">
                                <span className="truncate font-medium text-gray-900 flex-1 mr-2">{pack.title}</span>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-green-600 font-bold">
                                    ${pack.discountedPrice}
                                  </span>
                                  <span className="text-gray-400 line-through text-[10px]">
                                    ${pack.originalPrice}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          {restaurant.packs.length > 2 && (
                            <p className="text-[10px] text-gray-500 mt-2 text-center">
                              +{restaurant.packs.length - 2} más
                            </p>
                          )}
                        </div>

                        {/* Actions - Diseño moderno */}
                        <div className="grid grid-cols-2 gap-2">
                          <Link
                            href={`/establecimiento/${restaurant.id}`}
                            className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white text-center py-2.5 px-3 rounded-xl text-sm font-semibold transition-all shadow-sm hover:shadow-md"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                            <span>Ver Packs</span>
                          </Link>
                          <Link
                            href={`/map?establishment=${restaurant.id}`}
                            className="flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-green-300 text-center py-2.5 px-3 rounded-xl text-sm font-semibold transition-all"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                            </svg>
                            <span>Mapa</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
