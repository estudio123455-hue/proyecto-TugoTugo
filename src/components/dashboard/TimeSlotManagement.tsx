'use client'

import { useState, useEffect } from 'react'

interface TimeSlot {
  id: string
  startTime: string
  endTime: string
  packCount: number
  price: number
  date: string
  status: 'active' | 'sold_out' | 'upcoming' | 'expired'
  remainingPacks: number
  createdAt: string
}

interface TimeSlotManagementProps {
  establishmentId: string
}

export default function TimeSlotManagement({ establishmentId }: TimeSlotManagementProps) {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingSlot, setEditingSlot] = useState<TimeSlot | null>(null)

  const [formData, setFormData] = useState({
    startTime: '12:00',
    endTime: '14:00',
    packCount: 5,
    price: 15000, // Precio más accesible en pesos colombianos
    date: new Date().toISOString().split('T')[0], // Today
  })

  useEffect(() => {
    fetchTimeSlots()
  }, [establishmentId])

  const fetchTimeSlots = async () => {
    try {
      const response = await fetch('/api/time-slots')
      if (response.ok) {
        const data = await response.json()
        setTimeSlots(data)
      }
    } catch (error) {
      console.error('Error fetching time slots:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingSlot ? `/api/time-slots/${editingSlot.id}` : '/api/time-slots'
      const method = editingSlot ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          establishmentId,
        }),
      })

      if (response.ok) {
        await fetchTimeSlots()
        resetForm()
        alert(editingSlot ? 'Horario actualizado!' : 'Horario publicado exitosamente!')
      } else {
        const error = await response.json()
        alert(error.message || 'Error al guardar el horario')
      }
    } catch (error) {
      console.error('Error saving time slot:', error)
      alert('Error al guardar el horario')
    }
  }

  const resetForm = () => {
    setFormData({
      startTime: '12:00',
      endTime: '14:00',
      packCount: 5,
      price: 10.00,
      date: new Date().toISOString().split('T')[0],
    })
    setShowCreateForm(false)
    setEditingSlot(null)
  }

  const handleEdit = (slot: TimeSlot) => {
    setFormData({
      startTime: slot.startTime,
      endTime: slot.endTime,
      packCount: slot.packCount,
      price: slot.price,
      date: slot.date,
    })
    setEditingSlot(slot)
    setShowCreateForm(true)
  }

  const handleCancel = async (slotId: string) => {
    console.log('Intentando cancelar horario:', slotId)
    
    if (!confirm('¿Estás seguro de cancelar este horario?')) {
      console.log('Cancelación abortada por el usuario')
      return
    }

    console.log('Enviando petición de cancelación...')

    try {
      const response = await fetch(`/api/time-slots/${slotId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      console.log('Respuesta recibida:', response.status, response.statusText)

      if (response.ok) {
        console.log('Cancelación exitosa')
        await fetchTimeSlots()
        alert('✅ Horario cancelado exitosamente')
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }))
        console.error('Error en la respuesta:', errorData)
        alert(`❌ Error al cancelar: ${errorData.message || 'Error desconocido'}`)
      }
    } catch (error) {
      console.error('Error de red al cancelar:', error)
      alert('❌ Error de conexión al cancelar el horario')
    }
  }

  const getStatusInfo = (slot: TimeSlot) => {
    switch (slot.status) {
      case 'active':
        return {
          color: 'bg-green-100 text-green-800',
          text: '🟢 Activo',
          description: `${slot.remainingPacks} packs restantes`
        }
      case 'sold_out':
        return {
          color: 'bg-red-100 text-red-800',
          text: '🔴 Agotado',
          description: 'Sin packs disponibles'
        }
      case 'upcoming':
        return {
          color: 'bg-blue-100 text-blue-800',
          text: '🔜 Próximo',
          description: `${slot.packCount} packs programados`
        }
      case 'expired':
        return {
          color: 'bg-gray-100 text-gray-800',
          text: '⏰ Expirado',
          description: 'Horario pasado'
        }
      default:
        return {
          color: 'bg-gray-100 text-gray-800',
          text: 'Desconocido',
          description: ''
        }
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">⏰ Gestión de Horarios</h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-lg"
        >
          📅 Publicar Packs
        </button>
      </div>

      {/* Create/Edit Form */}
      {showCreateForm && (
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900">
              {editingSlot ? '✏️ Editar Horario' : '📅 Publicar Nuevo Horario'}
            </h3>
            <button
              onClick={resetForm}
              className="text-gray-400 hover:text-gray-600 text-xl"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📅 Fecha
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ⏰ Hora Inicio
                </label>
                <input
                  type="time"
                  required
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ⏰ Hora Cierre
                </label>
                <input
                  type="time"
                  required
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📦 Cantidad de Packs
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  required
                  value={formData.packCount}
                  onChange={(e) => setFormData({ ...formData, packCount: parseInt(e.target.value) })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  💰 Precio por Pack
                </label>
                <input
                  type="number"
                  step="500"
                  min="500"
                  max="100000"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  placeholder="15000"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
                <div className="text-xs text-gray-500 mt-1">
                  Precio en pesos colombianos (mínimo $500, máximo $100,000)
                </div>
              </div>
            </div>

            <div className="flex space-x-4 pt-4">
              <button
                type="submit"
                className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-lg font-medium transition-colors shadow-lg"
              >
                {editingSlot ? '✅ Actualizar Horario' : '🚀 Confirmar Publicación'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Time Slots List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">📋 Horarios Publicados</h3>
        
        {timeSlots.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow border-2 border-dashed border-gray-300">
            <div className="text-6xl mb-4">⏰</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay horarios publicados</h3>
            <p className="text-gray-500 mb-6">Publica tu primer horario para que los clientes puedan reservar packs</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              📅 Publicar Primer Horario
            </button>
          </div>
        ) : (
          timeSlots.map((slot) => {
            const statusInfo = getStatusInfo(slot)
            return (
              <div key={slot.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-lg font-semibold text-gray-900">
                        📅 {new Date(slot.date).toLocaleDateString('es-ES', { 
                          weekday: 'long', 
                          day: 'numeric', 
                          month: 'long' 
                        })}
                      </h4>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
                        {statusInfo.text}
                      </span>
                    </div>
                    
                    <div className="grid md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">⏰ Horario:</span>
                        <div className="font-medium text-lg">{slot.startTime} - {slot.endTime}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">📦 Packs:</span>
                        <div className="font-medium">{statusInfo.description}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">💰 Precio:</span>
                        <div className="font-medium text-green-600">${slot.price.toFixed(2)}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">📊 Estado:</span>
                        <div className="font-medium">{statusInfo.description}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2 pt-4 border-t border-gray-100">
                  {/* Debug info */}
                  <div className="text-xs text-gray-400 mr-2">
                    Estado: {slot.status}
                  </div>
                  
                  {slot.status === 'upcoming' && (
                    <button
                      onClick={() => {
                        console.log('Editando slot:', slot.id, 'Estado:', slot.status)
                        handleEdit(slot)
                      }}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      ✏️ Editar
                    </button>
                  )}
                  
                  {/* Mostrar botón de cancelar para upcoming, active, y también para debug */}
                  {(slot.status === 'upcoming' || slot.status === 'active' || slot.status === 'expired') && (
                    <button
                      onClick={() => {
                        console.log('Cancelando slot:', slot.id, 'Estado:', slot.status)
                        handleCancel(slot.id)
                      }}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      ❌ Cancelar
                    </button>
                  )}
                  
                  <div className="text-xs text-gray-500 flex items-center ml-auto">
                    Publicado: {new Date(slot.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
