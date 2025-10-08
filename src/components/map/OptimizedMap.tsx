'use client'

import { useEffect, useState, useCallback, memo } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { formatDistance } from '@/lib/geolocation'

// Fix for default markers
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl:
      'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl:
      'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl:
      'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  })
}

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

interface OptimizedMapProps {
  establishments: Establishment[]
  userLocation?: { lat: number; lng: number } | null
  onEstablishmentSelect?: (establishment: Establishment) => void
}

// Componente para centrar el mapa - Memoizado para evitar re-renders
const MapCenterController = memo(({ center }: { center: [number, number] }) => {
  const map = useMap()

  useEffect(() => {
    map.setView(center, 13, { animate: true })
  }, [center, map])

  return null
})

MapCenterController.displayName = 'MapCenterController'

// Componente de marcador memoizado
const EstablishmentMarker = memo(
  ({
    establishment,
    onSelect,
  }: {
    establishment: Establishment
    onSelect?: (establishment: Establishment) => void
  }) => {
    const availablePacks = establishment.packs.filter((pack) => pack.quantity > 0)
    const hasAvailablePacks = availablePacks.length > 0

    // Custom icons
    const availableIcon = new L.Icon({
      iconUrl:
        'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
      shadowUrl:
        'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    })

    const unavailableIcon = new L.Icon({
      iconUrl:
        'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
      shadowUrl:
        'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    })

    return (
      <Marker
        position={[establishment.latitude, establishment.longitude]}
        icon={hasAvailablePacks ? availableIcon : unavailableIcon}
      >
        <Popup maxWidth={300}>
          <div className="p-3 min-w-[250px]">
            <h3 className="font-bold text-lg mb-2 text-gray-900">{establishment.name}</h3>

            <div className="space-y-2 mb-3">
              <p className="text-sm text-gray-600 flex items-start gap-2">
                <svg
                  className="w-4 h-4 mt-0.5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                {establishment.address}
              </p>

              <p className="text-sm text-gray-500 capitalize">
                📂 {establishment.category.toLowerCase()}
              </p>

              {establishment.distance !== undefined && (
                <p className="text-sm font-medium text-green-600">
                  📍 {formatDistance(establishment.distance)} de distancia
                </p>
              )}

              {establishment.averageRating && establishment.averageRating > 0 && (
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-sm font-medium">{establishment.averageRating.toFixed(1)}</span>
                </div>
              )}
            </div>

            {hasAvailablePacks ? (
              <div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-2 mb-3">
                  <p className="text-green-700 font-medium text-sm">
                    ✅ {availablePacks.length} pack{availablePacks.length !== 1 ? 's' : ''}{' '}
                    disponible{availablePacks.length !== 1 ? 's' : ''}
                  </p>
                  {availablePacks.length > 0 && (
                    <p className="text-xs text-green-600 mt-1">
                      Desde ${Math.min(...availablePacks.map((p) => p.discountedPrice)).toLocaleString('es-CO')}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => onSelect?.(establishment)}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm w-full font-medium transition-colors"
                >
                  Ver Packs
                </button>
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-lg p-2">
                <p className="text-red-600 text-sm">❌ Sin packs disponibles</p>
              </div>
            )}
          </div>
        </Popup>
      </Marker>
    )
  }
)

EstablishmentMarker.displayName = 'EstablishmentMarker'

function OptimizedMap({ establishments, userLocation, onEstablishmentSelect }: OptimizedMapProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Memoizar el centro del mapa
  const mapCenter: [number, number] = userLocation
    ? [userLocation.lat, userLocation.lng]
    : [4.711, -74.0721] // Bogotá por defecto

  // Icono para la ubicación del usuario
  const userLocationIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  })

  // Callback memoizado para selección de establecimiento
  const handleEstablishmentSelect = useCallback(
    (establishment: Establishment) => {
      onEstablishmentSelect?.(establishment)
    },
    [onEstablishmentSelect]
  )

  if (!isClient) {
    return (
      <div className="h-full w-full bg-gray-200 animate-pulse flex items-center justify-center">
        <div className="text-gray-500">Cargando mapa...</div>
      </div>
    )
  }

  return (
    <MapContainer
      center={mapCenter}
      zoom={13}
      style={{ height: '100%', width: '100%' }}
      className="z-0"
      scrollWheelZoom={true}
    >
      <MapCenterController center={mapCenter} />

      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
      />

      {/* Marcador de ubicación del usuario */}
      {userLocation && (
        <Marker position={[userLocation.lat, userLocation.lng]} icon={userLocationIcon}>
          <Popup>
            <div className="p-2">
              <p className="font-semibold text-blue-600">📍 Tu ubicación</p>
            </div>
          </Popup>
        </Marker>
      )}

      {/* Marcadores de establecimientos con clustering */}
      <MarkerClusterGroup
        chunkedLoading
        maxClusterRadius={50}
        spiderfyOnMaxZoom={true}
        showCoverageOnHover={false}
        zoomToBoundsOnClick={true}
        iconCreateFunction={(cluster: any) => {
          const count = cluster.getChildCount()
          let size: 'small' | 'medium' | 'large' = 'small'
          if (count > 10) size = 'medium'
          if (count > 50) size = 'large'

          const sizeMap: Record<'small' | 'medium' | 'large', string> = {
            small: 'w-10 h-10 text-sm',
            medium: 'w-12 h-12 text-base',
            large: 'w-14 h-14 text-lg',
          }

          return L.divIcon({
            html: `<div class="${sizeMap[size]} bg-orange-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg border-4 border-white">${count}</div>`,
            className: 'custom-cluster-icon',
            iconSize: L.point(40, 40, true),
          })
        }}
      >
        {establishments.map((establishment) => (
          <EstablishmentMarker
            key={establishment.id}
            establishment={establishment}
            onSelect={handleEstablishmentSelect}
          />
        ))}
      </MarkerClusterGroup>
    </MapContainer>
  )
}

export default memo(OptimizedMap)
