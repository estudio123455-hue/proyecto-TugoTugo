'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import SimpleNavigation from '@/components/SimpleNavigation'
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
  const [tabLoading, setTabLoading] = useState(false)
  const [notifications, setNotifications] = useState({
    emailReminders: true,
    newPackAlerts: true,
    weeklySummary: false,
    nearbyPacks: true,
    priceAlerts: false,
  })
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [preferences, setPreferences] = useState({
    maxDistance: 5,
    preferredCategories: ['restaurant', 'bakery'],
    maxPrice: 50,
    dietaryRestrictions: [] as string[],
  })
  const [achievements, setAchievements] = useState([
    { id: 1, title: 'Primer Pack', description: 'Compraste tu primer pack sorpresa', unlocked: true, icon: '🎉' },
    { id: 2, title: 'Eco Warrior', description: 'Salvaste 5kg de comida', unlocked: true, icon: '🌱' },
    { id: 3, title: 'Explorador', description: 'Visitaste 5 restaurantes diferentes', unlocked: false, icon: '🗺️' },
  ])

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth')
      return
    }

    // Lazy load data only when needed
    const timer = setTimeout(() => {
      fetchOrders()
      fetchStats()
    }, 100)

    return () => clearTimeout(timer)
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
      } else {
        // Datos simulados si no hay API
        setStats({
          totalOrders: orders.length,
          totalSaved: orders.reduce((sum, order) => sum + order.totalAmount, 0),
          packsCollected: orders.filter(o => o.status === 'COMPLETED').length,
          foodSaved: orders.length * 1.2, // kg estimados
          co2Saved: orders.length * 3.6, // kg CO2 estimados
          favoriteRestaurants: ['Restaurant A', 'Restaurant B'],
          currentStreak: 5,
          totalImpactScore: orders.length * 100,
        })
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
      // Datos simulados en caso de error
      setStats({
        totalOrders: orders.length,
        totalSaved: orders.reduce((sum, order) => sum + order.totalAmount, 0),
        packsCollected: orders.filter(o => o.status === 'COMPLETED').length,
        foodSaved: orders.length * 1.2,
        co2Saved: orders.length * 3.6,
        favoriteRestaurants: ['Restaurant A', 'Restaurant B'],
        currentStreak: 5,
        totalImpactScore: orders.length * 100,
      })
    }
  }

  const savePreferences = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/profile/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferences, notifications })
      })
      
      if (response.ok) {
        setSaveMessage('✅ Preferencias guardadas exitosamente')
      } else {
        setSaveMessage('❌ Error guardando preferencias')
      }
    } catch (error) {
      setSaveMessage('❌ Error de conexión')
    } finally {
      setIsSaving(false)
      setTimeout(() => setSaveMessage(''), 3000)
    }
  }

  const handleTabChange = (tabId: string) => {
    setTabLoading(true)
    setTimeout(() => {
      setActiveTab(tabId)
      setTabLoading(false)
    }, 150) // Small delay for smooth transition
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
    { id: 'achievements', name: 'Achievements', icon: '🏆' },
    { id: 'preferences', name: 'Preferences', icon: '⚙️' },
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
                onClick={() => handleTabChange(tab.id)}
                disabled={tabLoading}
                className={`whitespace-nowrap py-3 px-2 border-b-2 font-medium text-xs md:text-sm flex items-center space-x-1 md:space-x-2 transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } ${tabLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span>{tab.icon}</span>
                <span>{tab.name}</span>
                {tabLoading && activeTab === tab.id && (
                  <div className="w-3 h-3 border border-green-500 border-t-transparent rounded-full animate-spin ml-1"></div>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="pb-6 md:pb-8 relative">
          {tabLoading && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-gray-600">Cargando...</span>
              </div>
            </div>
          )}
          
          <div className={`transition-opacity duration-200 ${tabLoading ? 'opacity-50' : 'opacity-100'}`}>
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Welcome Section */}
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
                <h2 className="text-2xl font-bold mb-2">¡Bienvenido, {session?.user?.name}! 👋</h2>
                <p className="text-green-100">Aquí tienes un resumen de tu impacto ambiental y actividad reciente</p>
              </div>

              {/* Quick Stats */}
              {stats && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white rounded-xl p-4 shadow-sm border">
                    <div className="text-2xl font-bold text-blue-600">{stats.totalOrders}</div>
                    <div className="text-sm text-gray-600">Órdenes Totales</div>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-sm border">
                    <div className="text-2xl font-bold text-green-600">{stats.foodSaved.toFixed(1)}kg</div>
                    <div className="text-sm text-gray-600">Comida Salvada</div>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-sm border">
                    <div className="text-2xl font-bold text-purple-600">${stats.totalSaved.toFixed(0)}</div>
                    <div className="text-sm text-gray-600">Dinero Ahorrado</div>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-sm border">
                    <div className="text-2xl font-bold text-orange-600">{stats.currentStreak}</div>
                    <div className="text-sm text-gray-600">Días Consecutivos</div>
                  </div>
                </div>
              )}

              {/* Recent Activity */}
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <h3 className="text-lg font-semibold mb-4">📈 Actividad Reciente</h3>
                <div className="space-y-3">
                  {orders.slice(0, 3).map((order, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{order.pack.establishment.name}</p>
                        <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">${order.totalAmount.toFixed(2)}</p>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          order.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                  {orders.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <p>🛒 No tienes órdenes aún</p>
                      <a href="/packs" className="text-green-600 hover:underline">¡Explora packs disponibles!</a>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <h3 className="text-lg font-semibold mb-4">⚡ Acciones Rápidas</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <a href="/packs" className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                    <span className="text-2xl mr-3">🛒</span>
                    <div>
                      <p className="font-medium text-green-800">Explorar Packs</p>
                      <p className="text-sm text-green-600">Encuentra ofertas cerca</p>
                    </div>
                  </a>
                  <a href="/restaurants" className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                    <span className="text-2xl mr-3">🏪</span>
                    <div>
                      <p className="font-medium text-blue-800">Restaurantes</p>
                      <p className="text-sm text-blue-600">Ver todos los locales</p>
                    </div>
                  </a>
                  <button 
                    onClick={() => setActiveTab('achievements')}
                    className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                  >
                    <span className="text-2xl mr-3">🏆</span>
                    <div>
                      <p className="font-medium text-purple-800">Logros</p>
                      <p className="text-sm text-purple-600">Ver tus logros</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

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

          {activeTab === 'achievements' && (
            <div className="space-y-6">
              <h2 className="text-lg md:text-xl font-semibold text-gray-900">🏆 Logros y Gamificación</h2>
              
              {/* Progress Overview */}
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 text-white">
                <h3 className="text-xl font-bold mb-2">Tu Progreso</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-purple-100">Puntos Totales</p>
                    <p className="text-2xl font-bold">{stats?.totalImpactScore || 0}</p>
                  </div>
                  <div>
                    <p className="text-purple-100">Logros Desbloqueados</p>
                    <p className="text-2xl font-bold">{achievements.filter(a => a.unlocked).length}/{achievements.length}</p>
                  </div>
                </div>
              </div>

              {/* Achievements Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {achievements.map((achievement) => (
                  <div 
                    key={achievement.id} 
                    className={`p-4 rounded-xl border-2 transition-all ${
                      achievement.unlocked 
                        ? 'bg-green-50 border-green-200 shadow-sm' 
                        : 'bg-gray-50 border-gray-200 opacity-60'
                    }`}
                  >
                    <div className="text-center">
                      <div className={`text-4xl mb-2 ${achievement.unlocked ? '' : 'grayscale'}`}>
                        {achievement.icon}
                      </div>
                      <h4 className={`font-bold mb-1 ${
                        achievement.unlocked ? 'text-green-800' : 'text-gray-600'
                      }`}>
                        {achievement.title}
                      </h4>
                      <p className={`text-sm ${
                        achievement.unlocked ? 'text-green-600' : 'text-gray-500'
                      }`}>
                        {achievement.description}
                      </p>
                      {achievement.unlocked && (
                        <div className="mt-2">
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                            ✅ Desbloqueado
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Next Goals */}
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <h3 className="text-lg font-semibold mb-4">🎯 Próximos Objetivos</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div>
                      <p className="font-medium text-blue-800">Visitante Frecuente</p>
                      <p className="text-sm text-blue-600">Compra 10 packs en total</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-blue-600">{stats?.totalOrders || 0}/10</p>
                      <div className="w-20 bg-blue-200 rounded-full h-2 mt-1">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${Math.min(((stats?.totalOrders || 0) / 10) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="font-medium text-green-800">Eco Champion</p>
                      <p className="text-sm text-green-600">Salva 10kg de comida</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-green-600">{stats?.foodSaved.toFixed(1) || 0}/10kg</p>
                      <div className="w-20 bg-green-200 rounded-full h-2 mt-1">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${Math.min(((stats?.foodSaved || 0) / 10) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <h2 className="text-lg md:text-xl font-semibold text-gray-900">⚙️ Preferencias</h2>
              
              {/* Notification Settings */}
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <h3 className="text-lg font-semibold mb-4">🔔 Notificaciones</h3>
                <div className="space-y-4">
                  {Object.entries(notifications).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                        <p className="text-sm text-gray-500">
                          {key === 'emailReminders' && 'Recordatorios por email sobre tus pedidos'}
                          {key === 'newPackAlerts' && 'Alertas cuando hay nuevos packs disponibles'}
                          {key === 'weeklySummary' && 'Resumen semanal de tu impacto'}
                          {key === 'nearbyPacks' && 'Notificaciones de packs cerca de ti'}
                          {key === 'priceAlerts' && 'Alertas de precios especiales'}
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) => setNotifications({
                            ...notifications,
                            [key]: e.target.checked
                          })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Search Preferences */}
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <h3 className="text-lg font-semibold mb-4">🔍 Preferencias de Búsqueda</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Distancia máxima (km)
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="20"
                      value={preferences.maxDistance}
                      onChange={(e) => setPreferences({
                        ...preferences,
                        maxDistance: parseInt(e.target.value)
                      })}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-sm text-gray-500 mt-1">
                      <span>1km</span>
                      <span>{preferences.maxDistance}km</span>
                      <span>20km</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Precio máximo ($)
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={preferences.maxPrice}
                      onChange={(e) => setPreferences({
                        ...preferences,
                        maxPrice: parseInt(e.target.value)
                      })}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-sm text-gray-500 mt-1">
                      <span>$10</span>
                      <span>${preferences.maxPrice}</span>
                      <span>$100</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Categorías Preferidas
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {['restaurant', 'bakery', 'cafe', 'dessert', 'healthy'].map((category) => (
                        <button
                          key={category}
                          onClick={() => {
                            const newCategories = preferences.preferredCategories.includes(category)
                              ? preferences.preferredCategories.filter(c => c !== category)
                              : [...preferences.preferredCategories, category]
                            setPreferences({
                              ...preferences,
                              preferredCategories: newCategories
                            })
                          }}
                          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                            preferences.preferredCategories.includes(category)
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end">
                <button
                  onClick={savePreferences}
                  disabled={isSaving}
                  className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  {isSaving ? 'Guardando...' : 'Guardar Preferencias'}
                </button>
              </div>

              {saveMessage && (
                <div className="text-center p-3 rounded-lg bg-green-50 text-green-800">
                  {saveMessage}
                </div>
              )}
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
    </div>
  )
}
