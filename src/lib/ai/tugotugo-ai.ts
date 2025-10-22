'use client'

/**
 * TugoTugo AI - Sistema de IA personalizada
 * Nivel Básico: Recomendaciones basadas en historial + ubicación
 */

import { Pack, User, Order } from '@prisma/client'

// Tipos específicos para TugoTugo AI
export interface UserBehavior {
  userId: string
  preferences: {
    categories: string[]
    priceRange: [number, number]
    dietaryRestrictions: string[]
    favoriteEstablishments: string[]
    preferredTimes: string[]
    locationRadius: number
  }
  history: {
    purchases: Order[]
    views: PackView[]
    searches: SearchHistory[]
  }
  location: {
    lat: number
    lng: number
    address?: string
  }
}

export interface PackView {
  packId: string
  timestamp: Date
  duration: number // segundos viendo el pack
  source: 'search' | 'recommendation' | 'category' | 'map'
}

export interface SearchHistory {
  query: string
  timestamp: Date
  results: string[] // pack IDs
  clicked: string[] // pack IDs que clickeó
}

export interface AIRecommendation {
  packId: string
  score: number
  reasons: string[]
  type: 'location' | 'history' | 'similar_users' | 'trending' | 'dietary'
  confidence: number
}

/**
 * TugoTugo AI Engine - Nivel Básico
 */
export class TugoTugoAI {
  private userBehaviors: Map<string, UserBehavior> = new Map()
  private packVectors: Map<string, number[]> = new Map()
  
  constructor() {
    this.initializeAI()
  }

  private async initializeAI() {
    // Cargar datos de comportamiento del usuario desde localStorage/API
    await this.loadUserBehaviors()
    // Pre-calcular vectores de packs
    await this.calculatePackVectors()
  }

  /**
   * Generar recomendaciones personalizadas para un usuario
   */
  async generateRecommendations(
    userId: string, 
    userLocation: { lat: number; lng: number },
    availablePacks: Pack[],
    limit: number = 10
  ): Promise<AIRecommendation[]> {
    const userBehavior = this.userBehaviors.get(userId)
    const recommendations: AIRecommendation[] = []

    // 1. Recomendaciones basadas en ubicación (40% peso)
    const locationRecs = this.getLocationBasedRecommendations(
      userLocation, 
      availablePacks, 
      userBehavior
    )
    recommendations.push(...locationRecs.map(r => ({ ...r, score: r.score * 0.4 })))

    // 2. Recomendaciones basadas en historial (35% peso)
    if (userBehavior) {
      const historyRecs = this.getHistoryBasedRecommendations(
        userBehavior, 
        availablePacks
      )
      recommendations.push(...historyRecs.map(r => ({ ...r, score: r.score * 0.35 })))
    }

    // 3. Recomendaciones por similitud de usuarios (15% peso)
    const similarUserRecs = await this.getSimilarUserRecommendations(
      userId, 
      availablePacks
    )
    recommendations.push(...similarUserRecs.map(r => ({ ...r, score: r.score * 0.15 })))

    // 4. Trending/Popular (10% peso)
    const trendingRecs = this.getTrendingRecommendations(availablePacks)
    recommendations.push(...trendingRecs.map(r => ({ ...r, score: r.score * 0.1 })))

    // Consolidar y ordenar por score
    const consolidatedRecs = this.consolidateRecommendations(recommendations)
    
    return consolidatedRecs
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
  }

