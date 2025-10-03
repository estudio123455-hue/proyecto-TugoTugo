'use client'

import { useEffect, useState } from 'react'

interface AuditLog {
  id: string
  action: string
  entityType: string
  entityId: string
  userId: string
  userName: string | null
  changes: string | null
  metadata: string | null
  createdAt: Date
}

export default function AuditLogsTab() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    entityType: '',
    action: '',
  })

  useEffect(() => {
    fetchLogs()
  }, [filters])

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.entityType) params.append('entityType', filters.entityType)
      
      const res = await fetch(`/api/admin/audit-logs?${params.toString()}`)
      const data = await res.json()
      if (data.success) {
        setLogs(data.data)
      }
    } catch (error) {
      console.error('Error fetching audit logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const getActionBadge = (action: string) => {
    const colors: Record<string, string> = {
      CREATE: 'bg-green-100 text-green-800',
      UPDATE: 'bg-blue-100 text-blue-800',
      DELETE: 'bg-red-100 text-red-800',
      APPROVE: 'bg-purple-100 text-purple-800',
      REJECT: 'bg-orange-100 text-orange-800',
    }
    return colors[action] || 'bg-gray-100 text-gray-800'
  }

  const getEntityIcon = (entityType: string) => {
    const icons: Record<string, string> = {
      USER: '👤',
      ESTABLISHMENT: '🏪',
      POST: '📝',
      PACK: '📦',
      ORDER: '🛒',
    }
    return icons[entityType] || '📄'
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">🔍 Filtros</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Entidad
            </label>
            <select
              value={filters.entityType}
              onChange={(e) =>
                setFilters({ ...filters, entityType: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Todos</option>
              <option value="USER">Usuarios</option>
              <option value="ESTABLISHMENT">Restaurantes</option>
              <option value="POST">Posts</option>
              <option value="PACK">Packs</option>
              <option value="ORDER">Órdenes</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Acción
            </label>
            <select
              value={filters.action}
              onChange={(e) => setFilters({ ...filters, action: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Todas</option>
              <option value="CREATE">Crear</option>
              <option value="UPDATE">Actualizar</option>
              <option value="DELETE">Eliminar</option>
              <option value="APPROVE">Aprobar</option>
              <option value="REJECT">Rechazar</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => setFilters({ entityType: '', action: '' })}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Limpiar Filtros
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">📋 Registro de Auditoría</h3>
          <p className="text-sm text-gray-600 mt-1">
            Historial de todas las acciones administrativas
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando logs...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No hay logs de auditoría
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acción
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Entidad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Detalles
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(log.createdAt).toLocaleString('es-ES')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {log.userName || 'Sistema'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${getActionBadge(
                          log.action
                        )}`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className="mr-2">{getEntityIcon(log.entityType)}</span>
                      {log.entityType}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {log.metadata && (
                        <details className="cursor-pointer">
                          <summary className="text-blue-600 hover:text-blue-800">
                            Ver detalles
                          </summary>
                          <pre className="mt-2 text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                            {JSON.stringify(JSON.parse(log.metadata), null, 2)}
                          </pre>
                        </details>
                      )}
                      {log.changes && (
                        <details className="cursor-pointer mt-1">
                          <summary className="text-green-600 hover:text-green-800">
                            Ver cambios
                          </summary>
                          <pre className="mt-2 text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                            {JSON.stringify(JSON.parse(log.changes), null, 2)}
                          </pre>
                        </details>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
