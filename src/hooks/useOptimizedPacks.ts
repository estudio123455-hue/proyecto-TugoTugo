'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { debounce } from 'lodash'

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

interface UseOptimizedPacksProps {
  searchQuery?: string
  category?: string
  priceRange?: [number, number]
  maxDistance?: number
  userLocation?: { lat: number; lng: number } | null
  sortBy?: 'price' | 'distance' | 'rating' | 'newest'
}

export function useOptimizedPacks({
  searchQuery = '',
  category = 'all',
  priceRange = [0, 100],
  maxDistance = 20,
  userLocation = null,
  sortBy = 'distance'
}: UseOptimizedPacksProps = {}) {
  const [packs, setPacks] = useState<Pack[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastFetch, setLastFetch] = useState<number>(0)

  // Cache duration: 5 minutes
  const CACHE_DURATION = 5 * 60 * 1000

  // Debounced search function
  const debouncedFetch = useCallback(
    debounce(async (params: any) => {
      const now = Date.now()
      
      // Check if we need to fetch (cache expired or params changed)
      if (now - lastFetch < CACHE_DURATION && packs.length > 0) {
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const queryParams = new URLSearchParams({
          search: params.searchQuery || '',
          category: params.category || 'all',
          minPrice: params.priceRange[0].toString(),
          maxPrice: params.priceRange[1].toString(),
          ...(params.userLocation && {
            lat: params.userLocation.lat.toString(),
            lng: params.userLocation.lng.toString(),
            maxDistance: params.maxDistance.toString()
          })
        })

        const response = await fetch(`/api/packs?${queryParams}`)
        
        if (!response.ok) {
          throw new Error('Error fetching packs')
        }

        const data = await response.json()
        setPacks(data.packs || [])
        setLastFetch(now)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido')
        console.error('Error fetching packs:', err)
      } finally {
        setIsLoading(false)
      }
    }, 300),
    [lastFetch, packs.length]
  )

  // Effect to fetch packs when params change
  useEffect(() => {
    debouncedFetch({
      searchQuery,
      category,
      priceRange,
      maxDistance,
      userLocation,
      sortBy
    })

    // Cleanup debounced function
    return () => {
      debouncedFetch.cancel()
    }
  }, [searchQuery, category, priceRange, maxDistance, userLocation, sortBy, debouncedFetch])

  // Haversine distance calculation (optimized)
  const calculateDistance = useCallback((lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371 // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }, [])

  // Memoized filtered and sorted packs
  const filteredPacks = useMemo(() => {
    let filtered = [...packs]

    // Filter by search query (optimized with includes)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(pack => 
        pack.title.toLowerCase().includes(query) ||
        pack.description.toLowerCase().includes(query) ||
        pack.establishment.name.toLowerCase().includes(query) ||
        pack.tags.some(tag => tag.toLowerCase().includes(query))
      )
    }

    // Filter by category
    if (category !== 'all') {
      filtered = filtered.filter(pack => 
        pack.category === category || pack.establishment.category === category
      )
    }

    // Filter by price range
    filtered = filtered.filter(pack => 
      pack.discountedPrice >= priceRange[0] && pack.discountedPrice <= priceRange[1]
    )

    // Filter by distance
    if (userLocation && maxDistance < 20) {
      filtered = filtered.filter(pack => {
        const distance = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          pack.establishment.latitude,
          pack.establishment.longitude
        )
        return distance <= maxDistance
      })
    }

    // Sort packs
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return a.discountedPrice - b.discountedPrice
        case 'distance':
          if (!userLocation) return 0
          const distA = calculateDistance(
            userLocation.lat,
            userLocation.lng,
            a.establishment.latitude,
            a.establishment.longitude
          )
          const distB = calculateDistance(
            userLocation.lat,
            userLocation.lng,
            b.establishment.latitude,
            b.establishment.longitude
          )
          return distA - distB
        case 'newest':
          return new Date(b.availableFrom).getTime() - new Date(a.availableFrom).getTime()
        case 'rating':
          // Placeholder for rating sorting
          return Math.random() - 0.5
        default:
          return 0
      }
    })

    return filtered
  }, [packs, searchQuery, category, priceRange, maxDistance, userLocation, sortBy, calculateDistance])

  // Memoized pack statistics
  const stats = useMemo(() => ({
    total: packs.length,
    filtered: filteredPacks.length,
    averagePrice: filteredPacks.length > 0 
      ? filteredPacks.reduce((sum, pack) => sum + pack.discountedPrice, 0) / filteredPacks.length
      : 0,
    categories: [...new Set(packs.map(pack => pack.category))],
    establishments: [...new Set(packs.map(pack => pack.establishment.name))].length,
    nearbyCount: userLocation 
      ? packs.filter(pack => {
          const distance = calculateDistance(
            userLocation.lat,
            userLocation.lng,
            pack.establishment.latitude,
            pack.establishment.longitude
          )
          return distance <= 5 // Within 5km
        }).length
      : 0
  }), [packs, filteredPacks, userLocation, calculateDistance])

  // Force refresh function
  const refresh = useCallback(() => {
    setLastFetch(0) // Reset cache
    debouncedFetch({
      searchQuery,
      category,
      priceRange,
      maxDistance,
      userLocation,
      sortBy
    })
  }, [searchQuery, category, priceRange, maxDistance, userLocation, sortBy, debouncedFetch])

  return {
    packs: filteredPacks,
    allPacks: packs,
    isLoading,
    error,
    stats,
    refresh,
    calculateDistance
  }
}
