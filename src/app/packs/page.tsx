'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import Head from 'next/head'
import Navigation from '@/components/Navigation'
// import PackCard from '@/components/PackCard' // TODO: Use this component
import EmptyState from '@/components/EmptyState'
import PackSkeleton from '@/components/PackSkeleton'

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

interface Post {
  id: string
  title: string
  content: string
  price: number | null
  images: string[]
  createdAt: string
  establishment: {
    id: string
    name: string
    address: string
    category: string
    image?: string
  }
}

const foodCategories = [
  { id: 'all', name: 'Todos', emoji: '🍽️', color: 'bg-gray-100 text-gray-700' },
  { id: 'bakery', name: 'Panadería', emoji: '🥖', color: 'bg-amber-100 text-amber-700' },
  { id: 'lunch', name: 'Almuerzo', emoji: '🍛', color: 'bg-orange-100 text-orange-700' },
  { id: 'dessert', name: 'Postres', emoji: '🍰', color: 'bg-pink-100 text-pink-700' },
  { id: 'coffee', name: 'Café', emoji: '☕', color: 'bg-brown-100 text-brown-700' },
  { id: 'healthy', name: 'Saludable', emoji: '🥗', color: 'bg-green-100 text-green-700' },
  { id: 'pizza', name: 'Pizza', emoji: '🍕', color: 'bg-red-100 text-red-700' },
  { id: 'asian', name: 'Asiática', emoji: '🥢', color: 'bg-yellow-100 text-yellow-700' },
]

