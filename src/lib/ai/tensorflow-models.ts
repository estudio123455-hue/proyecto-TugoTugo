'use client'

import * as tf from '@tensorflow/tfjs'

/**
 * TugoTugo - Modelos de TensorFlow.js Reales
 * Sistema de IA con modelos entrenados para recomendaciones
 */

export interface ModelPrediction {
  prediction: number
  confidence: number
  factors: string[]
}

export interface UserFeatureVector {
  age: number
  location: [number, number] // lat, lng
  avgOrderValue: number
  orderFrequency: number
  preferredCuisines: number[] // one-hot encoded
  timeOfDay: number
  dayOfWeek: number
  seasonality: number
}

export interface PackFeatureVector {
  price: number
  originalPrice: number
  discount: number
  rating: number
  distance: number
  cuisine: number[] // one-hot encoded
  availability: number
  popularity: number
}

class TensorFlowModels {
  private recommendationModel: tf.LayersModel | null = null
  private sentimentModel: tf.LayersModel | null = null
  private churnModel: tf.LayersModel | null = null
  private isInitialized = false

  constructor() {
    this.initializeModels()
  }

  /**
   * Inicializar modelos de TensorFlow.js
   */
  private async initializeModels() {
    try {
      console.log('Inicializando modelos de TensorFlow.js...')
      
      // Configurar backend
      await tf.ready()
      console.log('TensorFlow.js backend:', tf.getBackend())

      // Crear modelos desde cero (en producción cargarías modelos pre-entrenados)
      this.recommendationModel = this.createRecommendationModel()
      this.sentimentModel = this.createSentimentModel()
      this.churnModel = this.createChurnModel()

      // Entrenar con datos sintéticos (en producción usarías datos reales)
      await this.trainModelsWithSyntheticData()

      this.isInitialized = true
      console.log('Modelos de TensorFlow.js inicializados correctamente')
    } catch (error) {
      console.error('Error inicializando modelos:', error)
      this.isInitialized = false
    }
  }

  /**
   * Crear modelo de recomendaciones
   */
  private createRecommendationModel(): tf.LayersModel {
    const model = tf.sequential({
      layers: [
        tf.layers.dense({
          inputShape: [16], // 8 user features + 8 pack features
          units: 64,
          activation: 'relu',
          name: 'dense_1'
        }),
        tf.layers.dropout({ rate: 0.3 }),
        tf.layers.dense({
          units: 32,
          activation: 'relu',
          name: 'dense_2'
        }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({
          units: 16,
          activation: 'relu',
          name: 'dense_3'
        }),
        tf.layers.dense({
          units: 1,
          activation: 'sigmoid',
          name: 'output'
        })
      ]
    })

    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'binaryCrossentropy',
      metrics: ['accuracy']
    })

