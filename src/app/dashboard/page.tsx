'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Navigation from '@/components/Navigation'
import TimeSlotManagement from '@/components/dashboard/TimeSlotManagement'
import EstablishmentSetup from '@/components/dashboard/EstablishmentSetup'
import OrdersOverview from '@/components/dashboard/OrdersOverview'

interface Establishment {
  id: string
  name: string
  description?: string
  address: string
  latitude: number
  longitude: number
  phone?: string
  email?: string
  category: string
  isActive: boolean
}

interface DashboardStats {
  totalOrders: number
  totalRevenue: number
  activePacks: number
  completedOrders: number
}

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [establishment, setEstablishment] = useState<Establishment | null>(null)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth')
      return
    }

    if (session.user.role !== 'ESTABLISHMENT') {
      router.push('/')
      return
    }

    fetchEstablishment()
    fetchStats()
  }, [session, status, router])

  const fetchEstablishment = async () => {
    try {
      const response = await fetch('/api/establishment/me')
      if (response.ok) {
        const data = await response.json()
        setEstablishment(data)
      }
    } catch (error) {
      console.error('Error fetching establishment:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/dashboard/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
        </div>
      </div>
    )
  }

  if (!establishment) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-4xl mx-auto pt-8 px-4 pb-20">
          <EstablishmentSetup onSetupComplete={fetchEstablishment} />
        </div>
        
        {/* Bottom Navigation - Solo Formulario */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden safe-area-bottom">
          <div className="flex items-center justify-center h-16">
            <div className="flex flex-col items-center justify-center text-green-600">
              <div className="text-2xl mb-1">📝</div>
              <span className="text-xs font-semibold">Formulario</span>
            </div>
          </div>
        </nav>
      </div>
    )
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: '📊' },
    { id: 'posts', name: 'Publicaciones', icon: '📱' },
    { id: 'packs', name: 'Gestionar Horarios', icon: '⏰' },
    { id: 'orders', name: 'Orders', icon: '🛒' },
    { id: 'settings', name: 'Settings', icon: '⚙️' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-7xl mx-auto pt-4 sm:pt-8 px-4">
        {/* Header - Mobile Optimized */}
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {establishment.name}
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">{establishment.address}</p>
          </div>
        </div>

        {/* Stats Cards - Mobile Optimized */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
            <div className="bg-white rounded-lg shadow p-4 sm:p-6">
              <div className="flex items-center">
                <div className="text-xl sm:text-2xl mr-2 sm:mr-3">📈</div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-500">
                    Total Orders
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalOrders}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="text-2xl mr-3">💰</div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${stats.totalRevenue.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="text-2xl mr-3">📦</div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Active Packs
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.activePacks}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="text-2xl mr-3">✅</div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.completedOrders}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs - Mobile Optimized */}
        <div className="border-b border-gray-200 mb-6 sm:mb-8">
          <nav className="-mb-px flex space-x-2 sm:space-x-8 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap py-2 px-2 sm:px-1 border-b-2 font-medium text-xs sm:text-sm flex items-center space-x-1 sm:space-x-2 min-w-max ${
                  activeTab === tab.id
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                <span className="hidden sm:inline">{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="pb-8">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">
                  Welcome to your dashboard!
                </h2>
                <p className="text-gray-600 mb-4">
                  Here you can manage your food packs, view orders, and track
                  your impact on reducing food waste.
                </p>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Quick Actions
                    </h3>
                    <ul className="space-y-2">
                      <li>
                        <button
                          onClick={() => setActiveTab('packs')}
                          className="text-green-600 hover:text-green-700"
                        >
                          → Create a new pack
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => setActiveTab('orders')}
                          className="text-green-600 hover:text-green-700"
                        >
                          → View recent orders
                        </button>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Tips for Success
                    </h3>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>• Update pack quantities regularly</li>
                      <li>• Set realistic pickup windows</li>
                      <li>• Respond to customer messages quickly</li>
                      <li>• Keep your establishment info up to date</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'posts' && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Mis Publicaciones</h2>
                <button
                  onClick={() => router.push('/dashboard/posts/new')}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
                >
                  <span>➕</span>
                  <span>Nueva Publicación</span>
                </button>
              </div>
              
              <div>
                  <p className="text-gray-600 mb-4">
                    Crea publicaciones para mostrar tus platillos, promociones y menús especiales a los clientes.
                  </p>
                  <div className="text-center py-8">
                    <div className="text-6xl mb-4">📱</div>
                    <p className="text-gray-500 mb-4">
                      Aún no tienes publicaciones
                    </p>
                    <button
                      onClick={() => router.push('/dashboard/posts/new')}
                      className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium"
                    >
                      Crear mi primera publicación
                    </button>
                  </div>
              </div>
            </div>
          )}

          {activeTab === 'packs' && (
            <TimeSlotManagement establishmentId={establishment.id} />
          )}

          {activeTab === 'orders' && (
            <OrdersOverview establishmentId={establishment.id} />
          )}

          {activeTab === 'settings' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">
                Establishment Settings
              </h2>
              <p className="text-gray-600">
                Settings panel coming soon. Contact support for any changes
                needed.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
