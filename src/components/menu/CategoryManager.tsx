'use client'

import { useState } from 'react'
import { Plus, X, Edit2, Check } from 'lucide-react'

interface CategoryManagerProps {
  categories: string[]
  onCategoryAdd: (category: string) => void
  onCategoryRemove: (category: string) => void
  onCategoryRename: (oldName: string, newName: string) => void
}

export default function CategoryManager({
  categories,
  onCategoryAdd,
  onCategoryRemove,
  onCategoryRename,
}: CategoryManagerProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [newCategory, setNewCategory] = useState('')
  const [editingCategory, setEditingCategory] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')

  const handleAdd = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      onCategoryAdd(newCategory.trim())
      setNewCategory('')
      setShowAddForm(false)
    }
  }

  const startEdit = (category: string) => {
    setEditingCategory(category)
    setEditValue(category)
  }

  const handleRename = () => {
    if (editValue.trim() && editValue !== editingCategory && !categories.includes(editValue.trim())) {
      onCategoryRename(editingCategory!, editValue.trim())
      setEditingCategory(null)
      setEditValue('')
    }
  }

  const cancelEdit = () => {
    setEditingCategory(null)
    setEditValue('')
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Gestión de Categorías</h3>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          Nueva Categoría
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex gap-2">
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
              placeholder="Nombre de la categoría"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              autoFocus
            />
            <button
              onClick={handleAdd}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              <Check className="w-5 h-5" />
            </button>
            <button
              onClick={() => {
                setShowAddForm(false)
                setNewCategory('')
              }}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Categories List */}
      <div className="space-y-2">
        {categories.map((category) => (
          <div
            key={category}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {editingCategory === category ? (
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleRename()}
                  className="flex-1 px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  autoFocus
                />
                <button
                  onClick={handleRename}
                  className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={cancelEdit}
                  className="px-3 py-1 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <span className="font-medium text-gray-900">{category}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(category)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Editar categoría"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`¿Eliminar la categoría "${category}"? Los items no se eliminarán.`)) {
                        onCategoryRemove(category)
                      }
                    }}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Eliminar categoría"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No hay categorías creadas</p>
          <p className="text-sm mt-1">Las categorías se crean automáticamente al agregar items</p>
        </div>
      )}
    </div>
  )
}
