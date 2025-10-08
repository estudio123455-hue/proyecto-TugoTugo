'use client'

import dynamic from 'next/dynamic'
import { useMemo } from 'react'

// Lazy load del mapa para mejor performance
const MapComponent = dynamic(() => import('./OptimizedMap'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-gray-200 animate-pulse flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4"></div>
        <p className="text-gray-600 font-medium">Cargando mapa...</p>
      </div>
    </div>
  ),
})

interface Establishment {
  id: string
  name: string
  address: string
  latitude: number
  longitude: number
  category: string
  image?: string
  distance?: number
  averageRating?: number
  packs: Pack[]
}

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
}

interface LazyMapProps {
  establishments: Establishment[]
  userLocation?: { lat: number; lng: number } | null
  onEstablishmentSelect?: (establishment: Establishment) => void
  maxDistance?: number // Filtro de distancia en km
  showOnlyAvailable?: boolean // Mostrar solo con packs disponibles
}

export default function LazyMap({
  establishments,
  userLocation,
  onEstablishmentSelect,
  maxDistance,
  showOnlyAvailable = false,
}: LazyMapProps) {
  // Filtrar establecimientos basado en criterios
  const filteredEstablishments = useMemo(() => {
    let filtered = establishments

    // Filtrar por disponibilidad
    if (showOnlyAvailable) {
      filtered = filtered.filter((est) =>
        est.packs.some((pack) => pack.quantity > 0)
      )
    }

    // Filtrar por distancia
    if (maxDistance && userLocation) {
      filtered = filtered.filter((est) => {
        if (est.distance === undefined) return true
        return est.distance <= maxDistance
      })
    }

    return filtered
  }, [establishments, showOnlyAvailable, maxDistance, userLocation])

  return (
    <MapComponent
      establishments={filteredEstablishments}
      userLocation={userLocation}
      onEstablishmentSelect={onEstablishmentSelect}
    />
  )
}
