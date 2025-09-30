'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { getFirstName } from '@/lib/user-utils'

export default function OAuthCallback() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isRedirecting, setIsRedirecting] = useState(false)

  useEffect(() => {
    if (status === 'loading') return // Still loading

    if (status === 'authenticated' && session && !isRedirecting) {
      setIsRedirecting(true)
      
      // Redirect based on user role
      const userRole = session.user?.role || 'CUSTOMER'
      
      setTimeout(() => {
        if (userRole === 'ESTABLISHMENT') {
          router.push('/dashboard')
        } else {
          router.push('/welcome')
        }
      }, 1000) // Small delay to ensure session is fully loaded
    }

    if (status === 'unauthenticated') {
      // Authentication failed, redirect to signin
      setTimeout(() => {
        router.push('/auth?error=OAuthError')
      }, 2000)
    }
  }, [session, status, router, isRedirecting])

  if (status === 'loading' || isRedirecting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500 mx-auto mb-6"></div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Completando autenticación...
          </h1>
          <p className="text-gray-600">
            Por favor espera mientras te redirigimos
          </p>
        </div>
      </div>
    )
  }

  if (status === 'authenticated') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="text-6xl mb-6">✅</div>
          <h1 className="text-3xl font-bold text-green-600 mb-4">
            ¡Autenticación exitosa!
          </h1>
          <p className="text-gray-600 mb-6">
            Bienvenido, {getFirstName(session.user?.name) || session.user?.email}
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-700 text-sm">
              Redirigiendo a tu dashboard...
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="text-6xl mb-6">❌</div>
        <h1 className="text-2xl font-bold text-red-600 mb-4">
          Error de autenticación
        </h1>
        <p className="text-gray-600 mb-6">
          Hubo un problema con la autenticación. Por favor intenta de nuevo.
        </p>
        <button
          onClick={() => router.push('/auth')}
          className="w-full bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          Volver al login
        </button>
      </div>
    </div>
  )
}
