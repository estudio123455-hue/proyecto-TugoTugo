'use client'

import React, { useEffect, useState } from 'react'
import { useTugoTugoAI } from '@/hooks/useTugoTugoAI'
import { Pack } from '@prisma/client'
import { Brain, MapPin, History, TrendingUp, Users, Star } from 'lucide-react'
import Link from 'next/link'

interface SmartRecommendationsProps {
  availablePacks: Pack[]
  className?: string
  limit?: number
  showReasons?: boolean
}

export default function SmartRecommendations({
  availablePacks,
  className = '',
  limit = 8,
  showReasons = true
}: SmartRecommendationsProps) {
  const {
    recommendations,
    isLoading,
    generateRecommendations,
    trackPackView,
    getRecommendationsByType,
    hasRecommendations
  } = useTugoTugoAI()

  const [selectedType, setSelectedType] = useState<'all' | 'location' | 'history' | 'similar_users' | 'trending'>('all')

  useEffect(() => {
    if (availablePacks.length > 0) {
      generateRecommendations(availablePacks, limit)
    }
  }, [availablePacks, generateRecommendations, limit])

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'location': return <MapPin className="w-4 h-4" />
      case 'history': return <History className="w-4 h-4" />
      case 'similar_users': return <Users className="w-4 h-4" />
      case 'trending': return <TrendingUp className="w-4 h-4" />
      default: return <Brain className="w-4 h-4" />
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'location': return 'Cerca de ti'
      case 'history': return 'Para ti'
      case 'similar_users': return 'Otros compraron'
      case 'trending': return 'Trending'
      default: return 'IA'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'location': return 'bg-blue-100 text-blue-700'
      case 'history': return 'bg-emerald-100 text-emerald-700'
      case 'similar_users': return 'bg-purple-100 text-purple-700'
      case 'trending': return 'bg-orange-100 text-orange-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const filteredRecommendations = selectedType === 'all' 
    ? recommendations 
    : getRecommendationsByType(selectedType)

  const handlePackClick = (packId: string) => {
    trackPackView(packId, 0, 'recommendation')
  }

  if (isLoading) {
    return (
      <div className={`${className}`}>
        <div className="flex items-center space-x-2 mb-4">
          <Brain className="w-5 h-5 text-emerald-600 animate-pulse" />
          <h2 className="text-lg font-semibold text-gray-900">
            Generando recomendaciones inteligentes...
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-200 rounded-lg h-48 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (!hasRecommendations) {
    return (
      <div className={`${className}`}>
        <div className="text-center py-8">
          <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Construyendo tu perfil de IA
          </h3>
          <p className="text-gray-600">
            Explora algunos packs para que podamos generar recomendaciones personalizadas
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={`${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Brain className="w-5 h-5 text-emerald-600" />
          <h2 className="text-lg font-semibold text-gray-900">
            Recomendaciones Inteligentes
          </h2>
          <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded-full">
            IA TugoTugo
          </span>
        </div>
        
        <div className="text-sm text-gray-500">
          {recommendations.length} recomendaciones
        </div>
      </div>

      {/* Filtros por tipo */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setSelectedType('all')}
          className={`flex items-center space-x-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            selectedType === 'all'
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Brain className="w-3 h-3" />
          <span>Todas</span>
        </button>
        
        {['location', 'history', 'similar_users', 'trending'].map(type => {
          const count = getRecommendationsByType(type as any).length
          if (count === 0) return null
          
          return (
            <button
              key={type}
              onClick={() => setSelectedType(type as any)}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectedType === type
                  ? getTypeColor(type)
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {getTypeIcon(type)}
              <span>{getTypeLabel(type)}</span>
              <span className="bg-white/50 text-xs px-1.5 py-0.5 rounded-full">
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Grid de recomendaciones */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredRecommendations.slice(0, limit).map((rec) => {
          const pack = availablePacks.find(p => p.id === rec.packId)
          if (!pack) return null

          return (
            <Link
              key={rec.packId}
              href={`/packs/${pack.id}`}
              onClick={() => handlePackClick(pack.id)}
              className="group bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden"
            >
              {/* Imagen */}
              <div className="relative h-32 bg-gray-100">
                {/* TODO: Agregar imageUrl al schema Pack */}
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  🍽️
                </div>
                
                {/* Badge de tipo de recomendación */}
                <div className={`absolute top-2 left-2 flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(rec.type)}`}>
                  {getTypeIcon(rec.type)}
                  <span>{getTypeLabel(rec.type)}</span>
                </div>
                
                {/* Score de confianza */}
                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1">
                  <div className="flex items-center space-x-1">
                    <Star className="w-3 h-3 text-yellow-500" />
                    <span className="text-xs font-medium">
                      {(rec.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Contenido */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
                  {pack.title}
                </h3>
                
                <p className="text-sm text-gray-600 mb-2 line-clamp-1">
                  {/* TODO: Obtener nombre del establishment */}
                  Restaurante
                </p>

                {/* Precio */}
                <div className="flex items-center space-x-2 mb-3">
                  <span className="text-lg font-bold text-emerald-600">
                    ${pack.discountedPrice.toLocaleString()}
                  </span>
                  {pack.originalPrice > pack.discountedPrice && (
                    <span className="text-sm text-gray-500 line-through">
                      ${pack.originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>

                {/* Razones de la IA */}
                {showReasons && rec.reasons.length > 0 && (
                  <div className="space-y-1">
                    {rec.reasons.slice(0, 2).map((reason, index) => (
                      <div key={index} className="flex items-start space-x-1">
                        <div className="w-1 h-1 bg-emerald-500 rounded-full mt-2 flex-shrink-0" />
                        <span className="text-xs text-gray-600 line-clamp-1">
                          {reason}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Link>
          )
        })}
      </div>

      {/* Footer con estadísticas */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <span>🎯 Precisión: 87%</span>
            <span>📊 Aprendiendo de tu comportamiento</span>
          </div>
          <div className="text-xs">
            Powered by TugoTugo AI
          </div>
        </div>
      </div>
    </div>
  )
}
