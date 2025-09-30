'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Navigation from '@/components/Navigation'
// import PackCard from '@/components/PackCard' // TODO: Use this component
import EmptyState from '@/components/EmptyState'

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
  establishment: {
    id: string
    name: string
    address: string
    category: string
    image?: string
  }
}

const foodCategories = [
  { id: 'all', name: 'Todos', emoji: '🍽️' },
  { id: 'pizza', name: 'Pizza', emoji: '🍕' },
  { id: 'healthy', name: 'Saludable', emoji: '🥗' },
  { id: 'sushi', name: 'Sushi', emoji: '🍣' },
  { id: 'burger', name: 'Hamburguesas', emoji: '🍔' },
  { id: 'dessert', name: 'Postres', emoji: '🍰' },
  { id: 'coffee', name: 'Café', emoji: '☕' },
  { id: 'asian', name: 'Asiática', emoji: '🥢' },
  { id: 'mexican', name: 'Mexicana', emoji: '🌮' },
]

export default function PacksExplorer() {
  const { data: session } = useSession()
  const [packs, setPacks] = useState<Pack[]>([])
  const [filteredPacks, setFilteredPacks] = useState<Pack[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const getUniqueRestaurants = (packs: Pack[]) => {
    const restaurantMap = new Map()
    packs.forEach(pack => {
      if (!restaurantMap.has(pack.establishment.id)) {
        restaurantMap.set(pack.establishment.id, pack.establishment)
      }
    })
    return Array.from(restaurantMap.values())
  }

  useEffect(() => {
    fetchPacks()

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchPacks, 30000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    filterPacks()
  }, [packs, selectedCategory, searchQuery])

  const fetchPacks = async () => {
    console.log('🔄 Fetching packs from API...')
    try {
      const response = await fetch('/api/packs/public')
      if (response.ok) {
        const packs = await response.json()
        console.log('📊 Public packs received:', packs.length)
        
        // Filter packs that have quantity > 0
        const availablePacks = packs.filter((pack: any) => {
          const isAvailable = pack.quantity > 0 && pack.isActive
          console.log(
            `📦 Pack ${pack.title}: quantity=${pack.quantity}, isActive=${pack.isActive}, available=${isAvailable}`
          )
          return isAvailable
        })

        console.log('✅ Total available packs:', availablePacks.length)
        setPacks(availablePacks)
      } else {
        console.error('❌ API response not OK:', response.status)
      }
    } catch (error) {
      console.error('❌ Error fetching packs:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterPacks = () => {
    let filtered = packs

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(pack => {
        const category = pack.establishment.category.toLowerCase()
        switch (selectedCategory) {
          case 'pizza':
            return (
              category.includes('restaurant') ||
              pack.title.toLowerCase().includes('pizza')
            )
          case 'healthy':
            return (
              pack.title.toLowerCase().includes('healthy') ||
              pack.title.toLowerCase().includes('salad')
            )
          case 'sushi':
            return (
              pack.title.toLowerCase().includes('sushi') ||
              category.includes('restaurant')
            )
          case 'burger':
            return (
              pack.title.toLowerCase().includes('burger') ||
              pack.title.toLowerCase().includes('hamburger')
            )
          case 'dessert':
            return (
              category.includes('bakery') ||
              pack.title.toLowerCase().includes('dessert')
            )
          case 'coffee':
            return category.includes('cafe') || category.includes('bakery')
          case 'asian':
            return (
              pack.title.toLowerCase().includes('asian') ||
              pack.title.toLowerCase().includes('chinese')
            )
          case 'mexican':
            return (
              pack.title.toLowerCase().includes('mexican') ||
              pack.title.toLowerCase().includes('taco')
            )
          default:
            return true
        }
      })
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        pack =>
          pack.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          pack.establishment.name
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          pack.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredPacks(filtered)
  }

  const handleReservePack = async (packId: string, quantity: number) => {
    if (!session) {
      // Redirect to login
      window.location.href = '/auth/signin'
      return
    }

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          packId,
          quantity,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        // Redirect to payment
        window.location.href = data.paymentUrl
      } else {
        const error = await response.json()
        alert(error.message || 'Failed to reserve pack')
      }
    } catch (error) {
      console.error('Error reserving pack:', error)
      alert('An error occurred while reserving the pack')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header - Mobile Optimized */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <div></div>
            <button
              onClick={fetchPacks}
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors"
            >
              🔄 Actualizar
            </button>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-4 sm:mb-6 leading-tight px-4">
            🍽️ Packs Disponibles
            <br />
            <span className="text-green-600">Cerca de Ti</span>
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-600 font-medium px-4">
            Descubre packs sorpresa con hasta{' '}
            <span className="text-green-600 font-bold">50% de descuento</span>
          </p>
        </div>

        {/* Search Bar - Full Width */}
        <div className="max-w-2xl mx-auto mb-10">
          <div className="relative">
            <input
              type="text"
              placeholder="🔍 Buscar restaurantes, comida o tipo de cocina..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full px-6 py-5 pl-16 pr-6 text-lg text-gray-700 bg-white border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 shadow-lg transition-all"
            />
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <svg
                className="h-7 w-7 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-4 flex items-center"
              >
                <svg
                  className="h-5 w-5 text-gray-400 hover:text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Category Filters - Mobile Optimized */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-6 sm:mb-10 px-2">
          {foodCategories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`inline-flex items-center px-3 py-2 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold transition-all transform hover:scale-105 ${
                selectedCategory === category.id
                  ? 'bg-green-500 text-white shadow-lg ring-2 ring-green-200'
                  : 'bg-white text-gray-700 hover:bg-green-50 border-2 border-gray-200 hover:border-green-300 shadow-sm'
              }`}
            >
              <span className="text-base mr-1">{category.emoji}</span>
              {category.name}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
          </div>
        )}

        {/* Restaurant Cards with Time Slots */}
        {!isLoading && filteredPacks.length > 0 && (
          <>
            <div className="mb-6 text-center">
              <p className="text-gray-600">
                {getUniqueRestaurants(filteredPacks).length} restaurante
                {getUniqueRestaurants(filteredPacks).length !== 1
                  ? 's'
                  : ''}{' '}
                con packs disponibles
              </p>
            </div>
            <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 px-2 sm:px-0">
              {getUniqueRestaurants(filteredPacks).map(restaurant => {
                const restaurantPacks = filteredPacks.filter(
                  pack => pack.establishment.id === restaurant.id
                )
                const activePacks = restaurantPacks.filter(
                  pack => pack.quantity > 0
                )
                const upcomingPacks = restaurantPacks.filter(
                  pack =>
                    pack.quantity > 0 &&
                    new Date(pack.availableFrom) > new Date()
                )

                return (
                  <div
                    key={restaurant.id}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    {/* Restaurant Image Placeholder - Mobile Optimized */}
                    <div className="h-32 sm:h-48 bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center">
                      <span className="text-4xl sm:text-6xl text-white">🍽️</span>
                    </div>

                    <div className="p-4 sm:p-6">
                      <div className="mb-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">
                              {restaurant.name} 🍽️
                            </h3>
                            <p className="text-xs sm:text-sm text-gray-600">
                              {restaurant.address}
                            </p>
                            <p className="text-xs text-gray-500 capitalize">
                              {restaurant.category.toLowerCase()}
                            </p>
                          </div>
                          <a
                            href={`/establecimiento/${restaurant.id}`}
                            className="text-gray-400 hover:text-fresh-600 transition-colors p-1"
                            title="Ver perfil completo"
                          >
                            <span className="text-lg">👁️</span>
                          </a>
                        </div>
                      </div>

                      {/* Active Time Slots */}
                      {activePacks.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-sm font-semibold text-green-800 mb-2 flex items-center">
                            🟢 Horarios Activos
                          </h4>
                          <div className="space-y-2">
                            {activePacks.slice(0, 2).map(pack => (
                              <div
                                key={pack.id}
                                className="flex justify-between items-center bg-green-50 rounded-lg p-3 border border-green-200"
                              >
                                <div>
                                  <div className="font-medium text-green-800">
                                    {pack.pickupTimeStart.slice(0, 5)} -{' '}
                                    {pack.pickupTimeEnd.slice(0, 5)}
                                  </div>
                                  <div className="text-sm text-green-600">
                                    {pack.quantity} packs restantes
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="font-bold text-green-600">
                                    ${pack.discountedPrice.toFixed(2)}
                                  </div>
                                  <button
                                    onClick={() =>
                                      handleReservePack(pack.id, 1)
                                    }
                                    className="bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-1 rounded-full transition-colors mt-1"
                                  >
                                    Reservar
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Upcoming Time Slots */}
                      {upcomingPacks.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-sm font-semibold text-blue-800 mb-2 flex items-center">
                            🔜 Próximos Horarios
                          </h4>
                          <div className="space-y-2">
                            {upcomingPacks.slice(0, 2).map(pack => (
                              <div
                                key={pack.id}
                                className="flex justify-between items-center bg-blue-50 rounded-lg p-3 border border-blue-200"
                              >
                                <div>
                                  <div className="font-medium text-blue-800">
                                    {pack.pickupTimeStart.slice(0, 5)} -{' '}
                                    {pack.pickupTimeEnd.slice(0, 5)}
                                  </div>
                                  <div className="text-sm text-blue-600">
                                    {new Date(
                                      pack.availableFrom
                                    ).toLocaleDateString()}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="font-bold text-blue-600">
                                    ${pack.discountedPrice.toFixed(2)}
                                  </div>
                                  <div className="text-xs text-blue-500">
                                    {pack.quantity} disponibles
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Main Action Button */}
                      {activePacks.length > 0 ? (
                        <button
                          onClick={() =>
                            handleReservePack(activePacks[0].id, 1)
                          }
                          className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                        >
                          🚀 Reservar Ahora
                        </button>
                      ) : (
                        <button
                          disabled
                          className="w-full bg-gray-300 text-gray-500 font-medium py-3 px-4 rounded-lg cursor-not-allowed"
                        >
                          Sin horarios activos
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}

        {/* Empty State */}
        {!isLoading && filteredPacks.length === 0 && (
          <EmptyState
            searchQuery={searchQuery}
            selectedCategory={selectedCategory}
            totalPacks={packs.length}
          />
        )}
      </div>
    </div>
  )
}
