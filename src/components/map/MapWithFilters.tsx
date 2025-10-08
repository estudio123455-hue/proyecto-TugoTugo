'use client'

import { useState, useCallback } from 'react'
import LazyMap from './LazyMap'
import MapFilters from './MapFilters'

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

interface MapWithFiltersProps {
  establishments: Establishment[]
  onEstablishmentSelect?: (establishment: Establishment) => void
}

export default function MapWithFilters({
  establishments,
  onEstablishmentSelect,
}: MapWithFiltersProps) {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [maxDistance, setMaxDistance] = useState<number | undefined>(undefined)
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)

  const requestLocation = useCallback(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
          setLocationError(null)
        },
        (error) => {
          console.error('Error getting location:', error)
          setLocationError('No se pudo obtener tu ubicación')
        }
      )
    } else {
      setLocationError('Tu navegador no soporta geolocalización')
    }
  }, [])

  return (
    <div className="relative h-full w-full">
      <LazyMap
        establishments={establishments}
        userLocation={userLocation}
        onEstablishmentSelect={onEstablishmentSelect}
        maxDistance={maxDistance}
        showOnlyAvailable={showOnlyAvailable}
      />
      
      <MapFilters
        onDistanceChange={setMaxDistance}
        onAvailableOnlyChange={setShowOnlyAvailable}
        userLocation={userLocation}
        onRequestLocation={requestLocation}
      />

      {locationError && (
        <div className="absolute bottom-4 left-4 right-4 bg-red-50 border border-red-200 rounded-lg p-3 shadow-lg z-[1000]">
          <p className="text-red-600 text-sm">{locationError}</p>
        </div>
      )}
    </div>
  )
}
