'use client'

import { useState, useEffect } from 'react'
import { useCleanSession } from '@/hooks/useCleanSession'

interface User {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
}

export default function AdminNotificationsPage() {
  const { data: session, status } = useCleanSession()
  const [users, setUsers] = useState<User[]>([])
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [notification, setNotification] = useState({
    title: '',
    body: '',
    url: '/',
    icon: '/icon-192x192.png'
  })
  const [isLoading, setIsLoading] = useState(false)
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [...prev, `[${timestamp}] ${message}`])
  }

  useEffect(() => {
    if (session?.user?.role === 'ADMIN') {
      fetchUsers()
    }
  }, [session])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users || [])
        addLog(`📊 Cargados ${data.users?.length || 0} usuarios`)
      }
    } catch (error) {
      addLog(`❌ Error cargando usuarios: ${error}`)
    }
  }

  const sendToUser = async (userId: string) => {
    if (!notification.title || !notification.body) {
      addLog('❌ Título y mensaje son requeridos')
      return
    }

    setIsLoading(true)
    addLog(`📱 Enviando notificación a usuario ${userId}...`)

    try {
      const response = await fetch('/api/notifications/send-to-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          title: notification.title,
          body: notification.body,
          data: {
            url: notification.url
          },
          icon: notification.icon
        }),
      })

      const result = await response.json()

      if (result.success) {
        addLog(`✅ Enviado a ${result.results.user?.email}: ${result.message}`)
      } else {
        addLog(`❌ Error: ${result.message}`)
      }

    } catch (error) {
      addLog(`❌ Error enviando: ${error}`)
    } finally {
      setIsLoading(false)
    }
  }

  const sendBulk = async () => {
    if (!notification.title || !notification.body) {
      addLog('❌ Título y mensaje son requeridos')
      return
    }

    if (selectedUsers.length === 0) {
      addLog('❌ Selecciona al menos un usuario')
      return
    }

    setIsLoading(true)
    addLog(`📢 Enviando notificación masiva a ${selectedUsers.length} usuarios...`)

    try {
      const response = await fetch('/api/notifications/send-bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userIds: selectedUsers,
          title: notification.title,
          body: notification.body,
          data: {
            url: notification.url
          },
          icon: notification.icon
        }),
      })

      const result = await response.json()

      if (result.success) {
        addLog(`✅ Envío masivo completado: ${result.message}`)
        addLog(`📊 ${result.results.successful} exitosos, ${result.results.failed} fallidos`)
      } else {
        addLog(`❌ Error: ${result.message}`)
      }

    } catch (error) {
      addLog(`❌ Error enviando: ${error}`)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const selectAll = () => {
    setSelectedUsers(users.map(u => u.id))
  }

  const clearSelection = () => {
    setSelectedUsers([])
  }

  if (status === 'loading') {
    return <div className="p-8">Cargando...</div>
  }

  if (session?.user?.role !== 'ADMIN') {
    return (
      <div className="p-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Solo administradores pueden acceder a esta página
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            📱 Administrar Notificaciones Push
          </h1>
          
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Formulario de Notificación */}
            <div className="lg:col-span-1 space-y-4">
              <h2 className="text-xl font-semibold text-gray-800">Crear Notificación</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título
                </label>
                <input
                  type="text"
                  value={notification.title}
                  onChange={(e) => setNotification(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Título de la notificación"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mensaje
                </label>
                <textarea
                  value={notification.body}
                  onChange={(e) => setNotification(prev => ({ ...prev, body: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Contenido del mensaje"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL de destino
                </label>
                <input
                  type="text"
                  value={notification.url}
                  onChange={(e) => setNotification(prev => ({ ...prev, url: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="/"
                />
              </div>

              <div className="space-y-2">
                <button
                  onClick={sendBulk}
                  disabled={isLoading || selectedUsers.length === 0}
                  className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  {isLoading ? '📤 Enviando...' : `📢 Enviar a ${selectedUsers.length} usuarios`}
                </button>
                
                <div className="flex gap-2">
                  <button
                    onClick={selectAll}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm"
                  >
                    Seleccionar Todos
                  </button>
                  <button
                    onClick={clearSelection}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm"
                  >
                    Limpiar
                  </button>
                </div>
              </div>
            </div>

            {/* Lista de Usuarios */}
            <div className="lg:col-span-1">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Usuarios ({users.length})
              </h2>
              
              <div className="max-h-96 overflow-y-auto space-y-2">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedUsers.includes(user.id)
                        ? 'bg-blue-50 border-blue-300'
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => toggleUserSelection(user.id)}
                          className="rounded"
                        />
                        <div>
                          <div className="font-medium text-sm">{user.name}</div>
                          <div className="text-xs text-gray-500">{user.email}</div>
                          <div className="text-xs text-gray-400">{user.role}</div>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => sendToUser(user.id)}
                        disabled={isLoading}
                        className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-2 py-1 rounded text-xs"
                      >
                        📱 Enviar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Logs */}
            <div className="lg:col-span-1">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Logs de Envío</h2>
              
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg h-96 overflow-y-auto font-mono text-sm">
                {logs.map((log, index) => (
                  <div key={index} className="mb-1">
                    {log}
                  </div>
                ))}
                {logs.length === 0 && (
                  <div className="text-gray-500">Esperando actividad...</div>
                )}
              </div>
              
              <button
                onClick={() => setLogs([])}
                className="mt-2 text-sm text-gray-500 hover:text-gray-700"
              >
                🗑️ Limpiar logs
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
