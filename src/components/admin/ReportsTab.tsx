'use client'

import { useEffect, useState } from 'react'

export default function ReportsTab() {
  const [activeReport, setActiveReport] = useState('overview')
  const [reportData, setReportData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchReport(activeReport)
  }, [activeReport])

  const fetchReport = async (type: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/reports?type=${type}`)
      const data = await res.json()
      if (data.success) {
        setReportData(data.data)
      }
    } catch (error) {
      console.error('Error fetching report:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportData = (type: string) => {
    window.open(`/api/admin/export?type=${type}`, '_blank')
  }

  return (
    <div className="space-y-6">
      {/* Export Buttons */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">📊 Exportar Datos</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <button
            onClick={() => exportData('users')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
          >
            👥 Usuarios
          </button>
          <button
            onClick={() => exportData('establishments')}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
          >
            🏪 Restaurantes
          </button>
          <button
            onClick={() => exportData('posts')}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm"
          >
            📝 Posts
          </button>
          <button
            onClick={() => exportData('packs')}
            className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 text-sm"
          >
            📦 Packs
          </button>
          <button
            onClick={() => exportData('orders')}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
          >
            🛒 Órdenes
          </button>
        </div>
      </div>

      {/* Report Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-4 px-6">
            {[
              { id: 'overview', name: 'Resumen', icon: '📊' },
              { id: 'revenue', name: 'Ingresos', icon: '💰' },
              { id: 'growth', name: 'Crecimiento', icon: '📈' },
              { id: 'popular', name: 'Populares', icon: '⭐' },
              { id: 'waste-saved', name: 'Impacto', icon: '🌱' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveReport(tab.id)}
                className={`py-4 px-2 border-b-2 font-medium text-sm ${
                  activeReport === tab.id
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.icon} {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Cargando reporte...</p>
            </div>
          ) : (
            <>
              {activeReport === 'overview' && <OverviewReport data={reportData} />}
              {activeReport === 'revenue' && <RevenueReport data={reportData} />}
              {activeReport === 'growth' && <GrowthReport data={reportData} />}
              {activeReport === 'popular' && <PopularReport data={reportData} />}
              {activeReport === 'waste-saved' && <WasteSavedReport data={reportData} />}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function OverviewReport({ data }: { data: any }) {
  if (!data) return null

  const { overview, usersByRole, ordersByStatus } = data

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Usuarios" value={overview.totalUsers} icon="👥" />
        <StatCard label="Restaurantes" value={overview.totalEstablishments} icon="🏪" />
        <StatCard label="Posts" value={overview.totalPosts} icon="📝" />
        <StatCard label="Packs" value={overview.totalPacks} icon="📦" />
        <StatCard label="Órdenes" value={overview.totalOrders} icon="🛒" />
        <StatCard label="Ingresos" value={`$${overview.totalRevenue.toFixed(2)}`} icon="💰" />
        <StatCard label="Nuevos (7d)" value={overview.recentUsers} icon="🆕" />
        <StatCard label="Activos" value={overview.activeEstablishments} icon="✅" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold mb-3">Usuarios por Rol</h4>
          <div className="space-y-2">
            {Object.entries(usersByRole).map(([role, count]) => (
              <div key={role} className="flex justify-between items-center">
                <span className="text-gray-600">{role}</span>
                <span className="font-semibold">{count as number}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold mb-3">Órdenes por Estado</h4>
          <div className="space-y-2">
            {Object.entries(ordersByStatus).map(([status, count]) => (
              <div key={status} className="flex justify-between items-center">
                <span className="text-gray-600">{status}</span>
                <span className="font-semibold">{count as number}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function RevenueReport({ data }: { data: any }) {
  if (!data) return null

  return (
    <div className="space-y-6">
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <h3 className="text-2xl font-bold text-green-800">
          ${data.total.toFixed(2)}
        </h3>
        <p className="text-green-600">Ingresos Totales (30 días)</p>
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-semibold mb-4">Ingresos por Día</h4>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {data.labels.map((label: string, index: number) => (
            <div key={label} className="flex justify-between items-center">
              <span className="text-sm text-gray-600">{label}</span>
              <span className="font-semibold">${data.values[index].toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function GrowthReport({ data }: { data: any }) {
  if (!data) return null

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-semibold mb-4">Crecimiento (30 días)</h4>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {data.labels.map((label: string, index: number) => (
            <div key={label} className="border-b pb-2">
              <div className="text-sm text-gray-600 mb-1">{label}</div>
              <div className="flex gap-4">
                <span className="text-sm">
                  👥 Usuarios: <strong>{data.users[index]}</strong>
                </span>
                <span className="text-sm">
                  🏪 Restaurantes: <strong>{data.establishments[index]}</strong>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function PopularReport({ data }: { data: any }) {
  if (!data) return null

  return (
    <div className="space-y-6">
      <div>
        <h4 className="font-semibold mb-4">📦 Packs Más Populares</h4>
        <div className="bg-gray-50 rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Pack
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Restaurante
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Órdenes
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Precio
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.packs.map((pack: any) => (
                <tr key={pack.id}>
                  <td className="px-4 py-3 text-sm">{pack.title}</td>
                  <td className="px-4 py-3 text-sm">{pack.establishment}</td>
                  <td className="px-4 py-3 text-sm font-semibold">{pack.orders}</td>
                  <td className="px-4 py-3 text-sm">${pack.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h4 className="font-semibold mb-4">🏪 Restaurantes Más Activos</h4>
        <div className="bg-gray-50 rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Restaurante
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Órdenes
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Packs
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Posts
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.establishments.map((est: any) => (
                <tr key={est.id}>
                  <td className="px-4 py-3 text-sm">{est.name}</td>
                  <td className="px-4 py-3 text-sm font-semibold">{est.totalOrders}</td>
                  <td className="px-4 py-3 text-sm">{est.totalPacks}</td>
                  <td className="px-4 py-3 text-sm">{est.totalPosts}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function WasteSavedReport({ data }: { data: any }) {
  if (!data) return null

  const { summary } = data

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-3xl font-bold text-green-800">
            {summary.totalMealsSaved}
          </div>
          <div className="text-sm text-green-600 mt-1">Comidas Salvadas</div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-3xl font-bold text-blue-800">
            {summary.estimatedKgSaved.toFixed(1)} kg
          </div>
          <div className="text-sm text-blue-600 mt-1">Comida Salvada</div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="text-3xl font-bold text-purple-800">
            ${summary.totalMoneySaved.toFixed(2)}
          </div>
          <div className="text-sm text-purple-600 mt-1">Ahorro Total</div>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="text-3xl font-bold text-orange-800">
            {summary.co2Saved.toFixed(1)} kg
          </div>
          <div className="text-sm text-orange-600 mt-1">CO₂ Evitado</div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-semibold mb-4">Impacto por Día</h4>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {data.byDay.labels.map((label: string, index: number) => (
            <div key={label} className="flex justify-between items-center border-b pb-2">
              <span className="text-sm text-gray-600">{label}</span>
              <div className="flex gap-4">
                <span className="text-sm">
                  🍽️ {data.byDay.meals[index]} comidas
                </span>
                <span className="text-sm">
                  ⚖️ {data.byDay.kg[index].toFixed(1)} kg
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, icon }: { label: string; value: any; icon: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{label}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
    </div>
  )
}
