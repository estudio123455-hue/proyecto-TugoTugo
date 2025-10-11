'use client'

import { useEffect, useState, useCallback, memo, useRef } from 'react'
import Map, { Marker, Popup, NavigationControl, GeolocateControl, ViewStateChangeEvent } from 'react-map-gl/maplibre'
import { MapPin } from 'lucide-react'
import 'maplibre-gl/dist/maplibre-gl.css'
import '@/styles/maplibre-custom.css'
import { formatDistance } from '@/lib/geolocation'

// Estilo de mapa usando OpenStreetMap tiles (100% gratis, sin token)
const MAP_STYLE = {
  version: 8 as const,
  sources: {
    osm: {
      type: 'raster' as const,
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '&copy; OpenStreetMap Contributors',
      maxzoom: 19,
    },
  },
  layers: [
    {
      id: 'osm',
      type: 'raster' as const,
      source: 'osm',
    },
  ],
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

// Componente de marcador memoizado
const EstablishmentMarker = memo(
  ({
    establishment,
    onSelect,
    selectedId,
    setSelectedId,
  }: {
    establishment: Establishment
    onSelect?: (establishment: Establishment) => void
    selectedId: string | null
    setSelectedId: (id: string | null) => void
  }) => {
    const availablePacks = establishment.packs.filter((pack) => pack.quantity > 0)
    const hasAvailablePacks = availablePacks.length > 0

    return (
      <>
        <Marker
          longitude={establishment.longitude}
          latitude={establishment.latitude}
          anchor="bottom"
        >
          <button
            onClick={() => setSelectedId(establishment.id)}
            className="relative group cursor-pointer transform transition-transform hover:scale-110"
          >
            <div className={`${hasAvailablePacks ? 'bg-green-500' : 'bg-red-500'} rounded-full p-2 shadow-lg border-2 border-white`}>
              <MapPin className="w-6 h-6 text-white" fill="white" />
            </div>
            {hasAvailablePacks && availablePacks.length > 0 && (
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded shadow-md text-xs font-bold text-green-600 whitespace-nowrap">
                ${Math.min(...availablePacks.map((p) => p.discountedPrice)).toLocaleString('es-CO')}
              </div>
            )}
          </button>
        </Marker>

        {selectedId === establishment.id && (
          <Popup
            longitude={establishment.longitude}
            latitude={establishment.latitude}
            anchor="top"
            onClose={() => setSelectedId(null)}
            closeButton={true}
            closeOnClick={false}
            className="maplibre-popup"
          >
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
        )}
      </>
    )
  }
)

EstablishmentMarker.displayName = 'EstablishmentMarker'

function OptimizedMap({ establishments, userLocation, onEstablishmentSelect }: OptimizedMapProps) {
  const mapRef = useRef<any>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [viewState, setViewState] = useState({
    longitude: userLocation?.lng || -74.0721,
    latitude: userLocation?.lat || 4.711,
    zoom: 13,
  })

  // Actualizar centro cuando cambia la ubicación del usuario
  useEffect(() => {
    if (userLocation) {
      setViewState({
        longitude: userLocation.lng,
        latitude: userLocation.lat,
        zoom: 13,
      })
    }
  }, [userLocation])

  // Callback memoizado para selección de establecimiento
  const handleEstablishmentSelect = useCallback(
    (establishment: Establishment) => {
      onEstablishmentSelect?.(establishment)
    },
    [onEstablishmentSelect]
  )

  return (
    <div className="h-full w-full relative">
      <Map
        ref={mapRef}
        {...viewState}
        onMove={(evt: ViewStateChangeEvent) => setViewState(evt.viewState)}
        mapStyle={MAP_STYLE}
        style={{ width: '100%', height: '100%' }}
      >
        {/* Controles de navegación */}
        <NavigationControl position="top-right" />

        {/* Control de geolocalización */}
        <GeolocateControl
          position="top-right"
          trackUserLocation
        />

        {/* Marcador de ubicación del usuario */}
        {userLocation && (
          <Marker
            longitude={userLocation.lng}
            latitude={userLocation.lat}
            anchor="bottom"
          >
            <div className="bg-blue-500 rounded-full p-2 shadow-lg border-2 border-white">
              <MapPin className="w-6 h-6 text-white" fill="white" />
            </div>
          </Marker>
        )}

        {/* Marcadores de establecimientos */}
        {establishments.map((establishment) => (
          <EstablishmentMarker
            key={establishment.id}
            establishment={establishment}
            onSelect={handleEstablishmentSelect}
            selectedId={selectedId}
            setSelectedId={setSelectedId}
          />
        ))}
      </Map>

      {/* Badge de OpenStreetMap */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-md px-3 py-2 text-xs z-10">
        <span className="text-gray-700 font-semibold">🗺️ OpenStreetMap</span>
        <span className="text-gray-500 ml-1">• Gratis</span>
      </div>

      {/* Contador de establecimientos */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 text-xs z-10">
        <div className="flex items-center space-x-2">
          <MapPin className="w-4 h-4 text-green-500" fill="currentColor" />
          <span className="text-gray-700 font-medium">
            {establishments.length} {establishments.length === 1 ? 'establecimiento' : 'establecimientos'}
          </span>
        </div>
      </div>
    </div>
  )
}

export default memo(OptimizedMap)
