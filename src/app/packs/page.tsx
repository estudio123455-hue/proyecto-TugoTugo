'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import Head from 'next/head'
import Navigation from '@/components/Navigation'
import GlobalHeader from '@/components/GlobalHeader'
import MapLibreMap, { MapLocation } from '@/components/MapLibreMap'
// import PackCard from '@/components/PackCard' // TODO: Use this component
import EmptyState from '@/components/EmptyState'
import PackSkeleton from '@/components/PackSkeleton'
import LogoutButton from '@/components/LogoutButton'
import { Map as MapIcon, List } from 'lucide-react'

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
    latitude?: number
    longitude?: number
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
  { id: 'all', name: 'Todos', emoji: '🍽️', color: 'bg-gray-200 text-gray-900' },
  { id: 'bakery', name: 'Panadería', emoji: '🥖', color: 'bg-amber-200 text-amber-900' },
  { id: 'lunch', name: 'Almuerzo', emoji: '🍛', color: 'bg-orange-200 text-orange-900' },
  { id: 'dessert', name: 'Postres', emoji: '🍰', color: 'bg-pink-200 text-pink-900' },
  { id: 'coffee', name: 'Café', emoji: '☕', color: 'bg-amber-200 text-amber-900' },
  { id: 'healthy', name: 'Saludable', emoji: '🥗', color: 'bg-green-200 text-green-900' },
  { id: 'pizza', name: 'Pizza', emoji: '🍕', color: 'bg-red-200 text-red-900' },
  { id: 'asian', name: 'Asiática', emoji: '🥢', color: 'bg-yellow-200 text-yellow-900' },
]

