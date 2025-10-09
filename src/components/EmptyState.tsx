'use client'

import Link from 'next/link'
import { useState } from 'react'

import React from 'react'

interface EmptyStateProps {
  searchQuery: string
  selectedCategory: string
  totalPacks: number
}

export default function EmptyState({
  searchQuery,
  selectedCategory,
  totalPacks,
}: EmptyStateProps) {
  const [emailForNotifications, setEmailForNotifications] = useState('')
  const [showNotificationForm, setShowNotificationForm] = useState(false)

  const handleNotificationSignup = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically save the email for notifications
    alert('¡Perfecto! Te notificaremos cuando haya nuevos packs disponibles.')
    setShowNotificationForm(false)
    setEmailForNotifications('')
  }

  // Different empty states based on context
  if (searchQuery || selectedCategory !== 'all') {
    // Filtered search with no results
    return (
      <div className="text-center py-16">
        <div className="text-8xl mb-6">🔍</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          No encontramos packs con esos criterios
        </h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          Intenta con otros filtros o amplía tu búsqueda. ¡Los restaurantes
          suben nuevos packs constantemente!
        </p>

        <div className="space-y-4">
          <button
            onClick={() => window.location.reload()}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            🔄 Buscar Todos los Packs
          </button>

          <div className="text-sm text-gray-500">
            <p>¿No encuentras lo que buscas?</p>
            <button
              onClick={() => setShowNotificationForm(true)}
              className="text-green-600 hover:text-green-700 underline"
            >
              Activa las notificaciones
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (totalPacks === 0) {
    // No packs at all - early adopter state
    return (
      <div className="py-16">
        {/* Main Card - Two Column Layout */}
        <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="grid md:grid-cols-2">
            {/* Left Side - Hero Content */}
            <div className="p-8 md:p-12 flex flex-col justify-center text-center md:text-left">
              <div className="text-8xl mb-6 text-center md:text-left">🌟</div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                ¡Eres de los Primeros
                <br />
                en tu Zona!
              </h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Cuando se unan más restaurantes a Zavo, serás el primero en
                enterarte de los mejores packs sorpresa.
              </p>

              {/* Action Buttons */}
              <div className="space-y-4">
                {!showNotificationForm ? (
                  <>
                    <button
                      onClick={() => setShowNotificationForm(true)}
                      className="w-full bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-xl text-lg font-bold transition-all transform hover:scale-105 shadow-lg"
                    >
                      🔔 Activar Alertas
                    </button>

                    <div className="grid grid-cols-2 gap-3">
                      <Link
                        href="/auth/signup?role=establishment"
                        className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-3 rounded-lg font-medium transition-colors text-center text-sm"
                      >
                        🤝 Invita un Restaurante
                      </Link>
                      <button
                        onClick={() => window.location.reload()}
                        className="border border-green-500 text-green-600 hover:bg-green-50 px-4 py-3 rounded-lg font-medium transition-colors text-sm"
                      >
                        🔄 Buscar de Nuevo
                      </button>
                    </div>
                  </>
                ) : (
                  <form
                    onSubmit={handleNotificationSignup}
                    className="space-y-4"
                  >
                    <input
                      type="email"
                      placeholder="tu@email.com"
                      value={emailForNotifications}
                      onChange={e => setEmailForNotifications(e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200"
                    />
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="submit"
                        className="col-span-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                      >
                        ✅ Activar Alertas
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowNotificationForm(false)}
                        className="px-4 py-3 text-gray-500 hover:text-gray-700 text-sm"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>

            {/* Right Side - Benefits */}
            <div className="bg-gradient-to-br from-green-50 to-blue-50 p-8 md:p-12 flex flex-col justify-center">
              <h3 className="text-2xl font-bold text-green-800 mb-8 text-center">
                Mientras tanto, sabías que:
              </h3>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-white rounded-full p-3 shadow-md">
                    <span className="text-2xl">💰</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-green-800 mb-1">
                      Ahorro Garantizado
                    </h4>
                    <p className="text-green-700">
                      Los usuarios ahorran 50% promedio en cada pack
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-white rounded-full p-3 shadow-md">
                    <span className="text-2xl">🌍</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-green-800 mb-1">
                      Impacto Real
                    </h4>
                    <p className="text-green-700">
                      Hemos salvado más de 10,000 comidas del desperdicio
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-white rounded-full p-3 shadow-md">
                    <span className="text-2xl">😋</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-green-800 mb-1">
                      Sorpresas Deliciosas
                    </h4>
                    <p className="text-green-700">
                      Cada pack es una sorpresa deliciosa y única
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 bg-white rounded-lg p-4 shadow-md">
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-1">
                    Únete a la comunidad
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    +1,000 usuarios
                  </div>
                  <div className="text-xs text-gray-500">
                    salvando comida cada día
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Restaurants Section */}
        <div className="mt-16 max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            🏆 Restaurantes Aliados Destacados
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: 'Pizzería Bella Vista',
                category: '🍕 Pizza',
                rating: '4.8',
                image: '🍕',
              },
              {
                name: 'Green Salads Co.',
                category: '🥗 Saludable',
                rating: '4.9',
                image: '🥗',
              },
              {
                name: 'Sushi Master',
                category: '🍣 Japonés',
                rating: '4.7',
                image: '🍣',
              },
            ].map((restaurant, index) => (
              <div
                key={index}
                className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="text-4xl mb-3 text-center">
                  {restaurant.image}
                </div>
                <h4 className="font-semibold text-gray-900 text-center">
                  {restaurant.name}
                </h4>
                <p className="text-sm text-gray-600 text-center">
                  {restaurant.category}
                </p>
                <div className="flex items-center justify-center mt-2">
                  <span className="text-yellow-500">⭐</span>
                  <span className="text-sm text-gray-600 ml-1">
                    {restaurant.rating}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-gray-500 text-sm mt-6 text-center">
            Estos restaurantes ya forman parte de Zavo en otras ciudades
          </p>
        </div>
      </div>
    )
  }

  // Default empty state (shouldn't happen, but just in case)
  return (
    <div className="text-center py-16">
      <div className="text-8xl mb-6">🍽️</div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        No hay packs disponibles en este momento
      </h2>
      <p className="text-gray-600 mb-8">
        ¡Vuelve más tarde o activa las notificaciones!
      </p>
      <button
        onClick={() => setShowNotificationForm(true)}
        className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
      >
        🔔 Activar Alertas
      </button>
    </div>
  )
}