  /**
   * Recomendaciones basadas en ubicación y proximidad
   */
  private getLocationBasedRecommendations(
    userLocation: { lat: number; lng: number },
    packs: Pack[],
    userBehavior?: UserBehavior
  ): AIRecommendation[] {
    const maxDistance = userBehavior?.preferences.locationRadius || 5000 // 5km por defecto
    
    return packs
      .map(pack => {
        // TODO: Calcular distancia usando datos del establishment
        // Por ahora usar distancia simulada
        const distance = Math.random() * maxDistance
        
        if (distance > maxDistance) return null
        
        // Score basado en proximidad (más cerca = mejor score)
        const proximityScore = Math.max(0, 1 - (distance / maxDistance))
        
        // TODO: Bonus por categoría cuando se agregue al schema
        const categoryBonus = 0
        
        // Bonus si está en rango de precio preferido
        const priceBonus = this.isPriceInRange(pack.discountedPrice, userBehavior?.preferences.priceRange) ? 0.1 : 0
        
        return {
          packId: pack.id,
          score: proximityScore + categoryBonus + priceBonus,
          reasons: [
            `A ${Math.round(distance)}m de tu ubicación`,
            // TODO: Agregar razón de categoría cuando esté disponible
            ...(priceBonus > 0 ? ['En tu rango de precio preferido'] : [])
          ],
          type: 'location' as const,
          confidence: proximityScore
        }
      })
      .filter(Boolean) as AIRecommendation[]
  }

  /**
   * Recomendaciones basadas en historial de compras y vistas
   */
  private getHistoryBasedRecommendations(
    userBehavior: UserBehavior,
    packs: Pack[]
  ): AIRecommendation[] {
    const recommendations: AIRecommendation[] = []
    
    // Analizar patrones de compra
    const purchasePatterns = this.analyzePurchasePatterns(userBehavior.history.purchases)
    
    // Analizar patrones de visualización
    const viewPatterns = this.analyzeViewPatterns(userBehavior.history.views)
    
    packs.forEach(pack => {
      let score = 0
      const reasons: string[] = []
      
      // TODO: Score por categoría cuando esté disponible en el schema
      // score += 0.4
      
      // Score por establecimiento frecuente
      if (purchasePatterns.frequentEstablishments.includes(pack.establishmentId)) {
        score += 0.3
        reasons.push(`Restaurante que has visitado antes`)
      }
      
      // Score por rango de precio habitual
      if (this.isPriceInRange(pack.discountedPrice, purchasePatterns.priceRange)) {
        score += 0.2
        reasons.push('En tu rango de precio habitual')
      }
      
      // Score por tiempo preferido
      const currentHour = new Date().getHours()
      if (purchasePatterns.preferredHours.includes(currentHour)) {
        score += 0.1
        reasons.push('Disponible en tu horario preferido')
      }
      
      if (score > 0) {
        recommendations.push({
          packId: pack.id,
          score,
          reasons,
          type: 'history',
          confidence: score
        })
      }
    })
    
    return recommendations
  }

  /**
   * Recomendaciones basadas en usuarios similares
   */
  private async getSimilarUserRecommendations(
    userId: string,
    packs: Pack[]
  ): Promise<AIRecommendation[]> {
    // Encontrar usuarios con comportamiento similar
    const similarUsers = this.findSimilarUsers(userId)
    
    if (similarUsers.length === 0) return []
    
    // Obtener packs que les gustaron a usuarios similares
    const recommendations: AIRecommendation[] = []
    
    similarUsers.forEach(similarUser => {
      const behavior = this.userBehaviors.get(similarUser.userId)
      if (!behavior) return
      
      // Packs que compraron usuarios similares
      behavior.history.purchases.forEach(purchase => {
        const pack = packs.find(p => p.id === purchase.packId)
        if (!pack) return
        
        recommendations.push({
          packId: pack.id,
          score: similarUser.similarity * 0.8, // Factor de similitud
          reasons: [`Usuarios con gustos similares también compraron esto`],
          type: 'similar_users',
          confidence: similarUser.similarity
        })
      })
    })
    
    return recommendations
  }

  /**
   * Recomendaciones trending/populares
   */
  private getTrendingRecommendations(packs: Pack[]): AIRecommendation[] {
    // Simular trending basado en datos disponibles
    // En producción, esto vendría de analytics reales
    return packs
      .filter(pack => pack.quantity > 0)
      .sort((a, b) => (b.originalPrice - b.discountedPrice) - (a.originalPrice - a.discountedPrice)) // Mayor descuento
      .slice(0, 5)
      .map(pack => ({
        packId: pack.id,
        score: 0.6,
        reasons: [`Tendencia: ${Math.round(((pack.originalPrice - pack.discountedPrice) / pack.originalPrice) * 100)}% de descuento`],
        type: 'trending' as const,
        confidence: 0.6
      }))
  }

