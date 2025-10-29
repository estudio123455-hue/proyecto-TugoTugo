'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Navigation from '@/components/Navigation'
import Link from 'next/link'
import { useCleanSession } from '@/hooks/useCleanSession'
import LogoutButton from '@/components/LogoutButton'

interface Order {
  id: string
  quantity: number
  totalAmount: number
  status: string
  pickupDate: string
  createdAt: string
  pack: {
    title: string
    description: string
    pickupTimeStart: string
    pickupTimeEnd: string
    establishment: {
      name: string
      address: string
      phone?: string
    }
  }
}

interface UserStats {
  totalOrders: number
  totalSaved: number
  packsCollected: number
  foodSaved: number // in kg, estimated
  co2Saved: number // in kg CO2
  favoriteRestaurants: string[]
  currentStreak: number // días consecutivos
  totalImpactScore: number
}

export default function Profile() {
  const { data: session, status } = useCleanSession()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [stats, setStats] = useState<UserStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [notifications, setNotifications] = useState({
    emailReminders: true,
    newPackAlerts: true,
    weeklySummary: false,
    nearbyPacks: true,
    priceAlerts: false,
  })
  const [preferences, setPreferences] = useState({
    maxDistance: 5, // km
    preferredCategories: [] as string[],
    maxPrice: 50,
    dietaryRestrictions: [] as string[],
  })
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [achievements, setAchievements] = useState<any[]>([])
  const [favoriteRestaurants, setFavoriteRestaurants] = useState<any[]>([])

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth')
      return
    }

    fetchOrders()
    fetchStats()
  }, [session, status, router])

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders')
      if (response.ok) {
        const data = await response.json()
        setOrders(data)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/profile/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800'
      case 'READY_FOR_PICKUP':
        return 'bg-green-100 text-green-800'
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return '⏳ Procesando'
      case 'CONFIRMED':
        return '✅ Confirmado'
      case 'READY_FOR_PICKUP':
        return '🔔 Listo para Recoger'
      case 'COMPLETED':
        return '✅ Recogido'
      case 'CANCELLED':
        return '❌ Cancelado'
      default:
        return status
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatTime = (time: string) => {
    return time.slice(0, 5) // Convert "18:00:00" to "18:00"
  }

  const handleSaveSettings = async () => {
    setIsSaving(true)
    setSaveMessage('')
    
    try {
      // Aquí puedes agregar la llamada a la API para guardar las preferencias
      // Por ahora solo simulamos el guardado
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setSaveMessage('✅ Cambios guardados exitosamente')
      setTimeout(() => setSaveMessage(''), 3000)
    } catch (error) {
      setSaveMessage('❌ Error al guardar los cambios')
      console.error('Error saving settings:', error)
    } finally {
      setIsSaving(false)
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

  const tabs = [
    { id: 'orders', name: 'My Orders', icon: '🛒' },
    { id: 'impact', name: 'My Impact', icon: '🌱' },
    { id: 'settings', name: 'Settings', icon: '⚙️' },
  ]

  return (
    <div className="min-h-screen bg-gray-25 pb-20 md:pb-8" style={{backgroundColor: '#fafafa'}}>
      <Navigation />

      <div className="max-w-6xl mx-auto pt-4 md:pt-8 px-4">
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
                    ${stats.totalSaved.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-3 md:p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center">
                <div className="text-xl md:text-2xl mb-2 md:mb-0 md:mr-3">✅</div>
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
                className={`whitespace-nowrap py-3 px-2 border-b-2 font-medium text-xs md:text-sm flex items-center space-x-1 md:space-x-2 ${
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
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
                <h2 className="text-lg md:text-xl font-semibold text-gray-900">
                  📦 Mis Órdenes
                </h2>
                <Link
                  href="/packs"
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm w-full sm:w-auto text-center"
                >
                  🔍 Buscar Packs
                </Link>
              </div>

              {orders.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                  <div className="text-6xl mb-4">🛒</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No orders yet
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Start saving food and money by ordering your first pack!
                  </p>
                  <Link
                    href="/packs"
                    className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg"
                  >
                    🔍 Encuentra Packs
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map(order => {
                    const isActive = ['CONFIRMED', 'READY_FOR_PICKUP'].includes(
                      order.status
                    )
                    const isPast = ['COMPLETED', 'CANCELLED'].includes(
                      order.status
                    )

                    return (
                      <div
                        key={order.id}
                        className={`rounded-lg shadow-md p-4 md:p-6 border-l-4 ${
                          isActive
                            ? 'bg-green-50 border-green-500'
                            : isPast
                              ? 'bg-gray-50 border-gray-300'
                              : 'bg-white border-blue-500'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-0 mb-4">
                          <div>
                            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 mb-2">
                              <h3 className="text-base md:text-lg font-semibold text-gray-900">
                                🏪 {order.pack.establishment.name}
                              </h3>
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}
                              >
                                {getStatusText(order.status)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">
                              {order.pack.establishment.address}
                            </p>
                          </div>
                          <div className="text-left sm:text-right">
                            <div className="text-lg md:text-xl font-bold text-green-600 mb-1">
                              ${order.totalAmount.toFixed(2)}
                            </div>
                            <div className="text-xs md:text-sm text-gray-500">
                              {order.quantity} pack
                              {order.quantity !== 1 ? 's' : ''}
                            </div>
                          </div>
                        </div>

                        {/* Status-specific content */}
                        {isActive && (
                          <div className="bg-white border border-green-200 rounded-lg p-3 md:p-4 mb-4">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                              <div>
                                <h4 className="text-sm md:text-base font-semibold text-green-800 flex items-center">
                                  ⏰ Horario de Recogida
                                </h4>
                                <p className="text-green-700 text-base md:text-lg font-bold">
                                  {formatTime(order.pack.pickupTimeStart)} -{' '}
                                  {formatTime(order.pack.pickupTimeEnd)}
                                </p>
                                <p className="text-green-600 text-xs md:text-sm">
                                  📅 {formatDate(order.pickupDate)}
                                </p>
                              </div>
                              <div className="w-full sm:w-auto">
                                {order.pack.establishment.phone && (
                                  <a
                                    href={`tel:${order.pack.establishment.phone}`}
                                    className="block sm:inline-block text-center bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                                  >
                                    📞 Llamar
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {isPast && (
                          <div className="text-sm text-gray-500">
                            {order.status === 'COMPLETED' ? (
                              <span className="text-green-600">
                                ✅ Recogido el {formatDate(order.pickupDate)}
                              </span>
                            ) : (
                              <span className="text-red-600">
                                ❌ Expirado / Cancelado
                              </span>
                            )}
                          </div>
                        )}

                        <div className="text-xs text-gray-400 mt-4">
                          Pedido realizado: {formatDate(order.createdAt)}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'impact' && (
            <div className="space-y-6">
              <h2 className="text-lg md:text-xl font-semibold text-gray-900">
                Your Environmental Impact
              </h2>

              <div className="bg-white rounded-lg shadow p-4 md:p-6">
                <div className="text-center mb-6 md:mb-8">
                  <div className="text-4xl md:text-6xl mb-3 md:mb-4">🌱</div>
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                    Thank you for making a difference!
                  </h3>
                  <p className="text-gray-600">
                    Every pack you rescue helps reduce food waste and supports
                    local businesses.
                  </p>
                </div>

                {stats && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-green-600 mb-2">
                        {stats.foodSaved}kg
                      </div>
                      <div className="text-gray-700">Food Saved from Waste</div>
                      <div className="text-sm text-gray-500 mt-1">
                        Equivalent to {Math.round(stats.foodSaved * 2.5)} meals
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="text-4xl font-bold text-green-600 mb-2">
                        {Math.round(stats.foodSaved * 3.3)}kg
                      </div>
                      <div className="text-gray-700">
                        CO₂ Emissions Prevented
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        By preventing food from going to landfill
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-8 p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">
                    Keep up the great work!
                  </h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>
                      • You&apos;ve helped {stats?.packsCollected || 0} local
                      businesses reduce waste
                    </li>
                    <li>
                      • Your actions contribute to a more sustainable food
                      system
                    </li>
                    <li>
                      • You&apos;ve saved ${stats?.totalSaved.toFixed(2) || '0.00'}{' '}
                      while making a positive impact
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
                Account Settings
              </h2>

              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-8">
                <div className="space-y-8">
                  {/* Personal Information Section */}
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-6 pb-2 border-b border-gray-100">
                      Personal Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-2">
                          Name
                        </label>
                        <input
                          type="text"
                          value={session?.user?.name || ''}
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-300 transition-all"
                          disabled
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          value={session?.user?.email || ''}
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-300 transition-all"
                          disabled
                        />
                      </div>
                    </div>
                  </div>

                  {/* Notifications Section */}
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-6 pb-2 border-b border-gray-100">
                      Notifications
                    </h3>
                    <div className="space-y-4">
                      <label className="flex items-center group cursor-pointer">
                        <div className="relative">
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={notifications.emailReminders}
                            onChange={(e) =>
                              setNotifications({
                                ...notifications,
                                emailReminders: e.target.checked,
                              })
                            }
                          />
                          <div className={`w-12 h-6 rounded-full transition-all duration-200 ${
                            notifications.emailReminders 
                              ? 'bg-emerald-500 shadow-lg' 
                              : 'bg-gray-300'
                          }`}>
                            <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 ${
                              notifications.emailReminders ? 'translate-x-6' : 'translate-x-0.5'
                            } mt-0.5`}></div>
                          </div>
                        </div>
                        <span className="ml-4 text-gray-700 font-medium group-hover:text-gray-900 transition-colors">
                          Email notifications for pickup reminders
                        </span>
                      </label>
                      
                      <label className="flex items-center group cursor-pointer">
                        <div className="relative">
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={notifications.newPackAlerts}
                            onChange={(e) =>
                              setNotifications({
                                ...notifications,
                                newPackAlerts: e.target.checked,
                              })
                            }
                          />
                          <div className={`w-12 h-6 rounded-full transition-all duration-200 ${
                            notifications.newPackAlerts 
                              ? 'bg-emerald-500 shadow-lg' 
                              : 'bg-gray-300'
                          }`}>
                            <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 ${
                              notifications.newPackAlerts ? 'translate-x-6' : 'translate-x-0.5'
                            } mt-0.5`}></div>
                          </div>
                        </div>
                        <span className="ml-4 text-gray-700 font-medium group-hover:text-gray-900 transition-colors">
                          New pack alerts in your area
                        </span>
                      </label>
                      
                      <label className="flex items-center group cursor-pointer">
                        <div className="relative">
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={notifications.weeklySummary}
                            onChange={(e) =>
                              setNotifications({
                                ...notifications,
                                weeklySummary: e.target.checked,
                              })
                            }
                          />
                          <div className={`w-12 h-6 rounded-full transition-all duration-200 ${
                            notifications.weeklySummary 
                              ? 'bg-emerald-500 shadow-lg' 
                              : 'bg-gray-300'
                          }`}>
                            <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 ${
                              notifications.weeklySummary ? 'translate-x-6' : 'translate-x-0.5'
                            } mt-0.5`}></div>
                          </div>
                        </div>
                        <span className="ml-4 text-gray-700 font-medium group-hover:text-gray-900 transition-colors">
                          Weekly impact summary
                        </span>
                      </label>
                    </div>
                  </div>

                  {saveMessage && (
                    <div className={`p-4 rounded-xl text-sm font-medium ${
                      saveMessage.includes('✅') 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      {saveMessage}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="pt-6 flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                      onClick={handleSaveSettings}
                      disabled={isSaving}
                      className="flex-1 sm:flex-none bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-400 text-white px-8 py-3 rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none flex items-center justify-center gap-2"
                    >
                      {isSaving ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Guardando...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Save Changes</span>
                        </>
                      )}
                    </button>
                    
                    <LogoutButton className="flex-1 sm:flex-none px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
