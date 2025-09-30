'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface Pack {
  id: string
  title: string
  description: string
  originalPrice: number
  discountedPrice: number
  quantity: number
  availableFrom: string
  availableUntil: string
  pickupTimeStart: string
  pickupTimeEnd: string
  establishment: {
    id: string
    name: string
    address: string
    category: string
    image?: string | null
    isActive: boolean
  }
}

interface PackCardProps {
  pack: Pack
  onReserve?: (packId: string, quantity: number) => void
}

export default function PackCard({ pack, onReserve }: PackCardProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [quantity, setQuantity] = useState(1)
  const [isReserving, setIsReserving] = useState(false)

  const discountPercentage = Math.round(
    ((pack.originalPrice - pack.discountedPrice) / pack.originalPrice) * 100
  )

  const handleReserve = async () => {
    if (!session) {
      router.push('/auth')
      return
    }

    setIsReserving(true)
    try {
      if (onReserve) {
        await onReserve(pack.id, quantity)
      }
    } catch (error) {
      console.error('Error reserving pack:', error)
    } finally {
      setIsReserving(false)
    }
  }

  const formatTime = (time: string) => {
    return time.slice(0, 5) // Convert "18:00:00" to "18:00"
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {pack.title}
            </h3>
            <p className="text-sm text-gray-600">{pack.establishment.name}</p>
            <p className="text-xs text-gray-500">
              {pack.establishment.address}
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold text-green-600">
                ${pack.discountedPrice.toFixed(2)}
              </span>
              <span className="text-sm text-gray-500 line-through">
                ${pack.originalPrice.toFixed(2)}
              </span>
            </div>
            <span className="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
              {discountPercentage}% OFF
            </span>
          </div>
        </div>

        <p className="text-gray-700 text-sm mb-4">{pack.description}</p>

        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Available:</span>
            <span className="font-medium">
              {formatDate(pack.availableFrom)} -{' '}
              {formatDate(pack.availableUntil)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Pickup time:</span>
            <span className="font-medium">
              {formatTime(pack.pickupTimeStart)} -{' '}
              {formatTime(pack.pickupTimeEnd)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Remaining:</span>
            <span className="font-medium text-green-600">
              {pack.quantity} pack{pack.quantity !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {pack.quantity > 0 ? (
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <label
                htmlFor={`quantity-${pack.id}`}
                className="text-sm font-medium text-gray-700"
              >
                Quantity:
              </label>
              <select
                id={`quantity-${pack.id}`}
                value={quantity}
                onChange={e => setQuantity(parseInt(e.target.value))}
                className="border border-gray-300 rounded px-3 py-1 text-sm"
              >
                {Array.from({ length: Math.min(pack.quantity, 5) }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleReserve}
              disabled={isReserving}
              className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white font-medium py-2 px-4 rounded transition-colors"
            >
              {isReserving
                ? 'Reserving...'
                : `Reserve for $${(pack.discountedPrice * quantity).toFixed(2)}`}
            </button>
          </div>
        ) : (
          <div className="text-center py-2">
            <span className="text-red-500 font-medium">Sold Out</span>
          </div>
        )}
      </div>
    </div>
  )
}
