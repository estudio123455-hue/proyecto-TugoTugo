'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import { signIn } from 'next-auth/react'

export default function SignUp() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'CUSTOMER' as 'CUSTOMER' | 'ESTABLISHMENT',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
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
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        }),
      })

      if (response.ok) {
        // Auto sign in after successful registration
        const result = await signIn('credentials', {
          email: formData.email,
          password: formData.password,
          redirect: false,
        })

        if (result?.error) {
          setError(
            'Registration successful but login failed. Please sign in manually.'
          )
        } else {
          router.push(
            formData.role === 'ESTABLISHMENT' ? '/dashboard' : '/welcome'
          )
        }
      } else {
        const data = await response.json()
        setError(data.message || 'Registration failed')
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Crear tu cuenta
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            ¿Ya tienes cuenta?{' '}
            <Link
              href="/auth/signin"
              className="font-medium text-green-600 hover:text-green-500"
            >
              Iniciar sesión
            </Link>
          </p>
        </div>

        {/* Account Type Selection */}
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="grid grid-cols-2 gap-4 mb-8">
            <button
              onClick={() => setFormData({ ...formData, role: 'CUSTOMER' })}
              className={`p-4 rounded-lg border-2 transition-all ${
                formData.role === 'CUSTOMER'
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-200 hover:border-green-300 text-gray-700'
              }`}
            >
              <div className="text-3xl mb-2">🛒</div>
              <div className="font-semibold">Soy Cliente</div>
              <div className="text-xs text-gray-500">Quiero comprar packs</div>
            </button>

            <button
              onClick={() =>
                setFormData({ ...formData, role: 'ESTABLISHMENT' })
              }
              className={`p-4 rounded-lg border-2 transition-all ${
                formData.role === 'ESTABLISHMENT'
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-200 hover:border-primary-300 text-gray-700'
              }`}
            >
              <div className="text-3xl mb-2">🏪</div>
              <div className="font-semibold">Soy Restaurante</div>
              <div className="text-xs text-gray-500">Quiero vender packs</div>
            </button>
          </div>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Selected Role Display */}
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-2xl mb-1">
                  {formData.role === 'CUSTOMER' ? '🛒' : '🏪'}
                </div>
                <div className="font-medium text-gray-900">
                  {formData.role === 'CUSTOMER'
                    ? 'Registro como Cliente'
                    : 'Registro como Restaurante'}
                </div>
                <div className="text-sm text-gray-500">
                  {formData.role === 'CUSTOMER'
                    ? 'Comprar packs sorpresa'
                    : 'Vender packs sorpresa'}
                </div>
              </div>

              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  {formData.role === 'ESTABLISHMENT'
                    ? '🏪 Nombre del Negocio'
                    : '👤 Nombre Completo'}
                </label>
                <div className="mt-1">
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={e =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder={
                      formData.role === 'ESTABLISHMENT'
                        ? 'Ej: Pizzería Don Giuseppe'
                        : 'Ej: Juan Pérez'
                    }
                    className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  📧 Email
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={e =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="tu@email.com"
                    className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  🔒 Contraseña
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={e =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    placeholder="Mínimo 6 caracteres"
                    className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700"
                >
                  🔒 Confirmar Contraseña
                </label>
                <div className="mt-1">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        confirmPassword: e.target.value,
                      })
                    }
                    placeholder="Repite tu contraseña"
                    className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500 sm:text-sm"
                  />
                </div>
              </div>

              {error && <div className="text-red-600 text-sm">{error}</div>}

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`flex w-full justify-center rounded-lg py-3 px-4 text-sm font-bold text-white shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 transition-all ${
                    formData.role === 'ESTABLISHMENT'
                      ? 'bg-primary-600 hover:bg-primary-700 focus:ring-primary-500'
                      : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                  }`}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creando cuenta...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <span className="mr-2">
                        {formData.role === 'ESTABLISHMENT' ? '🏪' : '🛒'}
                      </span>
                      {formData.role === 'ESTABLISHMENT'
                        ? 'Crear Cuenta de Restaurante'
                        : 'Crear Cuenta de Cliente'}
                    </div>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-2 text-gray-500">
                    O continúa con
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={() => signIn('google')}
                  className="inline-flex w-full justify-center rounded-lg border border-gray-300 bg-white py-3 px-4 text-sm font-medium text-gray-500 shadow-sm hover:bg-gray-50 transition-colors"
                >
                  <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
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
                  <span className="ml-2">Continuar con Google</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
