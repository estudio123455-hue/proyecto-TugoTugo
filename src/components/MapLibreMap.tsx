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
}

export default function MapLibreMap({
  locations,
  center = { latitude: 4.7110, longitude: -74.0721 }, // Bogotá por defecto
  zoom = 12,
  onLocationClick,
  height = '500px',
  showUserLocation = true,
  interactive = true,
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

  return (
    <div className="relative rounded-lg overflow-hidden shadow-lg" style={{ height }}>
      <Map
        ref={mapRef}
        {...viewState}
        onMove={(evt: ViewStateChangeEvent) => setViewState(evt.viewState)}
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

        {/* Marcadores */}
        {locations.map((location) => (
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
              <div className="bg-green-500 rounded-full p-2 shadow-lg border-2 border-white">
                <MapPin className="w-6 h-6 text-white" fill="white" />
              </div>
              {location.price && (
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded shadow-md text-xs font-bold text-green-600 whitespace-nowrap">
                  ${location.price}
                </div>
              )}
            </button>
          </Marker>
        ))}

        {/* Popup de información */}
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
            <div className="p-2 min-w-[200px]">
              {selectedLocation.image && (
                <img
                  src={selectedLocation.image}
                  alt={selectedLocation.title}
                  className="w-full h-32 object-cover rounded-md mb-2"
                />
              )}
              <h3 className="font-bold text-gray-900 mb-1">
                {selectedLocation.title}
              </h3>
              {selectedLocation.description && (
                <p className="text-sm text-gray-600 mb-2">
                  {selectedLocation.description}
                </p>
              )}
              {selectedLocation.price && (
                <div className="flex items-center justify-between">
                  <span className="text-green-600 font-bold text-lg">
                    ${selectedLocation.price}
                  </span>
                  <button className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm">
                    Ver más
                  </button>
                </div>
              )}
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
