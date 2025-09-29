'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import Navigation from '@/components/Navigation'
import FloatingSupport from '@/components/FloatingSupport'

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const [currentTestimonial, setCurrentTestimonial] = useState(0)

  useEffect(() => {
    setMounted(true)
    const interval = setInterval(() => {
      setCurrentTestimonial(prev => (prev + 1) % 3)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const testimonials = [
    {
      name: 'María González',
      role: 'Cliente frecuente',
      text: 'Nunca sabes qué te toca, ¡y eso es lo divertido!',
      avatar: '👩‍💼',
      rating: 5,
    },
    {
      name: 'Restaurante La Bella',
      role: 'Socio comercial',
      text: 'Reducimos nuestro desperdicio y llegamos a nuevos clientes cada día.',
      avatar: '🏪',
      rating: 5,
    },
    {
      name: 'Carlos Ruiz',
      role: 'Usuario nuevo',
      text: 'Comida deliciosa a precios increíbles. Lo recomiendo 100%.',
      avatar: '👨‍🍳',
      rating: 5,
    },
  ]

  const restaurants = [
    {
      id: 1,
      name: 'Panadería Artesanal',
      description: 'Panadería tradicional con productos frescos',
      image: '🥖',
      originalPrice: 15,
      salePrice: 7,
      pickupTime: '18:00 - 20:00',
      available: true,
    },
    {
      id: 2,
      name: 'Supermercado Local',
      description: 'Productos frescos y variados',
      image: '🛒',
      originalPrice: 20,
      salePrice: 10,
      pickupTime: '19:00 - 21:00',
      available: true,
    },
    {
      id: 3,
      name: 'Restaurante Verde',
      description: 'Comida saludable y sostenible',
      image: '🥗',
      originalPrice: 25,
      salePrice: 12,
      pickupTime: '20:00 - 22:00',
      available: false,
    },
  ]

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-white font-sans">
      <Navigation />

      {/* Hero Section - Minimalista y limpio */}
      <section
        className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-fresh-50 to-warm-50"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.8), rgba(255,255,255,0.8)), url(\'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="50" font-size="40">🥘</text></svg>\')',
          backgroundSize: '100px 100px',
          backgroundRepeat: 'repeat',
          backgroundPosition: '0 0',
        }}
      >
        <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 text-center">
          {/* Título principal - más limpio */}
          <h1 className="text-5xl lg:text-7xl font-bold mb-6 text-gray-900 leading-tight">
            Salva comida deliciosa
            <br />
            <span className="bg-gradient-to-r from-fresh-600 to-warm-500 bg-clip-text text-transparent">
              y ayuda al planeta
            </span>
          </h1>

          {/* Subtítulo */}
          <p className="text-xl lg:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Encuentra packs sorpresa en restaurantes cercanos a un precio
            reducido
          </p>

          {/* Botón principal */}
          <Link
            href="/packs"
            className="inline-flex items-center bg-gradient-to-r from-fresh-600 to-fresh-700 hover:from-fresh-700 hover:to-fresh-800 text-white px-12 py-5 rounded-2xl text-xl font-semibold transition-all transform hover:scale-105 shadow-lg hover:shadow-xl mb-16"
          >
            <span className="mr-3 text-2xl">📍</span>
            Explorar negocios
          </Link>

          {/* Imagen hero simple */}
          <div className="mt-16 relative max-w-4xl mx-auto">
            <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
              <div className="flex items-center justify-center text-8xl mb-4">
                🥘
              </div>
              <p className="text-gray-600 text-lg">
                Miles de restaurantes cerca de ti con packs sorpresa disponibles
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sección de beneficios - 4 bloques limpios */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              ¿Por qué elegir FoodSave?
            </h2>
            <p className="text-xl text-gray-600">
              Beneficios para ti y para el planeta
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Beneficio 1 */}
            <div className="text-center p-8 rounded-2xl hover:shadow-lg transition-shadow">
              <div className="w-20 h-20 bg-gradient-to-br from-warm-100 to-warm-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">🥡</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Packs a menor precio
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Compra packs sorpresa con hasta 50% de descuento
              </p>
            </div>

            {/* Beneficio 2 */}
            <div className="text-center p-8 rounded-2xl hover:shadow-lg transition-shadow">
              <div className="w-20 h-20 bg-gradient-to-br from-fresh-100 to-fresh-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">🌍</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Reduce el desperdicio
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Ayuda a reducir el desperdicio de alimentos
              </p>
            </div>

            {/* Beneficio 3 */}
            <div className="text-center p-8 rounded-2xl hover:shadow-lg transition-shadow">
              <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">📍</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Locales cerca de ti
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Encuentra restaurantes y tiendas en tu zona
              </p>
            </div>

            {/* Beneficio 4 */}
            <div className="text-center p-8 rounded-2xl hover:shadow-lg transition-shadow">
              <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-pink-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">❤️</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Apoya locales
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Apoya a restaurantes y panaderías locales
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sección de restaurantes */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Restaurantes disponibles
            </h2>
            <p className="text-xl text-gray-600">
              Descubre packs sorpresa cerca de ti
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {restaurants.map(restaurant => (
              <div
                key={restaurant.id}
                className="bg-white rounded-2xl shadow-soft hover:shadow-lg transition-shadow overflow-hidden"
              >
                {/* Imagen del restaurante */}
                <div className="h-48 bg-gradient-to-br from-warm-100 to-fresh-100 flex items-center justify-center">
                  <span className="text-6xl">{restaurant.image}</span>
                </div>

                {/* Contenido */}
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {restaurant.name}
                  </h3>
                  <p className="text-gray-600 mb-4">{restaurant.description}</p>

                  {/* Precios */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg line-through text-gray-400">
                        €{restaurant.originalPrice}
                      </span>
                      <span className="text-2xl font-bold text-fresh-600">
                        €{restaurant.salePrice}
                      </span>
                    </div>
                    <div className="bg-warm-100 text-warm-700 px-3 py-1 rounded-full text-sm font-medium">
                      -
                      {Math.round(
                        (1 - restaurant.salePrice / restaurant.originalPrice) *
                          100
                      )}
                      %
                    </div>
                  </div>

                  {/* Horario */}
                  <div className="flex items-center text-gray-600 mb-4">
                    <span className="mr-2">🕐</span>
                    <span className="text-sm">
                      Recogida: {restaurant.pickupTime}
                    </span>
                  </div>

                  {/* Botón */}
                  <button
                    className={`w-full py-3 rounded-xl font-semibold transition-all ${
                      restaurant.available
                        ? 'bg-gradient-to-r from-fresh-600 to-fresh-700 hover:from-fresh-700 hover:to-fresh-800 text-white shadow-lg hover:shadow-xl'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                    disabled={!restaurant.available}
                  >
                    {restaurant.available ? 'Reservar pack' : 'No disponible'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Ver más */}
          <div className="text-center mt-12">
            <Link
              href="/packs"
              className="inline-flex items-center text-fresh-600 hover:text-fresh-700 font-semibold"
            >
              Ver todos los restaurantes
              <span className="ml-2">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonios - Minimalista */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Lo que dicen nuestros usuarios
            </h2>
            <p className="text-xl text-gray-600">
              Reseñas reales de nuestra comunidad
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-soft hover:shadow-lg transition-all border border-gray-100"
              >
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-fresh-100 to-warm-100 rounded-full flex items-center justify-center text-xl mr-4">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">
                      {testimonial.name}
                    </div>
                    <div className="text-gray-600 text-sm">
                      {testimonial.role}
                    </div>
                  </div>
                </div>

                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-warm-500 text-lg">
                      ★
                    </span>
                  ))}
                </div>

                <p className="text-gray-700 leading-relaxed">
                  "{testimonial.text}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final - Minimalista */}
      <section className="py-24 bg-gradient-to-r from-fresh-600 to-warm-500">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
            Descarga la app y empieza a
            <br />
            salvar comida hoy mismo
          </h2>
          <p className="text-xl text-white/90 mb-12 max-w-2xl mx-auto">
            Únete a miles de personas que ya están ahorrando dinero y ayudando
            al planeta
          </p>

          {/* Botones de descarga */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <button className="inline-flex items-center bg-black text-white px-8 py-4 rounded-2xl font-semibold hover:bg-gray-800 transition-all shadow-lg">
              <span className="mr-3 text-2xl">📱</span>
              <div className="text-left">
                <div className="text-xs">Descargar en</div>
                <div className="text-lg font-bold">Google Play</div>
              </div>
            </button>

            <button className="inline-flex items-center bg-black text-white px-8 py-4 rounded-2xl font-semibold hover:bg-gray-800 transition-all shadow-lg">
              <span className="mr-3 text-2xl">🍎</span>
              <div className="text-left">
                <div className="text-xs">Descargar en</div>
                <div className="text-lg font-bold">App Store</div>
              </div>
            </button>
          </div>

          {/* Stats rápidos */}
          <div className="grid grid-cols-3 gap-8 max-w-md mx-auto text-white/90">
            <div>
              <div className="text-2xl font-bold">5K+</div>
              <div className="text-sm">Usuarios</div>
            </div>
            <div>
              <div className="text-2xl font-bold">150+</div>
              <div className="text-sm">Restaurantes</div>
            </div>
            <div>
              <div className="text-2xl font-bold">4.9★</div>
              <div className="text-sm">Valoración</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Minimalista */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="grid md:grid-cols-3 gap-12 text-center md:text-left">
            {/* Brand */}
            <div>
              <div className="flex items-center justify-center md:justify-start mb-6">
                <div className="bg-gradient-to-r from-fresh-500 to-warm-500 rounded-full p-2 mr-3">
                  <span className="text-xl">🍃</span>
                </div>
                <h3 className="text-2xl font-bold">FoodSave</h3>
              </div>
              <p className="text-gray-300 mb-6 leading-relaxed">
                Reduciendo el desperdicio de comida, un pack a la vez.
              </p>
              <button className="bg-gradient-to-r from-fresh-600 to-warm-500 hover:from-fresh-700 hover:to-warm-600 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg">
                📱 Descarga la App
              </button>
            </div>

            {/* Links rápidos */}
            <div>
              <h4 className="text-lg font-semibold mb-6">Links Rápidos</h4>
              <ul className="space-y-3 text-gray-300">
                <li>
                  <Link
                    href="/faq"
                    className="hover:text-white transition-colors"
                  >
                    💬 FAQ
                  </Link>
                </li>
                <li>
                  <a
                    href="mailto:estudio.123455@gmail.com"
                    className="hover:text-white transition-colors"
                  >
                    📧 estudio.123455@gmail.com
                  </a>
                </li>
                <li>
                  <a
                    href="https://wa.me/573214596837?text=Hola! Necesito ayuda con FoodSave"
                    className="hover:text-white transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    📱 WhatsApp
                  </a>
                </li>
              </ul>
            </div>

            {/* Para restaurantes */}
            <div>
              <h4 className="text-lg font-semibold mb-6">Para Restaurantes</h4>
              <div className="space-y-4">
                <Link
                  href="/auth/signup?role=establishment"
                  className="inline-block bg-gradient-to-r from-warm-600 to-warm-700 hover:from-warm-700 hover:to-warm-800 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg"
                >
                  🤝 Únete Ahora
                </Link>
                <ul className="space-y-3 text-gray-300">
                  <li>
                    <Link
                      href="/dashboard"
                      className="hover:text-white transition-colors"
                    >
                      📊 Dashboard
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom */}
          <div className="border-t border-gray-700 mt-12 pt-8 text-center">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="text-gray-400 text-sm">
                <p>&copy; 2025 FoodSave. Todos los derechos reservados.</p>
              </div>
              <div className="flex items-center space-x-6 text-sm text-gray-400">
                <Link
                  href="/privacy"
                  className="hover:text-white transition-colors"
                >
                  Política de privacidad
                </Link>
                <Link
                  href="/terms"
                  className="hover:text-white transition-colors"
                >
                  Términos y condiciones
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Support */}
      <FloatingSupport />
    </div>
  )
}
