'use client'

import React, { memo, useState, useCallback } from 'react'
import { Clock, MapPin, Star, ShoppingCart } from 'lucide-react'
import { useImageOptimization } from '@/hooks/useImageOptimization'

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
    latitude: number
    longitude: number
    category: string
    image?: string
  }
  category: string
  tags: string[]
  isActive: boolean
}

interface OptimizedPackCardProps {
  pack: Pack
  distance?: number
  onReserve: (packId: string, quantity: number) => void
  onViewDetails: (pack: Pack) => void
  isLoading?: boolean
  priority?: boolean
  className?: string
}

const OptimizedPackCard = memo(function OptimizedPackCard({
  pack,
  distance,
  onReserve,
  onViewDetails,
  isLoading = false,
  priority = false,
  className = ''
}: OptimizedPackCardProps) {
  const [quantity, setQuantity] = useState(1)
  const [isReserving, setIsReserving] = useState(false)

  // Optimized image loading
  const imageProps = useImageOptimization({
    src: pack.establishment.image || '/images/restaurant-placeholder.jpg',
    alt: pack.establishment.name,
    placeholder: '/images/restaurant-placeholder.jpg',
    quality: 80,
    priority,
    sizes: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
  })

  // Calculate discount percentage
  const discountPercentage = Math.round(
    ((pack.originalPrice - pack.discountedPrice) / pack.originalPrice) * 100
  )

  // Format time
  const formatTime = useCallback((timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }, [])

  // Handle reserve action
  const handleReserve = useCallback(async () => {
    if (isReserving || isLoading) return
    
    setIsReserving(true)
    try {
      await onReserve(pack.id, quantity)
    } finally {
      setIsReserving(false)
    }
  }, [pack.id, quantity, onReserve, isReserving, isLoading])

  // Handle view details
  const handleViewDetails = useCallback(() => {
    onViewDetails(pack)
  }, [pack, onViewDetails])

  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 group ${className}`}>
      {/* Image Section */}
      <div className="relative h-48 overflow-hidden">
        <img
          {...imageProps}
          alt={imageProps.alt}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Discount Badge */}
        {discountPercentage > 0 && (
          <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
            -{discountPercentage}%
          </div>
        )}

        {/* Distance Badge */}
        {distance !== undefined && (
          <div className="absolute top-3 right-3 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {distance.toFixed(1)}km
          </div>
        )}

        {/* Category Tag */}
        <div className="absolute bottom-3 left-3 bg-black/70 text-white px-2 py-1 rounded-md text-xs">
          {pack.category}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4">
        {/* Restaurant Name */}
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-gray-900 truncate flex-1">
            {pack.establishment.name}
          </h3>
          <div className="flex items-center text-yellow-500 ml-2">
            <Star className="w-4 h-4 fill-current" />
            <span className="text-xs text-gray-600 ml-1">4.5</span>
          </div>
        </div>

        {/* Pack Title */}
        <h4 className="text-sm font-medium text-gray-700 mb-2 line-clamp-2">
          {pack.title}
        </h4>

        {/* Description */}
        <p className="text-xs text-gray-500 mb-3 line-clamp-2">
          {pack.description}
        </p>

        {/* Pickup Time */}
        <div className="flex items-center text-xs text-gray-600 mb-3">
          <Clock className="w-3 h-3 mr-1" />
          <span>
            Recogida: {formatTime(pack.pickupTimeStart)} - {formatTime(pack.pickupTimeEnd)}
          </span>
        </div>

        {/* Tags */}
        {pack.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {pack.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs"
              >
                {tag}
              </span>
            ))}
            {pack.tags.length > 3 && (
              <span className="text-xs text-gray-400">
                +{pack.tags.length - 3} más
              </span>
            )}
          </div>
        )}

        {/* Price Section */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-green-600">
              ${pack.discountedPrice.toFixed(2)}
            </span>
            {pack.originalPrice > pack.discountedPrice && (
              <span className="text-sm text-gray-400 line-through">
                ${pack.originalPrice.toFixed(2)}
              </span>
            )}
          </div>
          <span className="text-xs text-gray-500">
            {pack.quantity} disponibles
          </span>
        </div>

        {/* Quantity Selector */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs text-gray-600">Cantidad:</span>
          <div className="flex items-center border border-gray-200 rounded-lg">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"
              disabled={quantity <= 1}
            >
              -
            </button>
            <span className="w-8 text-center text-sm font-medium">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(Math.min(pack.quantity, quantity + 1))}
              className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"
              disabled={quantity >= pack.quantity}
            >
              +
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleViewDetails}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded-lg text-sm font-medium transition-colors"
          >
            Ver detalles
          </button>
          <button
            onClick={handleReserve}
            disabled={isReserving || isLoading || !pack.isActive}
            className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1"
            data-pack-id={pack.id}
          >
            {isReserving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Reservando...
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                Reservar
              </>
            )}
          </button>
        </div>

        {/* Availability Status */}
        {!pack.isActive && (
          <div className="mt-2 text-center">
            <span className="text-xs text-red-500 bg-red-50 px-2 py-1 rounded-full">
              No disponible
            </span>
          </div>
        )}
      </div>
    </div>
  )
})

export default OptimizedPackCard
