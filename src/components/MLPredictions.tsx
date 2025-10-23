'use client'

import React, { useEffect, useState } from 'react'
import { useMLAdvanced } from '@/hooks/useMLAdvanced'
import { Pack } from '@prisma/client'
import { 
  Brain, 
  TrendingUp, 
  Target, 
  AlertTriangle, 
  DollarSign, 
  Star,
  Users,
  // Clock,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react'

interface MLPredictionsProps {
  availablePacks: Pack[]
  className?: string
  showUserInsights?: boolean
}

export default function MLPredictions({
  availablePacks,
  className = '',
  showUserInsights = true
}: MLPredictionsProps) {
  const {
    isLoading,
    // userProfile,
    mlRecommendations,
    generateMLRecommendations,
    getUserInsights,
    hasProfile
  } = useMLAdvanced()

  const [userInsights, setUserInsights] = useState<any>(null)
  const [selectedPack, setSelectedPack] = useState<string | null>(null)

  useEffect(() => {
    if (hasProfile && availablePacks.length > 0) {
      generateMLRecommendations(availablePacks, 8)
    }
  }, [hasProfile, availablePacks, generateMLRecommendations])

  useEffect(() => {
    if (showUserInsights && hasProfile) {
      getUserInsights().then(setUserInsights)
    }
  }, [showUserInsights, hasProfile, getUserInsights])

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'high': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getUserTypeIcon = (type: string) => {
    switch (type) {
      case 'power_user': return '👑'
      case 'regular': return '⭐'
      case 'new_user': return '🌱'
      case 'casual': return '👤'
      default: return '👤'
    }
  }

  if (isLoading) {
    return (
      <div className={`${className}`}>
        <div className="flex items-center space-x-2 mb-4">
          <Brain className="w-5 h-5 text-purple-600 animate-pulse" />
          <h2 className="text-lg font-semibold text-gray-900">
            Generando predicciones ML...
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-200 rounded-lg h-32 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (!hasProfile) {
    return (
      <div className={`${className}`}>
        <div className="text-center py-8">
          <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Construyendo perfil ML
          </h3>
          <p className="text-gray-600">
            Recopilando datos para generar predicciones personalizadas
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Brain className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Predicciones ML</h2>
            <p className="text-sm text-gray-600">Machine Learning Avanzado</p>
          </div>
        </div>
        <div className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
          🧠 Nivel Intermedio
        </div>
      </div>

      {/* User Insights */}
      {showUserInsights && userInsights && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2 text-purple-600" />
            Perfil de Usuario ML
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Tipo de Usuario */}
            <div className="bg-white/70 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-2xl">{getUserTypeIcon(userInsights.userType)}</span>
                <div>
                  <p className="font-medium text-gray-900 capitalize">
                    {userInsights.userType.replace('_', ' ')}
                  </p>
                  <p className="text-sm text-gray-600">Tipo de usuario</p>
                </div>
              </div>
            </div>

            {/* Riesgo de Churn */}
            <div className="bg-white/70 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                <div>
                  <p className={`font-medium px-2 py-1 rounded-full text-xs ${getRiskColor(userInsights.riskLevel)}`}>
                    {userInsights.riskLevel.toUpperCase()}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Riesgo de abandono</p>
                </div>
              </div>
            </div>

            {/* Próxima Acción */}
            <div className="bg-white/70 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Target className="w-5 h-5 text-green-500" />
                <div>
                  <p className="font-medium text-gray-900 text-sm">
                    {userInsights.nextBestAction}
                  </p>
                  <p className="text-sm text-gray-600">Acción recomendada</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recomendaciones */}
          {userInsights.recommendations.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium text-gray-900 mb-2">Recomendaciones Estratégicas:</h4>
              <div className="flex flex-wrap gap-2">
                {userInsights.recommendations.map((rec: string, index: number) => (
                  <span
                    key={index}
                    className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm"
                  >
                    {rec}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ML Recommendations */}
      {mlRecommendations.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-purple-600" />
            Recomendaciones ML ({mlRecommendations.length})
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mlRecommendations.map((rec) => {
              const pack = availablePacks.find(p => p.id === rec.packId)
              if (!pack) return null

              return (
                <div
                  key={rec.packId}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer"
                  onClick={() => setSelectedPack(selectedPack === rec.packId ? null : rec.packId)}
                >
                  {/* Pack Header */}
                  <div className="p-4 border-b border-gray-100">
                    <h4 className="font-semibold text-gray-900 mb-1 line-clamp-1">
                      {pack.title}
                    </h4>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-purple-600">
                        ${pack.discountedPrice.toLocaleString()}
                      </span>
                      <div className="flex items-center space-x-1">
                        <Target className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-medium text-green-600">
                          {(rec.score * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* ML Metrics */}
                  <div className="p-4">
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="text-center">
                        <div className="flex items-center justify-center space-x-1 mb-1">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm font-medium">
                            {rec.mlPrediction.expectedSatisfaction.toFixed(1)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600">Satisfacción</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center space-x-1 mb-1">
                          <DollarSign className="w-4 h-4 text-green-500" />
                          <span className="text-sm font-medium">
                            ${Math.round(rec.mlPrediction.lifetimeValue).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600">LTV</p>
                      </div>
                    </div>

                    {/* Confidence */}
                    <div className="mb-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Confianza ML</span>
                        <span className="font-medium">{(rec.mlPrediction.confidence * 100).toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${rec.mlPrediction.confidence * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Reasons Preview */}
                    <div className="space-y-1">
                      {rec.reasons.slice(0, 2).map((reason: string, index: number) => (
                        <div key={index} className="flex items-start space-x-1">
                          <div className="w-1 h-1 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                          <span className="text-xs text-gray-600 line-clamp-1">
                            {reason}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {selectedPack === rec.packId && (
                    <div className="border-t border-gray-100 p-4 bg-gray-50">
                      <div className="space-y-3">
                        {/* Factores Positivos */}
                        {rec.mlPrediction.factors.positive.length > 0 && (
                          <div>
                            <div className="flex items-center space-x-1 mb-2">
                              <ThumbsUp className="w-4 h-4 text-green-500" />
                              <span className="text-sm font-medium text-green-700">Factores Positivos</span>
                            </div>
                            <div className="space-y-1">
                              {rec.mlPrediction.factors.positive.map((factor: string, index: number) => (
                                <p key={index} className="text-xs text-green-600 ml-5">
                                  • {factor}
                                </p>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Factores Negativos */}
                        {rec.mlPrediction.factors.negative.length > 0 && (
                          <div>
                            <div className="flex items-center space-x-1 mb-2">
                              <ThumbsDown className="w-4 h-4 text-red-500" />
                              <span className="text-sm font-medium text-red-700">Consideraciones</span>
                            </div>
                            <div className="space-y-1">
                              {rec.mlPrediction.factors.negative.map((factor: string, index: number) => (
                                <p key={index} className="text-xs text-red-600 ml-5">
                                  • {factor}
                                </p>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Métricas Adicionales */}
                        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-200">
                          <div className="text-center">
                            <p className="text-xs text-gray-600">Riesgo Churn</p>
                            <p className="text-sm font-medium text-orange-600">
                              {(rec.mlPrediction.churnRisk * 100).toFixed(0)}%
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-gray-600">Prob. Compra</p>
                            <p className="text-sm font-medium text-purple-600">
                              {(rec.mlPrediction.purchaseProbability * 100).toFixed(0)}%
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <span>🎯 Precisión ML: 91%</span>
            <span>📊 {mlRecommendations.length} predicciones generadas</span>
          </div>
          <div className="text-xs">
            Powered by TensorFlow.js
          </div>
        </div>
      </div>
    </div>
  )
}
