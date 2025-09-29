'use client'

import React, { useState, useEffect } from 'react'

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
  isActive: boolean
  createdAt: string
}

interface PackManagementProps {
  establishmentId: string
}

export default function PackManagement({
  establishmentId,
}: PackManagementProps) {
  const [packs, setPacks] = useState<Pack[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingPack, setEditingPack] = useState<Pack | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    originalPrice: 0,
    discountedPrice: 0,
    quantity: 1,
    availableFrom: '',
    availableUntil: '',
    pickupTimeStart: '18:00',
    pickupTimeEnd: '20:00',
  })

  useEffect(() => {
    fetchPacks()
  }, [establishmentId])

  const fetchPacks = async () => {
    try {
      const response = await fetch('/api/packs')
      if (response.ok) {
        const data = await response.json()
        setPacks(data)
      }
    } catch (error) {
      console.error('Error fetching packs:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingPack ? `/api/packs/${editingPack.id}` : '/api/packs'
      const method = editingPack ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          establishmentId,
        }),
      })

      if (response.ok) {
        await fetchPacks()
        resetForm()
      } else {
        const error = await response.json()
        alert(error.message || 'Failed to save pack')
      }
    } catch (error) {
      console.error('Error saving pack:', error)
      alert('An error occurred while saving the pack')
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      originalPrice: 0,
      discountedPrice: 0,
      quantity: 1,
      availableFrom: '',
      availableUntil: '',
      pickupTimeStart: '18:00',
      pickupTimeEnd: '20:00',
    })
    setShowCreateForm(false)
    setEditingPack(null)
  }

  const handleEdit = (pack: Pack) => {
    setFormData({
      title: pack.title,
      description: pack.description,
      originalPrice: pack.originalPrice,
      discountedPrice: pack.discountedPrice,
      quantity: pack.quantity,
      availableFrom: pack.availableFrom.split('T')[0],
      availableUntil: pack.availableUntil.split('T')[0],
      pickupTimeStart: pack.pickupTimeStart,
      pickupTimeEnd: pack.pickupTimeEnd,
    })
    setEditingPack(pack)
    setShowCreateForm(true)
  }

  const handleToggleActive = async (packId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/packs/${packId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !isActive }),
      })

      if (response.ok) {
        await fetchPacks()
      }
    } catch (error) {
      console.error('Error toggling pack status:', error)
    }
  }

  const handleDelete = async (packId: string) => {
    if (!confirm('Are you sure you want to delete this pack?')) return

    try {
      const response = await fetch(`/api/packs/${packId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchPacks()
      }
    } catch (error) {
      console.error('Error deleting pack:', error)
    }
  }

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
        <h2 className="text-2xl font-bold text-gray-900">Manage Packs</h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
        >
          Create New Pack
        </button>
      </div>

      {/* Create/Edit Form */}
      {showCreateForm && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              {editingPack ? 'Edit Pack' : 'Create New Pack'}
            </h3>
            <button
              onClick={resetForm}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pack Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={e =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                  placeholder="Surprise Dinner Pack"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={formData.quantity}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      quantity: parseInt(e.target.value),
                    })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                required
                rows={3}
                value={formData.description}
                onChange={e =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                placeholder="Describe what might be included in this pack..."
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Original Price *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={formData.originalPrice}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      originalPrice: parseFloat(e.target.value),
                    })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                  placeholder="25.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discounted Price *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={formData.discountedPrice}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      discountedPrice: parseFloat(e.target.value),
                    })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                  placeholder="12.50"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Available From *
                </label>
                <input
                  type="date"
                  required
                  value={formData.availableFrom}
                  onChange={e =>
                    setFormData({ ...formData, availableFrom: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Available Until *
                </label>
                <input
                  type="date"
                  required
                  value={formData.availableUntil}
                  onChange={e =>
                    setFormData({ ...formData, availableUntil: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pickup Start Time *
                </label>
                <input
                  type="time"
                  required
                  value={formData.pickupTimeStart}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      pickupTimeStart: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pickup End Time *
                </label>
                <input
                  type="time"
                  required
                  value={formData.pickupTimeEnd}
                  onChange={e =>
                    setFormData({ ...formData, pickupTimeEnd: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>

            <div className="flex space-x-4 pt-4">
              <button
                type="submit"
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-md"
              >
                {editingPack ? 'Update Pack' : 'Create Pack'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-md"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Packs List */}
      <div className="space-y-4">
        {packs.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500 mb-4">No packs created yet</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg"
            >
              Create Your First Pack
            </button>
          </div>
        ) : (
          packs.map(pack => (
            <div key={pack.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {pack.title}
                  </h3>
                  <p className="text-gray-600 text-sm">{pack.description}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      pack.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {pack.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              <div className="grid md:grid-cols-4 gap-4 mb-4">
                <div>
                  <span className="text-sm text-gray-500">Price</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-green-600">
                      ${pack.discountedPrice}
                    </span>
                    <span className="text-sm text-gray-500 line-through">
                      ${pack.originalPrice}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Quantity</span>
                  <div className="font-semibold">{pack.quantity}</div>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Available</span>
                  <div className="text-sm">
                    {new Date(pack.availableFrom).toLocaleDateString()} -{' '}
                    {new Date(pack.availableUntil).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Pickup Time</span>
                  <div className="text-sm">
                    {pack.pickupTimeStart} - {pack.pickupTimeEnd}
                  </div>
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(pack)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleToggleActive(pack.id, pack.isActive)}
                  className={`px-4 py-2 rounded text-sm ${
                    pack.isActive
                      ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                      : 'bg-green-500 hover:bg-green-600 text-white'
                  }`}
                >
                  {pack.isActive ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => handleDelete(pack.id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
