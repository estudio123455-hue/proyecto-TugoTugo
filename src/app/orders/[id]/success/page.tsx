'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Navigation from '@/components/Navigation'

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

export default function OrderSuccess() {
  const params = useParams()
  const orderId = params.id as string
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (orderId) {
      fetchOrder()
    }
  }, [orderId, fetchOrder])

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/orders/${orderId}`)
      if (response.ok) {
        const data = await response.json()
        setOrder(data)
      } else {
        setError('Order not found')
      }
    } catch (error) {
      setError('Failed to load order details')
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatTime = (time: string) => {
    return time.slice(0, 5) // Convert "18:00:00" to "18:00"
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-md mx-auto pt-20 px-4">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-red-500 text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Order Not Found
            </h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link
              href="/map"
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg"
            >
              Browse Packs
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-2xl mx-auto pt-20 px-4">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Success Header */}
          <div className="bg-green-500 text-white p-6 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="text-3xl font-bold mb-2">¡Pack Reservado!</h1>
            <p className="text-green-100 text-lg">
              Tu pack sorpresa está confirmado
            </p>
          </div>

          {/* Order Details */}
          <div className="p-6">
            <div className="border-b border-gray-200 pb-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Order Details
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order ID:</span>
                  <span className="font-medium">
                    {order.id.slice(-8).toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pack:</span>
                  <span className="font-medium">{order.pack.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Quantity:</span>
                  <span className="font-medium">{order.quantity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Paid:</span>
                  <span className="font-medium text-green-600">
                    ${order.totalAmount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    {order.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Pickup Information */}
            <div className="border-b border-gray-200 pb-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                📍 Información de Recogida
              </h2>

              <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6 mb-4">
                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold text-green-800 mb-2">
                    Recógelo entre {formatTime(order.pack.pickupTimeStart)} y{' '}
                    {formatTime(order.pack.pickupTimeEnd)}
                  </h3>
                  <p className="text-green-700 font-medium">
                    en {order.pack.establishment.name}
                  </p>
                </div>

                <div className="bg-white rounded-lg p-4">
                  <div className="flex items-start">
                    <div className="text-2xl mr-3">🏪</div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {order.pack.establishment.name}
                      </h4>
                      <p className="text-gray-600 text-sm">
                        {order.pack.establishment.address}
                      </p>
                      {order.pack.establishment.phone && (
                        <p className="text-gray-600 text-sm mt-1">
                          📞 {order.pack.establishment.phone}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center justify-center text-blue-800">
                  <div className="text-xl mr-2">⏰</div>
                  <div className="text-center">
                    <div className="font-bold">
                      {formatDate(order.pickupDate)}
                    </div>
                    <div className="text-sm">
                      Horario: {formatTime(order.pack.pickupTimeStart)} -{' '}
                      {formatTime(order.pack.pickupTimeEnd)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Important Notes */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Important Notes
              </h2>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  Please arrive during the specified pickup window
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  Bring a valid ID and show this confirmation
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  The pack contents are a surprise - enjoy discovering what&apos;s
                  inside!
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  If you can&apos;t make it, please contact the establishment
                </li>
              </ul>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/profile"
                className="flex-1 bg-primary-500 hover:bg-primary-600 text-white text-center py-2 px-4 rounded-lg transition-colors"
              >
                View All Orders
              </Link>
              <Link
                href="/map"
                className="flex-1 bg-green-500 hover:bg-green-600 text-white text-center py-2 px-4 rounded-lg transition-colors"
              >
                Browse More Packs
              </Link>
            </div>
          </div>
        </div>

        {/* Email Reminder */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <p className="text-blue-700 text-sm">
            📧 A confirmation email has been sent to your registered email
            address with all the details.
          </p>
        </div>
      </div>
    </div>
  )
}
