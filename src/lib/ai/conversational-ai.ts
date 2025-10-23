'use client'

/**
 * TugoTugo AI - Chat Bot Conversacional
 * IA conversacional para recomendaciones y soporte
 */

import { sentimentAnalyzer } from './sentiment-analysis'
// import { mlAdvancedSystem } from './ml-advanced'
// import { deepLearningSystem } from './deep-learning'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  metadata?: {
    intent?: string
    entities?: { [key: string]: any }
    confidence?: number
    suggestions?: string[]
  }
}

export interface ConversationContext {
  userId: string
  sessionId: string
  userProfile?: any
  currentLocation?: { lat: number; lng: number }
  conversationHistory: ChatMessage[]
  preferences: {
    language: 'es' | 'en'
    responseStyle: 'casual' | 'formal' | 'friendly'
    maxResponseLength: 'short' | 'medium' | 'long'
  }
  currentIntent?: string
  entities: { [key: string]: any }
}

export interface ChatResponse {
  message: string
  suggestions: string[]
  actions?: {
    type: 'show_packs' | 'show_restaurants' | 'make_reservation' | 'show_offers'
    data?: any
  }[]
  recommendations?: any[]
  confidence: number
}

/**
 * Sistema de IA Conversacional para TugoTugo
 */
export class ConversationalAI {
  private intents: Map<string, any> = new Map()
  private entityExtractor: any
  private responseTemplates: Map<string, string[]> = new Map()
  
  constructor() {
    this.initializeConversationalAI()
  }
  
  /**
   * Inicializar sistema conversacional
   */
  private initializeConversationalAI() {
    this.setupIntents()
    this.setupEntityExtraction()
    this.setupResponseTemplates()
    console.log('Sistema conversacional inicializado')
  }
  
  /**
   * Configurar intents (intenciones) del usuario
   */
  private setupIntents() {
    this.intents.set('greeting', {
      patterns: [
        'hola', 'buenos días', 'buenas tardes', 'buenas noches', 'hey', 'hi',
        'qué tal', 'cómo estás', 'saludos'
      ],
      responses: [
        '¡Hola! 👋 Soy tu asistente de TugoTugo. ¿En qué puedo ayudarte hoy?',
        '¡Bienvenido a TugoTugo! 🍽️ ¿Buscas algo delicioso cerca de ti?',
        '¡Hola! Estoy aquí para ayudarte a encontrar la mejor comida. ¿Qué te apetece?'
      ],
      actions: ['show_nearby_offers']
    })
    
    this.intents.set('food_recommendation', {
      patterns: [
        'qué me recomiendas', 'quiero comer', 'tengo hambre', 'busco comida',
        'recomiéndame algo', 'qué hay bueno', 'opciones de comida'
      ],
      responses: [
        'Perfecto! Basándome en tus gustos, te tengo algunas recomendaciones increíbles 🎯',
        'Déjame buscar las mejores opciones para ti según tus preferencias 🔍',
        'Te voy a mostrar packs que creo que te van a encantar ✨'
      ],
      actions: ['generate_ml_recommendations']
    })
    
    this.intents.set('location_based', {
      patterns: [
        'cerca de mí', 'en mi zona', 'por aquí', 'alrededor', 'nearby',
        'en [ubicación]', 'restaurantes cerca'
      ],
      responses: [
        'Buscando las mejores opciones cerca de tu ubicación 📍',
        'Encontré varios restaurantes geniales en tu zona 🗺️'
      ],
      actions: ['show_nearby_restaurants']
    })
    
    this.intents.set('price_inquiry', {
      patterns: [
        'barato', 'económico', 'precio', 'costo', 'cuánto cuesta',
        'ofertas', 'descuentos', 'promociones'
      ],
      responses: [
        'Te muestro las mejores ofertas y descuentos disponibles 💰',
        'Aquí tienes opciones económicas con excelente relación calidad-precio 🏷️'
      ],
      actions: ['show_discounted_packs']
    })
    
    this.intents.set('cuisine_preference', {
      patterns: [
        'comida [tipo]', 'cocina [tipo]', 'quiero [comida]',
        'italiana', 'mexicana', 'china', 'japonesa', 'colombiana',
        'pizza', 'hamburguesa', 'sushi', 'tacos'
      ],
      responses: [
        'Excelente elección! Te busco las mejores opciones de {cuisine_type} 🍕',
        'Tengo varias recomendaciones de {cuisine_type} que te van a gustar 🌮'
      ],
      actions: ['filter_by_cuisine']
    })
    
    this.intents.set('help', {
      patterns: [
        'ayuda', 'help', 'cómo funciona', 'qué puedes hacer',
        'no entiendo', 'explícame'
      ],
      responses: [
        'Puedo ayudarte a:\n• Encontrar comida cerca de ti 📍\n• Recomendarte packs personalizados 🎯\n• Buscar ofertas y descuentos 💰\n• Responder preguntas sobre restaurantes 🍽️',
        'Soy tu asistente inteligente de TugoTugo. Puedo recomendarte comida, buscar ofertas, y ayudarte con cualquier duda sobre nuestros restaurantes.'
      ],
      actions: ['show_help_menu']
    })
  }
  
