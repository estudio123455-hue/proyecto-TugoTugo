import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface Order {
  id: string
  quantity: number
  totalAmount: number
  status: string
  pickupDate: string
  verificationCode: string | null
  createdAt: string
  user: {
    id: string
    name: string | null
    email: string
  }
  pack: {
    id: string
    title: string
    pickupTimeStart: string
    pickupTimeEnd: string
  }
}

interface OrderFilters {
  status?: string
  establishmentId?: string
}

export function useOrders(filters?: OrderFilters) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams()
      if (filters?.status) params.append('status', filters.status)
      if (filters?.establishmentId) params.append('establishmentId', filters.establishmentId)
      
      const response = await fetch(`/api/establishment/orders?${params}`)
      
      if (!response.ok) {
        throw new Error('Error al cargar órdenes')
      }
      
      const data = await response.json()
      setOrders(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar órdenes')
    } finally {
      setLoading(false)
    }
  }, [filters?.status, filters?.establishmentId])

  const updateOrderStatus = useCallback(async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error('Error al actualizar orden')
      }

      await fetchOrders()
      router.refresh()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar orden')
      return false
    }
  }, [fetchOrders, router])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  return {
    orders,
    loading,
    error,
    updateOrderStatus,
    refetch: fetchOrders,
  }
}

export function useOrder(id: string) {
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOrder = useCallback(async () => {
    if (!id) return

    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/orders/${id}`)
      
      if (!response.ok) {
        throw new Error('Orden no encontrada')
      }
      
      const data = await response.json()
      setOrder(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar orden')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchOrder()
  }, [fetchOrder])

  return {
    order,
    loading,
    error,
    refetch: fetchOrder,
  }
}
