'use client'

import { signIn, getSession } from 'next-auth/react'
import React, { useState } from 'react'
import Link from 'next/link'

export default function AuthLanding() {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [userType, setUserType] = useState<'CUSTOMER' | 'ESTABLISHMENT'>('CUSTOMER')
  const [loginType, setLoginType] = useState<'customer' | 'restaurant'>('customer')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Email o contraseña incorrectos')
      } else {
        const session = await getSession()

        // Verify that the user role matches the selected login type
        if (
          loginType === 'restaurant' &&
          session?.user?.role !== 'ESTABLISHMENT'
        ) {
          setError('Esta cuenta no es de restaurante. Usa el login de cliente.')
          setIsLoading(false)
          return
        }

        if (
          loginType === 'customer' &&
          session?.user?.role === 'ESTABLISHMENT'
        ) {
          setError('Esta cuenta es de restaurante. Usa el login de restaurante.')
          setIsLoading(false)
          return
        }

        // Show success message and redirect
        setError('') // Clear any previous errors
        
        setTimeout(() => {
          if (session?.user?.role === 'ESTABLISHMENT') {
            window.location.href = '/dashboard'
          } else {
            window.location.href = '/packs'
          }
        }, 800)
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

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
          role: userType,
        }),
      })

      if (response.ok) {
        const result = await signIn('credentials', {
          email,
          password,
          redirect: false,
        })

        if (result?.error) {
          setError('Registro exitoso pero falló el login. Por favor inicia sesión.')
        } else {
          setTimeout(() => {
            window.location.href = userType === 'ESTABLISHMENT' ? '/dashboard' : '/welcome'
          }, 1000)
        }
      } else {
        const data = await response.json()
        setError(data.message || 'Error en el registro')
      }
    } catch (error) {
      setError('Ocurrió un error. Por favor intenta de nuevo.')
    } finally {
      setIsLoading(false)
    }
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
        <div className="w-full max-w-6xl mx-auto">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden border border-white/20">
            <div className="flex flex-col lg:flex-row min-h-[700px]">
              
              {/* Left Side - Welcome Section */}
              <div className="lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center text-white">
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-4xl">🍃</span>
                    <span className="text-3xl font-bold">Zavo</span>
                  </div>
                  <h1 className="text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                    Salva comida, ahorra dinero, ayuda al planeta
                  </h1>
                  <p className="text-lg lg:text-xl text-white/90 leading-relaxed">
                    Únete a la revolución contra el desperdicio de comida. 
                    Descubre packs sorpresa increíbles mientras contribuyes a un mundo más sostenible.
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
                    <span>Más de 2,847 kg de comida salvados este mes</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <span>🏪</span>
                    </div>
                    <span>Apoya restaurantes locales en Bogotá</span>
                  </div>
                </div>
              </div>

              {/* Right Side - Auth Form */}
              <div className="lg:w-1/2 bg-white p-8 lg:p-12 flex flex-col justify-center">
                <div className="max-w-md mx-auto w-full">
                  
                  {/* Tab Selector */}
                  <div className="flex bg-gray-100 rounded-xl p-1 mb-8">
                    <button
                      onClick={() => setActiveTab('signin')}
                      className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                        activeTab === 'signin'
                          ? 'bg-white text-purple-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Iniciar Sesión
                    </button>
                    <button
                      onClick={() => setActiveTab('signup')}
                      className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                        activeTab === 'signup'
                          ? 'bg-white text-purple-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Crear Cuenta
                    </button>
                  </div>

                  {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                      <p className="text-red-700 text-sm text-center">{error}</p>
                    </div>
                  )}

                  {/* Sign In Form */}
                  {activeTab === 'signin' && (
                    <>
                      {/* Login Type Selector */}
                      <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Tipo de cuenta
                        </label>
                        <div className="flex bg-gray-100 rounded-xl p-1">
                          <button
                            type="button"
                            onClick={() => setLoginType('customer')}
                            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                              loginType === 'customer'
                                ? 'bg-white text-purple-600 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                          >
                            🛒 Cliente
                          </button>
                          <button
                            type="button"
                            onClick={() => setLoginType('restaurant')}
                            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                              loginType === 'restaurant'
                                ? 'bg-white text-purple-600 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                          >
                            🏪 Restaurante
                          </button>
                        </div>
                      </div>

                      <form onSubmit={handleSignIn} className="space-y-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Email
                          </label>
                          <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                            placeholder="tu@email.com"
                            required
                          />
                        </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Contraseña
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white pr-12"
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

                        <button
                          type="submit"
                          disabled={isLoading}
                          className="w-full bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 text-white py-4 px-6 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50"
                        >
                          {isLoading ? (
                            <div className="flex items-center justify-center space-x-2">
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                              <span>Iniciando sesión...</span>
                            </div>
                          ) : (
                            <span>INICIAR SESIÓN</span>
                          )}
                        </button>
                      </form>
                    </>
                  )}

                  {/* Sign Up Form */}
                  {activeTab === 'signup' && (
                    <>
                      {/* User Type Selector */}
                      <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Tipo de cuenta
                        </label>
                        <div className="flex bg-gray-100 rounded-xl p-1">
                          <button
                            type="button"
                            onClick={() => setUserType('CUSTOMER')}
                            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                              userType === 'CUSTOMER'
                                ? 'bg-white text-purple-600 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                          >
                            🛒 Cliente
                          </button>
                          <button
                            type="button"
                            onClick={() => setUserType('ESTABLISHMENT')}
                            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                              userType === 'ESTABLISHMENT'
                                ? 'bg-white text-purple-600 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                          >
                            🏪 Restaurante
                          </button>
                        </div>
                      </div>

                      <form onSubmit={handleSignUp} className="space-y-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Nombre completo
                          </label>
                          <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                            placeholder="Tu nombre completo"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Email
                          </label>
                          <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                            placeholder="tu@email.com"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Contraseña
                          </label>
                          <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                            placeholder="••••••••"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Confirmar contraseña
                          </label>
                          <input
                            type="password"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                            placeholder="••••••••"
                            required
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={isLoading}
                          className="w-full bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 text-white py-4 px-6 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50"
                        >
                          {isLoading ? (
                            <div className="flex items-center justify-center space-x-2">
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                              <span>Creando cuenta...</span>
                            </div>
                          ) : (
                            <span>CREAR CUENTA GRATIS</span>
                          )}
                        </button>
                      </form>
                    </>
                  )}

                  {/* Google OAuth */}
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
                        onClick={() => signIn('google', { 
                          callbackUrl: '/',
                          redirect: true 
                        })}
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

                  {/* Footer Links */}
                  <div className="mt-8 text-center space-y-2">
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
