'use client'

import { UserButton, useUser } from '@stackframe/react'
import Navigation from '@/components/Navigation'

export default function StackProfilePage() {
  const user = useUser()

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <Navigation />
        <div className="flex items-center justify-center px-4 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Acceso denegado
            </h1>
            <p className="text-gray-600">
              Debes iniciar sesión para ver tu perfil
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <Navigation />
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Mi Perfil
              </h1>
              <p className="text-gray-600">
                Gestiona tu información personal
              </p>
            </div>
            <UserButton />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Información Personal
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Email:
                  </label>
                  <p className="text-gray-900">{user.primaryEmail}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Nombre:
                  </label>
                  <p className="text-gray-900">
                    {user.displayName || 'No configurado'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    ID de Usuario:
                  </label>
                  <p className="text-gray-500 text-sm">{user.id}</p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-800 mb-4">
                Impacto Ambiental
              </h3>
              <div className="space-y-3">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-1">
                    🌱
                  </div>
                  <p className="text-sm text-green-700">
                    ¡Gracias por ayudar a reducir el desperdicio de alimentos!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
