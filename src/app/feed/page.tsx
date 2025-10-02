'use client'

import { useEffect, useState } from 'react'
import Navigation from '@/components/Navigation'
import Link from 'next/link'

interface Post {
  id: string
  title: string
  content: string
  images: string[]
  price?: number
  likes: number
  views: number
  createdAt: string
  establishment: {
    id: string
    name: string
    image?: string
    category: string
    address: string
    isApproved?: boolean // Opcional hasta que exista en BD
  }
}

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/posts')
      if (response.ok) {
        const data = await response.json()
        setPosts(data.data)
      }
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Hace menos de 1 hora'
    if (diffInHours < 24) return `Hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `Hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
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

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            📱 Feed de Platillos
          </h1>
          <p className="text-gray-600">
            Descubre los platillos más recientes de restaurantes aprobados
          </p>
        </div>

        {/* Posts Feed */}
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No hay publicaciones aún
            </h3>
            <p className="text-gray-600">
              Los restaurantes comenzarán a publicar pronto
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <div
                key={post.id}
                className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Post Header */}
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <Link
                      href={`/establecimiento/${post.establishment.id}`}
                      className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-2xl">
                          {post.establishment.image || '🏪'}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {post.establishment.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {formatDate(post.createdAt)}
                        </p>
                      </div>
                    </Link>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                      {post.establishment.category}
                    </span>
                  </div>
                </div>

                {/* Post Content */}
                <div className="p-4">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    {post.title}
                  </h2>
                  <p className="text-gray-700 mb-4 whitespace-pre-wrap">
                    {post.content}
                  </p>

                  {post.price && (
                    <div className="mb-4">
                      <span className="inline-flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full font-semibold">
                        💰 ${post.price.toFixed(2)}
                      </span>
                    </div>
                  )}

                  {/* Images Grid */}
                  {post.images && post.images.length > 0 && (
                    <div className={`grid gap-2 mb-4 ${
                      post.images.length === 1 ? 'grid-cols-1' :
                      post.images.length === 2 ? 'grid-cols-2' :
                      'grid-cols-2 md:grid-cols-3'
                    }`}>
                      {post.images.map((image, index) => (
                        <div
                          key={index}
                          className="relative aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => setSelectedImage(image)}
                        >
                          <img
                            src={image}
                            alt={`${post.title} - imagen ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Post Footer */}
                <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center">
                        <span className="mr-1">👁️</span>
                        {post.views} vistas
                      </span>
                      <span className="flex items-center">
                        <span className="mr-1">❤️</span>
                        {post.likes} me gusta
                      </span>
                    </div>
                    <Link
                      href={`/establecimiento/${post.establishment.id}`}
                      className="text-green-600 hover:text-green-700 font-medium"
                    >
                      Ver restaurante →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 text-white text-4xl hover:text-gray-300"
            >
              ×
            </button>
            <img
              src={selectedImage}
              alt="Imagen ampliada"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  )
}
