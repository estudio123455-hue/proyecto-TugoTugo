'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
// TODO: Install framer-motion package and uncomment
// import { motion } from 'framer-motion'

interface UserImpact {
  totalPacksSaved: number
  totalFoodSaved: number // in kg
  totalCO2Avoided: number // in kg
  totalMoneySaved: number
  treesEquivalent: number
  mealsProvided: number
  daysOfImpact: number
  currentStreak: number
  longestStreak: number
  achievements: Achievement[]
  monthlyProgress: MonthlyProgress[]
}

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlockedAt: Date
  category: 'saver' | 'explorer' | 'champion' | 'streak'
}

interface MonthlyProgress {
  month: string
  packsSaved: number
  co2Avoided: number
  foodSaved: number
}

const ImpactDashboard = () => {
  const { data: session } = useSession()
  const [impact, setImpact] = useState<UserImpact | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year' | 'all'>('month')

  useEffect(() => {
    if (session?.user?.id) {
      fetchUserImpact()
    }
  }, [session, selectedPeriod])

  const fetchUserImpact = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/user/impact?period=${selectedPeriod}`)
      if (response.ok) {
        const data = await response.json()
        setImpact(data)
      }
    } catch (error) {
      console.error('Error fetching user impact:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-8 shadow-soft">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded-lg w-1/3"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!impact) {
    return (
      <div className="bg-white rounded-3xl p-8 shadow-soft text-center">
        <div className="text-6xl mb-4">🌱</div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">¡Comienza tu impacto!</h3>
        <p className="text-gray-600">Rescata tu primer pack para ver tu contribución al planeta.</p>
      </div>
    )
  }

  const impactStats = [
    {
      icon: '🍽️',
      value: impact.totalFoodSaved.toFixed(1),
      unit: 'kg',
      label: 'Comida rescatada',
      color: 'from-tugo-500 to-tugo-600',
      description: 'Equivale a evitar el desperdicio de comida'
    },
    {
      icon: '🌍',
      value: impact.totalCO2Avoided.toFixed(1),
      unit: 'kg CO₂',
      label: 'Emisiones evitadas',
      color: 'from-green-500 to-green-600',
      description: `Como plantar ${impact.treesEquivalent} árboles`
    },
    {
      icon: '💰',
      value: impact.totalMoneySaved.toLocaleString(),
      unit: '$',
      label: 'Dinero ahorrado',
      color: 'from-terracota-500 to-terracota-600',
      description: 'En descuentos obtenidos'
    },
    {
      icon: '🔥',
      value: impact.currentStreak.toString(),
      unit: 'días',
      label: 'Racha actual',
      color: 'from-orange-500 to-red-500',
      description: `Récord: ${impact.longestStreak} días`
    }
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Tu Impacto Ambiental</h2>
          <p className="text-gray-600">
            Llevás <span className="font-semibold text-tugo-600">{impact.daysOfImpact} días</span> haciendo la diferencia
          </p>
        </div>
        
        {/* Period Selector */}
        <div className="flex bg-gray-100 rounded-xl p-1">
          {(['week', 'month', 'year', 'all'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedPeriod === period
                  ? 'bg-white text-tugo-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {period === 'week' && 'Semana'}
              {period === 'month' && 'Mes'}
              {period === 'year' && 'Año'}
              {period === 'all' && 'Total'}
            </button>
          ))}
        </div>
      </div>

      {/* Impact Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {impactStats.map((stat, index) => (
          <div
            key={stat.label}
            // TODO: Restore motion animations when framer-motion is installed
            // initial={{ opacity: 0, y: 20 }}
            // animate={{ opacity: 1, y: 0 }}
            // transition={{ delay: index * 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-soft hover:shadow-lg transition-all hover:-translate-y-1"
          >
            <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center text-2xl mb-4`}>
              {stat.icon}
            </div>
            <div className="space-y-2">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-gray-900">{stat.value}</span>
                <span className="text-sm font-medium text-gray-500">{stat.unit}</span>
              </div>
              <h3 className="font-semibold text-gray-700">{stat.label}</h3>
              <p className="text-xs text-gray-500">{stat.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Achievements Section */}
      {impact.achievements.length > 0 && (
        <div className="bg-white rounded-3xl p-8 shadow-soft">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
              🏆
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Logros Desbloqueados</h3>
              <p className="text-gray-600">Has ganado {impact.achievements.length} insignias</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {impact.achievements.map((achievement) => (
              <div
                key={achievement.id}
                // TODO: Restore motion animations when framer-motion is installed
                // initial={{ scale: 0 }}
                // animate={{ scale: 1 }}
                className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-4 text-center hover:from-tugo-50 hover:to-tugo-100 transition-all cursor-pointer"
              >
                <div className="text-3xl mb-2">{achievement.icon}</div>
                <h4 className="font-bold text-gray-900 text-sm mb-1">{achievement.title}</h4>
                <p className="text-xs text-gray-600">{achievement.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Environmental Impact Visualization */}
      <div className="bg-gradient-to-br from-tugo-500 to-terracota-500 rounded-3xl p-8 text-white">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h3 className="text-2xl font-bold mb-4">Tu Contribución al Planeta</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">🌳</div>
                <div>
                  <p className="font-semibold">Equivale a plantar {impact.treesEquivalent} árboles</p>
                  <p className="text-white/80 text-sm">Basado en tu CO₂ evitado</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">🍽️</div>
                <div>
                  <p className="font-semibold">Proporcionaste {impact.mealsProvided} comidas</p>
                  <p className="text-white/80 text-sm">A través del rescate de alimentos</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">♻️</div>
                <div>
                  <p className="font-semibold">Evitaste {impact.totalPacksSaved} desperdicios</p>
                  <p className="text-white/80 text-sm">Packs que iban a la basura</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-6xl mb-4">🌍</div>
            <h4 className="text-xl font-bold mb-2">¡Eres un Héroe Ambiental!</h4>
            <p className="text-white/90">
              Cada pack que rescatas hace la diferencia. Seguí así y juntos crearemos un futuro más sostenible.
            </p>
          </div>
        </div>
      </div>

      {/* Monthly Progress Chart */}
      {impact.monthlyProgress.length > 0 && (
        <div className="bg-white rounded-3xl p-8 shadow-soft">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Progreso Mensual</h3>
          <div className="space-y-4">
            {impact.monthlyProgress.map((month, index) => (
              <div key={month.month} className="flex items-center gap-4">
                <div className="w-16 text-sm font-medium text-gray-600">{month.month}</div>
                <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div
                    // TODO: Restore motion animations when framer-motion is installed
                    // initial={{ width: 0 }}
                    // animate={{ width: `${(month.packsSaved / Math.max(...impact.monthlyProgress.map(m => m.packsSaved))) * 100}%` }}
                    // transition={{ delay: index * 0.1, duration: 0.8 }}
                    style={{ width: `${(month.packsSaved / Math.max(...impact.monthlyProgress.map(m => m.packsSaved))) * 100}%` }}
                    className="h-full bg-gradient-to-r from-tugo-500 to-terracota-500"
                  />
                </div>
                <div className="w-20 text-sm font-semibold text-gray-900">{month.packsSaved} packs</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ImpactDashboard
