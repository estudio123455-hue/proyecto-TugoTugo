'use client'

import { signIn, getSession } from 'next-auth/react'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'

export default function SignInNew() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [loginType, setLoginType] = useState<'customer' | 'restaurant'>('customer')
  const [showPassword, setShowPassword] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
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
        
        // Redirect based on actual role with full page reload to ensure session is updated
        setTimeout(() => {
          if (session?.user?.role === 'ESTABLISHMENT') {
            window.location.href = '/dashboard'
          } else {
            window.location.href = '/packs'
          }
        }, 800) // Slightly longer delay for better UX
      }
    } catch (error) {
      setError('Ocurrió un error. Inténtalo de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-500 to-orange-400 font-sans relative overflow-hidden">
      {/* Decorative shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-orange-300/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 -left-20 w-60 h-60 bg-purple-300/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-1/3 w-32 h-32 bg-pink-300/20 rounded-full blur-2xl"></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-6xl mx-auto">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden border border-white/20">
            <div className="flex flex-col lg:flex-row min-h-[600px]">
              
              {/* Left Side - Welcome Section */}
              <div className="lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center text-white">
                <div className="mb-8">
                  <h1 className="text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                    Bienvenido a FoodSave
                  </h1>
                  <p className="text-lg lg:text-xl text-white/90 leading-relaxed">
                    Únete a la revolución contra el desperdicio de comida. 
                    Descubre packs sorpresa increíbles mientras ayudas al planeta.
                  </p>
                </div>
                
                <div className="space-y-4 text-white/80">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <span>🌱</span>
                    </div>
                    <span>Reduce el desperdicio alimentario</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <span>💰</span>
                    </div>
                    <span>Ahorra hasta 70% en comida deliciosa</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <span>🏪</span>
                    </div>
                    <span>Apoya restaurantes locales</span>
                  </div>
                </div>
              </div>

              {/* Right Side - Login Form */}
              <div className="lg:w-1/2 bg-white p-8 lg:p-12 flex flex-col justify-center">
                <div className="max-w-md mx-auto w-full">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                      Iniciar Sesión
                    </h2>
                    <p className="text-gray-600">
                      Ingresa a tu cuenta para continuar
                    </p>
                  </div>
                  
                  {/* Login Type Selector */}
                  <div className="mb-6">
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

                  {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                      <p className="text-red-700 text-sm text-center">{error}</p>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-semibold text-gray-700 mb-2"
                      >
                        Email
                      </label>
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                        placeholder="tu@email.com"
                        required
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="password"
                        className="block text-sm font-semibold text-gray-700 mb-2"
                      >
                        Contraseña
                      </label>
                      <div className="relative">
                        <input
                          id="password"
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
                      className="w-full bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 text-white py-4 px-6 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
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
                    <p className="text-sm text-gray-500">
                      ¿No tienes cuenta?{' '}
                      <Link
                        href="/auth/signup-new"
                        className="font-semibold text-purple-600 hover:text-purple-700 transition-colors"
                      >
                        Crear cuenta gratuita
                      </Link>
                    </p>
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
