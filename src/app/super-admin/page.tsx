'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const ADMIN_PASSWORD = 'TugoTugo2024Admin!' // Contraseña única

export default function SuperAdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [activeTab, setActiveTab] = useState('packs')
  const [packs, setPacks] = useState([])
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // Verificar autenticación
  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      localStorage.setItem('admin_auth', 'true')
    } else {
      alert('Contraseña incorrecta')
    }
  }

  // Cargar datos
  const loadData = async () => {
    setLoading(true)
    try {
      // Cargar packs
      const packsRes = await fetch('/api/packs')
      if (packsRes.ok) {
        const packsData = await packsRes.json()
        setPacks(packsData)
      }

      // Cargar restaurantes
      const restaurantsRes = await fetch('/api/establishments')
      if (restaurantsRes.ok) {
        const restaurantsData = await restaurantsRes.json()
        setRestaurants(restaurantsData)
      }
    } catch (error) {
      console.error('Error loading data:', error)
    }
    setLoading(false)
  }

  useEffect(() => {
    const savedAuth = localStorage.getItem('admin_auth')
    if (savedAuth === 'true') {
      setIsAuthenticated(true)
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      loadData()
    }
  }, [isAuthenticated])

  // Crear pack
  const createPack = async (packData: any) => {
    try {
      const response = await fetch('/api/packs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(packData)
      })
      if (response.ok) {
        loadData()
        alert('Pack creado exitosamente')
      } else {
        alert('Error creando pack')
      }
    } catch (error) {
      alert('Error: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }

  // Eliminar pack
  const deletePack = async (packId: string) => {
    if (confirm('¿Estás seguro de eliminar este pack?')) {
      try {
        const response = await fetch(`/api/packs/${packId}`, {
          method: 'DELETE'
        })
        if (response.ok) {
          loadData()
          alert('Pack eliminado')
        }
      } catch (error) {
        alert('Error eliminando pack')
      }
    }
  }

  // Crear restaurante
  const createRestaurant = async (restaurantData: any) => {
    try {
      const response = await fetch('/api/establishments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(restaurantData)
      })
      if (response.ok) {
        loadData()
        alert('Restaurante creado exitosamente')
      } else {
        alert('Error creando restaurante')
      }
    } catch (error) {
      alert('Error: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }

  // Eliminar restaurante
  const deleteRestaurant = async (restaurantId: string) => {
    if (confirm('¿Estás seguro de eliminar este restaurante?')) {
      try {
        const response = await fetch(`/api/establishments/${restaurantId}`, {
          method: 'DELETE'
        })
        if (response.ok) {
          loadData()
          alert('Restaurante eliminado')
        }
      } catch (error) {
        alert('Error eliminando restaurante')
      }
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md w-96">
          <h1 className="text-2xl font-bold mb-6 text-center">🔐 Super Admin</h1>
          <input
            type="password"
            placeholder="Contraseña de administrador"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border rounded mb-4"
            onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
          />
          <button
            onClick={handleLogin}
            className="w-full bg-blue-500 text-white p-3 rounded hover:bg-blue-600"
          >
            Acceder
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">🚀 Super Admin - TugoTugo</h1>
            <button
              onClick={() => {
                localStorage.removeItem('admin_auth')
                setIsAuthenticated(false)
              }}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('packs')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'packs'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              📦 Gestión de Packs
            </button>
            <button
              onClick={() => setActiveTab('restaurants')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'restaurants'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              🏪 Gestión de Restaurantes
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'stats'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              📊 Estadísticas
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-gray-600">Cargando...</p>
          </div>
        )}

        {/* Packs Tab */}
        {activeTab === 'packs' && (
          <PacksManagement 
            packs={packs} 
            restaurants={restaurants}
            onCreatePack={createPack}
            onDeletePack={deletePack}
          />
        )}

        {/* Restaurants Tab */}
        {activeTab === 'restaurants' && (
          <RestaurantsManagement 
            restaurants={restaurants}
            onCreateRestaurant={createRestaurant}
            onDeleteRestaurant={deleteRestaurant}
          />
        )}

        {/* Stats Tab */}
        {activeTab === 'stats' && (
          <StatsPanel packs={packs} restaurants={restaurants} />
        )}
      </div>
    </div>
  )
}

// Componente para gestión de packs
function PacksManagement({ packs, restaurants, onCreatePack, onDeletePack }: any) {
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    originalPrice: '',
    discountedPrice: '',
    quantity: '',
    establishmentId: '',
    availableFrom: '',
    availableUntil: '',
    pickupTimeStart: '',
    pickupTimeEnd: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    const packData = {
      ...formData,
      originalPrice: parseInt(formData.originalPrice),
      discountedPrice: parseInt(formData.discountedPrice),
      quantity: parseInt(formData.quantity),
      isActive: true
    }
    onCreatePack(packData)
    setFormData({
      title: '',
      description: '',
      originalPrice: '',
      discountedPrice: '',
      quantity: '',
      establishmentId: '',
      availableFrom: '',
      availableUntil: '',
      pickupTimeStart: '',
      pickupTimeEnd: ''
    })
    setShowForm(false)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">📦 Gestión de Packs ({packs.length})</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          {showForm ? 'Cancelar' : '+ Crear Pack'}
        </button>
      </div>

      {/* Formulario de creación */}
      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h3 className="text-lg font-medium mb-4">Crear Nuevo Pack</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Título del pack"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="p-2 border rounded"
              required
            />
            <select
              value={formData.establishmentId}
              onChange={(e) => setFormData({...formData, establishmentId: e.target.value})}
              className="p-2 border rounded"
              required
            >
              <option value="">Seleccionar restaurante</option>
              {restaurants.map(restaurant => (
                <option key={restaurant.id} value={restaurant.id}>
                  {restaurant.name}
                </option>
              ))}
            </select>
            <textarea
              placeholder="Descripción"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="p-2 border rounded col-span-2"
              required
            />
            <input
              type="number"
              placeholder="Precio original"
              value={formData.originalPrice}
              onChange={(e) => setFormData({...formData, originalPrice: e.target.value})}
              className="p-2 border rounded"
              required
            />
            <input
              type="number"
              placeholder="Precio con descuento"
              value={formData.discountedPrice}
              onChange={(e) => setFormData({...formData, discountedPrice: e.target.value})}
              className="p-2 border rounded"
              required
            />
            <input
              type="number"
              placeholder="Cantidad disponible"
              value={formData.quantity}
              onChange={(e) => setFormData({...formData, quantity: e.target.value})}
              className="p-2 border rounded"
              required
            />
            <div></div>
            <input
              type="datetime-local"
              placeholder="Disponible desde"
              value={formData.availableFrom}
              onChange={(e) => setFormData({...formData, availableFrom: e.target.value})}
              className="p-2 border rounded"
              required
            />
            <input
              type="datetime-local"
              placeholder="Disponible hasta"
              value={formData.availableUntil}
              onChange={(e) => setFormData({...formData, availableUntil: e.target.value})}
              className="p-2 border rounded"
              required
            />
            <input
              type="datetime-local"
              placeholder="Recogida desde"
              value={formData.pickupTimeStart}
              onChange={(e) => setFormData({...formData, pickupTimeStart: e.target.value})}
              className="p-2 border rounded"
              required
            />
            <input
              type="datetime-local"
              placeholder="Recogida hasta"
              value={formData.pickupTimeEnd}
              onChange={(e) => setFormData({...formData, pickupTimeEnd: e.target.value})}
              className="p-2 border rounded"
              required
            />
            <button
              type="submit"
              className="col-span-2 bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
            >
              Crear Pack
            </button>
          </form>
        </div>
      )}

      {/* Lista de packs */}
      <div className="grid gap-4">
        {packs.map(pack => (
          <div key={pack.id} className="bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-medium text-lg">{pack.title}</h3>
                <p className="text-gray-600 text-sm mb-2">{pack.description}</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Precio:</span> ${pack.originalPrice} → ${pack.discountedPrice}
                  </div>
                  <div>
                    <span className="font-medium">Cantidad:</span> {pack.quantity}
                  </div>
                  <div>
                    <span className="font-medium">Estado:</span> 
                    <span className={`ml-1 px-2 py-1 rounded text-xs ${pack.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {pack.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">ID:</span> {pack.id}
                  </div>
                </div>
              </div>
              <button
                onClick={() => onDeletePack(pack.id)}
                className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Componente para gestión de restaurantes
function RestaurantsManagement({ restaurants, onCreateRestaurant, onDeleteRestaurant }: any) {
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    category: 'RESTAURANT',
    latitude: '',
    longitude: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    const restaurantData = {
      ...formData,
      latitude: parseFloat(formData.latitude) || 0,
      longitude: parseFloat(formData.longitude) || 0,
      isActive: true
    }
    onCreateRestaurant(restaurantData)
    setFormData({
      name: '',
      address: '',
      phone: '',
      email: '',
      category: 'RESTAURANT',
      latitude: '',
      longitude: ''
    })
    setShowForm(false)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">🏪 Gestión de Restaurantes ({restaurants.length})</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          {showForm ? 'Cancelar' : '+ Crear Restaurante'}
        </button>
      </div>

      {/* Formulario de creación */}
      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h3 className="text-lg font-medium mb-4">Crear Nuevo Restaurante</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Nombre del restaurante"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="p-2 border rounded"
              required
            />
            <select
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              className="p-2 border rounded"
            >
              <option value="RESTAURANT">Restaurante</option>
              <option value="CAFE">Café</option>
              <option value="BAKERY">Panadería</option>
              <option value="FAST_FOOD">Comida Rápida</option>
            </select>
            <input
              type="text"
              placeholder="Dirección"
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              className="p-2 border rounded col-span-2"
              required
            />
            <input
              type="tel"
              placeholder="Teléfono"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="p-2 border rounded"
            />
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="p-2 border rounded"
            />
            <input
              type="number"
              step="any"
              placeholder="Latitud"
              value={formData.latitude}
              onChange={(e) => setFormData({...formData, latitude: e.target.value})}
              className="p-2 border rounded"
            />
            <input
              type="number"
              step="any"
              placeholder="Longitud"
              value={formData.longitude}
              onChange={(e) => setFormData({...formData, longitude: e.target.value})}
              className="p-2 border rounded"
            />
            <button
              type="submit"
              className="col-span-2 bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
            >
              Crear Restaurante
            </button>
          </form>
        </div>
      )}

      {/* Lista de restaurantes */}
      <div className="grid gap-4">
        {restaurants.map(restaurant => (
          <div key={restaurant.id} className="bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-medium text-lg">{restaurant.name}</h3>
                <p className="text-gray-600 text-sm mb-2">{restaurant.address}</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Categoría:</span> {restaurant.category}
                  </div>
                  <div>
                    <span className="font-medium">Teléfono:</span> {restaurant.phone || 'N/A'}
                  </div>
                  <div>
                    <span className="font-medium">Email:</span> {restaurant.email || 'N/A'}
                  </div>
                  <div>
                    <span className="font-medium">Estado:</span> 
                    <span className={`ml-1 px-2 py-1 rounded text-xs ${restaurant.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {restaurant.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => onDeleteRestaurant(restaurant.id)}
                className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Componente de estadísticas
function StatsPanel({ packs, restaurants }: any) {
  const activePacks = packs.filter(p => p.isActive).length
  const activeRestaurants = restaurants.filter(r => r.isActive).length
  const totalRevenue = packs.reduce((sum, pack) => sum + (pack.discountedPrice * (pack.quantity || 0)), 0)

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">📊 Estadísticas del Sistema</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              📦
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Packs Totales</p>
              <p className="text-2xl font-semibold text-gray-900">{packs.length}</p>
              <p className="text-sm text-green-600">{activePacks} activos</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              🏪
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Restaurantes</p>
              <p className="text-2xl font-semibold text-gray-900">{restaurants.length}</p>
              <p className="text-sm text-green-600">{activeRestaurants} activos</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
              💰
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Valor Total</p>
              <p className="text-2xl font-semibold text-gray-900">${totalRevenue.toLocaleString()}</p>
              <p className="text-sm text-gray-500">En packs disponibles</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">🔗 Enlaces Útiles</h3>
        <div className="grid grid-cols-2 gap-4">
          <a href="/api/health" target="_blank" className="text-blue-600 hover:underline">
            📊 Health Check
          </a>
          <a href="/api/packs/public" target="_blank" className="text-blue-600 hover:underline">
            📦 Packs Públicos API
          </a>
          <a href="/packs" target="_blank" className="text-blue-600 hover:underline">
            🛒 Ver Packs (Frontend)
          </a>
          <a href="/restaurants" target="_blank" className="text-blue-600 hover:underline">
            🏪 Ver Restaurantes
          </a>
        </div>
      </div>
    </div>
  )
}