  /**
   * Configurar extracción de entidades
   */
  private setupEntityExtraction() {
    this.entityExtractor = {
      location: /(?:en|cerca de|por)\s+([a-záéíóúñü\s]+)/i,
      cuisine: /(italiana?|mexicana?|china?|japonesa?|colombiana?|pizza|hamburguesa|sushi|tacos|comida rápida|saludable)/i,
      price: /(barato|económico|caro|costoso|precio|ofertas?|descuentos?)/i,
      time: /(desayuno|almuerzo|cena|mañana|tarde|noche)/i,
      quantity: /(\d+)\s*(personas?|comensales?)/i
    }
  }
  
  /**
   * Configurar plantillas de respuesta
   */
  private setupResponseTemplates() {
    this.responseTemplates.set('recommendation_intro', [
      'Basándome en tu historial y preferencias, te recomiendo:',
      'Perfecto para ti! Encontré estas opciones:',
      'Según tu perfil de gustos, estas son mis mejores sugerencias:'
    ])
    
    this.responseTemplates.set('location_context', [
      'En tu zona hay {count} restaurantes disponibles',
      'Encontré {count} opciones cerca de ti',
      'Tienes {count} restaurantes a menos de 2km'
    ])
    
    this.responseTemplates.set('no_results', [
      'No encontré opciones exactas, pero te sugiero estas alternativas:',
      'Aunque no hay resultados precisos, estas opciones podrían interesarte:',
      'Déjame mostrarte algunas alternativas que podrían gustarte:'
    ])
  }
  
  /**
   * Procesar mensaje del usuario
   */
  async processMessage(
    message: string,
    context: ConversationContext
  ): Promise<ChatResponse> {
    // Analizar sentimiento del mensaje
    const sentiment = sentimentAnalyzer.analyzeSentiment(message)
    
    // Detectar intent
    const intent = this.detectIntent(message)
    
    // Extraer entidades
    const entities = this.extractEntities(message)
    
    // Actualizar contexto
    context.currentIntent = intent
    context.entities = { ...context.entities, ...entities }
    
    // Generar respuesta
    const response = await this.generateResponse(message, intent, entities, context, sentiment)
    
    // Agregar mensaje a historial
    context.conversationHistory.push({
      id: this.generateId(),
      role: 'user',
      content: message,
      timestamp: new Date(),
      metadata: {
        intent,
        entities,
        confidence: response.confidence
      }
    })
    
    context.conversationHistory.push({
      id: this.generateId(),
      role: 'assistant',
      content: response.message,
      timestamp: new Date()
    })
    
    return response
  }
  
  /**
   * Detectar intención del usuario
   */
  private detectIntent(message: string): string {
    const normalizedMessage = message.toLowerCase()
    let bestMatch = 'unknown'
    let bestScore = 0
    
    for (const [intent, config] of Array.from(this.intents.entries())) {
      const patterns = config.patterns
      let score = 0
      
      for (const pattern of patterns) {
        if (normalizedMessage.includes(pattern.toLowerCase())) {
          score += 1
        }
      }
      
      if (score > bestScore) {
        bestScore = score
        bestMatch = intent
      }
    }
    
    return bestScore > 0 ? bestMatch : 'unknown'
  }
  
  /**
   * Extraer entidades del mensaje
   */
  private extractEntities(message: string): { [key: string]: any } {
    const entities: { [key: string]: any } = {}
    
    for (const [entityType, regex] of Object.entries(this.entityExtractor)) {
      const regexPattern = regex as RegExp
      const match = message.match(regexPattern)
      if (match) {
        entities[entityType] = match[1] || match[0]
      }
    }
    
    return entities
  }
  