export default function PacksExplorer() {
  const [packs, setPacks] = useState<Pack[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [filteredPacks, setFilteredPacks] = useState<Pack[]>([])
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const { data: session } = useSession()

  const getUniqueRestaurants = (packs: Pack[]) => {
    const restaurantMap = new Map()
    packs.forEach(pack => {
      if (!restaurantMap.has(pack.establishment.id)) {
        restaurantMap.set(pack.establishment.id, pack.establishment)
      }
    })
    return Array.from(restaurantMap.values())
  }

  const fetchPacks = async () => {
    console.log('🔄 Fetching packs and posts from API...')
    try {
      // Fetch packs
      const packsResponse = await fetch('/api/packs/public')
      if (packsResponse.ok) {
        const packsData = await packsResponse.json()
        console.log('📊 Public packs received:', packsData.length)
        
        const availablePacks = packsData.filter((pack: any) => {
          return pack.quantity > 0 && pack.isActive
        })

        console.log('✅ Total available packs:', availablePacks.length)
        setPacks(availablePacks)
      }

      // Fetch posts
      const postsResponse = await fetch('/api/posts')
      if (postsResponse.ok) {
        const postsData = await postsResponse.json()
        console.log('📱 Posts received:', postsData.data?.length || 0)
        setPosts(postsData.data || [])
      }
    } catch (error) {
      console.error('❌ Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterPacks = useCallback(() => {
    let filteredPacksData = packs
    let filteredPostsData = posts

    // Filter by category
    if (selectedCategory !== 'all') {
      filteredPacksData = filteredPacksData.filter(pack => {
        const category = pack.establishment.category.toLowerCase()
        switch (selectedCategory) {
          case 'bakery':
            return category.includes('bakery') || category.includes('panaderia')
          case 'lunch':
            return category.includes('restaurant') || category.includes('restaurante')
          case 'dessert':
            return category.includes('bakery') || pack.title.toLowerCase().includes('postre')
          case 'coffee':
            return category.includes('cafe') || category.includes('café')
          case 'healthy':
            return pack.title.toLowerCase().includes('salud') || pack.title.toLowerCase().includes('healthy')
          case 'pizza':
            return category.includes('restaurant') || pack.title.toLowerCase().includes('pizza')
          case 'asian':
            return pack.title.toLowerCase().includes('asian') || pack.title.toLowerCase().includes('sushi')
          default:
            return true
        }
      })

      filteredPostsData = filteredPostsData.filter(post => {
        const category = post.establishment.category.toLowerCase()
        switch (selectedCategory) {
          case 'bakery':
            return category.includes('bakery') || category.includes('panaderia')
          case 'lunch':
            return category.includes('restaurant') || category.includes('restaurante')
          case 'dessert':
            return category.includes('bakery') || post.title.toLowerCase().includes('postre')
          case 'coffee':
            return category.includes('cafe') || category.includes('café')
          case 'healthy':
            return post.title.toLowerCase().includes('salud') || post.content.toLowerCase().includes('healthy')
          case 'pizza':
            return category.includes('restaurant') || post.title.toLowerCase().includes('pizza')
          case 'asian':
            return post.title.toLowerCase().includes('asian') || post.title.toLowerCase().includes('sushi')
          default:
            return true
        }
      })
    }

    // Filter by search query
    if (searchQuery) {
      filteredPacksData = filteredPacksData.filter(
        pack =>
          pack.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          pack.establishment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          pack.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
      
      filteredPostsData = filteredPostsData.filter(
        post =>
          post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.establishment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredPacks(filteredPacksData)
    setFilteredPosts(filteredPostsData)
  }, [packs, posts, selectedCategory, searchQuery])

  useEffect(() => {
    fetchPacks()

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchPacks, 30000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    filterPacks()
  }, [packs, selectedCategory, searchQuery, filterPacks])

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
    <>
      <Head>
        <title>Packs Sorpresa Disponibles - FoodSave Bogotá | Reduce el Desperdicio de Comida</title>
        <meta 
          name="description" 
          content="Descubre packs sorpresa con hasta 70% de descuento en restaurantes de Bogotá. Salva comida, ahorra dinero y ayuda al planeta. ¡Más de 2,847 kg salvados este mes!" 
        />
        <meta name="keywords" content="comida, descuento, bogotá, restaurantes, sostenibilidad, desperdicio alimentario" />
        <meta property="og:title" content="Packs Sorpresa - FoodSave Bogotá" />
        <meta property="og:description" content="Comida deliciosa con hasta 70% de descuento. Ayuda a reducir el desperdicio alimentario en Bogotá." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://app-rho-sandy.vercel.app/packs" />
      </Head>
      
      <div className="min-h-screen bg-gray-50">
        <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" role="main">
        {/* Hero Section with Impact - Brand Identity */}
        <header className="text-center mb-8 sm:mb-12" role="banner">
          {/* Slogan de impacto */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-4 rounded-2xl mb-6 shadow-lg">
            <p className="text-sm sm:text-base font-semibold">
              🌱 Salva comida, ahorra dinero, ayuda al planeta
            </p>
          </div>
          
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <div></div>
            <button
              onClick={fetchPacks}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-full text-sm sm:text-base font-semibold transition-all transform hover:scale-105 shadow-lg flex items-center gap-2"
            >
              <span className="animate-pulse">🔄</span>
              Ver nuevos packs disponibles
            </button>
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-4 sm:mb-6 leading-tight px-4">
            🍽️ Packs Sorpresa
            <br />
            <span className="text-green-600">Disponibles Ahora</span>
          </h1>
          
          <p className="text-lg sm:text-xl md:text-2xl text-gray-600 font-medium px-4 mb-4">
            Comida deliciosa con hasta{' '}
            <span className="text-green-600 font-bold">70% de descuento</span>
          </p>
          
          {/* Sección de impacto */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mx-4 sm:mx-auto max-w-lg">
            <p className="text-green-800 font-semibold text-sm sm:text-base">
              🌍 Este mes hemos salvado <span className="text-green-600 font-bold">2,847 kg</span> de comida en Bogotá
            </p>
          </div>
        </header>

        {/* Search Bar - Full Width */}
        <div className="max-w-2xl mx-auto mb-10">
          <div className="relative">
            <input
              type="text"
              placeholder="🔍 Buscar restaurantes, comida o tipo de cocina..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full px-6 py-5 pl-16 pr-6 text-lg text-gray-700 bg-white border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 shadow-lg transition-all"
              aria-label="Buscar packs sorpresa por restaurante o tipo de comida"
              role="searchbox"
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
                  : `${category.color} hover:bg-green-50 border-2 border-gray-200 hover:border-green-300 shadow-sm`
              }`}
            >
              <span className="text-base mr-1">{category.emoji}</span>
              {category.name}
            </button>
          ))}
        </div>

        {/* Loading State with Skeletons */}
        {isLoading && (
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 px-2 sm:px-0">
            {[1, 2, 3, 4].map(i => (
              <PackSkeleton key={i} />
            ))}
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
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 px-2 sm:px-0">
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
                    className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all transform hover:-translate-y-1 border border-gray-100"
                  >
                    {/* Restaurant Image with Category Badge */}
                    <div className="relative h-32 sm:h-48 bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600 flex items-center justify-center">
                      <span className="text-4xl sm:text-6xl text-white drop-shadow-lg">🍽️</span>
                      {/* Category Badge */}
                      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full">
                        <span className="text-xs font-semibold text-gray-700 capitalize">
                          {restaurant.category.toLowerCase()}
                        </span>
                      </div>
                      {/* Distance Badge (placeholder) */}
                      <div className="absolute top-3 right-3 bg-green-500/90 backdrop-blur-sm px-2 py-1 rounded-full">
                        <span className="text-xs font-semibold text-white">
                          📍 2.1 km
                        </span>
                      </div>
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

                      {/* Packs Disponibles - Rediseñado */}
                      {activePacks.length > 0 && (
                        <div className="space-y-3">
                          {activePacks.slice(0, 2).map(pack => (
                            <div
                              key={pack.id}
                              className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200 hover:border-green-300 transition-all"
                            >
                              {/* Pack Header */}
                              <div className="flex justify-between items-start mb-3">
                                <div className="flex-1">
                                  <h4 className="font-bold text-gray-900 mb-1">
                                    📦 {pack.title}
                                  </h4>
                                  <p className="text-sm text-gray-600 line-clamp-2">
                                    {pack.description}
                                  </p>
                                </div>
                                <div className="ml-3 text-right">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm text-gray-500 line-through">
                                      ${pack.originalPrice.toFixed(2)}
                                    </span>
                                    <span className="font-bold text-green-600 text-lg">
                                      ${pack.discountedPrice.toFixed(2)}
                                    </span>
                                  </div>
                                  <div className="text-xs text-green-600 font-semibold">
                                    {Math.round(((pack.originalPrice - pack.discountedPrice) / pack.originalPrice) * 100)}% OFF
                                  </div>
                                </div>
                              </div>
                              
                              {/* Pack Info */}
                              <div className="flex justify-between items-center mb-3">
                                <div className="flex items-center gap-4">
                                  <div className="flex items-center gap-1">
                                    <span className="text-green-600">⏰</span>
                                    <span className="text-sm font-medium text-gray-700">
                                      {pack.pickupTimeStart.slice(0, 5)} - {pack.pickupTimeEnd.slice(0, 5)}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <span className="text-orange-500">📦</span>
                                    <span className="text-sm font-medium text-gray-700">
                                      {pack.quantity} disponibles
                                    </span>
                                  </div>
                                </div>
                              </div>
                              
                              {/* CTA Button */}
                              <button
                                onClick={() => handleReservePack(pack.id, 1)}
                                className="group w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 px-4 rounded-xl transition-all transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 active:scale-95 focus:ring-4 focus:ring-green-200"
                              >
                                <span className="group-hover:animate-bounce">🛒</span>
                                <span className="group-hover:tracking-wide transition-all">
                                  Reservar Pack Sorpresa
                                </span>
                              </button>
                            </div>
                          ))}
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

        {/* Posts Section */}
        {!isLoading && filteredPosts.length > 0 && (
          <div className="mt-12 px-2 sm:px-0">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 text-center">
              📱 Publicaciones Recientes
            </h2>
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {filteredPosts.map(post => (
                <div key={post.id} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                  <div className="mb-3">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {post.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      🏪 {post.establishment.name}
                    </p>
                  </div>
                  <p className="text-gray-700 mb-4 line-clamp-3">
                    {post.content}
                  </p>
                  {post.price && (
                    <div className="text-green-600 font-bold text-lg mb-3">
                      💰 ${post.price.toFixed(2)}
                    </div>
                  )}
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>{new Date(post.createdAt).toLocaleDateString('es-ES')}</span>
                    <a
                      href={`/establecimiento/${post.establishment.id}`}
                      className="text-green-600 hover:text-green-700 font-semibold"
                    >
                      Ver restaurante →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredPacks.length === 0 && filteredPosts.length === 0 && (
          <EmptyState
            searchQuery={searchQuery}
            selectedCategory={selectedCategory}
            totalPacks={packs.length}
          />
        )}
      </main>
      </div>
    </>
  )
}
