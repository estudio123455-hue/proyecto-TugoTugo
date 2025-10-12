'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'

interface DashboardMetrics {
  summary: {
    totalUsers: number
    totalEstablishments: number
    averageTrustScore: number
    averageReputationScore: number
    suspiciousUsers: number
    activeUsers: number
    newUsersThisMonth: number
  }
  usersByStatus: Record<string, number>
  establishmentsByStatus: Record<string, number>
  reputation: {
    totalRatings: number
    averageRating: number
    recentRatings: number
  }
  alertUsers: Array<{
    id: string
    name: string
    email: string
    trustScore: number
    reputationScore: number
    suspiciousActivity: boolean
    verificationStatus: string
    lastActivity: string
    createdAt: string
  }>
  trends: {
    trustScoreChart: Array<{
      date: string
      averageTrustScore: number
    }>
  }
  stats: {
    verificationRate: number
    suspiciousRate: number
    activeRate: number
  }
}

export default function VerificationDashboard() {
  const { data: session, status } = useSession()
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchMetrics = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/metrics')
      const data = await response.json()
      
      if (data.success) {
        setMetrics(data.data)
        setLastUpdated(new Date())
      }
    } catch (error) {
      console.error('Error fetching metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMetrics()
    // Auto-refresh cada 5 minutos
    const interval = setInterval(fetchMetrics, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  // Verificar autorización
  if (status === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  }

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/')
  }

  if (loading && !metrics) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'TRUSTED_USER': return 'text-green-600 bg-green-100'
      case 'IDENTITY_VERIFIED': return 'text-blue-600 bg-blue-100'
      case 'EMAIL_VERIFIED': return 'text-yellow-600 bg-yellow-100'
      case 'PENDING': return 'text-gray-600 bg-gray-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getTrustScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600'
    if (score >= 0.6) return 'text-yellow-600'
    if (score >= 0.4) return 'text-orange-600'
    return 'text-red-600'
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">🎯 Panel de Verificación Inteligente</h1>
              <p className="text-gray-600 mt-2">Monitoreo automático de usuarios y restaurantes verificados</p>
            </div>
            <div className="text-right">
              <button 
                onClick={fetchMetrics}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? '🔄 Actualizando...' : '🔄 Actualizar'}
              </button>
              {lastUpdated && (
                <p className="text-sm text-gray-500 mt-1">
                  Última actualización: {lastUpdated.toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>
        </div>

        {metrics && (
          <>
            {/* Métricas Clave */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <span className="text-2xl">👥</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Usuarios Totales</p>
                    <p className="text-2xl font-bold text-gray-900">{metrics.summary.totalUsers}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <span className="text-2xl">📊</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Trust Score Promedio</p>
                    <p className={`text-2xl font-bold ${getTrustScoreColor(metrics.summary.averageTrustScore)}`}>
                      {(metrics.summary.averageTrustScore * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <span className="text-2xl">⚠️</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Usuarios Sospechosos</p>
                    <p className="text-2xl font-bold text-red-600">{metrics.summary.suspiciousUsers}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <span className="text-2xl">🏪</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Restaurantes</p>
                    <p className="text-2xl font-bold text-gray-900">{metrics.summary.totalEstablishments}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Estadísticas Rápidas */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 Tasas del Sistema</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tasa de Verificación</span>
                    <span className="font-semibold text-green-600">{metrics.stats.verificationRate.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Usuarios Activos</span>
                    <span className="font-semibold text-blue-600">{metrics.stats.activeRate.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Actividad Sospechosa</span>
                    <span className="font-semibold text-red-600">{metrics.stats.suspiciousRate.toFixed(1)}%</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">👥 Estados de Usuario</h3>
                <div className="space-y-3">
                  {Object.entries(metrics.usersByStatus).map(([status, count]) => (
                    <div key={status} className="flex justify-between">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(status)}`}>
                        {status.replace('_', ' ')}
                      </span>
                      <span className="font-semibold">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">⭐ Reputación</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Calificaciones Totales</span>
                    <span className="font-semibold">{metrics.reputation.totalRatings}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Promedio General</span>
                    <span className="font-semibold text-yellow-600">
                      {metrics.reputation.averageRating.toFixed(1)}/5.0
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Esta Semana</span>
                    <span className="font-semibold text-green-600">{metrics.reputation.recentRatings}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Alertas Críticas */}
            {metrics.alertUsers.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  🚨 Usuarios que Requieren Atención ({metrics.alertUsers.length})
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trust Score</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reputación</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Última Actividad</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Alertas</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {metrics.alertUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{user.name || 'Sin nombre'}</div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`text-sm font-medium ${getTrustScoreColor(user.trustScore)}`}>
                              {(user.trustScore * 100).toFixed(1)}%
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-900">
                              {user.reputationScore > 0 ? `${user.reputationScore.toFixed(1)}/5.0` : 'Sin calificar'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(user.verificationStatus)}`}>
                              {user.verificationStatus.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.lastActivity ? new Date(user.lastActivity).toLocaleDateString() : 'Nunca'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {user.suspiciousActivity && (
                              <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                                🚨 Sospechoso
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Tendencias */}
            {metrics.trends.trustScoreChart.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 Tendencia de Trust Score (Últimos 7 días)</h3>
                <div className="h-64 flex items-end justify-between space-x-2">
                  {metrics.trends.trustScoreChart.map((point, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div 
                        className="w-full bg-blue-500 rounded-t"
                        style={{ height: `${point.averageTrustScore * 200}px` }}
                      ></div>
                      <div className="text-xs text-gray-500 mt-2 transform -rotate-45">
                        {new Date(point.date).toLocaleDateString('es', { month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
