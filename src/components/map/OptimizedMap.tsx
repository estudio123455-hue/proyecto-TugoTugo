'use client'

import { useEffect, useState, useCallback, memo, useRef } from 'react'
import Map, { Marker, Popup, NavigationControl, GeolocateControl, ViewStateChangeEvent } from 'react-map-gl/maplibre'
import { MapPin } from 'lucide-react'
import 'maplibre-gl/dist/maplibre-gl.css'
import '@/styles/maplibre-custom.css'
import { formatDistance } from '@/lib/geolocation'

// Estilo de mapa profesional usando CartoDB Positron (100% gratis, sin token, muy confiable)
const MAP_STYLE = {
  version: 8 as const,
  sources: {
    'carto-light': {
      type: 'raster' as const,
      tiles: [
        'https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
        'https://b.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
        'https://c.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
        'https://d.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png'
      ],
      tileSize: 256,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxzoom: 20,
    },
  },
  layers: [
    {
      id: 'carto-light',
      type: 'raster' as const,
      source: 'carto-light',
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
            className="relative group cursor-pointer transform transition-all hover:scale-110 hover:-translate-y-1"
          >
            {/* Marcador personalizado con logo corporativo */}
            <div className={`relative ${
              hasAvailablePacks 
                ? 'bg-gradient-to-br from-green-400 to-green-600' 
                : 'bg-gradient-to-br from-gray-400 to-gray-600'
            } rounded-full p-3 shadow-xl border-3 border-white ring-2 ring-green-200`}>
              <div className="text-white font-bold text-lg">🍽️</div>
            </div>
            {/* Badge de precio */}
            {hasAvailablePacks && availablePacks.length > 0 && (
              <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-green-500 to-emerald-500 px-3 py-1.5 rounded-full shadow-lg text-xs font-bold text-white whitespace-nowrap border-2 border-white">
                💵 ${Math.min(...availablePacks.map((p) => p.discountedPrice)).toLocaleString('es-CO')}
              </div>
            )}
            {/* Pulso animado para establecimientos con packs */}
            {hasAvailablePacks && (
              <div className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-20"></div>
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
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-4 text-center">
                <div className="text-4xl mb-2">🔍</div>
                <p className="text-gray-700 font-semibold text-sm mb-1">
                  No hay paquetes activos
                </p>
                <p className="text-gray-500 text-xs mb-3">
                  Activa las notificaciones para saber cuándo hay nuevos
                </p>
                <button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-all">
                  🔔 Activar notificaciones
                </button>
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
        {/* Controles de navegación - Abajo a la derecha */}
        <NavigationControl position="bottom-right" showCompass={true} showZoom={true} />

        {/* Control de geolocalización - Arriba a la derecha, lejos del panel */}
        <GeolocateControl
          position="top-right"
          trackUserLocation
          showUserLocation
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

      {/* Panel de información compacto - inferior izquierda para evitar sobreposición */}
      <div className="absolute bottom-20 left-4 z-10">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 overflow-hidden" style={{ width: '200px' }}>
          {/* Header con estado */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-3 py-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <span className="text-white text-xs font-bold">🗺️ En vivo</span>
            </div>
          </div>
          
          {/* Contador */}
          <div className="px-3 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <MapPin className="w-4 h-4 text-green-600" fill="currentColor" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base font-bold text-gray-900">{establishments.length}</p>
                <p className="text-[10px] text-gray-500 truncate">
                  {establishments.length === 1 ? 'Lugar' : 'Lugares'}
                </p>
              </div>
            </div>
          </div>
          
          {/* Leyenda compacta */}
          <div className="px-3 py-2 bg-gray-50">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-green-500 rounded-full flex-shrink-0"></div>
                <span className="text-[10px] text-gray-600">Con packs</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-gray-400 rounded-full flex-shrink-0"></div>
                <span className="text-[10px] text-gray-600">Sin packs</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mensaje cuando no hay establecimientos */}
      {establishments.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm mx-4 pointer-events-auto border border-gray-200">
            <div className="text-center">
              <div className="text-6xl mb-4">🗺️</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                No hay ubicaciones
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Aún no hay restaurantes registrados con coordenadas.
              </p>
              <p className="text-xs text-gray-500">
                Los establecimientos aparecerán aquí cuando se registren.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Indicador de atribución - esquina inferior derecha */}
      <div className="absolute bottom-2 right-2 bg-white/80 backdrop-blur-sm rounded px-2 py-1 text-[8px] text-gray-500 z-10">
        <a href="https://carto.com/attributions" target="_blank" rel="noopener noreferrer" className="hover:text-gray-700">
          © CARTO
        </a>
      </div>
    </div>
  )
}

export default memo(OptimizedMap)