  /**
   * Consolidar recomendaciones duplicadas
   */
  private consolidateRecommendations(recommendations: AIRecommendation[]): AIRecommendation[] {
    const consolidated = new Map<string, AIRecommendation>()
    
    recommendations.forEach(rec => {
      const existing = consolidated.get(rec.packId)
      if (existing) {
        // Combinar scores y razones
        existing.score += rec.score
        existing.reasons.push(...rec.reasons)
        existing.confidence = Math.max(existing.confidence, rec.confidence)
      } else {
        consolidated.set(rec.packId, { ...rec })
      }
    })
    
    return Array.from(consolidated.values())
  }

  /**
   * Registrar comportamiento del usuario
   */
  async trackUserBehavior(
    userId: string,
    action: 'view' | 'purchase' | 'search',
    data: any
  ) {
    let behavior = this.userBehaviors.get(userId)
    
    if (!behavior) {
      behavior = {
        userId,
        preferences: {
          categories: [],
          priceRange: [0, 100],
          dietaryRestrictions: [],
          favoriteEstablishments: [],
          preferredTimes: [],
          locationRadius: 5000
        },
        history: {
          purchases: [],
          views: [],
          searches: []
        },
        location: { lat: 0, lng: 0 }
      }
    }
    
    switch (action) {
      case 'view':
        behavior.history.views.push({
          packId: data.packId,
          timestamp: new Date(),
          duration: data.duration || 0,
          source: data.source || 'unknown'
        })
        break
        
      case 'purchase':
        behavior.history.purchases.push(data)
        break
        
      case 'search':
        behavior.history.searches.push({
          query: data.query,
          timestamp: new Date(),
          results: data.results || [],
          clicked: data.clicked || []
        })
        break
    }
    
    this.userBehaviors.set(userId, behavior)
    
    // Actualizar preferencias basadas en comportamiento
    this.updateUserPreferences(userId)
    
    // Guardar en localStorage/API
    await this.saveUserBehavior(userId, behavior)
  }

