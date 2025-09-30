'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import VerificationCodeInput from '@/components/VerificationCodeInput'

export default function VerifyPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // Get params from URL
  const email = searchParams.get('email') || ''
  const type = searchParams.get('type') as 'REGISTRATION' | 'LOGIN' | 'PASSWORD_RESET' || 'REGISTRATION'
  const userData = searchParams.get('userData') ? JSON.parse(decodeURIComponent(searchParams.get('userData')!)) : null
  const userRole = searchParams.get('role') || null
  const accountType = searchParams.get('accountType') || null

  useEffect(() => {
    if (!email) {
      router.push('/auth')
    }
  }, [email, router])

  const handleCodeComplete = async (code: string) => {
    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/auth/simple-verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'verify',
          email,
          code,
          type,
          userData,
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setSuccess(data.message)

        // Handle different verification types
        switch (type) {
          case 'REGISTRATION':
            // Auto login after successful registration
            setTimeout(async () => {
              const result = await signIn('credentials', {
                email,
                password: userData?.password,
                redirect: false,
              })

              if (result?.error) {
                router.push('/auth?message=registration-success')
              } else {
                const role = userData?.role
                window.location.href = role === 'ESTABLISHMENT' ? '/dashboard' : '/welcome'
              }
            }, 1500)
            break

          case 'LOGIN':
            // After successful verification, redirect based on role
            setTimeout(() => {
              if (userRole === 'ESTABLISHMENT') {
                window.location.href = '/dashboard'
              } else {
                window.location.href = '/packs'
              }
            }, 1500)
            break

          case 'PASSWORD_RESET':
            // Redirect to password reset page
            setTimeout(() => {
              router.push(`/auth/reset-password?email=${email}&verified=true`)
            }, 1500)
            break
        }
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
      const response = await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          type,
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

  const getPageTitle = () => {
    switch (type) {
      case 'REGISTRATION':
        return 'Verifica tu cuenta'
      case 'LOGIN':
        return 'Verificación de acceso'
      case 'PASSWORD_RESET':
        return 'Restablecer contraseña'
      default:
        return 'Verificación'
    }
  }

  const getPageDescription = () => {
    switch (type) {
      case 'REGISTRATION':
        return 'Completa tu registro verificando tu email'
      case 'LOGIN':
        return 'Confirma tu identidad para acceder'
      case 'PASSWORD_RESET':
        return 'Verifica tu identidad para cambiar tu contraseña'
      default:
        return 'Verifica tu email para continuar'
    }
  }

  if (!email) {
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
                <span className="text-3xl">🔐</span>
                <span className="text-2xl font-bold text-white">FoodSave</span>
              </div>
              <h1 className="text-xl font-bold text-white mb-2">
                {getPageTitle()}
              </h1>
              <p className="text-white/90 text-sm">
                {getPageDescription()}
              </p>
            </div>

            {/* Content */}
            <div className="bg-white p-6">
              {success ? (
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">✅</span>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    ¡Verificación Exitosa!
                  </h2>
                  <p className="text-green-600 mb-4">{success}</p>
                  <div className="flex items-center justify-center gap-2 text-gray-500">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-500"></div>
                    <span className="text-sm">Redirigiendo...</span>
                  </div>
                </div>
              ) : (
                <VerificationCodeInput
                  onComplete={handleCodeComplete}
                  onResend={handleResendCode}
                  isLoading={isLoading}
                  error={error}
                  email={email}
                  canResend={true}
                  resendCooldown={120}
                />
              )}
            </div>

            {/* Footer */}
            <div className="bg-white/5 p-4 text-center">
              <Link
                href="/auth"
                className="text-white/80 hover:text-white text-sm transition-colors"
              >
                ← Volver al inicio de sesión
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
