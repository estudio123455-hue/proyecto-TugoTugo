'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'
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
        <Navigation />
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      
      <div className="container-mobile spacing-mobile-y">
        {/* Header */}
        <div className="mb-6">
          <h1 className="title-responsive mb-2">Mis Órdenes</h1>
          <p className="text-responsive text-gray-600 dark:text-gray-400">
            Historial de tus pedidos
          </p>
        </div>

        {/* Filters */}
        <div className="tabs-mobile mb-6">
          {[
            { value: 'all', label: 'Todas' },
            { value: 'pending', label: 'Pendientes' },
            { value: 'confirmed', label: 'Confirmadas' },
            { value: 'completed', label: 'Completadas' },
            { value: 'cancelled', label: 'Canceladas' },
          ].map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setFilter(value as any)}
              className={`tab-mobile ${filter === value ? 'active' : ''}`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="card-mobile text-center py-12">
            <Package className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-headline-3 mb-2">No hay órdenes</h3>
            <p className="text-body text-gray-600 dark:text-gray-400 mb-6">
              {filter === 'all' 
                ? 'Aún no has realizado ningún pedido'
                : `No tienes órdenes ${filter === 'pending' ? 'pendientes' : filter === 'confirmed' ? 'confirmadas' : filter === 'completed' ? 'completadas' : 'canceladas'}`
              }
            </p>
            <button
              onClick={() => router.push('/explore')}
              className="btn-mobile bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Explorar Packs
            </button>
          </div>
        ) : (
          <div className="list-mobile">
            {filteredOrders.map(order => (
              <div
                key={order.id}
                className="list-item-mobile tap-feedback cursor-pointer"
                onClick={() => router.push(`/orders/${order.id}/success`)}
              >
                <div className="flex gap-4">
                  {/* Image */}
                  {order.pack.establishment.image && (
                    <img
                      src={order.pack.establishment.image}
                      alt={order.pack.establishment.name}
                      className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                    />
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                        {order.pack.title}
                      </h3>
                      <span className={`text-xs px-2 py-1 rounded-full flex-shrink-0 ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {order.pack.establishment.name}
                    </p>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                        <Package className="w-4 h-4" />
                        <span>{order.quantity}x</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDistanceToNow(new Date(order.pickupDate), { addSuffix: true, locale: es })}</span>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                      <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                        ${order.totalAmount.toFixed(2)}
                      </span>
                      {order.verificationCode && (
                        <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded font-mono">
                          {order.verificationCode}
                        </span>
                      )}
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
