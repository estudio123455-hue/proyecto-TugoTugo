import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface Pack {
  id: string
  title: string
  description: string
  originalPrice: number
  discountedPrice: number
  quantity: number
  availableFrom: string
  availableUntil: string
  pickupTimeStart: string
  pickupTimeEnd: string
  isActive: boolean
}

export function usePacks(establishmentId?: string) {
  const [packs, setPacks] = useState<Pack[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const fetchPacks = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const url = establishmentId
        ? `/api/packs/public?establishmentId=${establishmentId}`
        : '/api/restaurant/packs'
      
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error('Error al cargar packs')
      }
      
      const data = await response.json()
      setPacks(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar packs')
    } finally {
      setLoading(false)
    }
  }, [establishmentId])

  const createPack = useCallback(async (packData: Partial<Pack>) => {
    try {
      const response = await fetch('/api/restaurant/packs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(packData),
      })

      if (!response.ok) {
        throw new Error('Error al crear pack')
      }

      await fetchPacks()
      router.refresh()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear pack')
      return false
    }
  }, [fetchPacks, router])

  const updatePack = useCallback(async (id: string, packData: Partial<Pack>) => {
    try {
      const response = await fetch(`/api/packs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(packData),
      })

      if (!response.ok) {
        throw new Error('Error al actualizar pack')
      }

      await fetchPacks()
      router.refresh()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar pack')
      return false
    }
  }, [fetchPacks, router])

  const deletePack = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/packs/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Error al eliminar pack')
      }

      await fetchPacks()
      router.refresh()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar pack')
      return false
    }
  }, [fetchPacks, router])

  useEffect(() => {
    fetchPacks()
  }, [fetchPacks])

  return {
    packs,
    loading,
    error,
    createPack,
    updatePack,
    deletePack,
    refetch: fetchPacks,
  }
}
