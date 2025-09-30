'use client'

import Navigation from '@/components/Navigation'
import Link from 'next/link'

export default function HowItWorksPage() {
  const customerSteps = [
    {
      number: '01',
      icon: '🔍',
      title: 'Descubre Packs Sorpresa',
      description: 'Explora restaurantes cerca de ti que ofrecen packs sorpresa con comida deliciosa a precios increíbles.',
      details: 'Usa nuestro mapa interactivo o navega por categorías para encontrar tus lugares favoritos.'
    },
    {
      number: '02',
      icon: '🛒',
      title: 'Reserva tu Pack',
      description: 'Selecciona el pack que más te guste, elige la cantidad y confirma tu reserva con pago seguro.',
      details: 'Cada pack es una sorpresa, pero siempre con un valor superior al precio que pagas.'
    },
    {
      number: '03',
      icon: '📱',
      title: 'Recibe Confirmación',
      description: 'Te enviamos todos los detalles por email: horario de recogida, dirección del restaurante y tu código de pedido.',
      details: 'También recibirás recordatorios para que no olvides recoger tu pack.'
    },
    {
      number: '04',
      icon: '🏃‍♂️',
      title: 'Recoge tu Pack',
      description: 'Ve al restaurante en el horario indicado, presenta tu confirmación y recoge tu deliciosa sorpresa.',
      details: '¡Disfruta descubriendo qué deliciosos productos hay dentro de tu pack!'
    }
  ]

  const restaurantSteps = [
    {
      number: '01',
      icon: '📝',
      title: 'Regístrate como Restaurante',
      description: 'Crea tu perfil de establecimiento con información básica: nombre, ubicación, tipo de cocina y fotos.',
      details: 'El proceso es rápido y sencillo. Solo necesitas unos minutos para estar listo.'
    },
    {
      number: '02',
      icon: '📦',
      title: 'Crea tus Packs Sorpresa',
      description: 'Define qué productos incluirás en tus packs, establece precios atractivos y horarios de recogida.',
      details: 'Puedes crear diferentes tipos de packs según tu inventario disponible.'
    },
    {
      number: '03',
      icon: '⏰',
      title: 'Gestiona tus Horarios',
      description: 'Establece cuándo estarán disponibles tus packs y cuántos ofreces cada día.',
      details: 'Tienes control total sobre tu inventario y disponibilidad.'
    },
    {
      number: '04',
      icon: '💰',
      title: 'Recibe Pedidos y Gana',
      description: 'Los clientes compran tus packs, tú reduces el desperdicio y generas ingresos adicionales.',
      details: 'Convierte el excedente de comida en una oportunidad de negocio sostenible.'
    }
  ]

  const benefits = [
    {
      icon: '🌱',
      title: 'Impacto Ambiental',
      description: 'Ayudamos a reducir el desperdicio alimentario',
      stats: '2,847 kg de comida salvados este mes'
    },
    {
      icon: '💰',
      title: 'Ahorro Significativo',
      description: 'Los clientes ahorran hasta 70% en comida de calidad',
      stats: 'Promedio de $15,000 ahorrados por usuario'
    },
    {
      icon: '🏪',
      title: 'Apoyo Local',
      description: 'Fortalecemos la economía local apoyando restaurantes',
      stats: '150+ restaurantes locales participando'
    },
    {
      icon: '🎁',
      title: 'Experiencia Única',
      description: 'Cada pack es una sorpresa culinaria emocionante',
      stats: '95% de satisfacción del cliente'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            ¿Cómo Funciona <span className="text-green-600">FoodSave</span>?
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Descubre cómo nuestra plataforma conecta a clientes con restaurantes para reducir el desperdicio alimentario, 
            ahorrar dinero y apoyar negocios locales.
          </p>
        </div>

        {/* Customer Journey */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 bg-blue-100 px-6 py-3 rounded-full mb-4">
              <span className="text-2xl">🛒</span>
              <span className="font-semibold text-blue-800">Para Clientes</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Tu Viaje hacia el Ahorro Sostenible
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              En 4 simples pasos, puedes ahorrar dinero mientras ayudas al planeta
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {customerSteps.map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 h-full">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-4xl">{step.icon}</span>
                    <span className="text-2xl font-bold text-gray-300">{step.number}</span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {step.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    {step.description}
                  </p>
                  
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-500">
                      {step.details}
                    </p>
                  </div>
                </div>

                {/* Connecting Arrow (hidden on mobile) */}
                {index < customerSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">→</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Restaurant Journey */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 bg-orange-100 px-6 py-3 rounded-full mb-4">
              <span className="text-2xl">🏪</span>
              <span className="font-semibold text-orange-800">Para Restaurantes</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Convierte el Desperdicio en Oportunidad
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Transforma tu excedente de comida en ingresos adicionales de manera sostenible
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {restaurantSteps.map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 h-full">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-4xl">{step.icon}</span>
                    <span className="text-2xl font-bold text-gray-300">{step.number}</span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {step.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    {step.description}
                  </p>
                  
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-500">
                      {step.details}
                    </p>
                  </div>
                </div>

                {/* Connecting Arrow (hidden on mobile) */}
                {index < restaurantSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">→</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              ¿Por Qué Elegir FoodSave?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Más que una plataforma, somos un movimiento hacia un futuro más sostenible
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <div className="text-5xl mb-4">{benefit.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {benefit.description}
                  </p>
                  <div className="bg-green-50 rounded-lg p-3">
                    <p className="text-sm font-semibold text-green-700">
                      {benefit.stats}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Preguntas Frecuentes
            </h2>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <h3 className="font-bold text-gray-900 mb-3">
                    ¿Qué contienen los packs sorpresa?
                  </h3>
                  <p className="text-gray-600">
                    Cada pack contiene una selección de productos del restaurante con un valor superior al precio pagado. 
                    Puede incluir platos preparados, ingredientes frescos, postres o bebidas.
                  </p>
                </div>
                
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <h3 className="font-bold text-gray-900 mb-3">
                    ¿Cuánto puedo ahorrar?
                  </h3>
                  <p className="text-gray-600">
                    En promedio, nuestros usuarios ahorran entre 50% y 70% del precio original. 
                    Un pack de $10,000 puede contener productos por valor de $25,000 o más.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <h3 className="font-bold text-gray-900 mb-3">
                    ¿Qué pasa si no puedo recoger mi pack?
                  </h3>
                  <p className="text-gray-600">
                    Te enviamos recordatorios por email y SMS. Si no puedes recogerlo, 
                    contáctanos antes del horario límite para buscar una solución.
                  </p>
                </div>
                
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <h3 className="font-bold text-gray-900 mb-3">
                    ¿Los restaurantes ganan dinero?
                  </h3>
                  <p className="text-gray-600">
                    ¡Absolutamente! Los restaurantes convierten productos que podrían desperdiciarse 
                    en ingresos adicionales, reduciendo pérdidas y aumentando sostenibilidad.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-3xl p-8 md:p-12 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            ¿Listo para Comenzar?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Únete a la revolución contra el desperdicio alimentario
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/auth"
              className="bg-white text-green-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-colors shadow-lg"
            >
              🛒 Soy Cliente - Empezar a Ahorrar
            </Link>
            
            <Link
              href="/auth"
              className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white hover:text-green-600 transition-colors"
            >
              🏪 Soy Restaurante - Unirme
            </Link>
          </div>
          
          <div className="mt-8 text-sm opacity-75">
            <p>¿Tienes preguntas? <Link href="/faq" className="underline hover:no-underline">Visita nuestro FAQ</Link></p>
          </div>
        </div>
      </div>
    </div>
  )
}
