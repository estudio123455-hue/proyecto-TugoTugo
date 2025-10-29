 'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const ADMIN_PASSWORD = 'TugoTugo2024Admin!' // Contraseña única

export default function SuperAdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [activeTab, setActiveTab] = useState('dashboard')
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
      // Cargar packs usando API de admin
      const packsRes = await fetch('/api/admin/packs')
      if (packsRes.ok) {
        const packsData = await packsRes.json()
        setPacks(packsData.data || packsData) // La API de admin devuelve {success: true, data: [...]}
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
      console.log('🚀 Enviando datos del pack:', packData)
      const response = await fetch('/api/admin/packs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(packData)
      })
      
      console.log('📡 Respuesta del servidor:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      })
      
      if (response.ok) {
        const responseData = await response.json()
        console.log('✅ Pack creado exitosamente:', responseData)
        loadData()
        alert('Pack creado exitosamente')
      } else {
        const errorData = await response.json()
        console.error('❌ Error del servidor:', errorData)
        alert('Error creando pack: ' + (errorData.message || 'Error desconocido'))
      }
    } catch (error) {
      console.error('💥 Error de red:', error)
      alert('Error: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }

  // Eliminar pack
  const deletePack = async (packId: string) => {
    if (confirm('¿Estás seguro de eliminar este pack?')) {
      try {
        const response = await fetch(`/api/admin/packs?id=${packId}`, {
          method: 'DELETE'
        })
        if (response.ok) {
          loadData()
          alert('Pack eliminado')
        } else {
          const errorData = await response.json()
          alert('Error eliminando pack: ' + (errorData.message || 'Error desconocido'))
        }
      } catch (error) {
        alert('Error eliminando pack')
      }
    }
  }

  // Crear restaurante
  const createRestaurant = async (restaurantData: any) => {
    try {
      console.log('Enviando datos del restaurante:', restaurantData)
      const response = await fetch('/api/establishments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(restaurantData)
      })
      
      if (response.ok) {
        loadData()
        alert('Restaurante creado exitosamente')
      } else {
        const errorData = await response.json()
        console.error('Error del servidor:', errorData)
        alert('Error creando restaurante: ' + (errorData.error || errorData.message || 'Error desconocido'))
      }
    } catch (error) {
      console.error('Error de red:', error)
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
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'dashboard'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              🏠 Dashboard
            </button>
            <button
              onClick={() => setActiveTab('packs')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'packs'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              📦 Packs ({packs.length})
            </button>
            <button
              onClick={() => setActiveTab('restaurants')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'restaurants'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              🏪 Restaurantes ({restaurants.length})
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

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <Dashboard packs={packs} restaurants={restaurants} />
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
    quantity: '5',
    establishmentId: '',
    hoursAvailable: '24' // Ultra simple: solo horas de duración
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validación básica
    if (!formData.title.trim()) {
      alert('El título del pack es obligatorio')
      return
    }
    if (!formData.description.trim()) {
      alert('La descripción es obligatoria')
      return
    }
    if (!formData.establishmentId) {
      alert('Debe seleccionar un restaurante')
      return
    }
    if (!formData.originalPrice || !formData.discountedPrice) {
      alert('Los precios son obligatorios')
      return
    }
    if (parseFloat(formData.discountedPrice) >= parseFloat(formData.originalPrice)) {
      alert('El precio con descuento debe ser menor al precio original')
      return
    }
    
    const packData = {
      ...formData,
      title: formData.title.trim(),
      description: formData.description.trim(),
      originalPrice: parseFloat(formData.originalPrice),
      discountedPrice: parseFloat(formData.discountedPrice),
      quantity: parseInt(formData.quantity) || 1,
      hoursAvailable: parseInt(formData.hoursAvailable) || 24,
      isActive: true
    }
    
    console.log('Datos del pack a enviar:', packData)
    onCreatePack(packData)
    
    // Resetear formulario ultra simple
    setFormData({
      title: '',
      description: '',
      originalPrice: '',
      discountedPrice: '',
      quantity: '5',
      establishmentId: '',
      hoursAvailable: '24'
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
              {restaurants.map((restaurant: any) => (
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
            <div className="bg-green-50 p-3 rounded border">
              <label className="block text-sm font-medium text-green-800 mb-2">
                ⏰ Duración del Pack (Ultra Simple)
              </label>
              <select
                value={formData.hoursAvailable}
                onChange={(e) => setFormData({...formData, hoursAvailable: e.target.value})}
                className="w-full p-2 border rounded bg-white"
              >
                <option value="12">12 horas (hasta medianoche)</option>
                <option value="24">24 horas (todo el día siguiente)</option>
                <option value="48">48 horas (fin de semana)</option>
                <option value="72">72 horas (3 días)</option>
              </select>
              <p className="text-xs text-green-600 mt-1">
                📅 Disponible desde ahora • 🕐 Recogida: 12:00-22:00
              </p>
            </div>
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
        {packs.map((pack: any) => (
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validación básica
    if (!formData.name.trim()) {
      alert('El nombre del restaurante es obligatorio')
      return
    }
    if (!formData.address.trim()) {
      alert('La dirección es obligatoria')
      return
    }
    
    const restaurantData = {
      ...formData,
      name: formData.name.trim(),
      address: formData.address.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
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
        {restaurants.map((restaurant: any) => (
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
  const activePacks = packs.filter((p: any) => p.isActive).length
  const activeRestaurants = restaurants.filter((r: any) => r.isActive).length
  const totalRevenue = packs.reduce((sum: number, pack: any) => sum + (pack.discountedPrice * (pack.quantity || 0)), 0)

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

// Componente Dashboard
function Dashboard({ packs, restaurants }: any) {
  const activePacks = packs.filter((pack: any) => pack.isActive)
  const activeRestaurants = restaurants.filter((restaurant: any) => restaurant.isActive)
  const totalRevenue = packs.reduce((sum: number, pack: any) => sum + (pack.discountedPrice * (pack.quantity || 0)), 0)
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">🏠 Dashboard TugoTugo</h1>
        <p className="text-blue-100">Panel de control administrativo</p>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Total Packs</p>
              <p className="text-2xl font-bold text-gray-900">{packs.length}</p>
            </div>
            <div className="text-3xl">📦</div>
          </div>
          <p className="text-xs text-gray-500 mt-2">{activePacks.length} activos</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Restaurantes</p>
              <p className="text-2xl font-bold text-gray-900">{restaurants.length}</p>
            </div>
            <div className="text-3xl">🏪</div>
          </div>
          <p className="text-xs text-gray-500 mt-2">{activeRestaurants.length} activos</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Ingresos Est.</p>
              <p className="text-2xl font-bold text-gray-900">${totalRevenue.toFixed(2)}</p>
            </div>
            <div className="text-3xl">💰</div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Potencial total</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Disponibles</p>
              <p className="text-2xl font-bold text-gray-900">{activePacks.length}</p>
            </div>
            <div className="text-3xl">✅</div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Packs activos ahora</p>
        </div>
      </div>

      {/* Acciones rápidas */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">⚡ Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => window.location.hash = 'packs'}
            className="bg-blue-500 text-white p-4 rounded-lg hover:bg-blue-600 transition-colors"
          >
            <div className="text-2xl mb-2">📦</div>
            <div className="font-medium">Crear Pack</div>
            <div className="text-sm opacity-90">Nuevo pack sorpresa</div>
          </button>
          
          <button 
            onClick={() => window.location.hash = 'restaurants'}
            className="bg-green-500 text-white p-4 rounded-lg hover:bg-green-600 transition-colors"
          >
            <div className="text-2xl mb-2">🏪</div>
            <div className="font-medium">Agregar Restaurante</div>
            <div className="text-sm opacity-90">Nuevo establecimiento</div>
          </button>
          
          <button 
            onClick={() => window.location.hash = 'stats'}
            className="bg-purple-500 text-white p-4 rounded-lg hover:bg-purple-600 transition-colors"
          >
            <div className="text-2xl mb-2">📊</div>
            <div className="font-medium">Ver Estadísticas</div>
            <div className="text-sm opacity-90">Análisis completo</div>
          </button>
        </div>
      </div>

      {/* Actividad reciente */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">📦 Packs Recientes</h3>
          <div className="space-y-3">
            {packs.slice(0, 5).map((pack: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-medium text-sm">{pack.title}</p>
                  <p className="text-xs text-gray-500">${pack.discountedPrice}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  pack.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {pack.isActive ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            ))}
            {packs.length === 0 && (
              <p className="text-gray-500 text-center py-4">No hay packs creados</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">🏪 Restaurantes Activos</h3>
          <div className="space-y-3">
            {restaurants.slice(0, 5).map((restaurant: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-medium text-sm">{restaurant.name}</p>
                  <p className="text-xs text-gray-500">{restaurant.category}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  restaurant.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {restaurant.isActive ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            ))}
            {restaurants.length === 0 && (
              <p className="text-gray-500 text-center py-4">No hay restaurantes registrados</p>
            )}
          </div>
        </div>
      </div>

      {/* Enlaces útiles */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">🔗 Enlaces Útiles</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <a href="/api/health" target="_blank" className="text-blue-600 hover:underline flex items-center">
            <span className="mr-2">📊</span> Health Check
          </a>
          <a href="/api/packs/public" target="_blank" className="text-blue-600 hover:underline flex items-center">
            <span className="mr-2">📦</span> API Packs
          </a>
          <a href="/packs" target="_blank" className="text-blue-600 hover:underline flex items-center">
            <span className="mr-2">🛒</span> Ver Packs
          </a>
          <a href="/restaurants" target="_blank" className="text-blue-600 hover:underline flex items-center">
            <span className="mr-2">🏪</span> Ver Restaurantes
          </a>
        </div>
      </div>
    </div>
  )
}
