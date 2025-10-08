'use client'

import { useState, useEffect } from 'react'
import { Clock, Leaf, Wheat } from 'lucide-react'

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

interface MenuDisplayProps {
  establishmentId: string
}

export default function MenuDisplay({ establishmentId }: MenuDisplayProps) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [groupedMenu, setGroupedMenu] = useState<Record<string, MenuItem[]>>({})
  const [categories, setCategories] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMenu()
  }, [establishmentId])

  const fetchMenu = async () => {
    try {
      const response = await fetch(`/api/restaurant/menu?establishmentId=${establishmentId}`)
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setMenuItems(data.data.items)
          setGroupedMenu(data.data.grouped)
          setCategories(data.data.categories)
        }
      }
    } catch (error) {
      console.error('Error fetching menu:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredItems =
    selectedCategory === 'all'
      ? menuItems
      : menuItems.filter((item) => item.category === selectedCategory)

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  if (menuItems.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <p className="text-gray-600">Este establecimiento aún no ha publicado su menú</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedCategory === 'all'
              ? 'bg-orange-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Todos
        </button>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedCategory === category
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Menu Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className={`bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 ${
              !item.isAvailable ? 'opacity-60' : ''
            }`}
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{item.name}</h3>
                {item.description && (
                  <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                )}
              </div>
              <div className="text-right ml-4">
                <p className="text-xl font-bold text-green-600">${item.price.toFixed(2)}</p>
                {!item.isAvailable && (
                  <span className="text-xs text-red-600">No disponible</span>
                )}
              </div>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-3">
              {item.isVegetarian && (
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded flex items-center gap-1">
                  <Leaf className="w-3 h-3" />
                  Vegetariano
                </span>
              )}
              {item.isVegan && (
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded flex items-center gap-1">
                  <Leaf className="w-3 h-3" />
                  Vegano
                </span>
              )}
              {item.isGlutenFree && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded flex items-center gap-1">
                  <Wheat className="w-3 h-3" />
                  Sin Gluten
                </span>
              )}
              {item.preparationTime && (
                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {item.preparationTime} min
                </span>
              )}
            </div>

            {/* Allergens */}
            {item.allergens.length > 0 && (
              <div className="text-xs text-gray-500">
                <span className="font-medium">Alérgenos:</span> {item.allergens.join(', ')}
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No hay items en esta categoría</p>
        </div>
      )}
    </div>
  )
}