  // Métodos auxiliares
  private calculateDistance(
    point1: { lat: number; lng: number },
    point2: { lat: number; lng: number }
  ): number {
    // Fórmula haversine simplificada
    const R = 6371000 // Radio de la Tierra en metros
    const dLat = (point2.lat - point1.lat) * Math.PI / 180
    const dLng = (point2.lng - point1.lng) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  private isPriceInRange(price: number, range?: [number, number]): boolean {
    if (!range) return true
    return price >= range[0] && price <= range[1]
  }

  private analyzePurchasePatterns(purchases: Order[]) {
    // Analizar patrones de compra
    const categories = purchases.map(p => p.category).filter(Boolean)
    const establishments = purchases.map(p => p.establishmentId).filter(Boolean)
    const prices = purchases.map(p => p.totalAmount)
    const hours = purchases.map(p => new Date(p.createdAt).getHours())
    
    return {
      frequentCategories: this.getFrequentItems(categories),
      frequentEstablishments: this.getFrequentItems(establishments),
      priceRange: [Math.min(...prices), Math.max(...prices)] as [number, number],
      preferredHours: this.getFrequentItems(hours)
    }
  }

  private analyzeViewPatterns(views: PackView[]) {
    // Analizar patrones de visualización
    return {
      frequentSources: this.getFrequentItems(views.map(v => v.source)),
      averageViewTime: views.reduce((sum, v) => sum + v.duration, 0) / views.length
    }
  }

  private getFrequentItems<T>(items: T[]): T[] {
    const frequency = new Map<T, number>()
    items.forEach(item => {
      frequency.set(item, (frequency.get(item) || 0) + 1)
    })
    
    return Array.from(frequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([item]) => item)
  }

  private findSimilarUsers(userId: string): { userId: string; similarity: number }[] {
    const userBehavior = this.userBehaviors.get(userId)
    if (!userBehavior) return []
    
    const similarities: { userId: string; similarity: number }[] = []
    
    this.userBehaviors.forEach((behavior, otherUserId) => {
      if (otherUserId === userId) return
      
      const similarity = this.calculateUserSimilarity(userBehavior, behavior)
      if (similarity > 0.3) { // Threshold de similitud
        similarities.push({ userId: otherUserId, similarity })
      }
    })
    
    return similarities.sort((a, b) => b.similarity - a.similarity).slice(0, 10)
  }

  private calculateUserSimilarity(user1: UserBehavior, user2: UserBehavior): number {
    // Similitud basada en categorías preferidas
    const categorySimilarity = this.calculateArraySimilarity(
      user1.preferences.categories,
      user2.preferences.categories
    )
    
    // Similitud basada en establecimientos frecuentes
    const establishmentSimilarity = this.calculateArraySimilarity(
      user1.preferences.favoriteEstablishments,
      user2.preferences.favoriteEstablishments
    )
    
    // Similitud basada en rango de precios
    const priceSimilarity = this.calculatePriceRangeSimilarity(
      user1.preferences.priceRange,
      user2.preferences.priceRange
    )
    
    return (categorySimilarity * 0.5 + establishmentSimilarity * 0.3 + priceSimilarity * 0.2)
  }

  private calculateArraySimilarity<T>(arr1: T[], arr2: T[]): number {
    if (arr1.length === 0 && arr2.length === 0) return 1
    if (arr1.length === 0 || arr2.length === 0) return 0
    
    const intersection = arr1.filter(item => arr2.includes(item))
    const union = [...new Set([...arr1, ...arr2])]
    
    return intersection.length / union.length
  }

  private calculatePriceRangeSimilarity(range1: [number, number], range2: [number, number]): number {
    const overlap = Math.max(0, Math.min(range1[1], range2[1]) - Math.max(range1[0], range2[0]))
    const totalRange = Math.max(range1[1], range2[1]) - Math.min(range1[0], range2[0])
    
    return totalRange > 0 ? overlap / totalRange : 1
  }

  private updateUserPreferences(userId: string) {
    const behavior = this.userBehaviors.get(userId)
    if (!behavior) return
    
    // Actualizar preferencias basadas en historial
    const patterns = this.analyzePurchasePatterns(behavior.history.purchases)
    
    behavior.preferences.categories = patterns.frequentCategories
    behavior.preferences.favoriteEstablishments = patterns.frequentEstablishments
    behavior.preferences.priceRange = patterns.priceRange
    behavior.preferences.preferredTimes = patterns.preferredHours.map(h => `${h}:00`)
  }

  private async loadUserBehaviors() {
    // Cargar desde localStorage o API
    try {
      const stored = localStorage.getItem('tugotugo-user-behaviors')
      if (stored) {
        const behaviors = JSON.parse(stored)
        Object.entries(behaviors).forEach(([userId, behavior]) => {
          this.userBehaviors.set(userId, behavior as UserBehavior)
        })
      }
    } catch (error) {
      console.error('Error loading user behaviors:', error)
    }
  }

  private async saveUserBehavior(userId: string, behavior: UserBehavior) {
    try {
      const allBehaviors = Object.fromEntries(this.userBehaviors.entries())
      localStorage.setItem('tugotugo-user-behaviors', JSON.stringify(allBehaviors))
    } catch (error) {
      console.error('Error saving user behavior:', error)
    }
  }

  private async calculatePackVectors() {
    // Pre-calcular vectores de características para packs
    // Esto se puede expandir con TensorFlow.js
    console.log('Pack vectors calculation - to be implemented with TensorFlow.js')
  }
}

// Instancia singleton
export const tugotugoAI = new TugoTugoAI()
