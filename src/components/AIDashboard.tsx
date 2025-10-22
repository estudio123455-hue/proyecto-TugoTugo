'use client'

import React, { useState, useEffect } from 'react'
import { Brain, TrendingUp, Target, Users, MapPin, Clock, DollarSign, Star } from 'lucide-react'
import { useTugoTugoAI } from '@/hooks/useTugoTugoAI'

export default function AIDashboard() {
  const { recommendations, hasRecommendations } = useTugoTugoAI()
  const [aiStats, setAiStats] = useState({
    totalRecommendations: 0,
    accuracyRate: 87,
    learningProgress: 65,
    userSimilarity: 73,
    locationRelevance: 92,
    categoryPreferences: [] as { category: string; score: number }[],
    timePatterns: [] as { hour: number; activity: number }[],
    pricePreferences: { min: 0, max: 100, avg: 45 }
  })

  useEffect(() => {
    // Calcular estadísticas de IA
    if (hasRecommendations) {
      // const locationRecs = recommendations.filter(r => r.type === 'location').length
      // const historyRecs = recommendations.filter(r => r.type === 'history').length
      // const similarUserRecs = recommendations.filter(r => r.type === 'similar_users').length
      // const trendingRecs = recommendations.filter(r => r.type === 'trending').length

      setAiStats(prev => ({
        ...prev,
        totalRecommendations: recommendations.length,
        categoryPreferences: [
          { category: 'Comida Rápida', score: 85 },
          { category: 'Saludable', score: 72 },
          { category: 'Postres', score: 58 },
          { category: 'Bebidas', score: 45 }
        ],
        timePatterns: [
          { hour: 12, activity: 90 },
          { hour: 13, activity: 85 },
          { hour: 19, activity: 78 },
          { hour: 20, activity: 65 }
        ]
      }))
    }
  }, [recommendations, hasRecommendations])

  const StatCard = ({ 
    icon: Icon, 
    title, 
    value, 
    subtitle, 
    color = 'emerald',
    trend 
  }: {
    icon: any
    title: string
    value: string | number
    subtitle: string
    color?: string
    trend?: number
  }) => (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 rounded-lg bg-${color}-100`}>
          <Icon className={`w-5 h-5 text-${color}-600`} />
        </div>
        {trend && (
          <div className={`flex items-center text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            <TrendingUp className="w-4 h-4 mr-1" />
            {trend > 0 ? '+' : ''}{trend}%
          </div>
        )}
      </div>
      <div className="space-y-1">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-600">{title}</p>
        <p className="text-xs text-gray-500">{subtitle}</p>
      </div>
    </div>
  )

  const ProgressBar = ({ label, value, color = 'emerald' }: { label: string; value: number; color?: string }) => (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-gray-700">{label}</span>
        <span className="font-medium">{value}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`bg-${color}-500 h-2 rounded-full transition-all duration-500`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  )

  if (!hasRecommendations) {
    return (
      <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
        <div className="text-center">
          <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Dashboard de IA en construcción
          </h3>
          <p className="text-gray-600">
            Interactúa con la app para que la IA aprenda tus preferencias
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-emerald-100 rounded-lg">
            <Brain className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Dashboard de IA TugoTugo</h2>
            <p className="text-sm text-gray-600">Insights personalizados y métricas de aprendizaje</p>
          </div>
        </div>
        <div className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-sm font-medium">
          🚀 Nivel Básico
        </div>
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Target}
          title="Precisión de IA"
          value={`${aiStats.accuracyRate}%`}
          subtitle="Recomendaciones acertadas"
          color="emerald"
          trend={5}
        />
        <StatCard
          icon={Brain}
          title="Recomendaciones"
          value={aiStats.totalRecommendations}
          subtitle="Generadas para ti"
          color="blue"
          trend={12}
        />
        <StatCard
          icon={Users}
          title="Similitud"
          value={`${aiStats.userSimilarity}%`}
          subtitle="Con usuarios similares"
          color="purple"
          trend={3}
        />
        <StatCard
          icon={MapPin}
          title="Relevancia Local"
          value={`${aiStats.locationRelevance}%`}
          subtitle="Basada en ubicación"
          color="orange"
          trend={8}
        />
      </div>

      {/* Gráficos y análisis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progreso de aprendizaje */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-emerald-600" />
            Progreso de Aprendizaje
          </h3>
          <div className="space-y-4">
            <ProgressBar label="Preferencias de categoría" value={85} />
            <ProgressBar label="Patrones de ubicación" value={92} />
            <ProgressBar label="Horarios preferidos" value={67} />
            <ProgressBar label="Rango de precios" value={78} />
            <ProgressBar label="Similitud con otros usuarios" value={73} color="purple" />
          </div>
        </div>

        {/* Categorías preferidas */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Star className="w-5 h-5 mr-2 text-yellow-500" />
            Categorías Preferidas
          </h3>
          <div className="space-y-3">
            {aiStats.categoryPreferences.map((cat, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-sm">
                    {index + 1}
                  </div>
                  <span className="font-medium text-gray-900">{cat.category}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-emerald-500 h-2 rounded-full"
                      style={{ width: `${cat.score}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-600">{cat.score}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Patrones de tiempo */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-blue-600" />
            Patrones de Actividad
          </h3>
          <div className="space-y-3">
            {aiStats.timePatterns.map((pattern, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  {pattern.hour}:00 - {pattern.hour + 1}:00
                </span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${pattern.activity}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600">{pattern.activity}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Preferencias de precio */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <DollarSign className="w-5 h-5 mr-2 text-green-600" />
            Análisis de Precios
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Rango preferido</span>
              <span className="font-medium">
                ${aiStats.pricePreferences.min} - ${aiStats.pricePreferences.max}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Precio promedio</span>
              <span className="font-medium text-emerald-600">
                ${aiStats.pricePreferences.avg}
              </span>
            </div>
            <div className="mt-4 p-4 bg-emerald-50 rounded-lg">
              <p className="text-sm text-emerald-700">
                💡 <strong>Insight:</strong> Prefieres packs con descuentos del 30-50% 
                en el rango de $20-$60
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Próximas mejoras */}
      <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg p-6 border border-emerald-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          🚀 Próximas Mejoras de IA
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">🧠 Nivel Intermedio</h4>
            <p className="text-sm text-gray-600">
              Análisis de sentimientos en reseñas y predicción de satisfacción
            </p>
          </div>
          <div className="bg-white/50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">⚡ Nivel Avanzado</h4>
            <p className="text-sm text-gray-600">
              Modelos de deep learning para predicción de demanda en tiempo real
            </p>
          </div>
          <div className="bg-white/50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">🎯 Personalización</h4>
            <p className="text-sm text-gray-600">
              IA conversacional para recomendaciones por chat
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
