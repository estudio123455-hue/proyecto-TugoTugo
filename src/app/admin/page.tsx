'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'

interface Establishment {
  id: string
  name: string
  description?: string
  address: string
  phone?: string
  email?: string
  category: string
  isActive: boolean
  createdAt: string
  user: {
    email: string
    createdAt: string
  }
  _count: {
    posts: number
    packs: number
  }
}

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [establishments, setEstablishments] = useState<Establishment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'pending' | 'approved' | 'all'>('pending')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'loading') return

    if (!session || session.user.role !== 'ADMIN') {
      router.push('/')
      return
    }

    fetchEstablishments()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, status, router, filter])

  const fetchEstablishments = async () => {
    try {
      const response = await fetch(`/api/admin/establishments?status=${filter}`)
      if (response.ok) {
        const data = await response.json()
        setEstablishments(data.data)
      }
    } catch (error) {
      console.error('Error fetching establishments:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleApprove = async (id: string, name: string) => {
    if (!confirm(`¿Aprobar el restaurante "${name}"?`)) return

    setActionLoading(id)
    try {
      const response = await fetch(`/api/admin/establishments/${id}/approve`, {
        method: 'POST',
      })

      if (response.ok) {
        alert(`✅ Restaurante "${name}" aprobado exitosamente`)
        fetchEstablishments()
      } else {
        alert('Error al aprobar restaurante')
      }
    } catch (error) {
      console.error('Error approving:', error)
      alert('Error al aprobar restaurante')
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (id: string, name: string) => {
    const reason = prompt(`¿Por qué rechazar "${name}"? (opcional)`)
    if (reason === null) return // Cancelado

    setActionLoading(id)
    try {
      const response = await fetch(`/api/admin/establishments/${id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      })

      if (response.ok) {
        alert(`❌ Restaurante "${name}" rechazado`)
        fetchEstablishments()
      } else {
        alert('Error al rechazar restaurante')
      }
    } catch (error) {
      console.error('Error rejecting:', error)
      alert('Error al rechazar restaurante')
    } finally {
      setActionLoading(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  if (status === 'loading' || isLoading) {
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

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            👑 Panel de Administrador
          </h1>
          <p className="text-gray-600">
            Gestiona las solicitudes de restaurantes
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex space-x-4">
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === 'pending'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              ⏳ Pendientes
            </button>
            <button
              onClick={() => setFilter('approved')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === 'approved'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              ✅ Aprobados
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === 'all'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📋 Todos
            </button>
          </div>
        </div>

        {/* Establishments List */}
        {establishments.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No hay restaurantes {filter === 'pending' ? 'pendientes' : filter === 'approved' ? 'aprobados' : ''}
            </h3>
          </div>
        ) : (
          <div className="space-y-4">
            {establishments.map((est) => (
              <div
                key={est.id}
                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">
                        {est.name}
                      </h3>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        ✅ Activo
                      </span>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                        {est.category}
                      </span>
                    </div>

                    <p className="text-gray-600 mb-3">{est.description}</p>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">📍 Dirección:</p>
                        <p className="font-medium">{est.address}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">📧 Email:</p>
                        <p className="font-medium">{est.user.email}</p>
                      </div>
                      {est.phone && (
                        <div>
                          <p className="text-gray-500">📞 Teléfono:</p>
                          <p className="font-medium">{est.phone}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-gray-500">📅 Registro:</p>
                        <p className="font-medium">{formatDate(est.createdAt)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">📱 Publicaciones:</p>
                        <p className="font-medium">{est._count.posts}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">📦 Packs:</p>
                        <p className="font-medium">{est._count.packs}</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  {est.isActive && (
                    <div className="flex flex-col space-y-2 ml-4">
                      <button
                        onClick={() => handleApprove(est.id, est.name)}
                        disabled={actionLoading === est.id}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50"
                      >
                        {actionLoading === est.id ? '...' : '✅ Aprobar'}
                      </button>
                      <button
                        onClick={() => handleReject(est.id, est.name)}
                        disabled={actionLoading === est.id}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50"
                      >
                        {actionLoading === est.id ? '...' : '❌ Rechazar'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
