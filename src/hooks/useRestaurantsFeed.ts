import useSWR from 'swr'
import { useEffect } from 'react'
import { useWebSocket } from '@/lib/websocket'

interface Restaurant {
  id: string
  name: string
  description: string
  address: string
  category: string
  image: string
  phone?: string
  email?: string
  latitude: number
  longitude: number
  isActive: boolean
  createdAt: string
  updatedAt: string
  packs: Pack[]
  owner: {
    name: string
    email: string
  }
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
  isActive: boolean
  createdAt: string
}

interface FeedResponse {
  success: boolean
  data: Restaurant[]
  total: number
  timestamp: string
}

const fetcher = async (url: string): Promise<FeedResponse> => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Failed to fetch restaurants feed')
  }
  return response.json()
}

export const useRestaurantsFeed = (category?: string, limit?: number) => {
  const { connect, subscribe, unsubscribe, isConnected } = useWebSocket()
  
  const params = new URLSearchParams()
  if (category) params.set('category', category)
  if (limit) params.set('limit', limit.toString())
  
  const url = `/api/restaurants/feed?${params.toString()}`
  
  const { data, error, isLoading, mutate: revalidate } = useSWR<FeedResponse>(
    url,
    fetcher,
    {
      refreshInterval: 30000, // Auto-refresh every 30 seconds
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 5000, // Prevent duplicate requests within 5 seconds
      errorRetryCount: 3,
      errorRetryInterval: 5000,
    }
  )

  useEffect(() => {
    // Connect to WebSocket
    connect()

    // Subscribe to real-time updates
    const handleNewPack = (packData: any) => {
      console.log('🔄 New pack published:', packData)
      // Revalidate the feed when a new pack is published
      revalidate()
    }

    const handlePackUpdate = (packData: any) => {
      console.log('🔄 Pack updated:', packData)
      revalidate()
    }

    const handlePackDelete = (packData: any) => {
      console.log('🔄 Pack deleted:', packData)
      revalidate()
    }

    subscribe('pack:created', handleNewPack)
    subscribe('pack:updated', handlePackUpdate)
    subscribe('pack:deleted', handlePackDelete)

    return () => {
      unsubscribe('pack:created', handleNewPack)
      unsubscribe('pack:updated', handlePackUpdate)
      unsubscribe('pack:deleted', handlePackDelete)
    }
  }, [connect, subscribe, unsubscribe, revalidate])

  return {
    restaurants: data?.data || [],
    total: data?.total || 0,
    lastUpdate: data?.timestamp,
    isLoading,
    error,
    isConnected: isConnected(),
    revalidate,
  }
}

// Hook for individual restaurant
export const useRestaurant = (id: string) => {
  const { data, error, isLoading } = useSWR<Restaurant>(
    id ? `/api/restaurants/${id}` : null,
    fetcher,
    {
      refreshInterval: 10000,
      revalidateOnFocus: true,
    }
  )

  return {
    restaurant: data,
    isLoading,
    error,
  }
}

// Hook for packs with real-time updates
export const usePacksFeed = (establishmentId?: string) => {
  const { connect, subscribe, unsubscribe } = useWebSocket()
  
  const url = establishmentId 
    ? `/api/packs/public?establishmentId=${establishmentId}`
    : '/api/packs/public'
  
  const { data, error, isLoading, mutate } = useSWR(
    url,
    fetcher,
    {
      refreshInterval: 15000,
      revalidateOnFocus: true,
      dedupingInterval: 3000,
    }
  )

  useEffect(() => {
    connect()

    const handlePackUpdate = () => {
      mutate()
    }

    subscribe('pack:updated', handlePackUpdate)
    subscribe('pack:created', handlePackUpdate)
    subscribe('pack:deleted', handlePackUpdate)

    return () => {
      unsubscribe('pack:updated', handlePackUpdate)
      unsubscribe('pack:created', handlePackUpdate)
      unsubscribe('pack:deleted', handlePackUpdate)
    }
  }, [connect, subscribe, unsubscribe, mutate])

  return {
    packs: data || [],
    isLoading,
    error,
    mutate,
  }
}
