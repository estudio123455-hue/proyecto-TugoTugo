'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Eye, EyeOff } from 'lucide-react'
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
  isActive: boolean
}

export default function PackManagement() {
  const router = useRouter()
  const [packs, setPacks] = useState<Pack[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingPack, setEditingPack] = useState<Pack | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    originalPrice: '',
    discountedPrice: '',
    quantity: '',
    date: '',
    startTime: '',
    endTime: '',
  })

  useEffect(() => {
    fetchPacks()
  }, [])

  const fetchPacks = async () => {
    try {
      const response = await fetch('/api/restaurant/packs')
      if (response.ok) {
        const data = await response.json()
        setPacks(data)
      }
    } catch (error) {
      console.error('Error fetching packs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const packData = {
      title: formData.title,
      description: formData.description,
      originalPrice: parseFloat(formData.originalPrice),
      discountedPrice: parseFloat(formData.discountedPrice),
      quantity: parseInt(formData.quantity),
      availableFrom: new Date(`${formData.date}T${formData.startTime}`).toISOString(),
      availableUntil: new Date(`${formData.date}T${formData.endTime}`).toISOString(),
      pickupTimeStart: formData.startTime,
      pickupTimeEnd: formData.endTime,
    }

    try {
      const url = editingPack
        ? `/api/packs/${editingPack.id}`
        : '/api/restaurant/packs'
      const method = editingPack ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(packData),
      })

      if (response.ok) {
        await fetchPacks()
        resetForm()
        router.refresh()
      }
    } catch (error) {
      console.error('Error saving pack:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este pack?')) return

    try {
      const response = await fetch(`/api/packs/${id}`, { method: 'DELETE' })
      if (response.ok) {
        await fetchPacks()
        router.refresh()
      }
    } catch (error) {
      console.error('Error deleting pack:', error)
    }
  }

  const toggleActive = async (pack: Pack) => {
    try {
      const response = await fetch(`/api/packs/${pack.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !pack.isActive }),
      })
      if (response.ok) {
        await fetchPacks()
        router.refresh()
      }
    } catch (error) {
      console.error('Error toggling pack:', error)
    }
  }

  const startEdit = (pack: Pack) => {
    setEditingPack(pack)
    const date = new Date(pack.availableFrom).toISOString().split('T')[0]
    setFormData({
      title: pack.title,
      description: pack.description,
      originalPrice: pack.originalPrice.toString(),
      discountedPrice: pack.discountedPrice.toString(),
      quantity: pack.quantity.toString(),
      date,
      startTime: pack.pickupTimeStart,
      endTime: pack.pickupTimeEnd,
    })
    setShowForm(true)
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      originalPrice: '',
      discountedPrice: '',
      quantity: '',
      date: '',
      startTime: '',
      endTime: '',
    })
    setEditingPack(null)
    setShowForm(false)
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Gestión de Packs</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nuevo Pack
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingPack ? 'Editar Pack' : 'Crear Nuevo Pack'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Pack Sorpresa"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cantidad *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción *
              </label>
              <textarea
                required
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Descripción del pack..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Precio Original *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.originalPrice}
                  onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Precio con Descuento *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.discountedPrice}
                  onChange={(e) => setFormData({ ...formData, discountedPrice: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha *
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hora Inicio *
                </label>
                <input
                  type="time"
                  required
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hora Fin *
                </label>
                <input
                  type="time"
                  required
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
              >
                {editingPack ? 'Actualizar Pack' : 'Crear Pack'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Packs List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packs.map((pack) => (
          <div
            key={pack.id}
            className={`bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 ${
              !pack.isActive ? 'opacity-60' : ''
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{pack.title}</h3>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  pack.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {pack.isActive ? 'Activo' : 'Inactivo'}
              </span>
            </div>

            <p className="text-sm text-gray-600 mb-4 line-clamp-2">{pack.description}</p>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Precio:</span>
                <div>
                  <span className="line-through text-gray-400 mr-2">
                    ${pack.originalPrice.toFixed(2)}
                  </span>
                  <span className="text-green-600 font-bold">
                    ${pack.discountedPrice.toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Cantidad:</span>
                <span className="font-medium">{pack.quantity}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Horario:</span>
                <span className="font-medium">
                  {pack.pickupTimeStart} - {pack.pickupTimeEnd}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => toggleActive(pack)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                title={pack.isActive ? 'Desactivar' : 'Activar'}
              >
                {pack.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              <button
                onClick={() => startEdit(pack)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(pack.id)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {packs.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">No tienes packs creados</p>
          <button
            onClick={() => setShowForm(true)}
            className="text-orange-600 hover:text-orange-700 font-medium"
          >
            Crear tu primer pack
          </button>
        </div>
      )}
    </div>
  )
}
