'use client'

import { useState } from 'react'
import Link from 'next/link'
import Navigation from '@/components/Navigation'

interface FAQItem {
  id: string
  question: string
  answer: string
  category: string
}

const faqData: FAQItem[] = [
  // Compradores
  {
    id: '1',
    question: '¿Cómo funciona Zavo?',
    answer:
      'Zavo conecta a consumidores con restaurantes locales que tienen excedente de comida. Los restaurantes crean "packs sorpresa" con comida fresca que de otra manera se desperdiciaría, y tú puedes comprarlos con hasta 50% de descuento.',
    category: 'compradores',
  },
  {
    id: '2',
    question: '¿Cómo reservo un pack sorpresa?',
    answer:
      'Es muy fácil: 1) Busca restaurantes cerca de ti en la app, 2) Selecciona un pack disponible, 3) Realiza el pago seguro, 4) Ve al restaurante en el horario indicado y presenta tu confirmación para recoger tu pack.',
    category: 'compradores',
  },
  {
    id: '3',
    question: '¿Qué viene en un pack sorpresa?',
    answer:
      'Los packs sorpresa contienen una selección de comida fresca del restaurante. El contenido exacto es una sorpresa, pero siempre incluye productos de calidad que el restaurante no pudo vender durante el día. El valor siempre es mayor al precio que pagas.',
    category: 'compradores',
  },
  {
    id: '4',
    question: '¿Puedo elegir qué viene en mi pack?',
    answer:
      'No, los packs sorpresa son exactamente eso: una sorpresa. Sin embargo, puedes ver la categoría del restaurante (panadería, pizzería, etc.) para tener una idea general del tipo de comida que podrías recibir.',
    category: 'compradores',
  },
  {
    id: '5',
    question: '¿Qué pasa si no puedo recoger mi pack?',
    answer:
      'Si no puedes recoger tu pack en el horario establecido, contacta al restaurante lo antes posible. Algunos restaurantes pueden ser flexibles con los horarios, pero esto no está garantizado. Si no recoges tu pack, no habrá reembolso.',
    category: 'compradores',
  },
  {
    id: '6',
    question: '¿Puedo cancelar mi reserva?',
    answer:
      'Puedes cancelar tu reserva hasta 2 horas antes del horario de recogida y recibir un reembolso completo. Las cancelaciones después de este tiempo no son elegibles para reembolso.',
    category: 'compradores',
  },

  // Comerciantes
  {
    id: '7',
    question: '¿Cómo puedo unir mi restaurante a Zavo?',
    answer:
      'Es gratis y fácil: 1) Regístrate como establecimiento en nuestra plataforma, 2) Completa la información de tu negocio, 3) Configura tus horarios y tipos de packs, 4) ¡Empieza a vender y reduce tu desperdicio!',
    category: 'comerciantes',
  },
  {
    id: '8',
    question: '¿Cuánto cuesta usar Zavo para mi restaurante?',
    answer:
      'Registrarse es completamente gratis. Solo cobramos una pequeña comisión del 15% sobre cada pack vendido. No hay costos mensuales ni tarifas ocultas. Solo pagas cuando vendes.',
    category: 'comerciantes',
  },
  {
    id: '9',
    question: '¿Cómo funciona el pago para restaurantes?',
    answer:
      'Recibes el pago directamente en tu cuenta bancaria. Procesamos los pagos semanalmente, descontando nuestra comisión del 15%. Puedes ver todos tus ingresos y estadísticas en tiempo real en tu dashboard.',
    category: 'comerciantes',
  },
  {
    id: '10',
    question: '¿Qué tipo de comida puedo incluir en los packs?',
    answer:
      'Puedes incluir cualquier comida fresca y segura que normalmente venderías a tus clientes. La comida debe cumplir con todos los estándares de seguridad alimentaria y estar en perfecto estado para el consumo.',
    category: 'comerciantes',
  },
  {
    id: '11',
    question: '¿Cómo establezco los precios de mis packs?',
    answer:
      'Tú tienes control total sobre los precios. Recomendamos precios entre 30-50% del valor original para atraer clientes. Nuestro sistema te ayuda con sugerencias de precios basadas en tu tipo de negocio.',
    category: 'comerciantes',
  },

  // Pagos
  {
    id: '12',
    question: '¿Qué métodos de pago aceptan?',
    answer:
      'Aceptamos todas las tarjetas de crédito y débito principales (Visa, MasterCard, American Express), así como PayPal. Todos los pagos son procesados de forma segura a través de Stripe.',
    category: 'pagos',
  },
  {
    id: '13',
    question: '¿Es seguro pagar en Zavo?',
    answer:
      'Absolutamente. Utilizamos Stripe, uno de los procesadores de pagos más seguros del mundo. Nunca almacenamos tu información de tarjeta de crédito en nuestros servidores. Todos los pagos están encriptados y protegidos.',
    category: 'pagos',
  },
  {
    id: '14',
    question: '¿Cuándo se cobra mi tarjeta?',
    answer:
      'Tu tarjeta se cobra inmediatamente cuando confirmas tu reserva. Esto asegura tu pack y permite al restaurante prepararlo para ti.',
    category: 'pagos',
  },
  {
    id: '15',
    question: '¿Puedo obtener un reembolso?',
    answer:
      'Sí, puedes cancelar y obtener un reembolso completo hasta 2 horas antes del horario de recogida. Los reembolsos se procesan automáticamente y aparecen en tu cuenta en 3-5 días hábiles.',
    category: 'pagos',
  },
  {
    id: '16',
    question: '¿Hay cargos adicionales?',
    answer:
      'No, el precio que ves es el precio final. No hay cargos ocultos, tasas de servicio o propinas obligatorias. Puedes dejar propina voluntariamente al restaurante si lo deseas.',
    category: 'pagos',
  },

  // Seguridad
  {
    id: '17',
    question: '¿Es segura la comida en los packs sorpresa?',
    answer:
      'Sí, todos nuestros restaurantes socios deben cumplir con las regulaciones locales de seguridad alimentaria. La comida en los packs es fresca y segura para el consumo. Solo se incluye comida que el restaurante vendería normalmente.',
    category: 'seguridad',
  },
  {
    id: '18',
    question: '¿Cómo protegen mis datos personales?',
    answer:
      'Tomamos la privacidad muy en serio. Utilizamos encriptación de grado bancario para proteger tus datos. Solo recopilamos la información necesaria para brindar el servicio y nunca vendemos tus datos a terceros.',
    category: 'seguridad',
  },
  {
    id: '19',
    question: '¿Qué pasa si tengo una reacción alérgica?',
    answer:
      'Si tienes alergias alimentarias, siempre pregunta al restaurante sobre los ingredientes antes de recoger tu pack. Los restaurantes están obligados a proporcionar información sobre alérgenos si se les solicita.',
    category: 'seguridad',
  },
  {
    id: '20',
    question: '¿Cómo reporto un problema con mi pack?',
    answer:
      'Si tienes algún problema con tu pack, contacta nuestro soporte inmediatamente a través del chat en la app, email (estudio.123455@gmail.com) o WhatsApp. Investigaremos el problema y tomaremos las medidas apropiadas.',
    category: 'seguridad',
  },
  {
    id: '21',
    question: '¿Verifican a los restaurantes?',
    answer:
      'Sí, todos los restaurantes pasan por un proceso de verificación antes de unirse a nuestra plataforma. Verificamos licencias comerciales, permisos sanitarios y realizamos visitas cuando es necesario.',
    category: 'seguridad',
  },
]

