import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface MenuItem {
  id: string
  name: string
  description: string | null
  price: number
  category: string
  image: string | null
  isAvailable: boolean
  preparationTime: number | null
  allergens: string[]
  isVegetarian: boolean
  isVegan: boolean
  isGlutenFree: boolean
}

export function useMenu(establishmentId: string) {
  const [items, setItems] = useState<MenuItem[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const fetchMenu = useCallback(async () => {
    if (!establishmentId) return

    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/restaurant/menu?establishmentId=${establishmentId}`)
      
      if (!response.ok) {
        throw new Error('Error al cargar menú')
      }
      
      const data = await response.json()
      
      if (data.success) {
        setItems(data.data.items)
        setCategories(data.data.categories)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar menú')
    } finally {
      setLoading(false)
    }
  }, [establishmentId])

  const addItem = useCallback(async (itemData: Partial<MenuItem>) => {
    try {
      const response = await fetch('/api/restaurant/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemData),
      })

      if (!response.ok) {
        throw new Error('Error al crear item')
      }

      await fetchMenu()
      router.refresh()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear item')
      return false
    }
  }, [fetchMenu, router])

  const updateItem = useCallback(async (id: string, itemData: Partial<MenuItem>) => {
    try {
      const response = await fetch(`/api/restaurant/menu/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemData),
      })

      if (!response.ok) {
        throw new Error('Error al actualizar item')
      }

      await fetchMenu()
      router.refresh()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar item')
      return false
    }
  }, [fetchMenu, router])

  const deleteItem = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/restaurant/menu/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Error al eliminar item')
      }

      await fetchMenu()
      router.refresh()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar item')
      return false
    }
  }, [fetchMenu, router])

  useEffect(() => {
    fetchMenu()
  }, [fetchMenu])

  return {
    items,
    categories,
    loading,
    error,
    addItem,
    updateItem,
    deleteItem,
    refetch: fetchMenu,
  }
}
