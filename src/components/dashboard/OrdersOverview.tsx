'use client'

import { useState, useEffect } from 'react'

interface Order {
  id: string
  quantity: number
  totalAmount: number
  status: string
  pickupDate: string
  createdAt: string
  user: {
    name: string
    email: string
  }
  pack: {
    title: string
    pickupTimeStart: string
    pickupTimeEnd: string
  }
}

interface OrdersOverviewProps {
  establishmentId: string
}

export default function OrdersOverview({ establishmentId }: OrdersOverviewProps) {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchOrders()
  }, [establishmentId])

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
      setIsLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        await fetchOrders()
      }
    } catch (error) {
      console.error('Error updating order status:', error)
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

  const getStatusActions = (order: Order) => {
    switch (order.status) {
      case 'CONFIRMED':
        return (
          <button
            onClick={() => updateOrderStatus(order.id, 'READY_FOR_PICKUP')}
            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
          >
            Mark Ready
          </button>
        )
      case 'READY_FOR_PICKUP':
        return (
          <button
            onClick={() => updateOrderStatus(order.id, 'COMPLETED')}
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
          >
            Mark Completed
          </button>
        )
      default:
        return null
    }
  }

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true
    return order.status === filter
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Orders</h2>
        
        {/* Filter */}
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
        >
          <option value="all">All Orders</option>
          <option value="PENDING">Pending</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="READY_FOR_PICKUP">Ready for Pickup</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">
              {filter === 'all' ? 'No orders yet' : `No ${filter.toLowerCase()} orders`}
            </p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Order #{order.id.slice(-8).toUpperCase()}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {order.pack.title} × {order.quantity}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-green-600 mb-1">
                    ${order.totalAmount.toFixed(2)}
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
                    {order.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div>
                  <span className="text-sm text-gray-500">Customer</span>
                  <div className="font-medium">{order.user.name}</div>
                  <div className="text-sm text-gray-600">{order.user.email}</div>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Pickup Date</span>
                  <div className="font-medium">
                    {new Date(order.pickupDate).toLocaleDateString()}
                  </div>
                  <div className="text-sm text-gray-600">
                    {order.pack.pickupTimeStart} - {order.pack.pickupTimeEnd}
                  </div>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Order Date</span>
                  <div className="font-medium">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </div>
                  <div className="text-sm text-gray-600">
                    {new Date(order.createdAt).toLocaleTimeString()}
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  {order.status === 'READY_FOR_PICKUP' && (
                    <span className="text-green-600 font-medium">
                      🔔 Customer notified - Ready for pickup
                    </span>
                  )}
                </div>
                <div>
                  {getStatusActions(order)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
