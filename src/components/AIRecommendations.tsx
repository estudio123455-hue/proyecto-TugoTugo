'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
// TODO: Install framer-motion package and uncomment
// import { motion } from 'framer-motion'
import { MapPin, Clock, Star, Zap } from 'lucide-react'

interface RecommendedPack {
  id: string
  title: string
  description: string
  price: number
  originalPrice: number
  category: string
  availableUntil: Date
  quantity: number
  establishment: {
    id: string
    name: string
    address: string
    rating: number
    imageUrl?: string
  }
  recommendationScore: number
  recommendationReasons: string[]
  distance?: number
}

interface UserPreferences {
  favoriteCategories: string[]
  priceRange: { min: number; max: number }
  totalOrders: number
}

const AIRecommendations = () => {
  const { data: session } = useSession()
  const [recommendations, setRecommendations] = useState<RecommendedPack[]>([])
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null)
  const [loading, setLoading] = useState(true)
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)

  useEffect(() => {
    if (session?.user?.id) {
      getCurrentLocation()
    }
  }, [session])

  useEffect(() => {
    if (location) {
      fetchRecommendations()
    }
  }, [location])

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        },
        (error) => {
          console.error('Error getting location:', error)
          // Use default location (e.g., city center)
          setLocation({ lat: -34.6037, lng: -58.3816 }) // Buenos Aires
        }
      )
    } else {
      setLocation({ lat: -34.6037, lng: -58.3816 })
    }
  }

  const fetchRecommendations = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        limit: '8',
        lat: location?.lat.toString() || '0',
        lng: location?.lng.toString() || '0',
      })

      const response = await fetch(`/api/recommendations?${params}`)
      if (response.ok) {
        const data = await response.json()
        setRecommendations(data.recommendations)
        setUserPreferences(data.userPreferences)
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatTimeRemaining = (availableUntil: Date) => {
    const now = new Date()
    const timeLeft = new Date(availableUntil).getTime() - now.getTime()
    const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60))
    const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60))

    if (hoursLeft > 0) {
      return `${hoursLeft}h ${minutesLeft}m`
    }
    return `${minutesLeft}m`
  }

  const getDiscountPercentage = (original: number, current: number) => {
    return Math.round(((original - current) / original) * 100)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-tugo-500 to-terracota-500 rounded-xl flex items-center justify-center animate-pulse">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-32 mt-2 animate-pulse"></div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 shadow-soft animate-pulse">
              <div className="h-32 bg-gray-200 rounded-xl mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!recommendations.length) {
    return (
      <div className="bg-white rounded-3xl p-8 shadow-soft text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-tugo-500 to-terracota-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Zap className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">¡Pronto tendrás recomendaciones!</h3>
        <p className="text-gray-600 mb-4">
          Rescata algunos packs para que nuestra IA aprenda tus preferencias y te recomiende los mejores.
        </p>
        <Link
          href="/packs"
          className="inline-flex items-center gap-2 bg-tugo-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-tugo-600 transition-colors"
        >
          <span>Explorar Packs</span>
          <span>→</span>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-tugo-500 to-terracota-500 rounded-xl flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Recomendado para ti</h2>
            <p className="text-sm text-gray-600">
              Basado en tus {userPreferences?.totalOrders || 0} pedidos anteriores
            </p>
          </div>
        </div>

        <button
          onClick={fetchRecommendations}
          className="text-tugo-600 hover:text-tugo-700 font-medium text-sm transition-colors"
        >
          Actualizar
        </button>
      </div>

      {/* User Preferences Summary */}
      {userPreferences && (
        <div className="bg-gradient-to-r from-tugo-50 to-terracota-50 rounded-2xl p-4">
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-gray-600">Tus favoritos:</span>
            {userPreferences.favoriteCategories.map((category) => (
              <span
                key={category}
                className="bg-white px-3 py-1 rounded-full text-sm font-medium text-tugo-700 border border-tugo-200"
              >
                {category}
              </span>
            ))}
            <span className="bg-white px-3 py-1 rounded-full text-sm font-medium text-gray-700 border border-gray-200">
              ${userPreferences.priceRange.min}-${userPreferences.priceRange.max}
            </span>
          </div>
        </div>
      )}

      {/* Recommendations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {recommendations.map((pack, index) => (
          <div
            key={pack.id}
            // TODO: Restore motion animations when framer-motion is installed
            // initial={{ opacity: 0, y: 20 }}
            // animate={{ opacity: 1, y: 0 }}
            // transition={{ delay: index * 0.1 }}
            className="bg-white rounded-2xl overflow-hidden shadow-soft hover:shadow-lg transition-all hover:-translate-y-1 group"
          >
            <Link href={`/packs/${pack.id}`}>
              <div className="relative">
                {/* Pack Image */}
                <div className="h-32 bg-gradient-to-br from-tugo-100 to-terracota-100 flex items-center justify-center relative overflow-hidden">
                  {pack.establishment.imageUrl ? (
                    <img
                      src={pack.establishment.imageUrl}
                      alt={pack.establishment.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="text-4xl">🍽️</div>
                  )}
                  
                  {/* AI Badge */}
                  <div className="absolute top-2 left-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    AI
                  </div>

                  {/* Discount Badge */}
                  <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                    -{getDiscountPercentage(pack.originalPrice, pack.price)}%
                  </div>

                  {/* Time Remaining */}
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatTimeRemaining(pack.availableUntil)}
                  </div>
                </div>

                {/* Pack Info */}
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-bold text-gray-900 line-clamp-1">{pack.title}</h3>
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <span>{pack.establishment.name}</span>
                      {pack.establishment.rating && (
                        <>
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span>{pack.establishment.rating.toFixed(1)}</span>
                        </>
                      )}
                    </p>
                  </div>

                  {/* Distance */}
                  {pack.distance && (
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <MapPin className="w-3 h-3" />
                      <span>{pack.distance.toFixed(1)} km</span>
                    </div>
                  )}

                  {/* Price */}
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-tugo-600">${pack.price}</span>
                    <span className="text-sm text-gray-400 line-through">${pack.originalPrice}</span>
                  </div>

                  {/* Recommendation Reasons */}
                  <div className="flex flex-wrap gap-1">
                    {pack.recommendationReasons.slice(0, 2).map((reason, idx) => (
                      <span
                        key={idx}
                        className="bg-tugo-100 text-tugo-700 px-2 py-1 rounded-full text-xs font-medium"
                      >
                        {reason}
                      </span>
                    ))}
                  </div>

                  {/* Quantity */}
                  <div className="text-xs text-gray-500">
                    {pack.quantity} disponible{pack.quantity !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {/* View All Link */}
      <div className="text-center">
        <Link
          href="/packs"
          className="inline-flex items-center gap-2 text-tugo-600 hover:text-tugo-700 font-medium transition-colors"
        >
          <span>Ver todos los packs</span>
          <span>→</span>
        </Link>
      </div>
    </div>
  )
}

export default AIRecommendations
