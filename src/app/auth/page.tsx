'use client'

import { signIn, getSession, signOut } from 'next-auth/react'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
// import { shouldRequireVerificationSimple } from '@/lib/security' // Not needed - always require verification

export default function AuthPage() {
  // Estado principal
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin')
  const [accountType, setAccountType] = useState<'customer' | 'restaurant'>('customer')
  const [mounted, setMounted] = useState(false)
  
  // Estados del formulario
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  
  // Estados de UI
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  // const [enableExtraSecurity, setEnableExtraSecurity] = useState(false) // Not needed - always require verification

  useEffect(() => {
    setMounted(true)
    
    // Check for success message in URL
    const urlParams = new URLSearchParams(window.location.search)
    const message = urlParams.get('message')
    if (message) {
      setSuccess(message)
      setActiveTab('signin')
      // Clean URL
      window.history.replaceState({}, '', '/auth')
    }
  }, [])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    // Limpiar error cuando el usuario empiece a escribir
    if (error) setError('')
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // First verify credentials
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (result?.error) {
        setError('Email o contraseña incorrectos')
        setIsLoading(false)
        return
      }

      const session = await getSession()
      const userRole = session?.user?.role

      // ALWAYS require email verification for login
      await signOut({ redirect: false })
      
      // Send verification code using simple system
      const verificationResponse = await fetch('/api/auth/simple-verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'send',
          email: formData.email,
          type: 'LOGIN',
          userData: {
            role: userRole,
            accountType: accountType,
          },
        }),
      })

      const verificationData = await verificationResponse.json()

      if (verificationResponse.ok) {
        // Redirect to verification page
        const params = new URLSearchParams()
        params.append('email', formData.email)
        params.append('type', 'LOGIN')
        params.append('role', userRole || 'CUSTOMER')
        params.append('accountType', accountType)

        window.location.href = `/auth/verify-login?${params.toString()}`
      } else {
        setError(verificationData.message || 'Error al enviar código de verificación. Inténtalo de nuevo.')
      }
    } catch (error) {
      setError('Ocurrió un error. Inténtalo de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Validaciones
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden')
      setIsLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      setIsLoading(false)
      return
    }

    try {
      const role = accountType === 'restaurant' ? 'ESTABLISHMENT' : 'CUSTOMER'
      
      console.log('📧 [SignUp] Sending verification code to:', formData.email)
      
      // Send verification code using simple reliable system
      const response = await fetch('/api/auth/simple-verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'send',
          email: formData.email,
          type: 'REGISTRATION',
          userData: {
            name: formData.name,
            password: formData.password,
            role: role,
          },
        }),
      })

      console.log('📡 [SignUp] Response status:', response.status)
      const data = await response.json()
      console.log('📦 [SignUp] Response data:', data)

      if (response.ok) {
        console.log('✅ [SignUp] Code sent successfully, redirecting to verification page')
        
        // Redirect to verification page with user data
        const userData = {
          name: formData.name,
          password: formData.password,
          role: role,
        }
        
        const params = new URLSearchParams({
          email: formData.email,
          type: 'REGISTRATION',
          userData: encodeURIComponent(JSON.stringify(userData)),
        })

        window.location.href = `/auth/verify?${params.toString()}`
      } else {
        console.error('❌ [SignUp] Error sending code:', data.message)
        setError(data.message || 'Error al enviar código de verificación')
      }
    } catch (error) {
      console.error('❌ [SignUp] Exception:', error)
      setError('Ocurrió un error. Por favor intenta de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = () => {
    // Store account type in localStorage before OAuth redirect
    if (typeof window !== 'undefined') {
      localStorage.setItem('pendingAccountType', accountType)
    }
    
    signIn('google', { 
      callbackUrl: '/',
      redirect: true 
    })
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-500 to-orange-400 font-sans relative overflow-hidden">
      {/* Formas decorativas */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-orange-300/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 -left-20 w-60 h-60 bg-purple-300/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-10 right-1/3 w-32 h-32 bg-pink-300/20 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-6xl mx-auto">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden border border-white/20">
            <div className="flex flex-col lg:flex-row min-h-[700px]">
              
              {/* Lado Izquierdo - Bienvenida */}
              <div className="lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center text-white">
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-4xl">🍃</span>
                    <span className="text-3xl font-bold">FoodSave</span>
                  </div>
                  <h1 className="text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                    {activeTab === 'signin' 
                      ? '¡Bienvenido de vuelta!' 
                      : '¡Únete a FoodSave!'
                    }
                  </h1>
                  <p className="text-lg lg:text-xl text-white/90 leading-relaxed">
                    {activeTab === 'signin' 
                      ? 'Inicia sesión para continuar salvando comida y ahorrando dinero.' 
                      : 'Únete a la revolución contra el desperdicio de comida y descubre packs sorpresa increíbles.'
                    }
                  </p>
                </div>
                
                <div className="space-y-4 text-white/80">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <span>🎁</span>
                    </div>
                    <span>Packs sorpresa con hasta 70% de descuento</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <span>🌍</span>
                    </div>
                    <span>Ayuda a reducir el desperdicio alimentario</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <span>🏪</span>
                    </div>
                    <span>Apoya restaurantes locales en Bogotá</span>
                  </div>
                </div>
              </div>

              {/* Lado Derecho - Formulario */}
              <div className="lg:w-1/2 bg-white dark:bg-gray-900 p-8 lg:p-12 flex flex-col justify-center">
                <div className="max-w-md mx-auto w-full">
                  
                  {/* Selector de Pestañas */}
                  <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 mb-8">
                    <button
                      onClick={() => setActiveTab('signin')}
                      className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                        activeTab === 'signin'
                          ? 'bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400 shadow-sm'
                          : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
                      }`}
                    >
                      Iniciar Sesión
                    </button>
                    <button
                      onClick={() => setActiveTab('signup')}
                      className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                        activeTab === 'signup'
                          ? 'bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400 shadow-sm'
                          : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
                      }`}
                    >
                      Crear Cuenta
                    </button>
                  </div>

                  {/* Selector de Tipo de Cuenta */}
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Tipo de cuenta
                    </label>
                    <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
                      <button
                        type="button"
                        onClick={() => setAccountType('customer')}
                        className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                          accountType === 'customer'
                            ? 'bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400 shadow-sm'
                            : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
                        }`}
                      >
                        🛒 Cliente
                      </button>
                      <button
                        type="button"
                        onClick={() => setAccountType('restaurant')}
                        className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                          accountType === 'restaurant'
                            ? 'bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400 shadow-sm'
                            : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
                        }`}
                      >
                        🏪 Restaurante
                      </button>
                    </div>
                    {accountType === 'restaurant' && (
                      <p className="mt-2 text-xs text-yellow-600 dark:text-yellow-400">
                        ⚠️ Las cuentas de restaurante requieren aprobación de un administrador
                      </p>
                    )}
                  </div>

                  {/* Mensaje de Éxito */}
                  {success && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                      <p className="text-green-700 text-sm text-center">{success}</p>
                    </div>
                  )}

                  {/* Mensaje de Error */}
                  {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                      <p className="text-red-700 text-sm text-center">{error}</p>
                    </div>
                  )}

                  {/* Formulario */}
                  <form onSubmit={activeTab === 'signin' ? handleSignIn : handleSignUp} className="space-y-6">
                    
                    {/* Nombre (solo para registro) */}
                    {activeTab === 'signup' && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Nombre completo
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={e => handleInputChange('name', e.target.value)}
                          className="w-full px-4 py-4 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-gray-50 dark:bg-gray-800 focus:bg-white dark:focus:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                          placeholder="Tu nombre completo"
                          required
                        />
                      </div>
                    )}

                    {/* Email o Teléfono según tipo de cuenta */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        {accountType === 'restaurant' && activeTab === 'signup' ? 'Número de Teléfono' : 'Email o Teléfono'}
                      </label>
                      <input
                        type={accountType === 'restaurant' && activeTab === 'signup' ? 'tel' : 'text'}
                        value={formData.email}
                        onChange={e => handleInputChange('email', e.target.value)}
                        className="w-full px-4 py-4 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-gray-50 dark:bg-gray-800 focus:bg-white dark:focus:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                        placeholder={accountType === 'restaurant' && activeTab === 'signup' ? '+1234567890' : 'tu@email.com o +1234567890'}
                        required
                      />
                      {accountType === 'restaurant' && activeTab === 'signup' && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Incluye el código de país (ej: +52 para México)
                        </p>
                      )}
                      {activeTab === 'signin' && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Usa el email o teléfono con el que te registraste
                        </p>
                      )}
                    </div>

                    {/* Contraseña */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Contraseña
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={formData.password}
                          onChange={e => handleInputChange('password', e.target.value)}
                          className="w-full px-4 py-4 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-gray-50 dark:bg-gray-800 focus:bg-white dark:focus:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 pr-12"
                          placeholder="••••••••"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-4 flex items-center"
                        >
                          <span className="text-gray-400 hover:text-gray-600 text-lg">
                            {showPassword ? '🙈' : '👁️'}
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Información de Seguridad (siempre activa) */}
                    {activeTab === 'signin' && (
                      <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-blue-600">🔒</span>
                          <span className="font-semibold text-blue-800">Verificación de Seguridad</span>
                        </div>
                        <p className="text-blue-600 text-sm">
                          Por tu seguridad, te enviaremos un código de verificación por email después de validar tus credenciales.
                        </p>
                      </div>
                    )}

                    {/* Confirmar Contraseña (solo para registro) */}
                    {activeTab === 'signup' && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Confirmar contraseña
                        </label>
                        <input
                          type="password"
                          value={formData.confirmPassword}
                          onChange={e => handleInputChange('confirmPassword', e.target.value)}
                          className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                          placeholder="••••••••"
                          required
                        />
                      </div>
                    )}

                    {/* Botón Principal */}
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 text-white py-4 px-6 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center space-x-2">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>
                            {activeTab === 'signin' ? 'Iniciando sesión...' : 'Creando cuenta...'}
                          </span>
                        </div>
                      ) : (
                        <span>
                          {activeTab === 'signin' ? 'INICIAR SESIÓN' : 'CREAR CUENTA GRATIS'}
                        </span>
                      )}
                    </button>
                  </form>

                  {/* Separador y Google OAuth */}
                  <div className="mt-6">
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200" />
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="bg-white px-4 text-gray-500">
                          O continúa con
                        </span>
                      </div>
                    </div>

                    <div className="mt-6">
                      <button
                        onClick={handleGoogleSignIn}
                        className="w-full bg-white border border-gray-200 hover:border-gray-300 text-gray-700 py-3 px-4 rounded-xl font-medium transition-all hover:shadow-md flex items-center justify-center gap-2"
                      >
                        <svg className="h-5 w-5" viewBox="0 0 24 24">
                          <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          />
                        </svg>
                        Continuar con Google
                      </button>
                    </div>
                  </div>

                  {/* Enlaces del Footer */}
                  <div className="mt-8 text-center space-y-2">
                    {activeTab === 'signup' && (
                      <div className="text-xs text-gray-500">
                        Al registrarte, aceptas nuestros{' '}
                        <Link href="/terms" className="text-purple-600 hover:underline">
                          Términos de Servicio
                        </Link>{' '}
                        y{' '}
                        <Link href="/privacy" className="text-purple-600 hover:underline">
                          Política de Privacidad
                        </Link>
                      </div>
                    )}
                    <Link
                      href="/"
                      className="text-sm text-gray-400 hover:text-gray-600 transition-colors block"
                    >
                      ← Volver al inicio
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
