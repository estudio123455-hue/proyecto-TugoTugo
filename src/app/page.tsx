'use client'

import Link from 'next/link'
import SimpleNavigation from '@/components/SimpleNavigation'
import GlobalHeader from '@/components/GlobalHeader'
import { useSession } from 'next-auth/react'

export default function Home() {
  const { data: session } = useSession()

  return (
    <div className="min-h-screen bg-white">
      <SimpleNavigation />
      <GlobalHeader />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-tugo-500 to-terracota-400 pt-20 pb-32 md:pt-32 md:pb-40">
        {/* Simplified background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-10 -right-10 w-80 h-80 bg-terracota-300/20 rounded-full blur-2xl"></div>
          <div className="absolute bottom-10 left-1/3 w-72 h-72 bg-tugo-300/15 rounded-full blur-xl"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-6 py-3 mb-8 hover:bg-white/30 transition-colors">
              <span className="text-xl">🌱</span>
              <span className="text-white font-semibold">Únete al movimiento sostenible</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              <span className="block">Rescata Comida,</span>
              <span className="block bg-gradient-to-r from-terracota-200 to-yellow-200 bg-clip-text text-transparent">
                Cuida el Planeta
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-xl md:text-2xl text-white/95 mb-10 max-w-4xl mx-auto leading-relaxed">
              Conectamos personas conscientes con restaurantes locales para rescatar comida deliciosa{' '}
              <span className="font-bold text-terracota-200">con hasta 70% de descuento</span>.
              <br className="hidden md:block" />
              <span className="text-lg md:text-xl text-white/80 mt-2 block">Cada pack salvado es un paso hacia un futuro más sostenible.</span>
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link
                href={session?.user ? 
                  (session.user.role === 'ESTABLISHMENT' ? '/dashboard' : 
                   session.user.role === 'ADMIN' ? '/admin' : '/packs') 
                  : '/packs'}
                className="group relative inline-flex items-center gap-3 bg-white text-tugo-600 px-8 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-2xl hover:shadow-3xl w-full sm:w-auto"
              >
                <span>🎉</span>
                <span>{session?.user ? 'Ir a mi Dashboard' : 'Comenzar Ahora'}</span>
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

            {/* Impact Message */}
            <div className="max-w-2xl mx-auto pt-8 border-t border-white/20">
              <p className="text-center text-white/90 text-lg">
                Únete a miles de personas que ya están haciendo la diferencia.
                <br />
                <span className="font-semibold text-white">Cada pack salvado cuenta.</span>
              </p>
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
      <section className="py-20 md:py-32 bg-gradient-to-b from-white to-tugo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 bg-tugo-100 text-tugo-700 px-4 py-2 rounded-full font-semibold mb-6">
              <span>✨</span>
              <span>Proceso Simple</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
              Rescatar comida es muy fácil
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              En solo tres pasos puedes hacer la diferencia: ahorra dinero, disfruta comida deliciosa y contribuyes a un planeta más sostenible.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            {/* Step 1 */}
            <div className="text-center bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="relative inline-block mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-tugo-500 to-tugo-600 rounded-2xl flex items-center justify-center text-4xl shadow-md">
                  🗺️
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-terracota-400 rounded-full flex items-center justify-center font-bold text-white text-sm shadow-md">
                  1
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Explora cerca de ti</h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                Descubre restaurantes locales con packs sorpresa disponibles. Usa nuestro mapa interactivo para encontrar las mejores ofertas cerca.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="relative inline-block mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-terracota-500 to-terracota-600 rounded-2xl flex items-center justify-center text-4xl shadow-md">
                  💳
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-tugo-500 rounded-full flex items-center justify-center font-bold text-white text-sm shadow-md">
                  2
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Reserva y paga</h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                Selecciona tu pack favorito, paga de forma segura y recibe tu código QR de confirmación al instante.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="relative inline-block mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-tugo-600 rounded-2xl flex items-center justify-center text-4xl shadow-md">
                  🎁
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-terracota-400 rounded-full flex items-center justify-center font-bold text-white text-sm shadow-md">
                  3
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Recoge tu sorpresa</h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                Presenta tu código QR en el restaurante durante el horario indicado y disfruta tu comida rescatada.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Story Section */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-tugo-50 to-terracota-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 bg-terracota-100 text-terracota-700 px-4 py-2 rounded-full font-semibold mb-6">
                <span>🌍</span>
                <span>Impacto Real</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-8">
                Cada rescate cuenta
              </h2>
              <div className="space-y-8">
                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-tugo-100 to-tugo-200 rounded-2xl flex items-center justify-center text-3xl">
                    💰
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Ahorro inteligente</h3>
                    <p className="text-gray-600 text-lg leading-relaxed">
                      Disfruta comida gourmet con hasta <span className="font-bold text-terracota-600">70% de descuento</span>. Tu bolsillo y el planeta te lo agradecerán.
                    </p>
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-tugo-100 to-tugo-200 rounded-2xl flex items-center justify-center text-3xl">
                    🌱
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Acción climática</h3>
                    <p className="text-gray-600 text-lg leading-relaxed">
                      Cada pack rescatado evita <span className="font-bold text-tugo-600">2.1 kg de CO₂</span> y reduce el desperdicio alimentario que genera el 8% de las emisiones globales.
                    </p>
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-terracota-100 to-terracota-200 rounded-2xl flex items-center justify-center text-3xl">
                    🏦
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Comunidad local</h3>
                    <p className="text-gray-600 text-lg leading-relaxed">
                      Apoya a restaurantes locales y descubre nuevos sabores mientras construimos una economía circular más justa.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative order-1 lg:order-2">
              <div className="bg-gradient-to-br from-tugo-500 to-terracota-500 rounded-2xl p-8 text-white shadow-lg">
                <div className="text-6xl mb-6 text-center">🌍</div>
                <h3 className="text-3xl font-bold mb-6 text-center">Nuestro Impacto Colectivo</h3>
                <p className="text-lg text-white/90 mb-8 text-center">
                  Juntos estamos creando un futuro más sostenible
                </p>
                <div className="space-y-6 bg-white/15 backdrop-blur-sm rounded-2xl p-8">
                  <div className="flex justify-between items-center border-b border-white/20 pb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🍽️</span>
                      <span className="font-medium">Comida rescatada</span>
                    </div>
                    <span className="font-bold text-2xl">15,247 kg</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/20 pb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🍃</span>
                      <span className="font-medium">CO₂ evitado</span>
                    </div>
                    <span className="font-bold text-2xl">32.5 Ton</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/20 pb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">💵</span>
                      <span className="font-medium">Dinero ahorrado</span>
                    </div>
                    <span className="font-bold text-2xl">$89,340</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🎆</span>
                      <span className="font-medium">Restaurantes aliados</span>
                    </div>
                    <span className="font-bold text-2xl">847</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 bg-gradient-to-r from-tugo-600 to-terracota-500 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 text-6xl animate-float">🌱</div>
          <div className="absolute top-20 right-20 text-4xl animate-bounce-slow">🍽️</div>
          <div className="absolute bottom-20 left-1/4 text-5xl animate-pulse-soft">🌍</div>
          <div className="absolute bottom-10 right-10 text-3xl animate-float">✨</div>
        </div>
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-6 py-3 mb-8">
            <span className="text-2xl animate-bounce-slow">🚀</span>
            <span className="text-white font-semibold">Únete al Movimiento</span>
          </div>
          <h2 className="text-3xl md:text-6xl font-bold text-white mb-8">
            ¿Listo para rescatar comida?
          </h2>
          <p className="text-xl md:text-2xl text-white/95 mb-12 max-w-3xl mx-auto leading-relaxed">
            Cada acción cuenta. Comienza hoy tu impacto positivo en el planeta mientras disfrutas comida increíble a precios increíbles.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!session ? (
              <>
                <Link
                  href="/auth/signup"
                  className="inline-flex items-center justify-center gap-3 bg-white text-tugo-600 px-10 py-5 rounded-xl font-bold text-xl transition-all transform hover:scale-105 shadow-2xl hover:shadow-3xl"
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
              </>
            ) : (
              <Link
                href="/packs"
                className="inline-flex items-center justify-center gap-3 bg-white text-tugo-600 px-10 py-5 rounded-xl font-bold text-xl transition-all transform hover:scale-105 shadow-2xl hover:shadow-3xl"
              >
                <span>🔍</span>
                <span>Explorar Packs</span>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4 text-tugo-400">🌱 TugoTugo</h3>
              <p className="text-gray-400 leading-relaxed">
                Conectando personas conscientes con restaurantes locales para crear un futuro más sostenible, un pack rescatado a la vez.
              </p>
              <div className="mt-4 flex gap-4 text-sm text-gray-500">
                <span>🌍 Impacto real</span>
                <span>💰 Ahorro inteligente</span>
              </div>
            </div>
            <div>
              <h4 className="font-bold mb-4">Para Usuarios</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/packs" className="hover:text-white">Explorar Packs</Link></li>
                <li><Link href="/auth/signup" className="hover:text-white">Registrarse</Link></li>
                <li><Link href="/auth/signin" className="hover:text-white">Iniciar Sesión</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Para Restaurantes</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/auth/signup" className="hover:text-white">Unirse como Socio</Link></li>
                <li><Link href="/dashboard" className="hover:text-white">Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Síguenos</h4>
              <div className="flex gap-4 text-2xl">
                <a href="#" className="hover:text-tugo-400 transition-colors">📘</a>
                <a href="#" className="hover:text-terracota-400 transition-colors">📷</a>
                <a href="#" className="hover:text-tugo-400 transition-colors">🐦</a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 TugoTugo. Todos los derechos reservados. Hecho con 💚 para un planeta más sostenible.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
