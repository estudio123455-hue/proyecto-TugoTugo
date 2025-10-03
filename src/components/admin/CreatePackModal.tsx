'use client'

import React, { useState, useEffect } from 'react'

interface CreatePackModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

interface Establishment {
  id: string
  name: string
}

export default function CreatePackModal({
  isOpen,
  onClose,
  onSuccess,
}: CreatePackModalProps) {
  const [establishments, setEstablishments] = useState<Establishment[]>([])
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    originalPrice: '',
    discountedPrice: '',
    quantity: '',
    availableFrom: '',
    availableUntil: '',
    pickupTimeStart: '',
    pickupTimeEnd: '',
    establishmentId: '',
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetchEstablishments()
    }
  }, [isOpen])

  const fetchEstablishments = async () => {
    try {
      const res = await fetch('/api/admin/establishments')
      const data = await res.json()
      if (data.success) {
        setEstablishments(data.data)
      }
    } catch (error) {
      console.error('Error fetching establishments:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/admin/packs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (data.success) {
        alert('Pack creado exitosamente')
        onSuccess()
        onClose()
        setFormData({
          title: '',
          description: '',
          originalPrice: '',
          discountedPrice: '',
          quantity: '',
          availableFrom: '',
          availableUntil: '',
          pickupTimeStart: '',
          pickupTimeEnd: '',
          establishmentId: '',
        })
      } else {
        alert(data.message || 'Error al crear pack')
      }
    } catch (error) {
      console.error('Error creating pack:', error)
      alert('Error al crear pack')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Crear Pack</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Restaurante *
              </label>
              <select
                required
                value={formData.establishmentId}
                onChange={(e) =>
                  setFormData({ ...formData, establishmentId: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">Seleccionar restaurante</option>
                {establishments.map((est) => (
                  <option key={est.id} value={est.id}>
                    {est.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Título *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción *
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Precio Original *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.originalPrice}
                  onChange={(e) =>
                    setFormData({ ...formData, originalPrice: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Precio con Descuento *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.discountedPrice}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      discountedPrice: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cantidad Disponible *
              </label>
              <input
                type="number"
                required
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({ ...formData, quantity: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Disponible Desde *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.availableFrom}
                  onChange={(e) =>
                    setFormData({ ...formData, availableFrom: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Disponible Hasta *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.availableUntil}
                  onChange={(e) =>
                    setFormData({ ...formData, availableUntil: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hora Inicio Recogida *
                </label>
                <input
                  type="time"
                  required
                  value={formData.pickupTimeStart}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      pickupTimeStart: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hora Fin Recogida *
                </label>
                <input
                  type="time"
                  required
                  value={formData.pickupTimeEnd}
                  onChange={(e) =>
                    setFormData({ ...formData, pickupTimeEnd: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Creando...' : 'Crear Pack'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