export default function PacksExplorer() {
  const [packs, setPacks] = useState<Pack[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [filteredPacks, setFilteredPacks] = useState<Pack[]>([])
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list')
  const [selectedPackOnMap, setSelectedPackOnMap] = useState<Pack | null>(null)
  
  // Nuevos filtros avanzados
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100 })
  const [sortBy, setSortBy] = useState('distance') // distance, price, rating, newest
  const [showFilters, setShowFilters] = useState(false)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const { data: session } = useSession()

  // Función para obtener geolocalización
  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
          console.log('📍 Ubicación obtenida:', position.coords.latitude, position.coords.longitude)
        },
        (error) => {
          console.log('❌ Error obteniendo ubicación:', error)
          // Ubicación por defecto (Madrid, España)
          setUserLocation({ lat: 40.4168, lng: -3.7038 })
        }
      )
    } else {
      // Ubicación por defecto si no hay geolocalización
      setUserLocation({ lat: 40.4168, lng: -3.7038 })
    }
  }

  // Función para calcular distancia entre dos puntos
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371 // Radio de la Tierra en km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  const getUniqueRestaurants = (packs: Pack[]) => {
    const restaurantMap = new Map()
    packs.forEach(pack => {
      if (!restaurantMap.has(pack.establishment.id)) {
        restaurantMap.set(pack.establishment.id, pack.establishment)
      }
    })
    return Array.from(restaurantMap.values())
  }

  const fetchPacks = useCallback(async () => {
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
  }, [])

  useEffect(() => {
    fetchPacks()
    getUserLocation() // Obtener ubicación del usuario

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchPacks, 30000)

    return () => clearInterval(interval)
  }, [fetchPacks])

  useEffect(() => {
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

    // Filtrar por rango de precio
    filteredPacksData = filteredPacksData.filter(pack => 
      pack.discountedPrice >= priceRange.min && pack.discountedPrice <= priceRange.max
    )

    // Agregar distancia a cada pack si tenemos ubicación del usuario
    if (userLocation) {
      filteredPacksData = filteredPacksData.map(pack => ({
        ...pack,
        distance: pack.establishment.latitude && pack.establishment.longitude 
          ? calculateDistance(
              userLocation.lat, 
              userLocation.lng, 
              pack.establishment.latitude, 
              pack.establishment.longitude
            )
          : 999 // Si no tiene coordenadas, poner distancia muy alta
      }))
    }

    // Ordenar según el criterio seleccionado
    switch (sortBy) {
      case 'distance':
        if (userLocation) {
          filteredPacksData.sort((a: any, b: any) => (a.distance || 999) - (b.distance || 999))
        }
        break
      case 'price':
        filteredPacksData.sort((a, b) => a.discountedPrice - b.discountedPrice)
        break
      case 'newest':
        filteredPacksData.sort((a, b) => new Date(b.availableFrom).getTime() - new Date(a.availableFrom).getTime())
        break
      default:
        break
    }

    setFilteredPacks(filteredPacksData)
    setFilteredPosts(filteredPostsData)
  }, [packs, posts, selectedCategory, searchQuery, priceRange, sortBy, userLocation])

  const handleReservePack = async (packId: string, quantity: number) => {
    if (!session) {
      // Redirect to login
      window.location.href = '/auth/signin'
      return
    }

    // Mostrar confirmación con detalles del pack
    const pack = filteredPacks.find(p => p.id === packId)
    if (!pack) return

    const confirmed = confirm(
      `¿Confirmar compra?\n\n` +
      `Pack: ${pack.title}\n` +
      `Restaurante: ${pack.establishment.name}\n` +
      `Precio: $${pack.discountedPrice.toFixed(2)}\n` +
      `Cantidad: ${quantity}\n\n` +
      `Total: $${(pack.discountedPrice * quantity * 1.19).toFixed(2)} (incluye IVA)`
    )

    if (!confirmed) return

    try {
      // Mostrar loading
      const button = document.querySelector(`[data-pack-id="${packId}"]`) as HTMLButtonElement
      if (button) {
        button.disabled = true
        button.innerHTML = '⏳ Procesando...'
      }

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          packId,
          quantity,
          paymentMethod: 'card'
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Redirigir a página de éxito
        window.location.href = data.data.checkoutUrl
      } else {
        alert(data.message || 'Error procesando el pago')
        // Restaurar botón
        if (button) {
          button.disabled = false
          button.innerHTML = '🛒 Reservar Pack Sorpresa'
        }
      }
    } catch (error) {
      console.error('Error en checkout:', error)
      alert('Error de conexión. Intenta de nuevo.')
      
      // Restaurar botón
      const button = document.querySelector(`[data-pack-id="${packId}"]`) as HTMLButtonElement
      if (button) {
        button.disabled = false
        button.innerHTML = '🛒 Reservar Pack Sorpresa'
      }
    }
  }

  // Convertir packs a ubicaciones de mapa
  const mapLocations: MapLocation[] = filteredPacks
    .filter((pack) => pack.establishment?.latitude && pack.establishment?.longitude)
    .map((pack) => ({
      id: pack.id,
      latitude: pack.establishment.latitude!,
      longitude: pack.establishment.longitude!,
      title: pack.establishment.name,
      description: pack.title,
      price: pack.discountedPrice,
      image: pack.establishment.image,
    }))

  const handleLocationClick = (location: MapLocation) => {
    const pack = filteredPacks.find((p) => p.id === location.id)
    if (pack) {
      setSelectedPackOnMap(pack)
    }
  }

  return (
    <>
      <Head>
        <title>Packs Sorpresa Disponibles - Zavo Bogotá | Reduce el Desperdicio de Comida</title>
        <meta 
          name="description" 
          content="Descubre packs sorpresa con hasta 70% de descuento en restaurantes de Bogotá. Salva comida, ahorra dinero y ayuda al planeta. ¡Más de 2,847 kg salvados este mes!" 
        />
        <meta name="keywords" content="comida, descuento, bogotá, restaurantes, sostenibilidad, desperdicio alimentario" />
        <meta property="og:title" content="Packs Sorpresa - Zavo Bogotá" />
        <meta property="og:description" content="Comida deliciosa con hasta 70% de descuento. Ayuda a reducir el desperdicio alimentario en Bogotá." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://app-rho-sandy.vercel.app/packs" />
      </Head>
      
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <GlobalHeader 
          title="Packs Disponibles"
          actions={
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode(viewMode === 'list' ? 'map' : 'list')}
                className="p-2 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                title={viewMode === 'list' ? 'Ver Mapa' : 'Ver Lista'}
              >
                {viewMode === 'list' ? <MapIcon className="w-5 h-5" /> : <List className="w-5 h-5" />}
              </button>
            </div>
          }
        />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-8" role="main">
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

        {/* Panel de Filtros Avanzados */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            {/* Header del panel de filtros */}
            <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center justify-between w-full text-left"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Filtros Avanzados</h3>
                    <p className="text-sm text-gray-600">Personaliza tu búsqueda</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {userLocation && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      📍 Ubicación detectada
                    </span>
                  )}
                  <svg 
                    className={`w-5 h-5 text-gray-400 transition-transform ${showFilters ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>
            </div>

            {/* Contenido del panel de filtros */}
            {showFilters && (
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  
                  {/* Filtro de Precio */}
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">
                      💰 Rango de Precio
                    </label>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>${priceRange.min}</span>
                        <span>${priceRange.max}</span>
                      </div>
                      <div className="space-y-2">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={priceRange.min}
                          onChange={(e) => setPriceRange({...priceRange, min: parseInt(e.target.value)})}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                          style={{
                            background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${priceRange.min}%, #E5E7EB ${priceRange.min}%, #E5E7EB 100%)`
                          }}
                        />
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={priceRange.max}
                          onChange={(e) => setPriceRange({...priceRange, max: parseInt(e.target.value)})}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                          style={{
                            background: `linear-gradient(to right, #E5E7EB 0%, #E5E7EB ${priceRange.max}%, #3B82F6 ${priceRange.max}%, #3B82F6 100%)`
                          }}
                        />
                      </div>
                      <div className="flex space-x-2">
                        <input
                          type="number"
                          placeholder="Min"
                          value={priceRange.min}
                          onChange={(e) => setPriceRange({...priceRange, min: parseInt(e.target.value) || 0})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                        <input
                          type="number"
                          placeholder="Max"
                          value={priceRange.max}
                          onChange={(e) => setPriceRange({...priceRange, max: parseInt(e.target.value) || 100})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Selector de Ordenamiento */}
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">
                      📊 Ordenar por
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="distance">📍 Distancia (más cerca)</option>
                      <option value="price">💰 Precio (más barato)</option>
                      <option value="newest">🆕 Más recientes</option>
                    </select>
                  </div>

                  {/* Botón de Ubicación */}
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">
                      📍 Mi Ubicación
                    </label>
                    <button
                      onClick={getUserLocation}
                      className={`w-full px-4 py-3 rounded-lg font-medium transition-all ${
                        userLocation 
                          ? 'bg-green-100 text-green-800 border border-green-300' 
                          : 'bg-blue-500 text-white hover:bg-blue-600'
                      }`}
                    >
                      {userLocation ? (
                        <span className="flex items-center justify-center space-x-2">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span>Ubicación obtenida</span>
                        </span>
                      ) : (
                        <span className="flex items-center justify-center space-x-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>Obtener mi ubicación</span>
                        </span>
                      )}
                    </button>
                    {userLocation && (
                      <p className="text-xs text-gray-500 text-center">
                        Lat: {userLocation.lat.toFixed(4)}, Lng: {userLocation.lng.toFixed(4)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Resumen de filtros activos */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">Filtros activos:</span>
                    
                    {(priceRange.min > 0 || priceRange.max < 100) && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        💰 ${priceRange.min} - ${priceRange.max}
                        <button
                          onClick={() => setPriceRange({min: 0, max: 100})}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    )}
                    
                    {sortBy !== 'distance' && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        📊 {sortBy === 'price' ? 'Por precio' : 'Más recientes'}
                        <button
                          onClick={() => setSortBy('distance')}
                          className="ml-2 text-purple-600 hover:text-purple-800"
                        >
                          ×
                        </button>
                      </span>
                    )}
                    
                    {userLocation && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        📍 Con ubicación
                      </span>
                    )}
                    
                    {/* Botón limpiar todos los filtros */}
                    {((priceRange.min > 0 || priceRange.max < 100) || sortBy !== 'distance') && (
                      <button
                        onClick={() => {
                          setPriceRange({min: 0, max: 100})
                          setSortBy('distance')
                        }}
                        className="text-xs text-gray-500 hover:text-gray-700 underline"
                      >
                        Limpiar todos
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* View Toggle & Category Filters */}
        <div className="space-y-4 mb-6 sm:mb-10">
          {/* View Mode Toggle */}
          <div className="flex justify-center">
            <div className="inline-flex bg-white rounded-xl p-1 shadow-md border border-gray-200">
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                  viewMode === 'list'
                    ? 'bg-green-500 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <List className="w-4 h-4" />
                <span className="text-sm font-medium">Lista</span>
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                  viewMode === 'map'
                    ? 'bg-green-500 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <MapIcon className="w-4 h-4" />
                <span className="text-sm font-medium">Mapa</span>
              </button>
            </div>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 px-2">
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
        </div>

        {/* Loading State with Skeletons */}
        {isLoading && (
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 px-2 sm:px-0">
            {[1, 2, 3, 4].map(i => (
              <PackSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Map View */}
        {!isLoading && viewMode === 'map' && (
          <div className="space-y-6 px-2 sm:px-0">
            {filteredPacks.length === 0 ? (
              <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                <div className="text-6xl mb-4">📦</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  No hay packs disponibles
                </h3>
                <p className="text-gray-600 mb-6">
                  Aún no hay packs creados en el sistema.
                  <br />
                  Los restaurantes pueden crear packs desde su dashboard.
                </p>
              </div>
            ) : mapLocations.length === 0 ? (
              <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                <div className="text-6xl mb-4">🗺️</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  No hay ubicaciones disponibles en el mapa
                </h3>
                <p className="text-gray-600 mb-6">
                  Los restaurantes aún no han configurado sus coordenadas de ubicación.
                  <br />
                  Por favor, usa la vista de lista para ver los packs disponibles.
                </p>
                <button
                  onClick={() => setViewMode('list')}
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Ver en Lista
                </button>
              </div>
            ) : (
              <>
                <div className="mb-4 text-center">
                  <p className="text-gray-600">
                    {mapLocations.length} ubicación{mapLocations.length !== 1 ? 'es' : ''} en el mapa
                  </p>
                </div>
                
                <MapLibreMap
                  locations={mapLocations}
                  onLocationClick={handleLocationClick}
                  height="600px"
                  showUserLocation={true}
                  userLocation={userLocation}
                  center={userLocation ? { latitude: userLocation.lat, longitude: userLocation.lng } : undefined}
                  zoom={userLocation ? 14 : 12}
                  onMapMove={(center, zoom) => {
                    console.log('Mapa movido:', center, 'Zoom:', zoom)
                  }}
                />
              </>
            )}

            {/* Selected Pack Details */}
            {selectedPackOnMap && (
              <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-green-500">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {selectedPackOnMap.establishment.name}
                    </h3>
                    <p className="text-gray-600 mb-2">{selectedPackOnMap.title}</p>
                    <p className="text-sm text-gray-500 mb-3">
                      {selectedPackOnMap.description}
                    </p>
                    <p className="text-sm text-gray-600">
                      📍 {selectedPackOnMap.establishment.address}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedPackOnMap(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm text-gray-500 line-through">
                        ${selectedPackOnMap.originalPrice.toFixed(2)}
                      </span>
                      <span className="text-3xl font-bold text-green-600">
                        ${selectedPackOnMap.discountedPrice.toFixed(2)}
                      </span>
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold">
                        {Math.round(((selectedPackOnMap.originalPrice - selectedPackOnMap.discountedPrice) / selectedPackOnMap.originalPrice) * 100)}% OFF
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>⏰ {selectedPackOnMap.pickupTimeStart.slice(0, 5)} - {selectedPackOnMap.pickupTimeEnd.slice(0, 5)}</span>
                      <span>📦 {selectedPackOnMap.quantity} disponibles</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleReservePack(selectedPackOnMap.id, 1)}
                    className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-xl font-bold transition-all transform hover:scale-105 shadow-lg"
                  >
                    Reservar Ahora
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Restaurant Cards with Time Slots */}
        {!isLoading && viewMode === 'list' && filteredPacks.length > 0 && (
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
                      {/* Distance Badge */}
                      {userLocation && restaurant.latitude && restaurant.longitude && (
                        <div className="absolute top-3 right-3 bg-green-500/90 backdrop-blur-sm px-2 py-1 rounded-full">
                          <span className="text-xs font-semibold text-white">
                            📍 {calculateDistance(
                              userLocation.lat, 
                              userLocation.lng, 
                              restaurant.latitude, 
                              restaurant.longitude
                            ).toFixed(1)} km
                          </span>
                        </div>
                      )}
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
                                <div className="flex items-center gap-4 flex-wrap">
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
                                  {/* Indicador de distancia individual */}
                                  {userLocation && pack.establishment.latitude && pack.establishment.longitude && (
                                    <div className="flex items-center gap-1">
                                      <span className="text-blue-500">📍</span>
                                      <span className="text-sm font-medium text-blue-700">
                                        {calculateDistance(
                                          userLocation.lat, 
                                          userLocation.lng, 
                                          pack.establishment.latitude, 
                                          pack.establishment.longitude
                                        ).toFixed(1)} km
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              {/* CTA Button */}
                              <button
                                onClick={() => handleReservePack(pack.id, 1)}
                                data-pack-id={pack.id}
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
