'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { getFirstName, getCleanUserName } from '@/lib/user-utils'

export default function FloatingSupport() {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showVideoModal, setShowVideoModal] = useState(false)
  const { data: session } = useSession()

  const quickFAQs = [
    {
      q: '¿Cómo reservo un pack?',
      a: 'Busca packs disponibles y haz clic en \'Reservar\'',
    },
    {
      q: '¿Cuándo puedo recoger mi pack?',
      a: 'En el horario especificado en tu reserva',
    },
    {
      q: '¿Qué pasa si no puedo recogerlo?',
      a: 'Contacta al restaurante lo antes posible',
    },
    {
      q: '¿Cómo funciona el pago?',
      a: 'Pagos seguros con Stripe, instantáneos',
    },
    {
      q: '¿Puedo cancelar mi reserva?',
      a: 'Sí, antes del horario de recogida',
    },
  ]

  const filteredFAQs = quickFAQs.filter(
    faq =>
      faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.a.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleEmailSupport = () => {
    const subject = session
      ? `Soporte FoodSave - ${getCleanUserName(session.user?.name)}`
      : 'Soporte FoodSave'
    const body = session
      ? `Hola, necesito ayuda con mi cuenta: ${session.user?.email}\n\nMi consulta es:\n\n`
      : 'Hola, necesito ayuda con FoodSave.\n\nMi consulta es:\n\n'

    window.open(
      `mailto:estudio.123455@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    )
  }

  const handleWhatsApp = () => {
    const message = session
      ? `Hola! Necesito ayuda con FoodSave. Mi cuenta es: ${session.user?.email}`
      : 'Hola! Necesito ayuda con FoodSave'

    window.open(
      `https://wa.me/573214596837?text=${encodeURIComponent(message)}`
    )
  }

  return (
    <>
      {/* Floating Support Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-green-500 hover:bg-green-600 text-white w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all transform hover:scale-110 ring-4 ring-green-200"
        >
          {isOpen ? (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <span className="text-2xl">💬</span>
          )}
        </button>
      </div>

      {/* Support Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-40 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6">
            <h3 className="text-xl font-bold mb-1">
              {session
                ? `Hola, ${getFirstName(session.user?.name)} 👋`
                : 'Need Help? 🤝'}
            </h3>
            <p className="text-sm text-green-100">
              {session
                ? '¿En qué podemos ayudarte?'
                : 'We\'re here to help you save food!'}
            </p>
          </div>

          {/* Search Bar */}
          <div className="p-4 border-b border-gray-100">
            <div className="relative">
              <input
                type="text"
                placeholder="🔍 Buscar ayuda (ej: pago, reserva, cuenta)..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 text-sm"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-4 w-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {/* Quick FAQs */}
            {searchQuery && (
              <div className="p-4 border-b border-gray-100">
                <h4 className="font-semibold text-gray-900 mb-3 text-sm">
                  Resultados de búsqueda:
                </h4>
                {filteredFAQs.length > 0 ? (
                  <div className="space-y-2">
                    {filteredFAQs.slice(0, 3).map((faq, index) => (
                      <div key={index} className="bg-blue-50 rounded-lg p-3">
                        <div className="font-medium text-blue-900 text-sm">
                          {faq.q}
                        </div>
                        <div className="text-blue-700 text-xs mt-1">
                          {faq.a}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-500 text-sm">
                    No se encontraron resultados
                  </div>
                )}
              </div>
            )}

            {/* Personalized Quick Actions */}
            {session && (
              <div className="p-4 border-b border-gray-100">
                <h4 className="font-semibold text-gray-900 mb-3 text-sm">
                  Atajos personalizados:
                </h4>
                <div className="space-y-2">
                  <Link
                    href="/profile"
                    className="flex items-center p-2 hover:bg-green-50 rounded-lg transition-colors"
                  >
                    <span className="text-lg mr-3">📦</span>
                    <div>
                      <div className="font-medium text-gray-900 text-sm">
                        Ver mis pedidos
                      </div>
                      <div className="text-xs text-gray-500">
                        Estado de tus reservas
                      </div>
                    </div>
                  </Link>

                  {session.user?.role === 'ESTABLISHMENT' && (
                    <Link
                      href="/dashboard"
                      className="flex items-center p-2 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <span className="text-lg mr-3">📊</span>
                      <div>
                        <div className="font-medium text-gray-900 text-sm">
                          Mi dashboard
                        </div>
                        <div className="text-xs text-gray-500">
                          Gestionar mi restaurante
                        </div>
                      </div>
                    </Link>
                  )}
                </div>
              </div>
            )}

            {/* Main Support Options */}
            <div className="p-4 space-y-2">
              <button
                onClick={() => window.open('/faq', '_blank')}
                className="w-full text-left p-3 hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors group"
              >
                <div className="flex items-center">
                  <div className="bg-red-100 rounded-full p-2 mr-3 group-hover:bg-red-200 transition-colors">
                    <span className="text-lg">❓</span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">FAQ</div>
                    <div className="text-sm text-gray-500">
                      Preguntas frecuentes
                    </div>
                  </div>
                </div>
              </button>

              <button
                onClick={handleEmailSupport}
                className="w-full text-left p-3 hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors group"
              >
                <div className="flex items-center">
                  <div className="bg-blue-100 rounded-full p-2 mr-3 group-hover:bg-blue-200 transition-colors">
                    <span className="text-lg">📧</span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      Email Support
                    </div>
                    <div className="text-sm text-gray-500">
                      estudio.123455@gmail.com
                    </div>
                  </div>
                </div>
              </button>

              <button
                onClick={handleWhatsApp}
                className="w-full text-left p-3 hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors group"
              >
                <div className="flex items-center">
                  <div className="bg-green-100 rounded-full p-2 mr-3 group-hover:bg-green-200 transition-colors">
                    <span className="text-lg">📱</span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">WhatsApp</div>
                    <div className="text-sm text-gray-500">
                      Respuesta rápida
                    </div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setShowVideoModal(true)}
                className="w-full text-left p-3 hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors group"
              >
                <div className="flex items-center">
                  <div className="bg-purple-100 rounded-full p-2 mr-3 group-hover:bg-purple-200 transition-colors">
                    <span className="text-lg">🎥</span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      Video Tutorial
                    </div>
                    <div className="text-sm text-gray-500">
                      Cómo usar FoodSave
                    </div>
                  </div>
                </div>
              </button>

              {/* Service Status */}
              <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-sm font-medium text-green-800">
                      Estado del Servicio
                    </span>
                  </div>
                  <span className="text-xs text-green-600">
                    ✅ Todo en orden
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-b-2xl border-t border-gray-100">
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-2">Disponible 24/7</div>
              <div className="flex items-center justify-center text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                <span className="text-sm font-medium">En línea ahora</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Video Modal */}
      {showVideoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setShowVideoModal(false)}
          ></div>
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">
                🎥 Tutorial de FoodSave
              </h3>
              <button
                onClick={() => setShowVideoModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">🎬</div>
                  <h4 className="text-lg font-semibold text-gray-700 mb-2">
                    Tutorial Próximamente
                  </h4>
                  <p className="text-gray-500">
                    Estamos preparando un video tutorial completo
                  </p>
                  <div className="mt-4 space-y-2 text-sm text-gray-600">
                    <p>📱 Cómo buscar packs</p>
                    <p>🛒 Cómo hacer reservas</p>
                    <p>📦 Cómo recoger tu pack</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </>
  )
}
