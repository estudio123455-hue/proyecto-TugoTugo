'use client'

import { useEffect, useState } from 'react'
import Navigation from '@/components/Navigation'
import PackCard from '@/components/PackCard'
import MapWithFilters from '@/components/map/MapWithFilters'

interface Establishment {
  id: string
  name: string
  address: string
  latitude: number
  longitude: number
  category: string
  image?: string
  packs: Pack[]
}

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
}

export default function MapPage() {
  const [establishments, setEstablishments] = useState<Establishment[]>([])
  const [selectedEstablishment, setSelectedEstablishment] =
    useState<Establishment | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showSidebar, setShowSidebar] = useState(false)

  useEffect(() => {
    fetchEstablishments()
  }, [])

  const fetchEstablishments = async () => {
    try {
      const response = await fetch('/api/establishments')
      if (response.ok) {
        const data = await response.json()
        setEstablishments(data)
      }
    } catch (error) {
      console.error('Error fetching establishments:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEstablishmentSelect = (establishment: Establishment) => {
    setSelectedEstablishment(establishment)
    setShowSidebar(true)
  }

  const handleReservePack = async (packId: string, quantity: number) => {
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          packId,
          quantity,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        // Redirect to payment
        window.location.href = data.paymentUrl
      } else {
        const error = await response.json()
        alert(error.message || 'Failed to reserve pack')
      }
    } catch (error) {
      console.error('Error reserving pack:', error)
      alert('An error occurred while reserving the pack')
    }
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="relative h-[calc(100vh-4rem)]">
        {/* Map */}
        <div className="h-full w-full">
          <MapWithFilters
            establishments={establishments}
            onEstablishmentSelect={handleEstablishmentSelect}
          />
        </div>

        {/* Mobile toggle button */}
        <button
          onClick={() => setShowSidebar(!showSidebar)}
          className="md:hidden absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3 z-10"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        {/* Sidebar */}
        <div
          className={`absolute top-0 right-0 h-full w-full md:w-96 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-10 ${
            showSidebar ? 'translate-x-0' : 'translate-x-full md:translate-x-0'
          }`}
        >
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="bg-green-500 text-white p-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {selectedEstablishment
                  ? selectedEstablishment.name
                  : 'Available Packs'}
              </h2>
              <button
                onClick={() => setShowSidebar(false)}
                className="md:hidden text-white hover:text-gray-200"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {selectedEstablishment ? (
                <div className="space-y-4">
                  <div className="mb-6">
                    <button
                      onClick={() => setSelectedEstablishment(null)}
                      className="text-green-600 hover:text-green-700 text-sm mb-2"
                    >
                      ← Back to all establishments
                    </button>
                    <h3 className="text-xl font-bold text-gray-900">
                      {selectedEstablishment.name}
                    </h3>
                    <p className="text-gray-600">
                      {selectedEstablishment.address}
                    </p>
                    <p className="text-sm text-gray-500 capitalize">
                      {selectedEstablishment.category.toLowerCase()}
                    </p>
                  </div>

                  {selectedEstablishment.packs.filter(pack => pack.quantity > 0)
                    .length > 0 ? (
                    <div className="space-y-4">
                      {selectedEstablishment.packs
                        .filter(pack => pack.quantity > 0)
                        .map(pack => (
                          <PackCard
                            key={pack.id}
                            pack={{
                              ...pack,
                              establishment: {
                                id: selectedEstablishment.id,
                                name: selectedEstablishment.name,
                                address: selectedEstablishment.address,
                                category: selectedEstablishment.category,
                                image: selectedEstablishment.image,
                                isActive: true,
                              },
                            }}
                            onReserve={handleReservePack}
                          />
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">
                        No packs available at this establishment.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      All Available Packs
                    </h3>
                    <p className="text-sm text-gray-600">
                      Click on a pack or map marker to view details
                    </p>
                  </div>

                  {establishments.flatMap(est =>
                    est.packs
                      .filter(pack => pack.quantity > 0)
                      .map(pack => ({
                        ...pack,
                        establishment: {
                          id: est.id,
                          name: est.name,
                          address: est.address,
                          category: est.category,
                          image: est.image,
                          isActive: true,
                        },
                      }))
                  ).length > 0 ? (
                    <div className="space-y-4">
                      {establishments.flatMap(est =>
                        est.packs
                          .filter(pack => pack.quantity > 0)
                          .map(pack => (
                            <PackCard
                              key={pack.id}
                              pack={{
                                ...pack,
                                establishment: {
                                  id: est.id,
                                  name: est.name,
                                  address: est.address,
                                  category: est.category,
                                  image: est.image,
                                  isActive: true,
                                },
                              }}
                              onReserve={handleReservePack}
                            />
                          ))
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">
                        No packs available right now.
                      </p>
                      <p className="text-sm text-gray-400 mt-2">
                        Check back later for new deals!
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
