/**
 * Utilidades de geolocalización y cálculo de distancias
 */

export interface Coordinates {
  latitude: number
  longitude: number
}

/**
 * Calcula la distancia entre dos puntos usando la fórmula de Haversine
 * @param from Coordenadas de origen
 * @param to Coordenadas de destino
 * @returns Distancia en kilómetros
 */
export function calculateDistance(from: Coordinates, to: Coordinates): number {
  const R = 6371 // Radio de la Tierra en km
  const dLat = toRad(to.latitude - from.latitude)
  const dLon = toRad(to.longitude - from.longitude)
  
  const lat1 = toRad(from.latitude)
  const lat2 = toRad(to.latitude)

  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2)
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c
  
  return Math.round(distance * 10) / 10 // Redondear a 1 decimal
}

/**
 * Convierte grados a radianes
 */
function toRad(degrees: number): number {
  return degrees * (Math.PI / 180)
}

/**
 * Formatea la distancia para mostrar
 */
export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)}m`
  }
  return `${km.toFixed(1)}km`
}

/**
 * Obtiene la ubicación actual del usuario
 */
export async function getCurrentLocation(): Promise<Coordinates | null> {
  if (!navigator.geolocation) {
    console.error('Geolocation is not supported by this browser')
    return null
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
      },
      (error) => {
        console.error('Error getting location:', error)
        // Ubicación por defecto: Bogotá, Colombia
        resolve({
          latitude: 4.7110,
          longitude: -74.0721,
        })
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    )
  })
}

/**
 * Ordena establecimientos por distancia
 */
export function sortByDistance<T extends { latitude: number; longitude: number; distance?: number }>(
  items: T[],
  userLocation: Coordinates
): T[] {
  return items
    .map(item => ({
      ...item,
      distance: calculateDistance(userLocation, {
        latitude: item.latitude,
        longitude: item.longitude,
      }),
    }))
    .sort((a, b) => (a.distance || 0) - (b.distance || 0))
}

/**
 * Filtra establecimientos dentro de un radio
 */
export function filterByRadius<T extends { latitude: number; longitude: number }>(
  items: T[],
  userLocation: Coordinates,
  radiusKm: number
): T[] {
  return items.filter(item => {
    const distance = calculateDistance(userLocation, {
      latitude: item.latitude,
      longitude: item.longitude,
    })
    return distance <= radiusKm
  })
}

/**
 * Obtiene los límites del mapa para un conjunto de coordenadas
 */
export function getBounds(coordinates: Coordinates[]): {
  minLat: number
  maxLat: number
  minLng: number
  maxLng: number
} {
  if (coordinates.length === 0) {
    return {
      minLat: 4.5,
      maxLat: 5.0,
      minLng: -74.3,
      maxLng: -73.8,
    }
  }

  const lats = coordinates.map(c => c.latitude)
  const lngs = coordinates.map(c => c.longitude)

  return {
    minLat: Math.min(...lats),
    maxLat: Math.max(...lats),
    minLng: Math.min(...lngs),
    maxLng: Math.max(...lngs),
  }
}
