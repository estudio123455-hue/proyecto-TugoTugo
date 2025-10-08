'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

export default function Home() {
  const router = useRouter()
  const { data: session, status } = useSession()

  useEffect(() => {
    // Si no hay sesión, redirigir a login
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
    // Si hay sesión, redirigir según el rol
    else if (status === 'authenticated' && session?.user) {
      if (session.user.role === 'ESTABLISHMENT') {
        router.push('/dashboard')
      } else if (session.user.role === 'ADMIN') {
        router.push('/admin')
      } else {
        router.push('/explore')
      }
    }
  }, [status, session, router])

  // Mostrar loading mientras se verifica la sesión
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-orange-50 flex items-center justify-center">
      <div className="text-center">
        {/* Loading spinner */}
        <div className="relative mb-8">
          <div className="w-20 h-20 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto"></div>
        </div>
        <div className="text-6xl mb-4 animate-bounce">🍃</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">FoodSave</h2>
        <p className="text-gray-600">Cargando...</p>
      </div>
    </div>
  )
}
