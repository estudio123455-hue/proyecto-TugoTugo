import { useState, useEffect, useCallback } from 'react'

interface Establishment {
  id: string
  name: string
  description: string | null
  address: string
  latitude: number
  longitude: number
  phone: string | null
  email: string | null
  image: string | null
  category: string
  isActive: boolean
}

export function useEstablishment(id: string) {
  const [establishment, setEstablishment] = useState<Establishment | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEstablishment = useCallback(async () => {
    if (!id) return

    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/establishments/${id}`)
      
      if (!response.ok) {
        throw new Error('Establecimiento no encontrado')
      }
      
      const data = await response.json()
      setEstablishment(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar establecimiento')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchEstablishment()
  }, [fetchEstablishment])

  return {
    establishment,
    loading,
    error,
    refetch: fetchEstablishment,
  }
}

export function useEstablishments(filters?: { category?: string; search?: string }) {
  const [establishments, setEstablishments] = useState<Establishment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEstablishments = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams()
      if (filters?.category) params.append('category', filters.category)
      if (filters?.search) params.append('search', filters.search)
      
      const response = await fetch(`/api/establishments?${params}`)
      
      if (!response.ok) {
        throw new Error('Error al cargar establecimientos')
      }
      
      const data = await response.json()
      setEstablishments(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar establecimientos')
    } finally {
      setLoading(false)
    }
  }, [filters?.category, filters?.search])

  useEffect(() => {
    fetchEstablishments()
  }, [fetchEstablishments])

  return {
    establishments,
    loading,
    error,
    refetch: fetchEstablishments,
  }
}