  /**
   * Generar respuesta contextual
   */
  private async generateResponse(
    message: string,
    intent: string,
    entities: any,
    context: ConversationContext,
    sentiment: any
  ): Promise<ChatResponse> {
    const intentConfig = this.intents.get(intent)
    
    if (!intentConfig) {
      return this.generateFallbackResponse(message, context)
    }
    
    // Seleccionar respuesta base
    const baseResponse = this.selectRandomResponse(intentConfig.responses)
    
    // Personalizar respuesta
    const personalizedResponse = await this.personalizeResponse(
      baseResponse,
      entities,
      context,
      sentiment
    )
    
    // Generar sugerencias
    const suggestions = this.generateSuggestions(intent, entities, context)
    
    // Ejecutar acciones
    const actions = await this.executeActions(intentConfig.actions || [], entities, context)
    
    // Generar recomendaciones si es necesario
    let recommendations: any[] = []
    if (intent === 'food_recommendation' || intent === 'location_based') {
      recommendations = await this.generateContextualRecommendations(context)
    }
    
    return {
      message: personalizedResponse,
      suggestions,
      actions,
      recommendations,
      confidence: this.calculateConfidence(intent, entities, sentiment)
    }
  }
  
  /**
   * Personalizar respuesta según contexto
   */
  private async personalizeResponse(
    baseResponse: string,
    entities: any,
    context: ConversationContext,
    sentiment: any
  ): Promise<string> {
    let response = baseResponse
    
    // Reemplazar placeholders
    if (entities.cuisine) {
      response = response.replace('{cuisine_type}', entities.cuisine)
    }
    
    // Ajustar tono según sentimiento
    if (sentiment.score < -0.3) {
      response = 'Entiendo tu frustración. ' + response + ' Espero poder ayudarte mejor.'
    } else if (sentiment.score > 0.5) {
      response = response + ' ¡Me alegra poder ayudarte! 😊'
    }
    
    // Personalizar según perfil del usuario
    if (context.userProfile?.behavior?.orderFrequency > 10) {
      response = '¡Hola de nuevo! ' + response
    }
    
    return response
  }
  
  /**
   * Generar sugerencias de seguimiento
   */
  private generateSuggestions(
    intent: string,
    entities: any,
    context: ConversationContext
  ): string[] {
    const suggestions: string[] = []
    
    switch (intent) {
      case 'greeting':
        suggestions.push('¿Qué me recomiendas?', 'Buscar cerca de mí', 'Ver ofertas')
        break
      case 'food_recommendation':
        suggestions.push('Mostrar más opciones', 'Filtrar por precio', 'Ver reseñas')
        break
      case 'location_based':
        suggestions.push('Cambiar ubicación', 'Ver menús', 'Ordenar por distancia')
        break
      case 'price_inquiry':
        suggestions.push('Ver más ofertas', 'Filtrar por descuento', 'Comparar precios')
        break
      default:
        suggestions.push('¿Qué más puedo hacer?', 'Ver recomendaciones', 'Buscar ofertas')
    }
    
    return suggestions
  }
  
  /**
   * Ejecutar acciones asociadas al intent
   */
  private async executeActions(
    actions: string[],
    _entities: any,
    context: ConversationContext
  ): Promise<any[]> {
    const executedActions: any[] = []
    
    for (const action of actions) {
      switch (action) {
        case 'show_nearby_offers':
          executedActions.push({
            type: 'show_offers',
            data: { location: context.currentLocation, radius: 5000 }
          })
          break
        case 'generate_ml_recommendations':
          executedActions.push({
            type: 'show_packs',
            data: { type: 'ml_recommendations', limit: 6 }
          })
          break
        case 'show_nearby_restaurants':
          executedActions.push({
            type: 'show_restaurants',
            data: { location: context.currentLocation }
          })
          break
        case 'show_discounted_packs':
          executedActions.push({
            type: 'show_packs',
            data: { filter: 'discounted', limit: 8 }
          })
          break
        case 'filter_by_cuisine':
          if (_entities.cuisine) {
            executedActions.push({
              type: 'show_packs',
              data: { cuisine: _entities.cuisine, limit: 6 }
            })
          }
          break
      }
    }
    
    return executedActions
  }
  
