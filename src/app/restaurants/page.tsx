'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
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
  { id: 'cafe', name: 'Café', emoji: '☕', color: 'bg-brown-100 text-brown-700' },
  { id: 'supermarket', name: 'Supermercado', emoji: '🛒', color: 'bg-green-100 text-green-700' },
  { id: 'pizzeria', name: 'Pizzería', emoji: '🍕', color: 'bg-red-100 text-red-700' },
]

export default function RestaurantsPage() {
  const { data: session } = useSession()
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'name'>('newest')

  // Use the new hook with real-time updates
  const { 
    restaurants, 
    total, 
    lastUpdate, 
    isLoading, 
    error, 
    isConnected 
  } = useRestaurantsFeed(selectedCategory === 'all' ? undefined : selectedCategory)

  useEffect(() => {
    filterRestaurants()
  }, [restaurants, selectedCategory, searchQuery, sortBy])

  const filterRestaurants = () => {
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
  }

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
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Restaurantes con Packs Disponibles
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Descubre los mejores packs sorpresa de restaurantes cerca de ti
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
          <div className="mb-6">
            <input
              type="text"
              placeholder="Buscar restaurantes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full max-w-md mx-auto block px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Category filters */}
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category.id
                    ? category.color
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="mr-2">{category.emoji}</span>
                {category.name}
              </button>
            ))}
          </div>

          {/* Sort options */}
          <div className="flex justify-center">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setSortBy('newest')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  sortBy === 'newest' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Más recientes
              </button>
              <button
                onClick={() => setSortBy('popular')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  sortBy === 'popular' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Más populares
              </button>
              <button
                onClick={() => setSortBy('name')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  sortBy === 'name' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Por nombre
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
            <div className="mb-6 text-center">
              <p className="text-gray-600">
                {filteredRestaurants.length} restaurante{filteredRestaurants.length !== 1 ? 's' : ''} con packs disponibles
              </p>
            </div>

            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {filteredRestaurants.map(restaurant => (
                <div
                  key={restaurant.id}
                  className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden"
                >
                  {/* Restaurant Image */}
                  <div className="h-48 bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center">
                    <span className="text-6xl">{restaurant.image || '🍽️'}</span>
                  </div>

                  {/* Restaurant Info */}
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-bold text-gray-900">
                        {restaurant.name}
                      </h3>
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        {restaurant.category}
                      </span>
                    </div>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {restaurant.description}
                    </p>

                    <div className="flex items-center text-sm text-gray-500 mb-4">
                      <span className="mr-2">📍</span>
                      <span className="truncate">{restaurant.address}</span>
                    </div>

                    {/* Packs Summary */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">Packs disponibles</span>
                        <span className="text-sm text-gray-600">
                          {getAvailablePacks(restaurant)} de {getTotalPacks(restaurant)}
                        </span>
                      </div>
                      
                      {restaurant.packs.slice(0, 2).map(pack => (
                        <div key={pack.id} className="flex justify-between items-center text-sm">
                          <span className="truncate">{pack.title}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-green-600 font-semibold">
                              ${pack.discountedPrice}
                            </span>
                            <span className="text-gray-400 line-through">
                              ${pack.originalPrice}
                            </span>
                            <span className="text-xs bg-red-100 text-red-800 px-1 rounded">
                              -{getDiscountPercentage(pack)}%
                            </span>
                          </div>
                        </div>
                      ))}
                      
                      {restaurant.packs.length > 2 && (
                        <p className="text-xs text-gray-500 mt-2">
                          +{restaurant.packs.length - 2} packs más
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <Link
                        href={`/establecimiento/${restaurant.id}`}
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white text-center py-2 px-4 rounded-lg font-medium transition-colors"
                      >
                        Ver Packs
                      </Link>
                      <Link
                        href={`/map?establishment=${restaurant.id}`}
                        className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
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
