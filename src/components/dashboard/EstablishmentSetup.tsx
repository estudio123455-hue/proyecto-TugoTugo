'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'

interface EstablishmentSetupProps {
  onSetupComplete: () => void
}

export default function EstablishmentSetup({ onSetupComplete }: EstablishmentSetupProps) {
  const { data: session } = useSession()
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    latitude: 4.7110, // Bogotá por defecto
    longitude: -74.0721, // Bogotá por defecto
    phone: '',
    email: session?.user?.email || '',
    category: 'RESTAURANT' as 'RESTAURANT' | 'CAFE' | 'BAKERY' | 'SUPERMARKET' | 'GROCERY' | 'OTHER'
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isGettingLocation, setIsGettingLocation] = useState(false)

  const categories = [
    { value: 'RESTAURANT', label: 'Restaurant' },
    { value: 'CAFE', label: 'Café' },
    { value: 'BAKERY', label: 'Bakery' },
    { value: 'SUPERMARKET', label: 'Supermarket' },
    { value: 'GROCERY', label: 'Grocery Store' },
    { value: 'OTHER', label: 'Other' },
  ]

  const getLocation = () => {
    setIsGettingLocation(true)
    
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser')
      setIsGettingLocation(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData({
          ...formData,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
        setIsGettingLocation(false)
      },
      (error) => {
        setError('Error getting location: ' + error.message)
        setIsGettingLocation(false)
      }
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (!formData.name || !formData.address || !formData.latitude || !formData.longitude) {
      setError('Please fill in all required fields and set your location')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/establishment/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          userId: session?.user?.id,
        }),
      })

      if (response.ok) {
        onSetupComplete()
      } else {
        const data = await response.json()
        setError(data.message || 'Failed to create establishment')
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to FoodSave!
          </h1>
          <p className="text-gray-600">
            Let's set up your establishment profile to start reducing food waste
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Business Name *
            </label>
            <input
              type="text"
              id="name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                  placeholder="Ej: Restaurante El Buen Sabor"
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
              Category *
            </label>
            <select
              id="category"
              required
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
            >
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
              placeholder="Tell customers about your business..."
            />
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">
              Address *
            </label>
            <input
              type="text"
              id="address"
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                placeholder="Ej: Calle 85 #15-20, Bogotá"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location *
            </label>
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={getLocation}
                disabled={isGettingLocation}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-md text-sm"
              >
                {isGettingLocation ? 'Getting Location...' : 'Get Current Location'}
              </button>
              {formData.latitude && formData.longitude && (
                <span className="text-sm text-green-600">
                  ✓ Location set ({formData.latitude.toFixed(4)}, {formData.longitude.toFixed(4)})
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              We need your location to show your establishment on the map
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                  placeholder="+57 321 459 6837"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Contact Email
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                placeholder="contacto@mirestaurante.com"
              />
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-md p-3">
              {error}
            </div>
          )}

          <div className="pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white font-medium py-3 px-4 rounded-md transition-colors"
            >
              {isLoading ? 'Setting up...' : 'Complete Setup'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
