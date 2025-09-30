'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn, useSession } from 'next-auth/react'
import Link from 'next/link'
import VerificationCodeInput from '@/components/VerificationCodeInput'

export default function VerifyLoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [mounted, setMounted] = useState(false)
  
  // Get params from URL
  const email = searchParams.get('email') || ''
  const expectedRole = searchParams.get('role') || ''

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!email || !mounted) return

    // If user is already logged in and has the correct role, redirect immediately
    if (session?.user?.email === email && session?.user?.role === expectedRole) {
      setTimeout(() => {
        if (expectedRole === 'ESTABLISHMENT') {
          window.location.href = '/dashboard'
        } else {
          window.location.href = '/packs'
        }
      }, 1000)
    }
  }, [session, email, expectedRole, mounted])

  const handleCodeComplete = async (code: string) => {
    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      // Verify the code using simple system
      const response = await fetch('/api/auth/simple-verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'verify',
          email,
          code,
          type: 'LOGIN',
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setSuccess('✅ Código verificado correctamente. Iniciando sesión...')

        // Login with credentials - the user already exists
        setTimeout(async () => {
          // Create NextAuth session with verified flag
          const result = await signIn('credentials', {
            email: email,
            verified: 'true',
            redirect: false,
          })

          if (!result?.error) {
            // Redirect based on role
            if (expectedRole === 'ESTABLISHMENT') {
              window.location.href = '/dashboard'
            } else {
              window.location.href = '/packs'
            }
          } else {
            console.error('SignIn error:', result?.error)
            setError('Error al iniciar sesión. Por favor intenta nuevamente.')
            setTimeout(() => {
              router.push('/auth')
            }, 2000)
          }
        }, 1500)
      } else {
        setError(data.message || 'Error al verificar el código')
      }
    } catch (error) {
      setError('Error de conexión. Inténtalo de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendCode = async () => {
    setError('')
    
    try {
      const response = await fetch('/api/auth/simple-verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'send',
          email,
          type: 'LOGIN',
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('Nuevo código enviado correctamente')
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(data.message || 'Error al reenviar el código')
      }
    } catch (error) {
      setError('Error de conexión. Inténtalo de nuevo.')
    }
  }

  if (!mounted) return null

  if (!email) {
    router.push('/auth')
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-500 to-orange-400 font-sans relative overflow-hidden">
      {/* Decorative shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-orange-300/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 -left-20 w-60 h-60 bg-purple-300/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-10 right-1/3 w-32 h-32 bg-pink-300/20 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md mx-auto">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden border border-white/20">
            
            {/* Header */}
            <div className="bg-white/20 p-6 text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <span className="text-3xl">🔒</span>
                <span className="text-2xl font-bold text-white">FoodSave</span>
              </div>
              <h1 className="text-xl font-bold text-white mb-2">
                Verificación de Seguridad
              </h1>
              <p className="text-white/90 text-sm">
                Confirma tu identidad para acceder de forma segura
              </p>
            </div>

            {/* Content */}
            <div className="bg-white dark:bg-gray-900 p-6">
              {success ? (
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">✅</span>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    ¡Verificación Exitosa!
                  </h2>
                  <p className="text-green-600 dark:text-green-400 mb-4 font-medium">{success}</p>
                  <div className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-500 dark:border-green-400"></div>
                    <span className="text-sm">Iniciando sesión...</span>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                      Código de Verificación
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      Enviamos un código de seguridad a<br />
                      <span className="font-semibold text-purple-600 dark:text-purple-400">{email}</span>
                    </p>
                    <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <p className="text-blue-700 dark:text-blue-300 text-sm font-medium">
                        🔒 <strong>Verificación requerida</strong> para tu cuenta
                      </p>
                    </div>
                  </div>

                  <VerificationCodeInput
                    onComplete={handleCodeComplete}
                    onResend={handleResendCode}
                    isLoading={isLoading}
                    error={error}
                    email={email}
                    canResend={true}
                    resendCooldown={120}
                  />
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-white/5 p-4 text-center">
              <Link
                href="/auth"
                className="text-white/80 hover:text-white text-sm transition-colors"
              >
                ← Cancelar e ir al inicio de sesión
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
