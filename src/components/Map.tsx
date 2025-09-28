'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

interface Establishment {
  id: string
  name: string
  address: string
  latitude: number
  longitude: number
  category: string
  image?: string
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

interface MapProps {
  establishments: Establishment[]
  onEstablishmentSelect: (establishment: Establishment) => void
}

export default function Map({ establishments, onEstablishmentSelect }: MapProps) {
  const [isClient, setIsClient] = useState(false)
  
  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return (
      <div className="h-full w-full bg-gray-200 animate-pulse flex items-center justify-center">
        <div className="text-gray-500">Loading map...</div>
      </div>
    )
  }

  // Default center - Bogotá, Colombia
  const defaultCenter: [number, number] = [4.7110, -74.0721] // Bogotá, Colombia

  // Custom icon for establishments with available packs
  const availableIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  })

  // Custom icon for establishments without available packs
  const unavailableIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  })

  return (
    <MapContainer
      center={defaultCenter}
      zoom={13}
      style={{ height: '100%', width: '100%' }}
      className="z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {establishments.map((establishment) => {
        const availablePacks = establishment.packs.filter(pack => pack.quantity > 0)
        const hasAvailablePacks = availablePacks.length > 0
        
        return (
          <Marker
            key={establishment.id}
            position={[establishment.latitude, establishment.longitude]}
            icon={hasAvailablePacks ? availableIcon : unavailableIcon}
          >
            <Popup>
              <div className="p-2 min-w-[200px]">
                <h3 className="font-semibold text-lg mb-2">{establishment.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{establishment.address}</p>
                <p className="text-sm text-gray-500 mb-3 capitalize">{establishment.category.toLowerCase()}</p>
                
                {hasAvailablePacks ? (
                  <div>
                    <p className="text-green-600 font-medium mb-2">
                      {availablePacks.length} pack{availablePacks.length !== 1 ? 's' : ''} available
                    </p>
                    <button
                      onClick={() => onEstablishmentSelect(establishment)}
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded text-sm w-full"
                    >
                      View Packs
                    </button>
                  </div>
                ) : (
                  <p className="text-red-500 text-sm">No packs available</p>
                )}
              </div>
            </Popup>
          </Marker>
        )
      })}
    </MapContainer>
  )
}
