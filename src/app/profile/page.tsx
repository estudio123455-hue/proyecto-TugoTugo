'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import SimpleNavigation from '@/components/SimpleNavigation'
import { useCleanSession } from '@/hooks/useCleanSession'
import LogoutButton from '@/components/LogoutButton'

interface Order {
  id: string
  quantity: number
  totalAmount: number
  status: string
  pickupDate: string
  pack: {
    title: string
    establishment: {
      name: string
    }
  }
}

interface UserStats {
  totalOrders: number
  totalSaved: number
  packsCollected: number
  foodSaved: number
  co2Saved: number
  favoriteRestaurants: string[]
  currentStreak: number
  totalImpactScore: number
}

export default function SimpleProfile() {
  const { data: session, status } = useCleanSession()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [stats, setStats] = useState<UserStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth')
      return
    }

    // Load data immediately
    loadData()
  }, [session, status, router])

  const loadData = () => {
    // Mock data for immediate response
    const mockOrders: Order[] = [
      {
        id: '1',
        quantity: 2,
        totalAmount: 25.50,
        status: 'COMPLETED',
        pickupDate: '2024-10-30',
        pack: {
          title: 'Pack Mixto',
          establishment: {
            name: 'Restaurante Demo'
          }
        }
      }
    ]

    const mockStats: UserStats = {
      totalOrders: 12,
      totalSaved: 156.50,
      packsCollected: 8,
      foodSaved: 4.2,
      co2Saved: 12.6,
      favoriteRestaurants: ['Restaurante Demo', 'Café Central'],
      currentStreak: 5,
      totalImpactScore: 85
    }

    setOrders(mockOrders)
    setStats(mockStats)
    setIsLoading(false)
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SimpleNavigation />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: '📊' },
    { id: 'orders', name: 'My Orders', icon: '🛒' },
    { id: 'impact', name: 'My Impact', icon: '🌱' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
      <SimpleNavigation />

      <div className="max-w-4xl mx-auto pt-4 md:pt-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Hello, {session?.user?.name}!
          </h1>
          <p className="text-sm md:text-base text-gray-600 mt-1 md:mt-2">
            Manage your orders and track your impact
          </p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
            <div className="bg-white rounded-lg shadow p-3 md:p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center">
                <div className="text-xl md:text-2xl mb-2 md:mb-0 md:mr-3">📦</div>
                <div>
                  <p className="text-xs md:text-sm font-medium text-gray-500">
                    Total Orders
                  </p>
                  <p className="text-xl md:text-2xl font-bold text-gray-900">
                    {stats.totalOrders}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-3 md:p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center">
                <div className="text-xl md:text-2xl mb-2 md:mb-0 md:mr-3">💰</div>
                <div>
                  <p className="text-xs md:text-sm font-medium text-gray-500">
                    Money Saved
                  </p>
                  <p className="text-xl md:text-2xl font-bold text-green-600">
                    ${stats.totalSaved}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-3 md:p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center">
                <div className="text-xl md:text-2xl mb-2 md:mb-0 md:mr-3">🎯</div>
                <div>
                  <p className="text-xs md:text-sm font-medium text-gray-500">
                    Packs Collected
                  </p>
                  <p className="text-xl md:text-2xl font-bold text-gray-900">
                    {stats.packsCollected}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-3 md:p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center">
                <div className="text-xl md:text-2xl mb-2 md:mb-0 md:mr-3">🌍</div>
                <div>
                  <p className="text-xs md:text-sm font-medium text-gray-500">
                    Food Saved
                  </p>
                  <p className="text-xl md:text-2xl font-bold text-green-600">
                    {stats.foodSaved}kg
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6 md:mb-8 -mx-4 px-4 overflow-x-auto">
          <nav className="-mb-px flex space-x-4 md:space-x-8 min-w-max md:min-w-0">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap py-3 px-2 border-b-2 font-medium text-xs md:text-sm flex items-center space-x-1 md:space-x-2 transition-colors duration-150 ${
                  activeTab === tab.id
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="pb-6 md:pb-8">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
                <h2 className="text-2xl font-bold mb-2">¡Bienvenido, {session?.user?.name}! 👋</h2>
                <p className="text-green-100">Aquí tienes un resumen de tu impacto ambiental y actividad reciente</p>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
              {orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.map(order => (
                    <div key={order.id} className="bg-white rounded-lg shadow p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-900">{order.pack.title}</h4>
                          <p className="text-sm text-gray-600">{order.pack.establishment.name}</p>
                          <p className="text-sm text-gray-500">Pickup: {order.pickupDate}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-600">${order.totalAmount}</p>
                          <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                            {order.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No orders yet</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'impact' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Your Environmental Impact</h3>
              {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <div className="text-3xl mr-4">🌱</div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Food Saved</p>
                        <p className="text-2xl font-bold text-green-600">{stats.foodSaved} kg</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <div className="text-3xl mr-4">🌍</div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">CO2 Saved</p>
                        <p className="text-2xl font-bold text-blue-600">{stats.co2Saved} kg</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Logout Button */}
        <div className="mt-8 flex justify-center">
          <LogoutButton className="px-8 py-3 rounded-xl shadow-lg hover:shadow-xl" />
        </div>
      </div>
    </div>
  )
}
