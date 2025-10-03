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
      
      <div className="bg-white rounded-lg shadow">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">Gestión de Restaurantes</h2>
              <p className="text-sm text-gray-600 mt-1">Total: {establishments.length} establecimientos</p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <span>+</span> Crear Restaurante
              </button>
              
              <input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Todos</option>
                <option value="PENDING">Pendientes</option>
                <option value="APPROVED">Aprobados</option>
              <option value="REJECTED">Rechazados</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Establecimiento
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Categoría
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Verificación
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contenido
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
                  <div>
                    <div className="text-sm font-medium text-gray-900">{est.name}</div>
                    <div className="text-sm text-gray-500">{est.email}</div>
                    <div className="text-xs text-gray-400">{est.address}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                    {est.category}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
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
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => toggleActive(est.id, est.isActive)}
                    className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      est.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {est.isActive ? 'Activo' : 'Inactivo'}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex gap-3">
                    <span>📦 {est._count.packs}</span>
                    <span>📝 {est._count.posts}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => deleteEstablishment(est.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredEstablishments.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No se encontraron establecimientos
        </div>
      )}
      </div>
    </>
  )
}
