'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        if (!supabase) {
          setStatus('error')
          setMessage('Error de configuración. Por favor intenta de nuevo.')
          return
        }
        
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth callback error:', error)
          setStatus('error')
          setMessage('Error al confirmar el email. Por favor intenta de nuevo.')
          return
        }

        if (data.session) {
          setStatus('success')
          setMessage('¡Email confirmado exitosamente!')
          
          // Check user role and redirect appropriately
          const userRole = data.session.user.user_metadata?.role
          
          setTimeout(() => {
            if (userRole === 'ESTABLISHMENT') {
              router.push('/dashboard')
            } else {
              router.push('/welcome')
            }
          }, 2000)
        } else {
          setStatus('error')
          setMessage('No se pudo confirmar el email.')
        }
      } catch (error) {
        console.error('Callback error:', error)
        setStatus('error')
        setMessage('Error inesperado. Por favor intenta de nuevo.')
      }
    }

    handleAuthCallback()
  }, [router, searchParams])

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        
        {status === 'loading' && (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500 mx-auto mb-6"></div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Confirmando tu email...
            </h1>
            <p className="text-gray-600">
              Por favor espera mientras verificamos tu cuenta
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="text-6xl mb-6">✅</div>
            <h1 className="text-3xl font-bold text-green-600 mb-4">
              ¡Email Confirmado!
            </h1>
            <p className="text-gray-600 mb-6">
              {message}
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-700 text-sm">
                Redirigiendo a tu dashboard...
              </p>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="text-6xl mb-6">❌</div>
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              Error de Confirmación
            </h1>
            <p className="text-gray-600 mb-6">
              {message}
            </p>
            <div className="space-y-3">
              <button
                onClick={() => router.push('/auth/signin')}
                className="w-full bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Ir al Login
              </button>
              <button
                onClick={() => router.push('/')}
                className="w-full text-gray-500 hover:text-gray-700 px-6 py-2"
              >
                Volver al Inicio
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
