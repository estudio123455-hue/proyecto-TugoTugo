'use client'

import Link from 'next/link'
import Navigation from '@/components/Navigation'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-purple-500 to-orange-400 pt-20 pb-32 md:pt-32 md:pb-40">
        {/* Decorative shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-10 -right-10 w-72 h-72 bg-orange-300/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/3 -left-20 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-1/3 w-64 h-64 bg-pink-300/20 rounded-full blur-2xl"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-4 py-2 mb-8">
              <span className="text-2xl">🌍</span>
              <span className="text-white font-medium">Combate el desperdicio de comida</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Salva Comida Deliciosa,
              <br />
              <span className="bg-gradient-to-r from-yellow-200 to-orange-200 bg-clip-text text-transparent">
                Salva el Planeta
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-xl md:text-2xl text-white/90 mb-10 max-w-3xl mx-auto leading-relaxed">
              Descubre packs sorpresa de tus restaurantes favoritos con hasta{' '}
              <span className="font-bold text-yellow-200">70% de descuento</span>.
              Comida increíble, precios increíbles, impacto real.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link
                href="/auth/signup-new"
                className="group relative inline-flex items-center gap-3 bg-white text-purple-600 px-8 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-2xl hover:shadow-3xl w-full sm:w-auto"
              >
                <span>🎉</span>
                <span>Comenzar Ahora</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
              
              <Link
                href="/packs"
                className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all hover:bg-white/20 w-full sm:w-auto"
              >
                <span>🔍</span>
                <span>Explorar Packs</span>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 md:gap-12 max-w-3xl mx-auto pt-8 border-t border-white/20">
              <div>
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">10K+</div>
                <div className="text-sm md:text-base text-white/80">Packs Salvados</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">500+</div>
                <div className="text-sm md:text-base text-white/80">Restaurantes</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">25 Ton</div>
                <div className="text-sm md:text-base text-white/80">CO₂ Evitado</div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg className="w-full h-16 md:h-24 fill-white" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
          </svg>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-20 md:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              ¿Cómo Funciona?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Tres simples pasos para salvar comida y ahorrar dinero
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            {/* Step 1 */}
            <div className="text-center group">
              <div className="relative inline-block mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center text-4xl transform group-hover:scale-110 transition-transform shadow-lg">
                  🔍
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center font-bold text-sm">
                  1
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Descubre</h3>
              <p className="text-gray-600 leading-relaxed">
                Explora packs sorpresa de restaurantes cerca de ti con grandes descuentos
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center group">
              <div className="relative inline-block mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center text-4xl transform group-hover:scale-110 transition-transform shadow-lg">
                  🛒
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center font-bold text-sm">
                  2
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Reserva</h3>
              <p className="text-gray-600 leading-relaxed">
                Elige tu pack favorito y completa tu pedido en segundos
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center group">
              <div className="relative inline-block mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center text-4xl transform group-hover:scale-110 transition-transform shadow-lg">
                  🎉
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center font-bold text-sm">
                  3
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Recoge</h3>
              <p className="text-gray-600 leading-relaxed">
                Pasa por el restaurante en el horario indicado y disfruta tu comida
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-purple-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
                Beneficios para Todos
              </h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-2xl">
                    💰
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Ahorra Dinero</h3>
                    <p className="text-gray-600">
                      Obtén comida deliciosa con hasta 70% de descuento del precio original
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-2xl">
                    🌱
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Reduce Desperdicio</h3>
                    <p className="text-gray-600">
                      Cada pack salvado evita que comida perfecta termine en la basura
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-2xl">
                    🏪
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Apoya Locales</h3>
                    <p className="text-gray-600">
                      Ayuda a restaurantes locales a reducir pérdidas y ser más sostenibles
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-2xl">
                    🎁
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Sorpresas Diarias</h3>
                    <p className="text-gray-600">
                      Descubre nuevos sabores y restaurantes cada día
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-purple-500 to-orange-500 rounded-3xl p-8 text-white shadow-2xl transform hover:scale-105 transition-transform">
                <div className="text-6xl mb-6">🌍</div>
                <h3 className="text-3xl font-bold mb-4">Tu Impacto Importa</h3>
                <p className="text-lg text-white/90 mb-6">
                  Únete a miles de personas que ya están haciendo la diferencia
                </p>
                <div className="space-y-4 bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                  <div className="flex justify-between items-center">
                    <span>Comida salvada</span>
                    <span className="font-bold text-xl">15,000 kg</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>CO₂ evitado</span>
                    <span className="font-bold text-xl">25 Ton</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Dinero ahorrado</span>
                    <span className="font-bold text-xl">$50,000</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 bg-gradient-to-r from-purple-600 to-orange-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            ¿Listo para Hacer la Diferencia?
          </h2>
          <p className="text-xl text-white/90 mb-10">
            Únete a nuestra comunidad y comienza a salvar comida hoy mismo
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signup-new"
              className="inline-flex items-center justify-center gap-3 bg-white text-purple-600 px-8 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-2xl"
            >
              <span>🚀</span>
              <span>Crear Cuenta Gratis</span>
            </Link>
            <Link
              href="/auth/signin"
              className="inline-flex items-center justify-center gap-3 bg-white/10 backdrop-blur-sm border-2 border-white text-white px-8 py-4 rounded-xl font-bold text-lg transition-all hover:bg-white/20"
            >
              <span>Iniciar Sesión</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">🍃 Zavo</h3>
              <p className="text-gray-400">
                Combatiendo el desperdicio de comida, un pack a la vez.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Para Usuarios</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/packs" className="hover:text-white">Explorar Packs</Link></li>
                <li><Link href="/auth/signup-new" className="hover:text-white">Registrarse</Link></li>
                <li><Link href="/auth/signin" className="hover:text-white">Iniciar Sesión</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Para Restaurantes</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/auth/signup-new" className="hover:text-white">Unirse como Socio</Link></li>
                <li><Link href="/dashboard" className="hover:text-white">Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Síguenos</h4>
              <div className="flex gap-4 text-2xl">
                <a href="#" className="hover:text-purple-400">📘</a>
                <a href="#" className="hover:text-purple-400">📷</a>
                <a href="#" className="hover:text-purple-400">🐦</a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Zavo. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
