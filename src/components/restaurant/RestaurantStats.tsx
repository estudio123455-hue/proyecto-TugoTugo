'use client'

import { useEffect, useState } from 'react'
import { TrendingUp, Package, ShoppingCart, DollarSign, Users, Star } from 'lucide-react'

interface Stats {
  totalOrders: number
  totalRevenue: number
  activePacks: number
  averageRating: number
  totalReviews: number
  pendingOrders: number
  completedOrders: number
  revenueGrowth: number
}

export default function RestaurantStats() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/restaurant/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800">No se pudieron cargar las estadísticas</p>
      </div>
    )
  }

  const statCards = [
    {
      title: 'Órdenes Totales',
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Ingresos Totales',
      value: `$${stats.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: 'bg-green-500',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50',
      growth: stats.revenueGrowth,
    },
    {
      title: 'Packs Activos',
      value: stats.activePacks,
      icon: Package,
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Calificación',
      value: stats.averageRating > 0 ? stats.averageRating.toFixed(1) : 'N/A',
      icon: Star,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      subtitle: `${stats.totalReviews} reseñas`,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.bgColor} p-3 rounded-lg`}>
                <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
              </div>
              {stat.growth !== undefined && stat.growth > 0 && (
                <div className="flex items-center text-green-600 text-sm">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  <span>+{stat.growth}%</span>
                </div>
              )}
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">
              {stat.title}
            </h3>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            {stat.subtitle && (
              <p className="text-sm text-gray-500 mt-1">{stat.subtitle}</p>
            )}
          </div>
        ))}
      </div>

      {/* Orders Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Estado de Órdenes
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                <span className="text-gray-700">Pendientes</span>
              </div>
              <span className="text-xl font-bold text-gray-900">
                {stats.pendingOrders}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span className="text-gray-700">Completadas</span>
              </div>
              <span className="text-xl font-bold text-gray-900">
                {stats.completedOrders}
              </span>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Tasa de Completitud</span>
              <span>
                {stats.totalOrders > 0
                  ? Math.round((stats.completedOrders / stats.totalOrders) * 100)
                  : 0}
                %
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${
                    stats.totalOrders > 0
                      ? (stats.completedOrders / stats.totalOrders) * 100
                      : 0
                  }%`,
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-br from-orange-500 to-pink-500 rounded-lg shadow p-6 text-white">
          <h3 className="text-lg font-semibold mb-4">Acciones Rápidas</h3>
          <div className="space-y-3">
            <a
              href="/restaurant-dashboard/packs"
              className="block bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg p-3 transition-colors"
            >
              <div className="flex items-center">
                <Package className="w-5 h-5 mr-3" />
                <span className="font-medium">Crear Nuevo Pack</span>
              </div>
            </a>
            <a
              href="/restaurant-dashboard/orders"
              className="block bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg p-3 transition-colors"
            >
              <div className="flex items-center">
                <ShoppingCart className="w-5 h-5 mr-3" />
                <span className="font-medium">Ver Órdenes Pendientes</span>
              </div>
            </a>
            <a
              href="/restaurant-dashboard/menu"
              className="block bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg p-3 transition-colors"
            >
              <div className="flex items-center">
                <Users className="w-5 h-5 mr-3" />
                <span className="font-medium">Gestionar Menú</span>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
