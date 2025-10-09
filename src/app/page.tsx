'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

export default function Home() {
  const router = useRouter()
  const { data: session, status } = useSession()

  useEffect(() => {
    // Redirigir solo una vez cuando el status cambia
    if (status === 'authenticated' && session?.user) {
      const destination = 
        session.user.role === 'ESTABLISHMENT' ? '/dashboard' :
        session.user.role === 'ADMIN' ? '/admin' : '/packs'
      
      router.replace(destination)
    } else if (status === 'unauthenticated') {
      // Si no hay sesión, ir al landing
      router.replace('/landing')
    }
  }, [status, session?.user, router])

  // Mostrar loading mientras redirige
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-orange-50 flex items-center justify-center">
      <div className="text-center">
        <div className="relative mb-8">
          <div className="w-20 h-20 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto"></div>
        </div>
        <div className="text-6xl mb-4 animate-bounce">🍃</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Zavo</h2>
        <p className="text-gray-600">Cargando...</p>
      </div>
    </div>
  )
}
