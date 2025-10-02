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
  verificationStatus: string
  verificationNotes?: string
  approvedAt?: string
  createdAt: string
  openingHours?: string
  images?: string[]
  legalDocument?: string
  businessType?: string
  taxId?: string
  user: {
    email: string
    name?: string
    createdAt: string
  }
  _count: {
    posts: number
    packs: number
  }
}

export default function AdminVerificationPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [establishments, setEstablishments] = useState<Establishment[]>([])
  const [filteredEstablishments, setFilteredEstablishments] = useState<Establishment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  
  // Filtros
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending')
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  
  // Modal de detalles
  const [selectedEstablishment, setSelectedEstablishment] = useState<Establishment | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')

  useEffect(() => {
    if (status === 'loading') return

    if (!session || session.user.role !== 'ADMIN') {
      router.push('/')
      return
    }

    fetchEstablishments()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, status, router])

  useEffect(() => {
    // Aplicar filtros
    let filtered = establishments

    // Filtro por estado
    if (statusFilter !== 'all') {
      filtered = filtered.filter(est => 
        est.verificationStatus.toLowerCase() === statusFilter
      )
    }

    // Filtro por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(est =>
        est.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        est.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        est.user.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filtro por categoría
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(est => est.category === categoryFilter)
    }

    setFilteredEstablishments(filtered)
  }, [establishments, statusFilter, searchTerm, categoryFilter])

  const fetchEstablishments = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/establishments?status=all')
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
        setShowDetailsModal(false)
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
    const reason = prompt(`¿Por qué rechazar "${name}"?`)
    if (!reason) return

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
        setShowDetailsModal(false)
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

  const getStatusBadge = (status: string) => {
    const badges = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
    }
    const labels = {
      PENDING: '⏳ Pendiente',
      APPROVED: '✅ Aprobado',
      REJECTED: '❌ Rechazado',
    }
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800'}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    )
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando...</p>
          </div>
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
            👑 Panel de Verificación de Restaurantes
          </h1>
          <p className="text-gray-600">
            Gestiona y aprueba las solicitudes de restaurantes
          </p>
        </div>

        {/* Filtros y Búsqueda */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Búsqueda */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🔍 Buscar
              </label>
              <input
                type="text"
                placeholder="Nombre, dirección o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Filtro por Estado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📊 Estado
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">Todos</option>
                <option value="pending">Pendientes</option>
                <option value="approved">Aprobados</option>
                <option value="rejected">Rechazados</option>
              </select>
            </div>

            {/* Filtro por Categoría */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🏪 Categoría
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">Todas</option>
                <option value="RESTAURANT">Restaurant</option>
                <option value="CAFE">Café</option>
                <option value="BAKERY">Bakery</option>
                <option value="SUPERMARKET">Supermarket</option>
                <option value="GROCERY">Grocery</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>

          {/* Contador de resultados */}
          <div className="mt-4 text-sm text-gray-600">
            Mostrando <strong>{filteredEstablishments.length}</strong> de <strong>{establishments.length}</strong> restaurantes
          </div>
        </div>

        {/* Lista de Restaurantes */}
        {filteredEstablishments.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No hay restaurantes
            </h3>
            <p className="text-gray-600">
              No se encontraron restaurantes con los filtros seleccionados
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredEstablishments.map((est) => (
              <div
                key={est.id}
                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="text-xl font-bold text-gray-900">
                        {est.name}
                      </h3>
                      {getStatusBadge(est.verificationStatus)}
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                        {est.category}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                      <div>
                        <p className="text-gray-500">📍 Dirección:</p>
                        <p className="font-medium">{est.address}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">📧 Email:</p>
                        <p className="font-medium">{est.user.email}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">📱 Teléfono:</p>
                        <p className="font-medium">{est.phone || 'No proporcionado'}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">📅 Registrado:</p>
                        <p className="font-medium">{new Date(est.createdAt).toLocaleDateString('es-ES')}</p>
                      </div>
                    </div>

                    {est.description && (
                      <p className="text-gray-600 mb-3">{est.description}</p>
                    )}

                    <div className="flex space-x-4 text-sm">
                      <div>
                        <span className="text-gray-500">📝 Posts:</span>
                        <span className="font-medium ml-1">{est._count.posts}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">📦 Packs:</span>
                        <span className="font-medium ml-1">{est._count.packs}</span>
                      </div>
                    </div>
                  </div>

                  {/* Botones de Acción */}
                  <div className="flex flex-col space-y-2 ml-4">
                    <button
                      onClick={() => {
                        setSelectedEstablishment(est)
                        setShowDetailsModal(true)
                      }}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium text-sm"
                    >
                      👁️ Ver Detalles
                    </button>
                    
                    {est.verificationStatus === 'PENDING' && (
                      <>
                        <button
                          onClick={() => handleApprove(est.id, est.name)}
                          disabled={actionLoading === est.id}
                          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50 text-sm"
                        >
                          {actionLoading === est.id ? '...' : '✅ Aprobar'}
                        </button>
                        <button
                          onClick={() => handleReject(est.id, est.name)}
                          disabled={actionLoading === est.id}
                          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50 text-sm"
                        >
                          {actionLoading === est.id ? '...' : '❌ Rechazar'}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal de Detalles */}
        {showDetailsModal && selectedEstablishment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {selectedEstablishment.name}
                    </h2>
                    {getStatusBadge(selectedEstablishment.verificationStatus)}
                  </div>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Información Básica */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">📋 Información Básica</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Nombre:</p>
                        <p className="font-medium">{selectedEstablishment.name}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Categoría:</p>
                        <p className="font-medium">{selectedEstablishment.category}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Dirección:</p>
                        <p className="font-medium">{selectedEstablishment.address}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Teléfono:</p>
                        <p className="font-medium">{selectedEstablishment.phone || 'No proporcionado'}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Email:</p>
                        <p className="font-medium">{selectedEstablishment.email || selectedEstablishment.user.email}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Tipo de Negocio:</p>
                        <p className="font-medium">{selectedEstablishment.businessType || 'No especificado'}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">NIT/RUT:</p>
                        <p className="font-medium">{selectedEstablishment.taxId || 'No proporcionado'}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Fecha de Registro:</p>
                        <p className="font-medium">{new Date(selectedEstablishment.createdAt).toLocaleString('es-ES')}</p>
                      </div>
                    </div>
                  </div>

                  {/* Descripción */}
                  {selectedEstablishment.description && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">📝 Descripción</h3>
                      <p className="text-gray-700">{selectedEstablishment.description}</p>
                    </div>
                  )}

                  {/* Horarios */}
                  {selectedEstablishment.openingHours && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">⏰ Horarios</h3>
                      <pre className="bg-gray-50 p-4 rounded text-sm">
                        {selectedEstablishment.openingHours}
                      </pre>
                    </div>
                  )}

                  {/* Fotos */}
                  {selectedEstablishment.images && selectedEstablishment.images.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">📸 Fotos ({selectedEstablishment.images.length})</h3>
                      <div className="grid grid-cols-3 gap-4">
                        {selectedEstablishment.images.map((img, idx) => (
                          <img key={idx} src={img} alt={`Foto ${idx + 1}`} className="rounded-lg w-full h-32 object-cover" />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Documento Legal */}
                  {selectedEstablishment.legalDocument && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">📄 Documento Legal</h3>
                      <a
                        href={selectedEstablishment.legalDocument}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Ver documento →
                      </a>
                    </div>
                  )}

                  {/* Notas de Verificación */}
                  {selectedEstablishment.verificationNotes && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">📝 Notas del Admin</h3>
                      <p className="text-gray-700 bg-yellow-50 p-4 rounded">
                        {selectedEstablishment.verificationNotes}
                      </p>
                    </div>
                  )}

                  {/* Botones de Acción */}
                  {selectedEstablishment.verificationStatus === 'PENDING' && (
                    <div className="flex space-x-4 pt-4 border-t">
                      <button
                        onClick={() => handleApprove(selectedEstablishment.id, selectedEstablishment.name)}
                        disabled={actionLoading === selectedEstablishment.id}
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50"
                      >
                        {actionLoading === selectedEstablishment.id ? 'Procesando...' : '✅ Aprobar Restaurante'}
                      </button>
                      <button
                        onClick={() => handleReject(selectedEstablishment.id, selectedEstablishment.name)}
                        disabled={actionLoading === selectedEstablishment.id}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50"
                      >
                        {actionLoading === selectedEstablishment.id ? 'Procesando...' : '❌ Rechazar Restaurante'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
