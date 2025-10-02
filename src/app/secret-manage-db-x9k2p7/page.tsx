'use client'

import { useEffect, useState } from 'react'
import Navigation from '@/components/Navigation'

interface Establishment {
  id: string
  name: string
  description: string | null
  address: string
  category: string
  createdAt: string
  user: {
    name: string | null
    email: string
  }
  _count: {
    posts: number
    packs: number
  }
}

interface Post {
  id: string
  title: string
  content: string
  price: number | null
  createdAt: string
  establishment: {
    name: string
  }
}

export default function SecretManagePage() {
  const [establishments, setEstablishments] = useState<Establishment[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'restaurants' | 'posts'>('restaurants')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      // Fetch establishments
      const estResponse = await fetch('/api/establishments')
      if (estResponse.ok) {
        const estData = await estResponse.json()
        setEstablishments(estData)
      }

      // Fetch posts
      const postsResponse = await fetch('/api/posts')
      if (postsResponse.ok) {
        const postsData = await postsResponse.json()
        setPosts(postsData.data || [])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const deleteEstablishment = async (id: string, name: string) => {
    if (!confirm(`¿Estás seguro de eliminar el restaurante "${name}"?\n\nEsto también eliminará todas sus publicaciones y packs.`)) {
      return
    }

    try {
      const response = await fetch(`/api/establishments/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        alert(`✅ Restaurante "${name}" eliminado exitosamente`)
        fetchData()
      } else {
        alert('❌ Error al eliminar restaurante')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('❌ Error al eliminar restaurante')
    }
  }

  const deletePost = async (id: string, title: string) => {
    if (!confirm(`¿Estás seguro de eliminar la publicación "${title}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/posts/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        alert(`✅ Publicación "${title}" eliminada exitosamente`)
        fetchData()
      } else {
        alert('❌ Error al eliminar publicación')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('❌ Error al eliminar publicación')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🔒 Panel de Gestión Secreto
          </h1>
          <p className="text-gray-600">
            Gestiona restaurantes y publicaciones desde aquí
          </p>
          <div className="mt-2 text-sm text-red-600 font-semibold">
            ⚠️ Esta página es privada - No compartas esta URL
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('restaurants')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'restaurants'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              🏪 Restaurantes ({establishments.length})
            </button>
            <button
              onClick={() => setActiveTab('posts')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'posts'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📱 Publicaciones ({posts.length})
            </button>
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando datos...</p>
          </div>
        )}

        {/* Restaurants Tab */}
        {!isLoading && activeTab === 'restaurants' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Restaurante
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoría
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dueño
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Posts/Packs
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {establishments.map((est) => (
                  <tr key={est.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{est.name}</div>
                      <div className="text-sm text-gray-500">{est.address}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {est.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{est.user.name || 'Sin nombre'}</div>
                      <div className="text-sm text-gray-500">{est.user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      📱 {est._count.posts} | 📦 {est._count.packs}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(est.createdAt).toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => deleteEstablishment(est.id, est.name)}
                        className="text-red-600 hover:text-red-900 font-semibold"
                      >
                        🗑️ Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {establishments.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No hay restaurantes</p>
              </div>
            )}
          </div>
        )}

        {/* Posts Tab */}
        {!isLoading && activeTab === 'posts' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Título
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Restaurante
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contenido
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Precio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{post.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{post.establishment.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 line-clamp-2">{post.content}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {post.price ? (
                        <span className="text-sm font-semibold text-green-600">
                          ${post.price.toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(post.createdAt).toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => deletePost(post.id, post.title)}
                        className="text-red-600 hover:text-red-900 font-semibold"
                      >
                        🗑️ Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {posts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No hay publicaciones</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
