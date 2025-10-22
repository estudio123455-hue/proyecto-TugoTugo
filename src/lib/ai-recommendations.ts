// Simplified recommendation engine without OpenAI dependency
// TODO: Install OpenAI package and uncomment the following lines when ready:
// import OpenAI from 'openai'
// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

interface UserPreferences {
  userId: string
  favoriteCategories: string[]
  priceRange: { min: number; max: number }
  dietaryRestrictions: string[]
  location: { lat: number; lng: number }
  orderHistory: OrderHistory[]
}

interface OrderHistory {
  packId: string
  establishmentId: string
  category: string
  price: number
  rating?: number
  timestamp: Date
}

interface Pack {
  id: string
  title: string
  description: string
  category: string
  price: number
  originalPrice: number
  establishmentId: string
  establishmentName: string
  location: { lat: number; lng: number }
  availableUntil: Date
  tags: string[]
  dietaryInfo: string[]
}

interface RecommendationScore {
  packId: string
  score: number
  reasons: string[]
}

export class AIRecommendationEngine {
  private static instance: AIRecommendationEngine
  private embeddings: Map<string, number[]> = new Map()

  static getInstance(): AIRecommendationEngine {
    if (!AIRecommendationEngine.instance) {
      AIRecommendationEngine.instance = new AIRecommendationEngine()
    }
    return AIRecommendationEngine.instance
  }

  // Generate embeddings for pack descriptions
  async generatePackEmbedding(pack: Pack): Promise<number[]> {
    const cacheKey = `pack_${pack.id}`
    
    if (this.embeddings.has(cacheKey)) {
      return this.embeddings.get(cacheKey)!
    }

    // TODO: Implement OpenAI embeddings when available
    // For now, return empty array as fallback
    return []
  }

  // Generate user preference embedding
  async generateUserEmbedding(preferences: UserPreferences): Promise<number[]> {
    const cacheKey = `user_${preferences.userId}`
    
    if (this.embeddings.has(cacheKey)) {
      return this.embeddings.get(cacheKey)!
    }

    try {
      // Create user preference text from history and preferences
      const favoriteCategories = preferences.favoriteCategories.join(' ')
      const dietaryRestrictions = preferences.dietaryRestrictions.join(' ')
      const recentOrders = preferences.orderHistory
        .slice(-10) // Last 10 orders
        .map(order => `${order.category} price:${order.price}`)
        .join(' ')

      const userText = `preferences: ${favoriteCategories} dietary: ${dietaryRestrictions} history: ${recentOrders}`
      
      // TODO: Uncomment when OpenAI is installed
      // const response = await openai.embeddings.create({
      //   model: 'text-embedding-3-small',
      //   input: userText,
      //   encoding_format: 'float',
      // })
      // const embedding = response.data[0].embedding
      // this.embeddings.set(cacheKey, embedding)
      // return embedding
      
      // Temporary fallback: return empty array
      return []
    } catch (error) {
      console.error('Error generating user embedding:', error)
      return []
    }
  }

  // Calculate cosine similarity between two vectors
  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0

