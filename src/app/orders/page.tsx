'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import SimpleNavigation from '@/components/SimpleNavigation'
import { Package, Clock, CheckCircle, XCircle, Calendar, MapPin } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

interface Order {
  id: string
  quantity: number
  totalAmount: number
  status: string
  pickupDate: string
  verificationCode: string | null
  createdAt: string
  pack: {
    id: string
    title: string
    price: number
    establishment: {
      id: string
      name: string
      address: string
      image: string | null
    }
  }
}

export default function OrdersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('all')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }

    if (status === 'authenticated') {
      fetchOrders()
    }
  }, [status, router])

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
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'COMPLETED':
        return <CheckCircle className="w-5 h-5 text-blue-600" />
      case 'CANCELLED':
        return <XCircle className="w-5 h-5 text-red-600" />
      default:
        return <Clock className="w-5 h-5 text-yellow-600" />
    }
  }

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      PENDING: 'Pendiente',
      CONFIRMED: 'Confirmada',
      COMPLETED: 'Completada',
      CANCELLED: 'Cancelada',
    }
    return statusMap[status] || status
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    }
  }

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true
    return order.status.toLowerCase() === filter
  })

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <SimpleNavigation />
        <div className="container-mobile spacing-mobile-y">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="card-mobile h-48"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 pb-20">
      <SimpleNavigation />
      
      <div className="container-mobile spacing-mobile-y">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                Mis Órdenes
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {orders.length} {orders.length === 1 ? 'pedido' : 'pedidos'} en total
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 overflow-x-auto scrollbar-hide -mx-4 px-4">
          <div className="flex gap-2 min-w-max">
            {[
              { value: 'all', label: 'Todas', icon: Package },
              { value: 'pending', label: 'Pendientes', icon: Clock },
              { value: 'confirmed', label: 'Confirmadas', icon: CheckCircle },
              { value: 'completed', label: 'Completadas', icon: CheckCircle },
              { value: 'cancelled', label: 'Canceladas', icon: XCircle },
            ].map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setFilter(value as any)}
                className={`
                  flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm
                  transition-all duration-200 whitespace-nowrap
                  ${filter === value 
                    ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30 scale-105' 
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="card-mobile text-center py-16 bg-white dark:bg-gray-800 shadow-sm">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="w-10 h-10 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              No hay órdenes
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 max-w-sm mx-auto">
              {filter === 'all' 
                ? 'Aún no has realizado ningún pedido. ¡Comienza a salvar comida deliciosa!'
                : `No tienes órdenes ${filter === 'pending' ? 'pendientes' : filter === 'confirmed' ? 'confirmadas' : filter === 'completed' ? 'completadas' : 'canceladas'}`
              }
            </p>
            <button
              onClick={() => router.push('/packs')}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white px-8 py-3.5 rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-primary-500/30 hover:shadow-xl hover:scale-105"
            >
              <Package className="w-5 h-5" />
              Explorar Packs
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map(order => (
              <div
                key={order.id}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border border-gray-100 dark:border-gray-700 tap-feedback cursor-pointer"
                onClick={() => router.push(`/orders/${order.id}/success`)}
              >
                <div className="p-4">
                  <div className="flex gap-4">
                    {/* Image */}
                    <div className="relative flex-shrink-0">
                      {order.pack.establishment.image ? (
                        <img
                          src={order.pack.establishment.image}
                          alt={order.pack.establishment.name}
                          className="w-24 h-24 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center">
                          <Package className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                      <div className="absolute -top-2 -right-2">
                        {getStatusIcon(order.status)}
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-bold text-base text-gray-900 dark:text-white line-clamp-1">
                          {order.pack.title}
                        </h3>
                        <span className={`text-xs px-2.5 py-1 rounded-full flex-shrink-0 font-medium ${getStatusColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 mb-3">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                          {order.pack.establishment.name}
                        </p>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-3">
                        <div className="flex items-center gap-1.5">
                          <Package className="w-4 h-4" />
                          <span className="font-medium">{order.quantity}x</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDistanceToNow(new Date(order.pickupDate), { addSuffix: true, locale: es })}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Total</p>
                          <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
                            ${order.totalAmount.toFixed(2)}
                          </span>
                        </div>
                        {order.verificationCode && (
                          <div className="text-right">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Código</p>
                            <span className="text-sm bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/30 text-primary-700 dark:text-primary-300 px-3 py-1.5 rounded-lg font-mono font-bold border border-primary-200 dark:border-primary-700">
                              {order.verificationCode}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
