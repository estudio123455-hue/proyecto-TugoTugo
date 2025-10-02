'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Navigation from '@/components/Navigation'

export default function NewPostPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    price: '',
    images: [] as string[],
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (!formData.title || !formData.content) {
      setError('El título y contenido son requeridos')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
          price: formData.price ? parseFloat(formData.price) : null,
          images: formData.images,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        alert('✅ Publicación creada exitosamente')
        router.push('/dashboard')
      } else {
        setError(data.message || 'Error al crear publicación')
      }
    } catch (error) {
      console.error('Error creating post:', error)
      setError('Error al crear publicación')
    } finally {
      setIsLoading(false)
    }
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <p>Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="text-green-600 hover:text-green-700 mb-4 flex items-center"
          >
            ← Volver
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📱 Nueva Publicación
          </h1>
          <p className="text-gray-600">
            Comparte tus platillos, promociones o menús especiales
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Título *
              </label>
              <input
                type="text"
                id="title"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Ej: Menú del día - Pasta Carbonara"
                maxLength={100}
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.title.length}/100 caracteres
              </p>
            </div>

            {/* Content */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                Descripción *
              </label>
              <textarea
                id="content"
                required
                rows={6}
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Describe tu platillo, ingredientes, promoción, etc..."
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.content.length}/500 caracteres
              </p>
            </div>

            {/* Price */}
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                Precio (opcional)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">$</span>
                <input
                  type="number"
                  id="price"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg pl-8 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="0.00"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Deja vacío si no quieres mostrar precio
              </p>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">💡 Consejos para una buena publicación:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Usa un título atractivo y descriptivo</li>
                <li>• Describe los ingredientes principales</li>
                <li>• Menciona si hay promociones o descuentos</li>
                <li>• Indica horarios de disponibilidad si aplica</li>
              </ul>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white font-medium py-3 px-6 rounded-lg transition-colors"
              >
                {isLoading ? 'Publicando...' : '✅ Publicar'}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
