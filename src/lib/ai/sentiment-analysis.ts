'use client'

/**
 * TugoTugo AI - Análisis de Sentimientos (Nivel Intermedio)
 * Analiza reseñas y comentarios para mejorar recomendaciones
 */

// Palabras clave para análisis de sentimientos en español
const POSITIVE_KEYWORDS = [
  'excelente', 'bueno', 'delicioso', 'rico', 'sabroso', 'fresco', 'perfecto',
  'increíble', 'fantástico', 'maravilloso', 'genial', 'espectacular',
  'recomiendo', 'me encanta', 'me gusta', 'satisfecho', 'feliz',
  'rápido', 'eficiente', 'amable', 'cordial', 'limpio', 'higiénico',
  'calidad', 'precio justo', 'barato', 'económico', 'abundante'
]

const NEGATIVE_KEYWORDS = [
  'malo', 'terrible', 'horrible', 'pésimo', 'asqueroso', 'desagradable',
  'frío', 'viejo', 'duro', 'salado', 'insípido', 'caro', 'costoso',
  'lento', 'tardó', 'demora', 'espera', 'sucio', 'antihigiénico',
  'grosero', 'maleducado', 'no recomiendo', 'decepcionado', 'molesto',
  'pequeño', 'poco', 'escaso', 'mal servicio', 'mala atención'
]

const FOOD_ASPECTS = {
  taste: ['sabor', 'gusto', 'rico', 'sabroso', 'delicioso', 'insípido', 'salado', 'dulce'],
  quality: ['calidad', 'fresco', 'viejo', 'duro', 'blando', 'crujiente'],
  service: ['servicio', 'atención', 'mesero', 'personal', 'amable', 'grosero', 'rápido', 'lento'],
  price: ['precio', 'caro', 'barato', 'económico', 'costoso', 'justo', 'valor'],
  quantity: ['cantidad', 'porción', 'abundante', 'poco', 'pequeño', 'grande'],
  hygiene: ['limpio', 'sucio', 'higiénico', 'antihigiénico', 'limpieza']
}

export interface SentimentResult {
  score: number // -1 (muy negativo) a 1 (muy positivo)
  confidence: number // 0 a 1
  aspects: {
    taste: number
    quality: number
    service: number
    price: number
    quantity: number
    hygiene: number
  }
  keywords: {
    positive: string[]
    negative: string[]
  }
  summary: string
}

export interface ReviewAnalysis {
  reviewId: string
  packId: string
  establishmentId: string
  sentiment: SentimentResult
  predictedSatisfaction: number // 0 a 5 (estrellas predichas)
  recommendations: string[]
}

/**
 * Motor de Análisis de Sentimientos para TugoTugo
 */
export class SentimentAnalyzer {
  
  /**
   * Analizar sentimiento de una reseña
   */
  analyzeSentiment(text: string): SentimentResult {
    const normalizedText = this.normalizeText(text)
    const words = normalizedText.split(/\s+/)
    
    let positiveScore = 0
    let negativeScore = 0
    const foundPositive: string[] = []
    const foundNegative: string[] = []
    
    // Análisis básico de palabras clave
    words.forEach(word => {
      if (POSITIVE_KEYWORDS.includes(word)) {
        positiveScore += 1
        foundPositive.push(word)
      }
      if (NEGATIVE_KEYWORDS.includes(word)) {
        negativeScore += 1
        foundNegative.push(word)
      }
    })
    
    // Análisis de aspectos específicos
    const aspects = this.analyzeAspects(normalizedText)
    
    // Calcular score final
    const totalWords = words.length
    const sentimentIntensity = (positiveScore - negativeScore) / Math.max(totalWords * 0.1, 1)
    const score = Math.max(-1, Math.min(1, sentimentIntensity))
    
    // Calcular confianza basada en cantidad de palabras clave encontradas
    const keywordCount = positiveScore + negativeScore
    const confidence = Math.min(1, keywordCount / Math.max(totalWords * 0.05, 1))
    
    return {
      score,
      confidence,
      aspects,
      keywords: {
        positive: foundPositive,
        negative: foundNegative
      },
      summary: this.generateSummary(score, aspects)
    }
  }
  
  /**
   * Analizar aspectos específicos de la comida
   */
  private analyzeAspects(text: string): SentimentResult['aspects'] {
    const aspects = {
      taste: 0,
      quality: 0,
      service: 0,
      price: 0,
      quantity: 0,
      hygiene: 0
    }
    
    Object.entries(FOOD_ASPECTS).forEach(([aspect, keywords]) => {
      let aspectScore = 0
      let mentions = 0
      
      keywords.forEach(keyword => {
        if (text.includes(keyword)) {
          mentions++
          // Buscar contexto alrededor de la palabra clave
          const context = this.getWordContext(text, keyword, 3)
          const contextSentiment = this.getContextSentiment(context)
          aspectScore += contextSentiment
        }
      })
      
      if (mentions > 0) {
        aspects[aspect as keyof typeof aspects] = aspectScore / mentions
      }
    })
    
    return aspects
  }
  
