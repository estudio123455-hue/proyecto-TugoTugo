'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Package, User, Calendar, ShoppingCart } from 'lucide-react'
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
  user: {
    id: string
    name: string | null
    email: string
  }
  pack: {
    id: string
    title: string
    pickupTimeStart: string
    pickupTimeEnd: string
  }
}

export default function OrdersReceived() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/establishment/orders')
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

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (response.ok) {
        await fetchOrders()
      }
    } catch (error) {
      console.error('Error updating order:', error)
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-blue-100 text-blue-800',
      READY_FOR_PICKUP: 'bg-green-100 text-green-800',
      COMPLETED: 'bg-gray-100 text-gray-800',
      CANCELLED: 'bg-red-100 text-red-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      PENDING: 'Pendiente',
      CONFIRMED: 'Confirmada',
      READY_FOR_PICKUP: 'Lista para Recoger',
      COMPLETED: 'Completada',
      CANCELLED: 'Cancelada',
    }
    return labels[status] || status
  }

  const filteredOrders = orders.filter((order) => {
    if (filter === 'all') return true
    return order.status === filter
  })

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-wrap gap-2">
          {[
            { value: 'all', label: 'Todas' },
            { value: 'PENDING', label: 'Pendientes' },
            { value: 'CONFIRMED', label: 'Confirmadas' },
            { value: 'READY_FOR_PICKUP', label: 'Listas' },
            { value: 'COMPLETED', label: 'Completadas' },
          ].map((filterOption) => (
            <button
              key={filterOption.value}
              onClick={() => setFilter(filterOption.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === filterOption.value
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {filterOption.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <div key={order.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4">
                <div className="bg-orange-100 p-3 rounded-lg">
                  <Package className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{order.pack.title}</h3>
                  <p className="text-sm text-gray-600">
                    Orden #{order.id.slice(0, 8)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDistanceToNow(new Date(order.createdAt), {
                      addSuffix: true,
                      locale: es,
                    })}
                  </p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                {getStatusLabel(order.status)}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="w-4 h-4" />
                <span>{order.user.name || order.user.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>
                  {new Date(order.pickupDate).toLocaleDateString('es-ES')} •{' '}
                  {order.pack.pickupTimeStart} - {order.pack.pickupTimeEnd}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Package className="w-4 h-4" />
                <span>Cantidad: {order.quantity}</span>
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold text-green-600">
                <span>Total: ${order.totalAmount.toFixed(2)}</span>
              </div>
            </div>

            {order.verificationCode && (
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <p className="text-xs text-gray-600 mb-1">Código de Verificación:</p>
                <p className="text-2xl font-mono font-bold text-gray-900">{order.verificationCode}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              {order.status === 'PENDING' && (
                <button
                  onClick={() => updateOrderStatus(order.id, 'CONFIRMED')}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  Confirmar
                </button>
              )}
              {order.status === 'CONFIRMED' && (
                <button
                  onClick={() => updateOrderStatus(order.id, 'READY_FOR_PICKUP')}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  Marcar Lista
                </button>
              )}
              {order.status === 'READY_FOR_PICKUP' && (
                <button
                  onClick={() => updateOrderStatus(order.id, 'COMPLETED')}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  Completar
                </button>
              )}
              {(order.status === 'PENDING' || order.status === 'CONFIRMED') && (
                <button
                  onClick={() => updateOrderStatus(order.id, 'CANCELLED')}
                  className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                  Cancelar
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="w-16 h-16 text-gray-300 mx-auto mb-4 flex items-center justify-center">
            <ShoppingCart className="w-16 h-16" />
          </div>
          <p className="text-gray-600">No hay órdenes {filter !== 'all' ? 'con este estado' : ''}</p>
        </div>
      )}
    </div>
  )
}