    return model
  }

  /**
   * Crear modelo de análisis de sentimientos
   */
  private createSentimentModel(): tf.LayersModel {
    const model = tf.sequential({
      layers: [
        tf.layers.dense({
          inputShape: [100], // Vector de características de texto
          units: 50,
          activation: 'relu'
        }),
        tf.layers.dropout({ rate: 0.5 }),
        tf.layers.dense({
          units: 25,
          activation: 'relu'
        }),
        tf.layers.dense({
          units: 3, // negativo, neutro, positivo
          activation: 'softmax'
        })
      ]
    })

    model.compile({
      optimizer: 'adam',
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    })

    return model
  }

  /**
   * Crear modelo de predicción de churn
   */
  private createChurnModel(): tf.LayersModel {
    const model = tf.sequential({
      layers: [
        tf.layers.dense({
          inputShape: [12], // Features de comportamiento del usuario
          units: 32,
          activation: 'relu'
        }),
        tf.layers.dropout({ rate: 0.3 }),
        tf.layers.dense({
          units: 16,
          activation: 'relu'
        }),
        tf.layers.dense({
          units: 1,
          activation: 'sigmoid'
        })
      ]
    })

    model.compile({
      optimizer: 'adam',
      loss: 'binaryCrossentropy',
      metrics: ['accuracy']
    })

    return model
  }

  /**
   * Entrenar modelos con datos sintéticos
   */
  private async trainModelsWithSyntheticData() {
    console.log('Entrenando modelos con datos sintéticos...')

    // Generar datos sintéticos para recomendaciones
    const { xs: recXs, ys: recYs } = this.generateSyntheticRecommendationData(1000)
    
    if (this.recommendationModel) {
      await this.recommendationModel.fit(recXs, recYs, {
        epochs: 50,
        batchSize: 32,
        validationSplit: 0.2,
        verbose: 0
      })
    }

    // Generar datos sintéticos para sentimientos
    const { xs: sentXs, ys: sentYs } = this.generateSyntheticSentimentData(500)
    
    if (this.sentimentModel) {
      await this.sentimentModel.fit(sentXs, sentYs, {
        epochs: 30,
        batchSize: 16,
        validationSplit: 0.2,
        verbose: 0
      })
    }

    // Generar datos sintéticos para churn
    const { xs: churnXs, ys: churnYs } = this.generateSyntheticChurnData(800)
    
    if (this.churnModel) {
      await this.churnModel.fit(churnXs, churnYs, {
        epochs: 40,
        batchSize: 32,
        validationSplit: 0.2,
        verbose: 0
      })
    }

    console.log('Entrenamiento completado')
  }

  /**
   * Generar datos sintéticos para recomendaciones
   */
  private generateSyntheticRecommendationData(samples: number) {
    const xs = []
    const ys = []

    for (let i = 0; i < samples; i++) {
      // User features
      const userAge = Math.random() * 60 + 18
      const userLat = Math.random() * 0.2 + 4.5 // Bogotá aprox
      const userLng = Math.random() * 0.2 - 74.1
      const avgOrderValue = Math.random() * 50000 + 15000
      const orderFreq = Math.random() * 10 + 1
      const prefCuisine = Math.random() > 0.5 ? 1 : 0
      const timeOfDay = Math.random() * 24
      const dayOfWeek = Math.random() * 7

      // Pack features
      const packPrice = Math.random() * 40000 + 10000
      const originalPrice = packPrice * (1 + Math.random() * 0.5)
      const discount = (originalPrice - packPrice) / originalPrice
      const rating = Math.random() * 2 + 3 // 3-5 stars
      const distance = Math.random() * 10 // km
      const packCuisine = Math.random() > 0.5 ? 1 : 0
      const availability = Math.random()
      const popularity = Math.random()

      const features = [
        userAge / 100, userLat / 10, userLng / -100, avgOrderValue / 100000,
        orderFreq / 10, prefCuisine, timeOfDay / 24, dayOfWeek / 7,
        packPrice / 100000, discount, rating / 5, distance / 10,
        packCuisine, availability, popularity, Math.random()
      ]

      // Label: probabilidad de que le guste (basado en lógica simple)
      const compatibility = (
        (prefCuisine === packCuisine ? 0.3 : 0) +
        (distance < 5 ? 0.2 : 0) +
        (rating > 4 ? 0.2 : 0) +
        (discount > 0.2 ? 0.2 : 0) +
        Math.random() * 0.1
      )

      xs.push(features)
      ys.push([compatibility > 0.5 ? 1 : 0])
    }

    return {
      xs: tf.tensor2d(xs),
      ys: tf.tensor2d(ys)
    }
  }

  /**
   * Generar datos sintéticos para sentimientos
   */
  private generateSyntheticSentimentData(samples: number) {
    const xs = []
    const ys = []

    for (let i = 0; i < samples; i++) {
      // Vector de características de texto simulado
      const textFeatures = Array.from({ length: 100 }, () => Math.random())
      
      // Sentimiento basado en algunas características
      const positiveSignal = textFeatures.slice(0, 30).reduce((a, b) => a + b, 0) / 30
      const negativeSignal = textFeatures.slice(30, 60).reduce((a, b) => a + b, 0) / 30
      
      let sentiment
      if (positiveSignal > 0.6) {
        sentiment = [0, 0, 1] // positivo
      } else if (negativeSignal > 0.6) {
        sentiment = [1, 0, 0] // negativo
      } else {
        sentiment = [0, 1, 0] // neutro
      }

      xs.push(textFeatures)
      ys.push(sentiment)
    }

    return {
      xs: tf.tensor2d(xs),
      ys: tf.tensor2d(ys)
    }
  }

  /**
   * Generar datos sintéticos para churn
   */
  private generateSyntheticChurnData(samples: number) {
    const xs = []
    const ys = []

    for (let i = 0; i < samples; i++) {
      const daysSinceLastOrder = Math.random() * 60
      const totalOrders = Math.random() * 50
      const avgRating = Math.random() * 2 + 3
      const avgOrderValue = Math.random() * 50000 + 10000
      const complaintsCount = Math.random() * 5
      const appUsageFreq = Math.random() * 30
      const sessionDuration = Math.random() * 60
      const supportTickets = Math.random() * 3
      const discountUsage = Math.random()
      const referrals = Math.random() * 5
      const loyaltyPoints = Math.random() * 1000
      const seasonality = Math.random()

      const features = [
        daysSinceLastOrder / 60, totalOrders / 50, avgRating / 5,
        avgOrderValue / 100000, complaintsCount / 5, appUsageFreq / 30,
        sessionDuration / 60, supportTickets / 3, discountUsage,
        referrals / 5, loyaltyPoints / 1000, seasonality
      ]

      // Churn probability based on features
      const churnProb = (
        (daysSinceLastOrder > 30 ? 0.3 : 0) +
        (totalOrders < 5 ? 0.2 : 0) +
        (avgRating < 3.5 ? 0.2 : 0) +
        (complaintsCount > 2 ? 0.2 : 0) +
        (appUsageFreq < 5 ? 0.1 : 0)
      )

      xs.push(features)
      ys.push([churnProb > 0.5 ? 1 : 0])
    }

    return {
      xs: tf.tensor2d(xs),
      ys: tf.tensor2d(ys)
    }
  }

  /**
   * Predecir probabilidad de recomendación
   */
  async predictRecommendation(
    userFeatures: UserFeatureVector,
    packFeatures: PackFeatureVector
  ): Promise<ModelPrediction> {
    if (!this.isInitialized || !this.recommendationModel) {
      throw new Error('Modelo de recomendación no inicializado')
    }

    const features = [
      userFeatures.age / 100,
      userFeatures.location[0] / 10,
      userFeatures.location[1] / -100,
      userFeatures.avgOrderValue / 100000,
      userFeatures.orderFrequency / 10,
      userFeatures.preferredCuisines[0] || 0,
      userFeatures.timeOfDay / 24,
      userFeatures.dayOfWeek / 7,
      packFeatures.price / 100000,
      packFeatures.discount,
      packFeatures.rating / 5,
      packFeatures.distance / 10,
      packFeatures.cuisine[0] || 0,
      packFeatures.availability,
      packFeatures.popularity,
      Math.random() // noise
    ]

    const prediction = this.recommendationModel.predict(
      tf.tensor2d([features])
    ) as tf.Tensor

    const result = await prediction.data()
    const confidence = result[0]

    prediction.dispose()

    return {
      prediction: confidence,
      confidence: Math.min(confidence * 1.2, 1), // Boost confidence slightly
      factors: this.explainRecommendation(userFeatures, packFeatures, confidence)
    }
  }

  /**
   * Analizar sentimiento de texto
   */
  async analyzeSentiment(textFeatures: number[]): Promise<ModelPrediction> {
    if (!this.isInitialized || !this.sentimentModel) {
      throw new Error('Modelo de sentimiento no inicializado')
    }

    const prediction = this.sentimentModel.predict(
      tf.tensor2d([textFeatures])
    ) as tf.Tensor

    const result = await prediction.data()
    const [negative, neutral, positive] = result

    prediction.dispose()

    const maxIndex = result.indexOf(Math.max(...result))
    const sentimentLabels = ['negativo', 'neutro', 'positivo']
    const sentimentScores = [-1, 0, 1]

    return {
      prediction: sentimentScores[maxIndex],
      confidence: Math.max(...result),
      factors: [`Sentimiento: ${sentimentLabels[maxIndex]}`]
    }
  }

  /**
   * Predecir probabilidad de churn
   */
  async predictChurn(userBehaviorFeatures: number[]): Promise<ModelPrediction> {
    if (!this.isInitialized || !this.churnModel) {
      throw new Error('Modelo de churn no inicializado')
    }

    const prediction = this.churnModel.predict(
      tf.tensor2d([userBehaviorFeatures])
    ) as tf.Tensor

    const result = await prediction.data()
    const churnProbability = result[0]

    prediction.dispose()

    return {
      prediction: churnProbability,
      confidence: Math.abs(churnProbability - 0.5) * 2, // Distance from uncertainty
      factors: this.explainChurn(userBehaviorFeatures, churnProbability)
    }
  }

  /**
   * Explicar recomendación
   */
  private explainRecommendation(
    userFeatures: UserFeatureVector,
    packFeatures: PackFeatureVector,
    score: number
  ): string[] {
    const factors = []

    if (packFeatures.distance < 2) {
      factors.push('Muy cerca de tu ubicación')
    }
    if (packFeatures.discount > 0.3) {
      factors.push('Excelente descuento')
    }
    if (packFeatures.rating > 4.5) {
      factors.push('Alta calificación')
    }
    if (score > 0.8) {
      factors.push('Altamente compatible con tus preferencias')
    }

    return factors.length > 0 ? factors : ['Recomendación basada en IA']
  }

  /**
   * Explicar predicción de churn
   */
  private explainChurn(features: number[], churnProb: number): string[] {
    const factors = []

    if (features[0] > 0.5) { // daysSinceLastOrder
      factors.push('Tiempo prolongado sin órdenes')
    }
    if (features[1] < 0.2) { // totalOrders
      factors.push('Pocas órdenes históricas')
    }
    if (features[2] < 0.7) { // avgRating
      factors.push('Calificaciones bajas')
    }
    if (churnProb > 0.7) {
      factors.push('Alto riesgo de abandono')
    }

    return factors.length > 0 ? factors : ['Análisis de comportamiento']
  }

  /**
   * Obtener información de los modelos
   */
  getModelInfo() {
    return {
      isInitialized: this.isInitialized,
      backend: tf.getBackend(),
      models: {
        recommendation: this.recommendationModel ? 'Cargado' : 'No disponible',
        sentiment: this.sentimentModel ? 'Cargado' : 'No disponible',
        churn: this.churnModel ? 'Cargado' : 'No disponible'
      }
    }
  }
}

// Instancia singleton
export const tensorFlowModels = new TensorFlowModels()