    let dotProduct = 0
    let normA = 0
    let normB = 0

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i]
      normA += a[i] * a[i]
      normB += b[i] * b[i]
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
  }

  // Calculate distance between two locations (Haversine formula)
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371 // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  // Generate recommendations for a user
  async getRecommendations(
    preferences: UserPreferences, 
    availablePacks: Pack[], 
    limit: number = 10
  ): Promise<RecommendationScore[]> {
    try {
      const userEmbedding = await this.generateUserEmbedding(preferences)
      if (userEmbedding.length === 0) {
        return this.getFallbackRecommendations(preferences, availablePacks, limit)
      }

      const recommendations: RecommendationScore[] = []

      for (const pack of availablePacks) {
        const packEmbedding = await this.generatePackEmbedding(pack)
        if (packEmbedding.length === 0) continue

        // Calculate different scoring factors
        const semanticScore = this.cosineSimilarity(userEmbedding, packEmbedding)
        const locationScore = this.calculateLocationScore(preferences.location, pack.location)
        const priceScore = this.calculatePriceScore(preferences.priceRange, pack.price)
        const categoryScore = this.calculateCategoryScore(preferences.favoriteCategories, pack.category)
        const dietaryScore = this.calculateDietaryScore(preferences.dietaryRestrictions, pack.dietaryInfo)
        const popularityScore = this.calculatePopularityScore(pack)
        const timeScore = this.calculateTimeScore(pack.availableUntil)

        // Weighted final score
        const finalScore = (
          semanticScore * 0.3 +
          locationScore * 0.25 +
          priceScore * 0.15 +
          categoryScore * 0.15 +
          dietaryScore * 0.1 +
          popularityScore * 0.03 +
          timeScore * 0.02
        )

        const reasons = this.generateReasons(
          semanticScore, locationScore, priceScore, categoryScore, 
          dietaryScore, pack, preferences
        )

        recommendations.push({
          packId: pack.id,
          score: finalScore,
          reasons
        })
      }

      // Sort by score and return top recommendations
      return recommendations
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)

    } catch (error) {
      console.error('Error generating recommendations:', error)
      return this.getFallbackRecommendations(preferences, availablePacks, limit)
    }
  }

  private calculateLocationScore(userLocation: { lat: number; lng: number }, packLocation: { lat: number; lng: number }): number {
    const distance = this.calculateDistance(userLocation.lat, userLocation.lng, packLocation.lat, packLocation.lng)
    // Score decreases with distance, max score at 0km, min score at 10km+
    return Math.max(0, 1 - (distance / 10))
  }

  private calculatePriceScore(priceRange: { min: number; max: number }, packPrice: number): number {
    if (packPrice >= priceRange.min && packPrice <= priceRange.max) {
      return 1.0
    }
    // Penalty for prices outside preferred range
    const deviation = Math.min(
      Math.abs(packPrice - priceRange.min),
      Math.abs(packPrice - priceRange.max)
    )
    return Math.max(0, 1 - (deviation / priceRange.max))
  }

  private calculateCategoryScore(favoriteCategories: string[], packCategory: string): number {
    return favoriteCategories.includes(packCategory) ? 1.0 : 0.3
  }

  private calculateDietaryScore(restrictions: string[], packDietaryInfo: string[]): number {
    if (restrictions.length === 0) return 1.0
    
    const compatibleRestrictions = restrictions.filter(restriction => 
      packDietaryInfo.some(info => info.toLowerCase().includes(restriction.toLowerCase()))
    )
    
    return compatibleRestrictions.length / restrictions.length
  }

  private calculatePopularityScore(pack: Pack): number {
    // This would be based on actual pack popularity metrics
    // For now, return a random score between 0.5 and 1.0
    return 0.5 + Math.random() * 0.5
  }

  private calculateTimeScore(availableUntil: Date): number {
    const now = new Date()
    const hoursUntilExpiry = (availableUntil.getTime() - now.getTime()) / (1000 * 60 * 60)
    
    // Higher score for packs expiring soon (urgency)
    if (hoursUntilExpiry <= 2) return 1.0
    if (hoursUntilExpiry <= 6) return 0.8
    if (hoursUntilExpiry <= 12) return 0.6
    return 0.4
  }

  private generateReasons(
    semanticScore: number, locationScore: number, priceScore: number, 
    categoryScore: number, dietaryScore: number, pack: Pack, preferences: UserPreferences
  ): string[] {
    const reasons: string[] = []

    if (locationScore > 0.8) reasons.push('Muy cerca de ti')
    if (priceScore > 0.8) reasons.push('Precio ideal para ti')
    if (categoryScore > 0.8) reasons.push('Categoría favorita')
    if (dietaryScore > 0.8) reasons.push('Compatible con tus restricciones')
    if (semanticScore > 0.7) reasons.push('Similar a tus pedidos anteriores')

    const discount = Math.round(((pack.originalPrice - pack.price) / pack.originalPrice) * 100)
    if (discount > 50) reasons.push(`${discount}% de descuento`)

    return reasons
  }

  private getFallbackRecommendations(
    preferences: UserPreferences, 
    availablePacks: Pack[], 
    limit: number
  ): RecommendationScore[] {
    // Simple fallback based on location and preferences
    return availablePacks
      .map(pack => ({
        packId: pack.id,
        score: this.calculateLocationScore(preferences.location, pack.location) * 0.6 +
               this.calculatePriceScore(preferences.priceRange, pack.price) * 0.4,
        reasons: ['Recomendación basada en ubicación y precio']
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
  }

  // Clear embeddings cache
  clearCache(): void {
    this.embeddings.clear()
  }
}
