'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Eye, EyeOff, Upload } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface MenuItem {
  id: string
  name: string
  description: string | null
  price: number
  category: string
  image: string | null
  isAvailable: boolean
  preparationTime: number | null
  allergens: string[]
  isVegetarian: boolean
  isVegan: boolean
  isGlutenFree: boolean
}

const categories = [
  'Entrada',
  'Plato Principal',
  'Postre',
  'Bebida',
  'Snack',
  'Otro',
]

const commonAllergens = [
  'Gluten',
  'Lácteos',
  'Huevo',
  'Nueces',
  'Maní',
  'Soja',
  'Pescado',
  'Mariscos',
]

export default function MenuEditor() {
  const router = useRouter()
  const [items, setItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Plato Principal',
    image: '',
    preparationTime: '',
    allergens: [] as string[],
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
  })

  useEffect(() => {
    fetchMenuItems()
  }, [])

  const fetchMenuItems = async () => {
    try {
      const response = await fetch('/api/restaurant/menu')
      if (response.ok) {
        const data = await response.json()
        setItems(data)
      }
    } catch (error) {
      console.error('Error fetching menu items:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const itemData = {
      name: formData.name,
      description: formData.description || null,
      price: parseFloat(formData.price),
      category: formData.category,
      image: formData.image || null,
      preparationTime: formData.preparationTime ? parseInt(formData.preparationTime) : null,
      allergens: formData.allergens,
      isVegetarian: formData.isVegetarian,
      isVegan: formData.isVegan,
      isGlutenFree: formData.isGlutenFree,
    }

    try {
      const url = editingItem
        ? `/api/restaurant/menu/${editingItem.id}`
        : '/api/restaurant/menu'
      const method = editingItem ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemData),
      })

      if (response.ok) {
        await fetchMenuItems()
        resetForm()
        router.refresh()
      }
    } catch (error) {
      console.error('Error saving menu item:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este item?')) return

    try {
      const response = await fetch(`/api/restaurant/menu/${id}`, { method: 'DELETE' })
      if (response.ok) {
        await fetchMenuItems()
        router.refresh()
      }
    } catch (error) {
      console.error('Error deleting menu item:', error)
    }
  }

  const toggleAvailability = async (item: MenuItem) => {
    try {
      const response = await fetch(`/api/restaurant/menu/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAvailable: !item.isAvailable }),
      })
      if (response.ok) {
        await fetchMenuItems()
        router.refresh()
      }
    } catch (error) {
      console.error('Error toggling availability:', error)
    }
  }

  const startEdit = (item: MenuItem) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      description: item.description || '',
      price: item.price.toString(),
      category: item.category,
      image: item.image || '',
      preparationTime: item.preparationTime?.toString() || '',
      allergens: item.allergens,
      isVegetarian: item.isVegetarian,
      isVegan: item.isVegan,
      isGlutenFree: item.isGlutenFree,
    })
    setShowForm(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: 'Plato Principal',
      image: '',
      preparationTime: '',
      allergens: [],
      isVegetarian: false,
      isVegan: false,
      isGlutenFree: false,
    })
    setEditingItem(null)
    setShowForm(false)
  }

  const toggleAllergen = (allergen: string) => {
    setFormData({
      ...formData,
      allergens: formData.allergens.includes(allergen)
        ? formData.allergens.filter((a) => a !== allergen)
        : [...formData.allergens, allergen],
    })
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
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Gestión de Menú</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nuevo Item
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingItem ? 'Editar Item' : 'Crear Nuevo Item'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoría *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Precio *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tiempo de Preparación (min)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.preparationTime}
                  onChange={(e) => setFormData({ ...formData, preparationTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Alérgenos
              </label>
              <div className="flex flex-wrap gap-2">
                {commonAllergens.map((allergen) => (
                  <button
                    key={allergen}
                    type="button"
                    onClick={() => toggleAllergen(allergen)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      formData.allergens.includes(allergen)
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {allergen}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isVegetarian}
                  onChange={(e) => setFormData({ ...formData, isVegetarian: e.target.checked })}
                  className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                />
                <span className="text-sm text-gray-700">Vegetariano</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isVegan}
                  onChange={(e) => setFormData({ ...formData, isVegan: e.target.checked })}
                  className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                />
                <span className="text-sm text-gray-700">Vegano</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isGlutenFree}
                  onChange={(e) => setFormData({ ...formData, isGlutenFree: e.target.checked })}
                  className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                />
                <span className="text-sm text-gray-700">Sin Gluten</span>
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
              >
                {editingItem ? 'Actualizar Item' : 'Crear Item'}
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <div
            key={item.id}
            className={`bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 ${
              !item.isAvailable ? 'opacity-60' : ''
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  item.isAvailable
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {item.isAvailable ? 'Disponible' : 'No disponible'}
              </span>
            </div>

            <p className="text-sm text-gray-600 mb-2">{item.category}</p>
            {item.description && (
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{item.description}</p>
            )}

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Precio:</span>
                <span className="font-bold text-green-600">${item.price.toFixed(2)}</span>
              </div>
              {item.preparationTime && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Preparación:</span>
                  <span className="font-medium">{item.preparationTime} min</span>
                </div>
              )}
            </div>

            {(item.isVegetarian || item.isVegan || item.isGlutenFree) && (
              <div className="flex flex-wrap gap-1 mb-4">
                {item.isVegetarian && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                    🌱 Vegetariano
                  </span>
                )}
                {item.isVegan && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                    🌿 Vegano
                  </span>
                )}
                {item.isGlutenFree && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                    🌾 Sin Gluten
                  </span>
                )}
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => toggleAvailability(item)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {item.isAvailable ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              <button
                onClick={() => startEdit(item)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(item.id)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 mb-4">No tienes items en el menú</p>
          <button
            onClick={() => setShowForm(true)}
            className="text-orange-600 hover:text-orange-700 font-medium"
          >
            Crear tu primer item
          </button>
        </div>
      )}
    </div>
  )
}
