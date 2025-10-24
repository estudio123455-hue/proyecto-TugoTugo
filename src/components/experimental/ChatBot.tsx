'use client'

import React, { useState, useRef, useEffect } from 'react'
import { conversationalAI, ChatMessage, ConversationContext } from '@/lib/ai/conversational-ai'
import { useCleanSession } from '@/hooks/useCleanSession'
import { 
  MessageCircle, 
  Send, 
  X, 
  Bot, 
  User, 
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  RotateCcw
} from 'lucide-react'

interface ChatBotProps {
  className?: string
  initialMessage?: string
}

export default function ChatBot({ 
  className = '',
  initialMessage = '¡Hola! 👋 Soy tu asistente de TugoTugo. ¿En qué puedo ayudarte hoy?'
}: ChatBotProps) {
  const { data: session } = useCleanSession()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [context, setContext] = useState<ConversationContext | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Inicializar contexto de conversación
  useEffect(() => {
    if (session?.user?.id && !context) {
      const newContext: ConversationContext = {
        userId: session.user.id,
        sessionId: `session_${Date.now()}`,
        conversationHistory: [],
        preferences: {
          language: 'es',
          responseStyle: 'friendly',
          maxResponseLength: 'medium'
        },
        entities: {}
      }
      
      setContext(newContext)
      
      // Mensaje inicial del bot
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        role: 'assistant',
        content: initialMessage,
        timestamp: new Date()
      }
      
      setMessages([welcomeMessage])
    }
  }, [session?.user?.id, context, initialMessage])

  // Auto-scroll al final
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus en input cuando se abre
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !context) return

    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsTyping(true)

    try {
      // Procesar mensaje con IA conversacional
      const response = await conversationalAI.processMessage(inputMessage, context)
      
      // Simular delay de typing
      setTimeout(() => {
        const assistantMessage: ChatMessage = {
          id: `msg_${Date.now()}_assistant`,
          role: 'assistant',
          content: response.message,
          timestamp: new Date(),
          metadata: {
            confidence: response.confidence,
            suggestions: response.suggestions
          }
        }

        setMessages(prev => [...prev, assistantMessage])
        setIsTyping(false)
      }, 1000 + Math.random() * 1000) // 1-2 segundos

    } catch (error) {
      console.error('Error procesando mensaje:', error)
      
      const errorMessage: ChatMessage = {
        id: `error_${Date.now()}`,
        role: 'assistant',
        content: 'Disculpa, tuve un problema procesando tu mensaje. ¿Podrías intentar de nuevo?',
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, errorMessage])
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion)
    inputRef.current?.focus()
  }

  const handleFeedback = (messageId: string, isPositive: boolean) => {
    console.log(`Feedback para mensaje ${messageId}: ${isPositive ? 'positivo' : 'negativo'}`)
    // TODO: Enviar feedback al sistema de IA para mejorar
  }

  const clearConversation = () => {
    if (context) {
      conversationalAI.clearContext(context.sessionId)
      setMessages([{
        id: 'welcome_new',
        role: 'assistant',
        content: initialMessage,
        timestamp: new Date()
      }])
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  if (!session) return null

  return (
    <>
      {/* Botón flotante */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className={`fixed chatbot-button bg-gradient-to-r from-purple-500 to-blue-500 text-white p-3 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 md:p-4 fab-shadow ${className}`}
        >
          <MessageCircle className="w-5 h-5 md:w-6 md:h-6" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
        </button>
      )}

      {/* Ventana de chat */}
      {isOpen && (
        <div className="fixed chatbot-window w-80 h-[400px] bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col overflow-hidden md:w-96 md:h-[500px]">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white p-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold">TugoTugo AI</h3>
                <p className="text-xs opacity-90">Asistente inteligente</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={clearConversation}
                className="p-1 hover:bg-white/20 rounded transition-colors"
                title="Nueva conversación"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/20 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Mensajes */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                  {/* Avatar */}
                  <div className={`flex items-center space-x-2 mb-1 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {message.role === 'assistant' && (
                      <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                        <Bot className="w-4 h-4 text-purple-600" />
                      </div>
                    )}
                    <span className="text-xs text-gray-500">
                      {formatTime(message.timestamp)}
                    </span>
                    {message.role === 'user' && (
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-blue-600" />
                      </div>
                    )}
                  </div>

                  {/* Mensaje */}
                  <div
                    className={`p-3 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-blue-500 text-white ml-8'
                        : 'bg-white border border-gray-200 mr-8'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    
                    {/* Confianza de IA */}
                    {message.role === 'assistant' && message.metadata?.confidence && (
                      <div className="mt-2 flex items-center space-x-1">
                        <Sparkles className="w-3 h-3 text-purple-500" />
                        <span className="text-xs text-gray-500">
                          {(message.metadata.confidence * 100).toFixed(0)}% confianza
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Sugerencias */}
                  {message.role === 'assistant' && message.metadata?.suggestions && (
                    <div className="mt-2 space-y-1">
                      {message.metadata.suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="block w-full text-left text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded hover:bg-purple-100 transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Feedback */}
                  {message.role === 'assistant' && message.id !== 'welcome' && (
                    <div className="mt-2 flex items-center space-x-2">
                      <button
                        onClick={() => handleFeedback(message.id, true)}
                        className="p-1 hover:bg-green-100 rounded transition-colors"
                        title="Respuesta útil"
                      >
                        <ThumbsUp className="w-3 h-3 text-gray-400 hover:text-green-500" />
                      </button>
                      <button
                        onClick={() => handleFeedback(message.id, false)}
                        className="p-1 hover:bg-red-100 rounded transition-colors"
                        title="Respuesta no útil"
                      >
                        <ThumbsDown className="w-3 h-3 text-gray-400 hover:text-red-500" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Indicador de typing */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                    <Bot className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 p-4 bg-white">
            <div className="flex items-center space-x-2">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Escribe tu mensaje..."
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={isTyping}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isTyping}
                className="bg-purple-500 text-white p-2 rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            
            <div className="mt-2 text-xs text-gray-500 text-center">
              Powered by TugoTugo AI • Conversacional
            </div>
          </div>
        </div>
      )}
    </>
  )
}
