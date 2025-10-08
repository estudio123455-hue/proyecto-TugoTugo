import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface Review {
  id: string
  rating: number
  comment: string | null
  createdAt: string
  updatedAt: string
  user: {
    id: string
    name: string | null
    email: string
    image: string | null
  }
}

export function useReviews(establishmentId: string) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [averageRating, setAverageRating] = useState(0)
  const [totalReviews, setTotalReviews] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const fetchReviews = useCallback(async () => {
    if (!establishmentId) return

    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/reviews?establishmentId=${establishmentId}`)
      
      if (!response.ok) {
        throw new Error('Error al cargar reseñas')
      }
      
      const data = await response.json()
      
      if (data.success) {
        setReviews(data.data.reviews)
        setAverageRating(data.data.avgRating)
        setTotalReviews(data.data.totalReviews)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar reseñas')
    } finally {
      setLoading(false)
    }
  }, [establishmentId])

  const addReview = useCallback(async (rating: number, comment?: string) => {
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          establishmentId,
          rating,
          comment: comment || null,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Error al crear reseña')
      }

      await fetchReviews()
      router.refresh()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear reseña')
      return false
    }
  }, [establishmentId, fetchReviews, router])

  const updateReview = useCallback(async (id: string, rating: number, comment?: string) => {
    try {
      const response = await fetch(`/api/reviews/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating,
          comment: comment || null,
        }),
      })

      if (!response.ok) {
        throw new Error('Error al actualizar reseña')
      }

      await fetchReviews()
      router.refresh()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar reseña')
      return false
    }
  }, [fetchReviews, router])

  const deleteReview = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/reviews/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Error al eliminar reseña')
      }

      await fetchReviews()
      router.refresh()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar reseña')
      return false
    }
  }, [fetchReviews, router])

  useEffect(() => {
    fetchReviews()
  }, [fetchReviews])

  return {
    reviews,
    averageRating,
    totalReviews,
    loading,
    error,
    addReview,
    updateReview,
    deleteReview,
    refetch: fetchReviews,
  }
}
