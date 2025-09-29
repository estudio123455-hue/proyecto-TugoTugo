'use client'

import { signIn, getSession } from 'next-auth/react'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navigation from '@/components/Navigation'

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [loginType, setLoginType] = useState<'customer' | 'restaurant'>(
    'customer'
  )
  const [showPassword, setShowPassword] = useState(false)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

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
          setError(
            'Esta cuenta es de restaurante. Usa el login de restaurante.'
          )
          setIsLoading(false)
          return
        }

        // Redirect based on actual role
        if (session?.user?.role === 'ESTABLISHMENT') {
          router.push('/dashboard')
        } else {
          router.push('/packs')
        }
      }
    } catch (error) {
      setError('Ocurrió un error. Inténtalo de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-fresh-50 to-warm-50 font-sans">
      <Navigation />

      <div className="flex min-h-full flex-col justify-center py-12 px-6">
        {/* Hero Section - Minimalista */}
        <div className="max-w-md mx-auto text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-fresh-500 to-warm-500 rounded-2xl shadow-lg mb-6">
            <span className="text-2xl">🍃</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            ¡Bienvenido de vuelta!
          </h1>
          <p className="text-gray-600 mb-2">
            Inicia sesión para continuar salvando comida
          </p>
          <p className="text-sm text-gray-500">
            ¿No tienes cuenta?{' '}
            <Link
              href="/auth/signup"
              className="font-semibold text-fresh-600 hover:text-fresh-700 transition-colors"
            >
              Crear cuenta gratuita
            </Link>
          </p>
        </div>

        {/* Login Type Selection - Minimalista */}
        <div className="max-w-md mx-auto mb-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 text-center">
              Selecciona tu tipo de cuenta
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setLoginType('customer')}
                className={`p-6 rounded-xl border-2 transition-all ${
                  loginType === 'customer'
                    ? 'border-fresh-500 bg-fresh-50 text-fresh-700'
                    : 'border-gray-200 bg-white hover:border-fresh-300 text-gray-700'
                }`}
              >
                <div className="text-center">
                  <div className="text-3xl mb-2">🛒</div>
                  <div className="font-semibold mb-1">Soy Cliente</div>
                  <div className="text-sm opacity-75">Buscar packs</div>
                </div>
              </button>

              <button
                onClick={() => setLoginType('restaurant')}
                className={`p-6 rounded-xl border-2 transition-all ${
                  loginType === 'restaurant'
                    ? 'border-warm-500 bg-warm-50 text-warm-700'
                    : 'border-gray-200 bg-white hover:border-warm-300 text-gray-700'
                }`}
              >
                <div className="text-center">
                  <div className="text-3xl mb-2">🏪</div>
                  <div className="font-semibold mb-1">Soy Restaurante</div>
                  <div className="text-sm opacity-75">Gestionar negocio</div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Main Form - Minimalista */}
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            {/* Selected Login Type Display */}
            <div
              className={`px-6 py-4 text-center ${
                loginType === 'customer'
                  ? 'bg-gradient-to-r from-fresh-500 to-fresh-600'
                  : 'bg-gradient-to-r from-warm-500 to-warm-600'
              }`}
            >
              <div className="flex items-center justify-center space-x-3">
                <div className="text-xl">
                  {loginType === 'customer' ? '🛒' : '🏪'}
                </div>
                <div className="text-white">
                  <div className="font-semibold">
                    {loginType === 'customer'
                      ? 'Acceso Cliente'
                      : 'Acceso Restaurante'}
                  </div>
                  <div className="text-sm opacity-90">
                    {loginType === 'customer'
                      ? 'Encuentra packs cerca'
                      : 'Gestiona tu negocio'}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6">
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      Correo electrónico
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="tu@email.com"
                      className="block w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-fresh-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
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
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        required
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Tu contraseña"
                        className="block w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-fresh-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                      >
                        <span className="text-sm">
                          {showPassword ? '👁️' : '🙈'}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center space-x-2">
                    <span className="text-red-500">⚠️</span>
                    <span className="text-red-700 text-sm font-medium">
                      {error}
                    </span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-4 px-4 rounded-xl text-white font-semibold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed ${
                    loginType === 'restaurant'
                      ? 'bg-gradient-to-r from-warm-600 to-warm-700 hover:from-warm-700 hover:to-warm-800'
                      : 'bg-gradient-to-r from-fresh-600 to-fresh-700 hover:from-fresh-700 hover:to-fresh-800'
                  }`}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Iniciando sesión...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <span>{loginType === 'restaurant' ? '🏪' : '🛒'}</span>
                      <span>
                        {loginType === 'restaurant'
                          ? 'Acceder como Restaurante'
                          : 'Acceder como Cliente'}
                      </span>
                    </div>
                  )}
                </button>
              </form>

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
                    onClick={() => signIn('google')}
                    className="inline-flex w-full justify-center items-center px-4 py-3 border border-gray-200 rounded-xl bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all shadow-sm hover:shadow-md"
                  >
                    <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
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

              <div className="mt-6 text-center">
                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-gray-600 hover:text-fresh-600 transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
            </div>
          </div>

          {/* Trust indicators */}
          <div className="mt-8 text-center">
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <span>🔒</span>
                <span>Seguro</span>
              </div>
              <div className="flex items-center space-x-1">
                <span>⚡</span>
                <span>Rápido</span>
              </div>
              <div className="flex items-center space-x-1">
                <span>🌱</span>
                <span>Sostenible</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
