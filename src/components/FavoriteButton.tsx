'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface FavoriteButtonProps {
  establishmentId: string
}

export default function FavoriteButton({ establishmentId }: FavoriteButtonProps) {
  const { data: session } = useSession()
  const [isFavorite, setIsFavorite] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (session) {
      checkFavorite()
    }
  }, [session, establishmentId])

  const checkFavorite = async () => {
    try {
      const response = await fetch('/api/favorites')
      if (response.ok) {
        const data = await response.json()
        const favorite = data.data.find(
          (f: any) => f.establishmentId === establishmentId
        )
        setIsFavorite(!!favorite)
      }
    } catch (error) {
      console.error('Error checking favorite:', error)
    }
  }

  const toggleFavorite = async () => {
    if (!session) {
      alert('Debes iniciar sesión para agregar favoritos')
      return
    }

    setLoading(true)

    try {
      if (isFavorite) {
        // Remover de favoritos
        const response = await fetch(
          `/api/favorites?establishmentId=${establishmentId}`,
          { method: 'DELETE' }
        )
        if (response.ok) {
          setIsFavorite(false)
        }
      } else {
        // Agregar a favoritos
        const response = await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ establishmentId }),
        })
        if (response.ok) {
          setIsFavorite(true)
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
      alert('Error al actualizar favoritos')
    } finally {
      setLoading(false)
    }
  }

  if (!session) {
    return null
  }

  return (
    <button
      onClick={toggleFavorite}
      disabled={loading}
      className={`p-2 rounded-full transition-all ${
        isFavorite
          ? 'bg-red-100 text-red-600 hover:bg-red-200'
          : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
      } disabled:opacity-50`}
      title={isFavorite ? 'Remover de favoritos' : 'Agregar a favoritos'}
    >
      <svg
        className="w-6 h-6"
        fill={isFavorite ? 'currentColor' : 'none'}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    </button>
  )
}
