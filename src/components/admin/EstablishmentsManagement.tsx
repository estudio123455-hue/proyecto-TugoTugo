'use client'

import { useEffect, useState } from 'react'
import CreateEstablishmentModal from './CreateEstablishmentModal'

interface Establishment {
  id: string
  name: string
  email: string | null
  address: string
  category: string
  isActive: boolean
  verificationStatus: string
  createdAt: Date
  user: {
    id: string
    name: string | null
    email: string
  }
  _count: {
    packs: number
    posts: number
  }
}

export default function EstablishmentsManagement() {
  const [establishments, setEstablishments] = useState<Establishment[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    fetchEstablishments()
  }, [filter])

  const fetchEstablishments = async () => {
    try {
      setLoading(true)
      const url = filter ? `/api/admin/establishments?status=${filter}` : '/api/admin/establishments'
      const res = await fetch(url)
      const data = await res.json()
      if (data.success) {
        setEstablishments(data.data)
      }
    } catch (error) {
      console.error('Error fetching establishments:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteEstablishment = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este establecimiento? Se eliminarán todos sus posts y packs.')) {
      return
    }

    try {
      const res = await fetch(`/api/admin/establishments?id=${id}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      
      if (data.success) {
        alert('Establecimiento eliminado exitosamente')
        fetchEstablishments()
      } else {
        alert(data.message || 'Error al eliminar establecimiento')
      }
    } catch (error) {
      console.error('Error deleting establishment:', error)
      alert('Error al eliminar establecimiento')
    }
  }

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch('/api/admin/establishments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          establishmentId: id, 
          isActive: !currentStatus 
        }),
      })
      const data = await res.json()
      
      if (data.success) {
        fetchEstablishments()
      } else {
        alert(data.message || 'Error al actualizar estado')
      }
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Error al actualizar estado')
    }
  }

  const updateVerificationStatus = async (id: string, status: string) => {
    try {
      const res = await fetch('/api/admin/establishments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          establishmentId: id, 
          verificationStatus: status 
        }),
      })
      const data = await res.json()
      
      if (data.success) {
        alert('Estado de verificación actualizado')
        fetchEstablishments()
      } else {
        alert(data.message || 'Error al actualizar verificación')
      }
    } catch (error) {
      console.error('Error updating verification:', error)
      alert('Error al actualizar verificación')
    }
  }

  const filteredEstablishments = establishments.filter(est =>
    est.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    est.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    est.address.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return <div className="text-center py-8">Cargando establecimientos...</div>
  }

  return (
    <>
      <CreateEstablishmentModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={fetchEstablishments}
      />
      
      <div className="bg-white rounded-lg shadow-sm">
        {/* Header Mobile-First */}
        <div className="p-4 md:p-6 border-b border-gray-200">
          <div className="flex flex-col gap-4">
            {/* Title and Stats */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-lg md:text-xl font-semibold text-gray-900">Gestión de Restaurantes</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Administra y verifica restaurantes en la plataforma
                </p>
              </div>
              
              <button
                onClick={() => setShowCreateModal(true)}
                className="w-full sm:w-auto px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 font-medium transition-colors"
              >
                <span className="text-lg">+</span> Crear Restaurante
              </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-sm">🏪</span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Total Restaurantes</p>
                    <p className="text-lg font-bold text-blue-600">{establishments.length}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-green-600 font-semibold text-sm">✓</span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Verificados</p>
                    <p className="text-lg font-bold text-green-600">
                      {establishments.filter(e => e.verificationStatus === 'APPROVED').length}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-yellow-50 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <span className="text-yellow-600 font-semibold text-sm">⏳</span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Pendientes</p>
                    <p className="text-lg font-bold text-yellow-600">
                      {establishments.filter(e => e.verificationStatus === 'PENDING').length}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-purple-600 font-semibold text-sm">📦</span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Con Packs</p>
                    <p className="text-lg font-bold text-purple-600">
                      {establishments.filter(e => e._count.packs > 0).length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="🔍 Buscar restaurante..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full sm:w-auto px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
              >
                <option value="">📋 Todos los estados</option>
                <option value="PENDING">⏳ Pendientes</option>
                <option value="APPROVED">✅ Aprobados</option>
                <option value="REJECTED">❌ Rechazados</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lista de Restaurantes - Mobile Cards / Desktop Table */}
        <div className="p-4 md:p-0">
          {/* Mobile Cards */}
          <div className="block md:hidden space-y-4">
            {filteredEstablishments.map((est) => (
              <div key={est.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                {/* Restaurant Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-sm">{est.name}</h3>
                    <p className="text-xs text-gray-600 mt-1">{est.email}</p>
                    <p className="text-xs text-gray-500 mt-1">📍 {est.address}</p>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                      {est.category}
                    </span>
                    
                    <button
                      onClick={() => toggleActive(est.id, est.isActive)}
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        est.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {est.isActive ? '🟢 Activo' : '⚪ Inactivo'}
                    </button>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 mb-3">
                  <span className="text-xs text-gray-600">📦 {est._count.packs} packs</span>
                  <span className="text-xs text-gray-600">📝 {est._count.posts} posts</span>
                </div>

                {/* Verification Status */}
                <div className="mb-3">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Estado de Verificación</label>
                  <select
                    value={est.verificationStatus}
                    onChange={(e) => updateVerificationStatus(est.id, e.target.value)}
                    className={`w-full text-xs px-3 py-2 rounded-lg border ${
                      est.verificationStatus === 'APPROVED' ? 'bg-green-50 border-green-200 text-green-700' :
                      est.verificationStatus === 'PENDING' ? 'bg-yellow-50 border-yellow-200 text-yellow-700' :
                      'bg-red-50 border-red-200 text-red-700'
                    }`}
                  >
                    <option value="PENDING">⏳ Pendiente</option>
                    <option value="APPROVED">✅ Aprobado</option>
                    <option value="REJECTED">❌ Rechazado</option>
                  </select>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => updateVerificationStatus(est.id, 'APPROVED')}
                    className="flex-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg text-xs font-medium hover:bg-green-200 transition-colors"
                  >
                    ✅ Verificar
                  </button>
                  <button
                    onClick={() => deleteEstablishment(est.id)}
                    className="px-3 py-2 bg-red-100 text-red-700 rounded-lg text-xs font-medium hover:bg-red-200 transition-colors"
                  >
                    🗑️ Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Restaurante
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contacto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ubicación
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estadísticas
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEstablishments.map((est) => (
                  <tr key={est.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                          <span className="text-blue-600 font-semibold">🏪</span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{est.name}</div>
                          <div className="text-xs text-gray-500">{est.category}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{est.email}</div>
                      <div className="text-xs text-gray-500">+{est.user.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500">{est.address}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2">
                        <select
                          value={est.verificationStatus}
                          onChange={(e) => updateVerificationStatus(est.id, e.target.value)}
                          className={`text-xs px-2 py-1 rounded border ${
                            est.verificationStatus === 'APPROVED' ? 'bg-green-50 border-green-200 text-green-700' :
                            est.verificationStatus === 'PENDING' ? 'bg-yellow-50 border-yellow-200 text-yellow-700' :
                            'bg-red-50 border-red-200 text-red-700'
                          }`}
                        >
                          <option value="PENDING">Pendiente</option>
                          <option value="APPROVED">Aprobado</option>
                          <option value="REJECTED">Rechazado</option>
                        </select>
                        
                        <button
                          onClick={() => toggleActive(est.id, est.isActive)}
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            est.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {est.isActive ? 'Activo' : 'Inactivo'}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs">📦 {est._count.packs} packs</span>
                        <span className="text-xs">📝 {est._count.posts} posts</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => deleteEstablishment(est.id)}
                        className="text-red-600 hover:text-red-900 text-sm"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredEstablishments.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🏪</span>
            </div>
            <p className="text-lg font-medium">No se encontraron restaurantes</p>
            <p className="text-sm mt-1">Intenta ajustar los filtros de búsqueda</p>
          </div>
        )}
      </div>
    </>
  )
}
