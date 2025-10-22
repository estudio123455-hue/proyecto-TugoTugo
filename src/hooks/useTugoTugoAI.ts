'use client'

import { useState, useEffect, useCallback } from 'react'
import { tugotugoAI, AIRecommendation, UserBehavior } from '@/lib/ai/tugotugo-ai'
import { useCleanSession } from './useCleanSession'
import { Pack } from '@prisma/client'

export function useTugoTugoAI() {
  const { data: session } = useCleanSession()
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)

  // Obtener ubicación del usuario
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (error) => {
          console.warn('Error getting location:', error)
          // Ubicación por defecto (ej: centro de la ciudad)
          setUserLocation({ lat: 4.6097, lng: -74.0817 }) // Bogotá
        }
      )
    }
  }, [])

  /**
   * Generar recomendaciones personalizadas
   */
  const generateRecommendations = useCallback(async (
    availablePacks: Pack[],
    limit: number = 10
  ) => {
    if (!session?.user?.id || !userLocation) return []

    setIsLoading(true)
    try {
      const recs = await tugotugoAI.generateRecommendations(
        session.user.id,
        userLocation,
        availablePacks,
        limit
      )
      setRecommendations(recs)
      return recs
    } catch (error) {
      console.error('Error generating recommendations:', error)
      return []
    } finally {
      setIsLoading(false)
    }
  }, [session?.user?.id, userLocation])

  /**
   * Registrar que el usuario vio un pack
   */
  const trackPackView = useCallback(async (
    packId: string,
    duration: number = 0,
    source: 'search' | 'recommendation' | 'category' | 'map' = 'recommendation'
  ) => {
    if (!session?.user?.id) return

    await tugotugoAI.trackUserBehavior(session.user.id, 'view', {
      packId,
      duration,
      source
    })
  }, [session?.user?.id])

  /**
   * Registrar una compra
   */
  const trackPurchase = useCallback(async (orderData: any) => {
    if (!session?.user?.id) return

    await tugotugoAI.trackUserBehavior(session.user.id, 'purchase', orderData)
  }, [session?.user?.id])

  /**
   * Registrar una búsqueda
   */
  const trackSearch = useCallback(async (
    query: string,
    results: string[] = [],
    clicked: string[] = []
  ) => {
    if (!session?.user?.id) return

    await tugotugoAI.trackUserBehavior(session.user.id, 'search', {
      query,
      results,
      clicked
    })
  }, [session?.user?.id])

  /**
   * Obtener recomendaciones por categoría
   */
  const getRecommendationsByCategory = useCallback((category: string) => {
    return recommendations.filter(rec => 
      rec.reasons.some(reason => 
        reason.toLowerCase().includes(category.toLowerCase())
      )
    )
  }, [recommendations])

  /**
   * Obtener recomendaciones por tipo
   */
  const getRecommendationsByType = useCallback((type: AIRecommendation['type']) => {
    return recommendations.filter(rec => rec.type === type)
  }, [recommendations])

  /**
   * Obtener las mejores recomendaciones (score > 0.7)
   */
  const getTopRecommendations = useCallback((limit: number = 5) => {
    return recommendations
      .filter(rec => rec.score > 0.7)
      .slice(0, limit)
  }, [recommendations])

  return {
    // Estado
    recommendations,
    isLoading,
    userLocation,
    
    // Acciones
    generateRecommendations,
    trackPackView,
    trackPurchase,
    trackSearch,
    
    // Utilidades
    getRecommendationsByCategory,
    getRecommendationsByType,
    getTopRecommendations,
    
    // Información
    hasRecommendations: recommendations.length > 0,
    recommendationCount: recommendations.length
  }
}