  /**
   * Obtener contexto alrededor de una palabra
   */
  private getWordContext(text: string, word: string, windowSize: number): string {
    const words = text.split(/\s+/)
    const index = words.findIndex(w => w.includes(word))
    
    if (index === -1) return ''
    
    const start = Math.max(0, index - windowSize)
    const end = Math.min(words.length, index + windowSize + 1)
    
    return words.slice(start, end).join(' ')
  }
  
  /**
   * Analizar sentimiento de un contexto específico
   */
  private getContextSentiment(context: string): number {
    const words = context.toLowerCase().split(/\s+/)
    let score = 0
    
    words.forEach(word => {
      if (POSITIVE_KEYWORDS.includes(word)) score += 1
      if (NEGATIVE_KEYWORDS.includes(word)) score -= 1
    })
    
    return Math.max(-1, Math.min(1, score / Math.max(words.length * 0.2, 1)))
  }
  
  /**
   * Normalizar texto para análisis
   */
  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\sáéíóúñü]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  }
  
  /**
   * Generar resumen del análisis
   */
  private generateSummary(score: number, _aspects: SentimentResult['aspects']): string {
    if (score > 0.5) return 'Reseña muy positiva'
    if (score > 0.2) return 'Reseña positiva'
    if (score > -0.2) return 'Reseña neutral'
    if (score > -0.5) return 'Reseña negativa'
    return 'Reseña muy negativa'
  }
  
  /**
   * Predecir satisfacción del usuario (1-5 estrellas)
   */
  predictSatisfaction(sentiment: SentimentResult): number {
    // Convertir score de sentimiento (-1 a 1) a estrellas (1 a 5)
    const baseScore = ((sentiment.score + 1) / 2) * 4 + 1 // 1 a 5
    
    // Ajustar basado en aspectos específicos
    const aspectsAvg = Object.values(sentiment.aspects).reduce((sum, val) => sum + val, 0) / 6
    const aspectAdjustment = aspectsAvg * 0.5
    
    // Ajustar basado en confianza
    const confidenceAdjustment = sentiment.confidence * 0.3
    
    const finalScore = baseScore + aspectAdjustment + confidenceAdjustment
    
    return Math.max(1, Math.min(5, Math.round(finalScore * 2) / 2)) // Redondear a 0.5
  }
  
  /**
   * Generar recomendaciones basadas en el análisis
   */
  generateRecommendations(sentiment: SentimentResult): string[] {
    const recommendations: string[] = []
    
    if (sentiment.score < -0.3) {
      recommendations.push('Revisar calidad del producto')
      recommendations.push('Mejorar tiempo de preparación')
    }
    
    if (sentiment.aspects.service < -0.2) {
      recommendations.push('Capacitar personal en atención al cliente')
    }
    
    if (sentiment.aspects.hygiene < -0.2) {
      recommendations.push('Reforzar protocolos de limpieza')
    }
    
    if (sentiment.aspects.price < -0.2) {
      recommendations.push('Evaluar estrategia de precios')
    }
    
    if (sentiment.aspects.quantity < -0.2) {
      recommendations.push('Revisar tamaño de porciones')
    }
    
    if (sentiment.score > 0.5) {
      recommendations.push('Mantener estándares de calidad')
      recommendations.push('Considerar para promociones especiales')
    }
    
    return recommendations
  }
  
  /**
   * Analizar múltiples reseñas de un pack
   */
  analyzePackReviews(reviews: { id: string; content: string; rating: number }[], packId: string, establishmentId: string): {
    overallSentiment: SentimentResult
    averagePredictedRating: number
    reviewAnalyses: ReviewAnalysis[]
    insights: string[]
  } {
    if (reviews.length === 0) {
      return {
        overallSentiment: {
          score: 0,
          confidence: 0,
          aspects: { taste: 0, quality: 0, service: 0, price: 0, quantity: 0, hygiene: 0 },
          keywords: { positive: [], negative: [] },
          summary: 'Sin reseñas disponibles'
        },
        averagePredictedRating: 3,
        reviewAnalyses: [],
        insights: ['No hay suficientes reseñas para análisis']
      }
    }
    
    const reviewAnalyses: ReviewAnalysis[] = reviews.map(review => {
      const sentiment = this.analyzeSentiment(review.content)
      const predictedSatisfaction = this.predictSatisfaction(sentiment)
      const recommendations = this.generateRecommendations(sentiment)
      
      return {
        reviewId: review.id,
        packId,
        establishmentId,
        sentiment,
        predictedSatisfaction,
        recommendations
      }
    })
    
    // Calcular métricas generales
    const avgScore = reviewAnalyses.reduce((sum, analysis) => sum + analysis.sentiment.score, 0) / reviewAnalyses.length
    const avgConfidence = reviewAnalyses.reduce((sum, analysis) => sum + analysis.sentiment.confidence, 0) / reviewAnalyses.length
    const avgPredictedRating = reviewAnalyses.reduce((sum, analysis) => sum + analysis.predictedSatisfaction, 0) / reviewAnalyses.length
    
    // Combinar aspectos
    const combinedAspects = {
      taste: reviewAnalyses.reduce((sum, analysis) => sum + analysis.sentiment.aspects.taste, 0) / reviewAnalyses.length,
      quality: reviewAnalyses.reduce((sum, analysis) => sum + analysis.sentiment.aspects.quality, 0) / reviewAnalyses.length,
      service: reviewAnalyses.reduce((sum, analysis) => sum + analysis.sentiment.aspects.service, 0) / reviewAnalyses.length,
      price: reviewAnalyses.reduce((sum, analysis) => sum + analysis.sentiment.aspects.price, 0) / reviewAnalyses.length,
      quantity: reviewAnalyses.reduce((sum, analysis) => sum + analysis.sentiment.aspects.quantity, 0) / reviewAnalyses.length,
      hygiene: reviewAnalyses.reduce((sum, analysis) => sum + analysis.sentiment.aspects.hygiene, 0) / reviewAnalyses.length
    }
    
    // Combinar palabras clave
    const allPositive = reviewAnalyses.flatMap(analysis => analysis.sentiment.keywords.positive)
    const allNegative = reviewAnalyses.flatMap(analysis => analysis.sentiment.keywords.negative)
    
    const overallSentiment: SentimentResult = {
      score: avgScore,
      confidence: avgConfidence,
      aspects: combinedAspects,
      keywords: {
        positive: [...new Set(allPositive)],
        negative: [...new Set(allNegative)]
      },
      summary: this.generateSummary(avgScore, combinedAspects)
    }
    
    // Generar insights
    const insights = this.generatePackInsights(overallSentiment, reviewAnalyses)
    
    return {
      overallSentiment,
      averagePredictedRating: Math.round(avgPredictedRating * 2) / 2,
      reviewAnalyses,
      insights
    }
  }
  
  /**
   * Generar insights para un pack basado en el análisis
   */
  private generatePackInsights(sentiment: SentimentResult, analyses: ReviewAnalysis[]): string[] {
    const insights: string[] = []
    
    // Análisis de tendencias
    if (sentiment.score > 0.3) {
      insights.push(`Pack bien valorado (${(sentiment.score * 100).toFixed(0)}% sentimiento positivo)`)
    } else if (sentiment.score < -0.3) {
      insights.push(`Pack con problemas identificados (${Math.abs(sentiment.score * 100).toFixed(0)}% sentimiento negativo)`)
    }
    
    // Aspectos destacados
    const bestAspect = Object.entries(sentiment.aspects).reduce((a, b) => a[1] > b[1] ? a : b)
    const worstAspect = Object.entries(sentiment.aspects).reduce((a, b) => a[1] < b[1] ? a : b)
    
    if (bestAspect[1] > 0.2) {
      insights.push(`Fortaleza: ${this.translateAspect(bestAspect[0])}`)
    }
    
    if (worstAspect[1] < -0.2) {
      insights.push(`Área de mejora: ${this.translateAspect(worstAspect[0])}`)
    }
    
    // Consistencia de reseñas
    const scoreVariance = this.calculateVariance(analyses.map(a => a.sentiment.score))
    if (scoreVariance < 0.1) {
      insights.push('Experiencia consistente entre usuarios')
    } else if (scoreVariance > 0.4) {
      insights.push('Experiencia variable - revisar consistencia')
    }
    
    return insights
  }
  
  /**
   * Traducir aspectos técnicos a términos comprensibles
   */
  private translateAspect(aspect: string): string {
    const translations: { [key: string]: string } = {
      taste: 'Sabor',
      quality: 'Calidad',
      service: 'Servicio',
      price: 'Precio',
      quantity: 'Cantidad',
      hygiene: 'Limpieza'
    }
    return translations[aspect] || aspect
  }
  
  /**
   * Calcular varianza de un array de números
   */
  private calculateVariance(numbers: number[]): number {
    const mean = numbers.reduce((sum, num) => sum + num, 0) / numbers.length
    const squaredDiffs = numbers.map(num => Math.pow(num - mean, 2))
    return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / numbers.length
  }
}

// Instancia singleton
export const sentimentAnalyzer = new SentimentAnalyzer()
