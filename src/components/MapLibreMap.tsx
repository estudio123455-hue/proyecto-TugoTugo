'use client'

import React, { useRef, useEffect, useState } from 'react'
import Map, { Marker, Popup, NavigationControl, GeolocateControl, ViewStateChangeEvent } from 'react-map-gl/maplibre'
import { MapPin } from 'lucide-react'
import 'maplibre-gl/dist/maplibre-gl.css'
import '@/styles/maplibre-custom.css'

export interface MapLocation {
  id: string
  latitude: number
  longitude: number
  title: string
  description?: string
  price?: number
  image?: string
}

interface MapLibreMapProps {
  locations: MapLocation[]
  center?: { latitude: number; longitude: number }
  zoom?: number
  onLocationClick?: (location: MapLocation) => void
  height?: string
  showUserLocation?: boolean
  interactive?: boolean
  userLocation?: { lat: number; lng: number } | null
  onMapMove?: (center: { latitude: number; longitude: number }, zoom: number) => void
}

export default function MapLibreMap({
  locations,
  center = { latitude: 4.7110, longitude: -74.0721 }, // Bogotá por defecto
  zoom = 12,
  onLocationClick,
  height = '500px',
  showUserLocation = true,
  interactive = true,
  userLocation = null,
  onMapMove,
}: MapLibreMapProps) {
  const mapRef = useRef<any>(null)
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null)
  const [viewState, setViewState] = useState({
    longitude: center.longitude,
    latitude: center.latitude,
    zoom: zoom,
  })

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

  useEffect(() => {
    // Ajustar el mapa para mostrar todos los marcadores
    if (locations.length > 0 && mapRef.current) {
      const bounds = locations.reduce(
        (acc, loc) => {
          return {
            minLng: Math.min(acc.minLng, loc.longitude),
            maxLng: Math.max(acc.maxLng, loc.longitude),
            minLat: Math.min(acc.minLat, loc.latitude),
            maxLat: Math.max(acc.maxLat, loc.latitude),
          }
        },
        {
          minLng: locations[0].longitude,
          maxLng: locations[0].longitude,
          minLat: locations[0].latitude,
          maxLat: locations[0].latitude,
        }
      )

      // Solo ajustar si hay múltiples ubicaciones
      if (locations.length > 1) {
        mapRef.current?.fitBounds(
          [
            [bounds.minLng, bounds.minLat],
            [bounds.maxLng, bounds.maxLat],
          ],
          {
            padding: 50,
            duration: 1000,
          }
        )
      }
    }
  }, [locations])

  const handleMarkerClick = (location: MapLocation) => {
    setSelectedLocation(location)
    if (onLocationClick) {
      onLocationClick(location)
    }
  }

  const handleMapMove = (evt: ViewStateChangeEvent) => {
    setViewState(evt.viewState)
    if (onMapMove) {
      onMapMove(
        { latitude: evt.viewState.latitude, longitude: evt.viewState.longitude },
        evt.viewState.zoom
      )
    }
  }

  // Calcular distancia entre dos puntos
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

  return (
    <div className="relative rounded-lg overflow-hidden shadow-lg" style={{ height }}>
      <Map
        ref={mapRef}
        {...viewState}
        onMove={handleMapMove}
        mapStyle={MAP_STYLE}
        style={{ width: '100%', height: '100%' }}
        interactive={interactive}
      >
        {/* Controles de navegación */}
        <NavigationControl position="top-right" />

        {/* Control de geolocalización */}
        {showUserLocation && (
          <GeolocateControl
            position="top-right"
            trackUserLocation
          />
        )}

        {/* Marcador de ubicación del usuario */}
        {userLocation && (
          <Marker
            longitude={userLocation.lng}
            latitude={userLocation.lat}
            anchor="center"
          >
            <div className="relative">
              <div className="bg-blue-500 rounded-full p-3 shadow-lg border-4 border-white animate-pulse">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
              <div className="absolute inset-0 bg-blue-300 rounded-full animate-ping opacity-75"></div>
            </div>
          </Marker>
        )}

        {/* Marcadores de packs */}
        {locations.map((location) => {
          const distance = userLocation 
            ? calculateDistance(userLocation.lat, userLocation.lng, location.latitude, location.longitude)
            : null

          return (
            <Marker
              key={location.id}
              longitude={location.longitude}
              latitude={location.latitude}
              anchor="bottom"
            >
              <button
                onClick={() => handleMarkerClick(location)}
                className="relative group cursor-pointer transform transition-transform hover:scale-110"
              >
                <div className="bg-green-500 rounded-full p-2 shadow-lg border-2 border-white group-hover:bg-green-600 transition-colors">
                  <MapPin className="w-6 h-6 text-white" fill="white" />
                </div>
                
                {/* Badge de precio */}
                {location.price && (
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded shadow-md text-xs font-bold text-green-600 whitespace-nowrap border">
                    ${location.price}
                  </div>
                )}
                
                {/* Badge de distancia */}
                {distance && (
                  <div className="absolute -top-12 -right-2 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-md">
                    {distance.toFixed(1)}km
                  </div>
                )}
              </button>
            </Marker>
          )
        })}

        {/* Popup de información mejorado */}
        {selectedLocation && (
          <Popup
            longitude={selectedLocation.longitude}
            latitude={selectedLocation.latitude}
            anchor="top"
            onClose={() => setSelectedLocation(null)}
            closeButton={true}
            closeOnClick={false}
            className="maplibre-popup"
          >
            <div className="p-3 min-w-[250px] max-w-[300px]">
              {/* Imagen del pack */}
              {selectedLocation.image && (
                <div className="relative mb-3">
                  <img
                    src={selectedLocation.image}
                    alt={selectedLocation.title}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                    📦 Pack
                  </div>
                </div>
              )}
              
              {/* Título y descripción */}
              <div className="mb-3">
                <h3 className="font-bold text-gray-900 mb-1 text-lg">
                  {selectedLocation.title}
                </h3>
                {selectedLocation.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {selectedLocation.description}
                  </p>
                )}
              </div>

              {/* Información adicional */}
              <div className="space-y-2 mb-3">
                {/* Distancia */}
                {userLocation && (
                  <div className="flex items-center text-sm text-blue-600">
                    <span className="mr-2">📍</span>
                    <span>
                      {calculateDistance(
                        userLocation.lat, 
                        userLocation.lng, 
                        selectedLocation.latitude, 
                        selectedLocation.longitude
                      ).toFixed(1)} km de distancia
                    </span>
                  </div>
                )}
                
                {/* Precio */}
                {selectedLocation.price && (
                  <div className="flex items-center justify-between bg-green-50 p-2 rounded-lg">
                    <div>
                      <span className="text-sm text-gray-600">Precio:</span>
                      <div className="text-green-600 font-bold text-xl">
                        ${selectedLocation.price}
                      </div>
                    </div>
                    <div className="text-xs text-green-600 font-medium">
                      ¡Oferta especial!
                    </div>
                  </div>
                )}
              </div>

              {/* Botones de acción */}
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    // Navegar a Google Maps
                    const url = `https://www.google.com/maps/dir/?api=1&destination=${selectedLocation.latitude},${selectedLocation.longitude}`
                    window.open(url, '_blank')
                  }}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1"
                >
                  🗺️ Ir
                </button>
                <button 
                  onClick={() => {
                    if (onLocationClick) {
                      onLocationClick(selectedLocation)
                    }
                  }}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1"
                >
                  🛒 Reservar
                </button>
              </div>
            </div>
          </Popup>
        )}
      </Map>

      {/* Leyenda personalizada */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 text-xs">
        <div className="flex items-center space-x-2">
          <MapPin className="w-4 h-4 text-green-500" fill="currentColor" />
          <span className="text-gray-700 font-medium">
            {locations.length} {locations.length === 1 ? 'ubicación' : 'ubicaciones'}
          </span>
        </div>
      </div>

      {/* Badge de OpenStreetMap */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-md px-3 py-2 text-xs">
        <span className="text-gray-700 font-semibold">🗺️ OpenStreetMap</span>
        <span className="text-gray-500 ml-1">• Gratis</span>
      </div>
    </div>
  )
}
