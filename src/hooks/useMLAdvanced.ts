'use client'

import { useState, useEffect, useCallback } from 'react'
import { mlAdvancedSystem, UserFeatures, PredictionResult } from '@/lib/ai/ml-advanced'
import { sentimentAnalyzer, ReviewAnalysis } from '@/lib/ai/sentiment-analysis'
import { useCleanSession } from './useCleanSession'
import { Pack } from '@prisma/client'

export function useMLAdvanced() {
  const { data: session } = useCleanSession()
  const [isLoading, setIsLoading] = useState(false)
  const [userProfile, setUserProfile] = useState<UserFeatures | null>(null)
  const [mlRecommendations, setMLRecommendations] = useState<any[]>([])

  // Construir perfil del usuario
  const buildUserProfile = useCallback(async (): Promise<UserFeatures | null> => {
    if (!session?.user?.id) return null

    // TODO: Obtener datos reales del usuario desde la base de datos
    // Por ahora, crear un perfil simulado
    const profile: UserFeatures = {
      userId: session.user.id,
      demographics: {
        ageGroup: 2, // 26-35 años
        location: { lat: 4.6097, lng: -74.0817 }, // Bogotá
        deviceType: 'mobile'
      },
      behavior: {
        avgOrderValue: 35000, // COP
        orderFrequency: 8, // órdenes por mes
        preferredTimeSlots: [12, 13, 19, 20], // almuerzo y cena
        categoryPreferences: {
          'comida_rapida': 0.8,
          'saludable': 0.6,
          'postres': 0.4,
          'bebidas': 0.3
        },
        pricesensitivity: 0.6, // moderadamente sensible al precio
        qualityPreference: 0.7 // prefiere calidad
      },
      engagement: {
        sessionDuration: 420, // 7 minutos promedio
        pagesPerSession: 8,
        reviewsWritten: 5,
        socialShares: 2
      }
    }

    setUserProfile(profile)
    return profile
  }, [session?.user?.id])

  // Generar recomendaciones ML
  const generateMLRecommendations = useCallback(async (
    availablePacks: Pack[],
    limit: number = 10
  ) => {
    if (!session?.user?.id) return []

    setIsLoading(true)
    try {
      const profile = userProfile || await buildUserProfile()
      if (!profile) return []

      const recommendations = await mlAdvancedSystem.generateMLRecommendations(
        session.user.id,
        availablePacks,
        profile
      )

      const limitedRecommendations = recommendations.slice(0, limit)
      setMLRecommendations(limitedRecommendations)
      return limitedRecommendations
    } catch (error) {
      console.error('Error generating ML recommendations:', error)
      return []
    } finally {
      setIsLoading(false)
    }
  }, [session?.user?.id, userProfile, buildUserProfile])

  // Predecir probabilidad de compra
  const predictPurchase = useCallback(async (
    packId: string,
    packData: any
  ): Promise<PredictionResult | null> => {
    const profile = userProfile || await buildUserProfile()
    if (!profile) return null

    try {
      // Crear PackFeatures desde packData
      const packFeatures = {
        packId,
        establishment: {
          rating: 4.2,
          reviewCount: 150,
          priceRange: 2,
          cuisineType: 'general',
          location: { lat: 0, lng: 0 }
        },
        pack: {
          originalPrice: packData.originalPrice || 50000,
          discountedPrice: packData.discountedPrice || 35000,
          discountPercentage: ((packData.originalPrice - packData.discountedPrice) / packData.originalPrice) || 0.3,
          availableQuantity: packData.quantity || 10,
          timeUntilExpiry: 12,
          category: 'general'
        },
        historical: {
          avgRating: 4.0,
          totalOrders: 200,
          returnCustomerRate: 0.3,
          sentimentScore: 0.2
        }
      }

      return await mlAdvancedSystem.predictPurchase(profile, packFeatures)
    } catch (error) {
      console.error('Error predicting purchase:', error)
      return null
    }
  }, [userProfile, buildUserProfile])

  // Analizar sentimientos de reseñas
  const analyzeReviewSentiments = useCallback(async (
    reviews: { id: string; content: string; rating: number }[],
    packId: string,
    establishmentId: string
  ) => {
    try {
      return sentimentAnalyzer.analyzePackReviews(reviews, packId, establishmentId)
    } catch (error) {
      console.error('Error analyzing sentiments:', error)
      return null
    }
  }, [])

  // Analizar comportamiento del usuario
  const analyzeUserBehavior = useCallback(async () => {
    const profile = userProfile || await buildUserProfile()
    if (!profile) return null

    try {
      return mlAdvancedSystem.analyzeUserBehavior(profile)
    } catch (error) {
      console.error('Error analyzing user behavior:', error)
      return null
    }
  }, [userProfile, buildUserProfile])

  // Obtener insights del usuario
  const getUserInsights = useCallback(async () => {
    const analysis = await analyzeUserBehavior()
    if (!analysis) return null

    return {
      userType: analysis.userType,
      riskLevel: analysis.riskLevel,
      recommendations: analysis.recommendations,
      nextBestAction: analysis.nextBestAction,
      profile: userProfile
    }
  }, [analyzeUserBehavior, userProfile])

  // Inicializar perfil al cargar
  useEffect(() => {
    if (session?.user?.id && !userProfile) {
      buildUserProfile()
    }
  }, [session?.user?.id, userProfile, buildUserProfile])

  return {
    // Estado
    isLoading,
    userProfile,
    mlRecommendations,
    
    // Acciones
    generateMLRecommendations,
    predictPurchase,
    analyzeReviewSentiments,
    analyzeUserBehavior,
    getUserInsights,
    buildUserProfile,
    
    // Utilidades
    hasProfile: !!userProfile,
    hasMLRecommendations: mlRecommendations.length > 0
  }
}
