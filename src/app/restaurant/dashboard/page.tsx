'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createAuditLog } from '@/lib/auditLog'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

interface RestaurantStats {
  totalPacks: number
  activePacks: number
  totalPosts: number
  totalOrders: number
  totalRevenue: number
  pendingOrders: number
  completedOrders: number
  recentOrders: any[]
}

export default function RestaurantDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<RestaurantStats | null>(null)
  const [establishment, setEstablishment] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth')
    } else if (status === 'authenticated') {
      if (session.user.role !== 'ESTABLISHMENT') {
        router.push('/')
      } else {
        fetchDashboardData()
      }
    }
  }, [status, session, router])

  const fetchDashboardData = async () => {
    try {
      // Obtener establecimiento del usuario
      const estRes = await fetch('/api/restaurant/my-establishment')
      if (estRes.ok) {
        const estData = await estRes.json()
        setEstablishment(estData.data)

        // Obtener estadísticas
        const statsRes = await fetch('/api/restaurant/stats')
        if (statsRes.ok) {
          const statsData = await statsRes.json()
          setStats(statsData.data)
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    )
  }

  if (!establishment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            No tienes un restaurante registrado
          </h2>
          <button
            onClick={() => router.push('/establecimiento/setup')}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
          >
            Registrar Restaurante
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {establishment.name}
              </h1>
              <p className="text-gray-600 mt-1">{establishment.category}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => router.push('/restaurant/settings')}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                ⚙️ Configuración
              </button>
              <button
                onClick={() => router.push('/')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                🏠 Inicio
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Packs Activos"
            value={stats?.activePacks || 0}
            total={stats?.totalPacks || 0}
            icon="📦"
            color="blue"
          />
          <StatCard
            title="Posts Publicados"
            value={stats?.totalPosts || 0}
            icon="📝"
            color="purple"
          />
          <StatCard
            title="Órdenes Totales"
            value={stats?.totalOrders || 0}
            icon="🛍️"
            color="green"
          />
          <StatCard
            title="Ingresos"
            value={`$${(stats?.totalRevenue || 0).toLocaleString()}`}
            icon="💰"
            color="yellow"
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Acciones Rápidas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ActionButton
              icon="📦"
              title="Crear Pack"
              description="Nueva oferta de comida"
              onClick={() => router.push('/restaurant/packs/create')}
            />
            <ActionButton
              icon="📝"
              title="Crear Post"
              description="Publicar novedad"
              onClick={() => router.push('/restaurant/posts/create')}
            />
            <ActionButton
              icon="📊"
              title="Ver Reportes"
              description="Estadísticas detalladas"
              onClick={() => router.push('/restaurant/reports')}
            />
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Órdenes Recientes
          </h2>
          {stats?.recentOrders && stats.recentOrders.length > 0 ? (
            <div className="space-y-4">
              {stats.recentOrders.map((order: any) => (
                <OrderItem key={order.id} order={order} />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              No hay órdenes recientes
            </p>
          )}
        </div>
      </main>
    </div>
  )
}

// Componentes auxiliares
function StatCard({
  title,
  value,
  total,
  icon,
  color,
}: {
  title: string
  value: number | string
  total?: number
  icon: string
  color: string
}) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
    green: 'bg-green-100 text-green-600',
    yellow: 'bg-yellow-100 text-yellow-600',
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {value}
            {total && <span className="text-sm text-gray-500"> / {total}</span>}
          </p>
        </div>
        <div className={`text-3xl ${colorClasses[color as keyof typeof colorClasses]} p-3 rounded-lg`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

function ActionButton({
  icon,
  title,
  description,
  onClick,
}: {
  icon: string
  title: string
  description: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-start gap-4 p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all text-left"
    >
      <div className="text-3xl">{icon}</div>
      <div>
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </button>
  )
}

function OrderItem({ order }: { order: any }) {
  const statusColors = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    CONFIRMED: 'bg-blue-100 text-blue-800',
    READY_FOR_PICKUP: 'bg-green-100 text-green-800',
    COMPLETED: 'bg-gray-100 text-gray-800',
    CANCELLED: 'bg-red-100 text-red-800',
  }

  return (
    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
      <div className="flex-1">
        <h4 className="font-semibold text-gray-900">
          {order.pack?.title || 'Orden'}
        </h4>
        <p className="text-sm text-gray-600">
          {order.user?.name || order.user?.email} • {order.quantity} unidades
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {new Date(order.createdAt).toLocaleDateString('es-CO', {
            day: 'numeric',
            month: 'long',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
      <div className="flex items-center gap-4">
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            statusColors[order.status as keyof typeof statusColors]
          }`}
        >
          {order.status}
        </span>
        <span className="font-bold text-gray-900">
          ${order.totalPrice?.toLocaleString()}
        </span>
      </div>
    </div>
  )
}
