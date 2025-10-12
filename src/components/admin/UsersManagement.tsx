'use client'

import React, { useEffect, useState } from 'react'

interface User {
  id: string
  name: string | null
  email: string
  role: string
  emailVerified: Date | null
  createdAt: Date
  _count: {
    orders: number
  }
  establishment: {
    id: string
  } | null
}

export default function UsersManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newUser, setNewUser] = useState({
    email: '',
    name: '',
    password: '',
    role: 'CUSTOMER',
  })

  useEffect(() => {
    fetchUsers()
  }, [filter])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const url = filter ? `/api/admin/users?role=${filter}` : '/api/admin/users'
      const res = await fetch(url)
      const data = await res.json()
      if (data.success) {
        setUsers(data.data)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteUser = async (userId: string) => {
    const user = users.find(u => u.id === userId)
    const userName = user?.name || user?.email || 'este usuario'
    
    if (!confirm(`¿Estás seguro de eliminar a ${userName}? Esta acción eliminará:\n\n• El usuario y su cuenta\n• Su establecimiento (si tiene uno)\n• Todos sus packs y posts\n• Todas sus órdenes\n• Todos los datos relacionados\n\nEsta acción NO se puede deshacer.`)) {
      return
    }

    try {
      console.log('🗑️ Eliminando usuario:', userId)
      
      const res = await fetch(`/api/admin/users?id=${userId}`, {
        method: 'DELETE',
      })
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }
      
      const data = await res.json()
      
      if (data.success) {
        alert('✅ Usuario eliminado exitosamente')
        fetchUsers() // Recargar la lista
      } else {
        alert(`❌ Error: ${data.message || 'Error al eliminar usuario'}`)
      }
    } catch (error) {
      console.error('❌ Error deleting user:', error)
      alert(`❌ Error al eliminar usuario: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    }
  }

  const changeRole = async (userId: string, newRole: string) => {
    if (!confirm(`¿Cambiar rol a ${newRole}?`)) {
      return
    }

    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole }),
      })
      const data = await res.json()
      
      if (data.success) {
        alert('Rol actualizado exitosamente')
        fetchUsers()
      } else {
        alert(data.message || 'Error al actualizar rol')
      }
    } catch (error) {
      console.error('Error updating role:', error)
      alert('Error al actualizar rol')
    }
  }

  const verifyUser = async (userId: string) => {
    if (!confirm('¿Verificar este usuario manualmente?')) {
      return
    }

    try {
      const res = await fetch('/api/admin/users/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })
      const data = await res.json()
      
      if (data.success) {
        alert('Usuario verificado exitosamente')
        fetchUsers()
      } else {
        alert(data.message || 'Error al verificar usuario')
      }
    } catch (error) {
      console.error('Error verifying user:', error)
      alert('Error al verificar usuario')
    }
  }

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      })
      const data = await res.json()
      
      if (data.success) {
        alert('Usuario creado exitosamente')
        setShowCreateForm(false)
        setNewUser({ email: '', name: '', password: '', role: 'CUSTOMER' })
        fetchUsers()
      } else {
        alert(data.message || 'Error al crear usuario')
      }
    } catch (error) {
      console.error('Error creating user:', error)
      alert('Error al crear usuario')
    }
  }

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return <div className="text-center py-8">Cargando usuarios...</div>
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">Gestión de Usuarios</h2>
            <p className="text-sm text-gray-600 mt-1">Total: {users.length} usuarios</p>
          </div>
          
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Buscar por email o nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Todos los roles</option>
              <option value="CUSTOMER">Clientes</option>
              <option value="ESTABLISHMENT">Restaurantes</option>
              <option value="ADMIN">Administradores</option>
            </select>

            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
            >
              + Crear Usuario
            </button>
          </div>
        </div>
      </div>

      {/* Create User Form */}
      {showCreateForm && (
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <form onSubmit={createUser} className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <input
              type="email"
              placeholder="Email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              required
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
            <input
              type="text"
              placeholder="Nombre"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
            <input
              type="password"
              placeholder="Contraseña"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              required
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
            <select
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="CUSTOMER">Cliente</option>
              <option value="ESTABLISHMENT">Restaurante</option>
              <option value="ADMIN">Admin</option>
            </select>
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Crear
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usuario
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rol
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Órdenes
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha Registro
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {user.name || 'Sin nombre'}
                    </div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={user.role}
                    onChange={(e) => changeRole(user.id, e.target.value)}
                    className="text-sm border border-gray-300 rounded px-2 py-1"
                  >
                    <option value="CUSTOMER">Cliente</option>
                    <option value="ESTABLISHMENT">Restaurante</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {user.emailVerified ? (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      ✓ Verificado
                    </span>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        Sin verificar
                      </span>
                      <button
                        onClick={() => verifyUser(user.id)}
                        className="text-xs bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded"
                        title="Verificar manualmente"
                      >
                        ✓ Verificar
                      </button>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user._count.orders}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => deleteUser(user.id)}
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

      {filteredUsers.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No se encontraron usuarios
        </div>
      )}
    </div>
  )
}