  /**
   * Generar recomendaciones contextuales
   */
  private async generateContextualRecommendations(
    _context: ConversationContext
  ): Promise<any[]> {
    // TODO: Integrar con sistema ML real
    // const mlRecommendations = await mlAdvancedSystem.generateMLRecommendations(...)
    
    // Por ahora, generar recomendaciones simuladas
    return [
      {
        id: 'pack_1',
        title: 'Pack Saludable Mediterráneo',
        restaurant: 'Olive Garden',
        price: 25000,
        originalPrice: 35000,
        discount: 29,
        rating: 4.5,
        reason: 'Basado en tu preferencia por comida saludable'
      },
      {
        id: 'pack_2',
        title: 'Combo Burger Gourmet',
        restaurant: 'Burger House',
        price: 18000,
        originalPrice: 24000,
        discount: 25,
        rating: 4.2,
        reason: 'Popular en tu zona y en tu rango de precio'
      }
    ]
  }
  
  /**
   * Generar respuesta de fallback
   */
  private generateFallbackResponse(
    _message: string,
    _context: ConversationContext
  ): ChatResponse {
    const fallbackResponses = [
      'No estoy seguro de entender exactamente lo que buscas, pero puedo ayudarte con recomendaciones de comida, búsqueda de restaurantes o información sobre ofertas.',
      'Disculpa, no capté bien tu mensaje. ¿Podrías ser más específico? Puedo ayudarte a encontrar comida, ver ofertas o buscar restaurantes.',
      'Hmm, no estoy seguro de cómo ayudarte con eso. ¿Te gustaría que te recomiende algo de comer o que busque ofertas cerca de ti?'
    ]
    
    return {
      message: this.selectRandomResponse(fallbackResponses),
      suggestions: ['¿Qué me recomiendas?', 'Buscar ofertas', 'Ver restaurantes cerca'],
      confidence: 0.3
    }
  }
  
  /**
   * Calcular confianza de la respuesta
   */
  private calculateConfidence(
    intent: string,
    entities: any,
    sentiment: any
  ): number {
    let confidence = 0.5
    
    if (intent !== 'unknown') confidence += 0.3
    if (Object.keys(entities).length > 0) confidence += 0.2
    if (sentiment.confidence > 0.7) confidence += 0.1
    
    return Math.min(1, confidence)
  }
  
  /**
   * Seleccionar respuesta aleatoria
   */
  private selectRandomResponse(responses: string[]): string {
    return responses[Math.floor(Math.random() * responses.length)]
  }
  
  /**
   * Generar ID único
   */
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }
  
  /**
   * Obtener historial de conversación
   */
  getConversationHistory(_sessionId: string): ChatMessage[] {
    // TODO: Implementar persistencia real
    return []
  }
  
  /**
   * Limpiar contexto de conversación
   */
  clearContext(sessionId: string): void {
    // TODO: Implementar limpieza de contexto
    console.log(`Contexto limpiado para sesión: ${sessionId}`)
  }
  
  /**
   * Analizar satisfacción del usuario con la conversación
   */
  analyzeConversationSatisfaction(context: ConversationContext): {
    satisfactionScore: number
    issues: string[]
    improvements: string[]
  } {
    const messages = context.conversationHistory
    let satisfactionScore = 0.7 // base
    const issues: string[] = []
    const improvements: string[] = []
    
    // Analizar sentimientos de los mensajes del usuario
    const userMessages = messages.filter(m => m.role === 'user')
    const avgSentiment = userMessages.reduce((sum, msg) => {
      const sentiment = sentimentAnalyzer.analyzeSentiment(msg.content)
      return sum + sentiment.score
    }, 0) / userMessages.length
    
    satisfactionScore += avgSentiment * 0.3
    
    // Detectar problemas
    if (avgSentiment < -0.3) {
      issues.push('Usuario muestra frustración')
      improvements.push('Mejorar comprensión de intents')
    }
    
    if (messages.filter(m => m.metadata?.intent === 'unknown').length > 2) {
      issues.push('Múltiples intents no reconocidos')
      improvements.push('Expandir base de conocimiento')
    }
    
    return {
      satisfactionScore: Math.max(0, Math.min(1, satisfactionScore)),
      issues,
      improvements
    }
  }
}

// Instancia singleton
export const conversationalAI = new ConversationalAI()
