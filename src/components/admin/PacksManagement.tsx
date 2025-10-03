'use client'

import { useEffect, useState } from 'react'

interface Pack {
  id: string
  title: string
  description: string
  originalPrice: number
  discountedPrice: number
  quantity: number
  isActive: boolean
  availableFrom: Date
  availableUntil: Date
  pickupTimeStart: string
  pickupTimeEnd: string
  createdAt: Date
  establishment: {
    id: string
    name: string
    email: string | null
  }
  _count: {
    orders: number
  }
}

export default function PacksManagement() {
  const [packs, setPacks] = useState<Pack[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchPacks()
  }, [])

  const fetchPacks = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/packs')
      const data = await res.json()
      if (data.success) {
        setPacks(data.data)
      }
    } catch (error) {
      console.error('Error fetching packs:', error)
    } finally {
      setLoading(false)
    }
  }

  const deletePack = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este pack?')) {
      return
    }

    try {
      const res = await fetch(`/api/admin/packs?id=${id}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      
      if (data.success) {
        alert('Pack eliminado exitosamente')
        fetchPacks()
      } else {
        alert(data.message || 'Error al eliminar pack')
      }
    } catch (error) {
      console.error('Error deleting pack:', error)
      alert('Error al eliminar pack')
    }
  }

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch('/api/admin/packs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          packId: id, 
          isActive: !currentStatus 
        }),
      })
      const data = await res.json()
      
      if (data.success) {
        fetchPacks()
      } else {
        alert(data.message || 'Error al actualizar estado')
      }
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Error al actualizar estado')
    }
  }

  const filteredPacks = packs.filter(pack =>
    pack.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pack.establishment.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return <div className="text-center py-8">Cargando packs...</div>
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">Gestión de Packs</h2>
            <p className="text-sm text-gray-600 mt-1">Total: {packs.length} packs</p>
          </div>
          
          <input
            type="text"
            placeholder="Buscar por título o restaurante..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pack
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Restaurante
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Precios
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Disponibilidad
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Órdenes
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredPacks.map((pack) => (
              <tr key={pack.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="max-w-xs">
                    <div className="text-sm font-medium text-gray-900">
                      {pack.title}
                    </div>
                    <div className="text-sm text-gray-500 truncate">
                      {pack.description.substring(0, 50)}...
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      Cantidad: {pack.quantity}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{pack.establishment.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm">
                    <div className="font-medium text-green-600">
                      ${pack.discountedPrice.toLocaleString()}
                    </div>
                    <div className="text-gray-400 line-through text-xs">
                      ${pack.originalPrice.toLocaleString()}
                    </div>
                    <div className="text-xs text-green-600">
                      {Math.round((1 - pack.discountedPrice / pack.originalPrice) * 100)}% OFF
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-xs text-gray-500">
                    <div>{new Date(pack.availableFrom).toLocaleDateString()}</div>
                    <div>a {new Date(pack.availableUntil).toLocaleDateString()}</div>
                    <div className="mt-1 text-gray-400">
                      🕐 {pack.pickupTimeStart} - {pack.pickupTimeEnd}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {pack._count.orders}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => toggleActive(pack.id, pack.isActive)}
                    className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      pack.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {pack.isActive ? 'Activo' : 'Inactivo'}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => deletePack(pack.id)}
                    className="text-red-600 hover:text-red-900"
                    disabled={pack._count.orders > 0}
                    title={pack._count.orders > 0 ? 'No se puede eliminar un pack con órdenes' : ''}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredPacks.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No se encontraron packs
        </div>
      )}
    </div>
  )
}
