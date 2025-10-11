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
  { id: 'all', name: 'Todos', emoji: '🍽️', color: 'bg-gray-200 text-gray-900' },
  { id: 'restaurant', name: 'Restaurante', emoji: '🍽️', color: 'bg-blue-200 text-blue-900' },
  { id: 'bakery', name: 'Panadería', emoji: '🥖', color: 'bg-amber-200 text-amber-900' },
  { id: 'cafe', name: 'Café', emoji: '☕', color: 'bg-amber-200 text-amber-900' },
  { id: 'supermarket', name: 'Supermercado', emoji: '🛒', color: 'bg-green-200 text-green-900' },
  { id: 'pizzeria', name: 'Pizzería', emoji: '🍕', color: 'bg-red-200 text-red-900' },
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
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <NotificationSystem />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block mb-4">
            <span className="bg-green-100 text-green-800 text-sm font-semibold px-4 py-2 rounded-full">
              🌟 Descubre Restaurantes
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-6 leading-tight">
            Restaurantes con
            <br />
            <span className="text-green-600">Packs Disponibles</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Descubre los mejores packs sorpresa de restaurantes cerca de ti y ahorra hasta un 70%
          </p>
          
          {/* Connection status and last update */}
          <div className="flex items-center justify-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-gray-500">
                {isConnected ? 'Tiempo real activo' : 'Modo offline'}
              </span>
            </div>
            {lastUpdate && (
              <span className="text-gray-500">
                Última actualización: {new Date(lastUpdate).toLocaleString()}
              </span>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8">
          {/* Search */}
          <div className="mb-8">
            <div className="relative max-w-2xl mx-auto">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="🔍 Buscar restaurantes por nombre, ubicación o tipo de comida..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 text-base border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all shadow-sm hover:shadow-md"
              />
            </div>
          </div>

          {/* Category filters */}
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`inline-flex items-center px-5 py-2.5 rounded-full text-sm font-semibold transition-all transform hover:scale-105 shadow-sm ${
                  selectedCategory === category.id
                    ? 'bg-green-500 text-white shadow-lg ring-2 ring-green-200'
                    : `${category.color} hover:shadow-md`
                }`}
              >
                <span className="mr-2 text-lg">{category.emoji}</span>
                {category.name}
              </button>
            ))}
          </div>

          {/* Sort options */}
          <div className="flex justify-center">
            <div className="inline-flex bg-white rounded-xl p-1.5 shadow-md border border-gray-200">
              <button
                onClick={() => setSortBy('newest')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  sortBy === 'newest' ? 'bg-green-500 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                🆕 Más recientes
              </button>
              <button
                onClick={() => setSortBy('popular')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  sortBy === 'popular' ? 'bg-green-500 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                🔥 Más populares
              </button>
              <button
                onClick={() => setSortBy('name')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  sortBy === 'name' ? 'bg-green-500 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                🔤 Por nombre
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
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
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="mb-8 text-center">
              <div className="inline-block bg-green-50 border border-green-200 rounded-full px-6 py-3">
                <p className="text-green-800 font-semibold">
                  ✨ {filteredRestaurants.length} restaurante{filteredRestaurants.length !== 1 ? 's' : ''} con packs disponibles
                </p>
              </div>
            </div>

            <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {filteredRestaurants.map(restaurant => (
                <div
                  key={restaurant.id}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1 overflow-hidden border border-gray-100"
                >
                  {/* Restaurant Image */}
                  <div className="relative h-52 bg-gradient-to-br from-green-400 via-emerald-400 to-teal-400 flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 bg-black opacity-5"></div>
                    <span className="text-7xl relative z-10 transform hover:scale-110 transition-transform">{restaurant.image || '🍽️'}</span>
                    <div className="absolute top-4 right-4">
                      <span className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold text-gray-900 shadow-lg">
                        {restaurant.category}
                      </span>
                    </div>
                  </div>

                  {/* Restaurant Info */}
                  <div className="p-6">
                    <div className="mb-4">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        {restaurant.name}
                      </h3>
                    </div>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {restaurant.description}
                    </p>

                    <div className="flex items-center text-sm text-gray-500 mb-4">
                      <span className="mr-2">📍</span>
                      <span className="truncate">{restaurant.address}</span>
                    </div>

                    {/* Packs Summary */}
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 mb-4 border border-green-100">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-bold text-green-900">📦 Packs disponibles</span>
                        <span className="bg-green-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                          {getAvailablePacks(restaurant)} de {getTotalPacks(restaurant)}
                        </span>
                      </div>
                      
                      {restaurant.packs.slice(0, 2).map(pack => (
                        <div key={pack.id} className="flex justify-between items-center text-sm mb-2 bg-white rounded-lg p-2">
                          <span className="truncate font-medium text-gray-900">{pack.title}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-green-600 font-bold text-base">
                              ${pack.discountedPrice}
                            </span>
                            <span className="text-gray-400 line-through text-xs">
                              ${pack.originalPrice}
                            </span>
                            <span className="text-xs bg-red-500 text-white font-bold px-2 py-0.5 rounded-full">
                              -{getDiscountPercentage(pack)}%
                            </span>
                          </div>
                        </div>
                      ))})
                      
                      {restaurant.packs.length > 2 && (
                        <p className="text-xs text-gray-500 mt-2">
                          +{restaurant.packs.length - 2} packs más
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-3">
                      <Link
                        href={`/establecimiento/${restaurant.id}`}
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white text-center py-3 px-4 rounded-xl font-bold transition-all transform hover:scale-105 shadow-md hover:shadow-lg"
                      >
                        🛍️ Ver Packs
                      </Link>
                      <Link
                        href={`/map?establishment=${restaurant.id}`}
                        className="bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-xl font-bold transition-all transform hover:scale-105 shadow-md hover:shadow-lg"
                      >
                        📍
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
  )
}