const categories = [
  { id: 'all', name: 'Todas', icon: '❓', color: 'text-gray-600' },
  {
    id: 'compradores',
    name: 'Compradores',
    icon: '🛒',
    color: 'text-fresh-600',
  },
  {
    id: 'comerciantes',
    name: 'Comerciantes',
    icon: '🏪',
    color: 'text-warm-600',
  },
  { id: 'pagos', name: 'Pagos', icon: '💳', color: 'text-blue-600' },
  { id: 'seguridad', name: 'Seguridad', icon: '🔒', color: 'text-green-600' },
]

export default function FAQ() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [openItems, setOpenItems] = useState<string[]>([])

  const filteredFAQs = faqData.filter(faq => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory =
      selectedCategory === 'all' || faq.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  const toggleItem = (id: string) => {
    setOpenItems(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

  const getCategoryInfo = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId) || categories[0]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-fresh-50 to-warm-50 font-sans">
      <Navigation />

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-fresh-500 to-warm-500 rounded-2xl shadow-lg mb-6">
            <span className="text-2xl">❓</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Preguntas Frecuentes
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Encuentra respuestas a las preguntas más comunes sobre Zavo
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-2xl mx-auto">
            <input
              type="text"
              placeholder="🔍 Buscar preguntas..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full px-6 py-4 pl-12 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-fresh-500 focus:border-transparent bg-white shadow-sm"
            />
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
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
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="h-5 w-5"
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
            )}
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`inline-flex items-center px-6 py-3 rounded-2xl font-semibold transition-all transform hover:scale-105 ${
                selectedCategory === category.id
                  ? 'bg-white text-fresh-600 shadow-lg ring-2 ring-fresh-200'
                  : 'bg-white/70 text-gray-700 hover:bg-white hover:shadow-md'
              }`}
            >
              <span className="mr-2">{category.icon}</span>
              {category.name}
              <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                {category.id === 'all'
                  ? faqData.length
                  : faqData.filter(faq => faq.category === category.id).length}
              </span>
            </button>
          ))}
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {filteredFAQs.length > 0 ? (
            filteredFAQs.map(faq => {
              const categoryInfo = getCategoryInfo(faq.category)
              const isOpen = openItems.includes(faq.id)

              return (
                <div
                  key={faq.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all"
                >
                  <button
                    onClick={() => toggleItem(faq.id)}
                    className="w-full px-6 py-6 text-left focus:outline-none focus:ring-2 focus:ring-fresh-500 focus:ring-inset rounded-2xl"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 ${categoryInfo.color} mr-3`}
                          >
                            {categoryInfo.icon} {categoryInfo.name}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 pr-4">
                          {faq.question}
                        </h3>
                      </div>
                      <div className="flex-shrink-0 ml-4">
                        <svg
                          className={`w-5 h-5 text-gray-400 transition-transform ${
                            isOpen ? 'transform rotate-180' : ''
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-6">
                      <div className="border-t border-gray-100 pt-4">
                        <p className="text-gray-700 leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )
            })
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🤔</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No encontramos resultados
              </h3>
              <p className="text-gray-600 mb-6">
                Intenta con otros términos de búsqueda o selecciona una
                categoría diferente
              </p>
              <button
                onClick={() => {
                  setSearchQuery('')
                  setSelectedCategory('all')
                }}
                className="bg-fresh-600 hover:bg-fresh-700 text-white px-6 py-3 rounded-xl font-semibold transition-all"
              >
                Ver todas las preguntas
              </button>
            </div>
          )}
        </div>

        {/* Contact Support */}
        <div className="mt-16 text-center">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            <div className="text-4xl mb-4">💬</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              ¿No encontraste lo que buscabas?
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Nuestro equipo de soporte está aquí para ayudarte. Contáctanos y
              te responderemos lo antes posible.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:estudio.123455@gmail.com"
                className="inline-flex items-center bg-fresh-600 hover:bg-fresh-700 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl"
              >
                <span className="mr-2">📧</span>
                Enviar Email
              </a>
              <a
                href="https://wa.me/573214596837?text=Hola! Tengo una pregunta sobre Zavo"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl"
              >
                <span className="mr-2">💬</span>
                WhatsApp
              </a>
            </div>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-12 text-center">
          <Link
            href="/"
            className="inline-flex items-center text-fresh-600 hover:text-fresh-700 font-semibold"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  )
}
