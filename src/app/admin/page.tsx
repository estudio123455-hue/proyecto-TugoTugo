'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import UsersManagement from '@/components/admin/UsersManagement'
import EstablishmentsManagement from '@/components/admin/EstablishmentsManagement'
import PostsManagement from '@/components/admin/PostsManagement'
import PacksManagement from '@/components/admin/PacksManagement'
import OrdersManagement from '@/components/admin/OrdersManagement'

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (session?.user?.role !== 'ADMIN') {
      router.push('/')
    }
  }, [session, status, router])

  useEffect(() => {
    if (session?.user?.role === 'ADMIN') {
      fetchStats()
    }
  }, [session])

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats')
      const data = await res.json()
      if (data.success) {
        setStats(data.data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  if (session?.user?.role !== 'ADMIN') {
    return null
  }

  const tabs = [
    { id: 'overview', name: 'Resumen', icon: '📊' },
    { id: 'users', name: 'Usuarios', icon: '👥' },
    { id: 'establishments', name: 'Restaurantes', icon: '🏪' },
    { id: 'posts', name: 'Posts', icon: '📝' },
    { id: 'packs', name: 'Packs', icon: '📦' },
    { id: 'orders', name: 'Órdenes', icon: '🛒' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">
              🔧 Panel de Administración
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Gestiona usuarios, restaurantes, posts, packs y órdenes
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                  ${
                    activeTab === tab.id
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="mt-6 pb-12">
          {activeTab === 'overview' && <OverviewTab stats={stats} />}
          {activeTab === 'users' && <UsersTab />}
          {activeTab === 'establishments' && <EstablishmentsTab />}
          {activeTab === 'posts' && <PostsTab />}
          {activeTab === 'packs' && <PacksTab />}
          {activeTab === 'orders' && <OrdersTab />}
        </div>
      </div>
    </div>
  )
}

// Overview Tab Component
function OverviewTab({ stats }: { stats: any }) {
  if (!stats) {
    return <div>Cargando estadísticas...</div>
  }

  const { overview, usersByRole, ordersByStatus } = stats

  const statCards = [
    { label: 'Total Usuarios', value: overview.totalUsers, icon: '👥', color: 'blue' },
    { label: 'Restaurantes', value: overview.totalEstablishments, icon: '🏪', color: 'green' },
    { label: 'Posts', value: overview.totalPosts, icon: '📝', color: 'purple' },
    { label: 'Packs', value: overview.totalPacks, icon: '📦', color: 'orange' },
    { label: 'Órdenes', value: overview.totalOrders, icon: '🛒', color: 'red' },
    { label: 'Activos', value: overview.activeEstablishments, icon: '✅', color: 'green' },
    { label: 'Pendientes', value: overview.pendingEstablishments, icon: '⏳', color: 'yellow' },
    { label: 'Órdenes (7d)', value: overview.recentOrders, icon: '📈', color: 'indigo' },
  ]

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className="text-4xl">{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Additional Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Usuarios por Rol</h3>
          <div className="space-y-2">
            {Object.entries(usersByRole).map(([role, count]) => (
              <div key={role} className="flex justify-between items-center">
                <span className="text-gray-600">{role}</span>
                <span className="font-semibold">{count as number}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Órdenes por Estado</h3>
          <div className="space-y-2">
            {Object.entries(ordersByStatus).map(([status, count]) => (
              <div key={status} className="flex justify-between items-center">
                <span className="text-gray-600">{status}</span>
                <span className="font-semibold">{count as number}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function UsersTab() {
  return <UsersManagement />
}

function EstablishmentsTab() {
  return <EstablishmentsManagement />
}

function PostsTab() {
  return <PostsManagement />
}

function PacksTab() {
  return <PacksManagement />
}

function OrdersTab() {
  return <OrdersManagement />
}
