'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'

export default function WelcomeSimple() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/auth/signin')
      return
    }
  }, [session, status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <div className="max-w-lg w-full bg-white rounded-2xl shadow-2xl p-12 text-center">
          
          {/* Welcome Icon */}
          <div className="text-8xl mb-8">🌱</div>
          
          {/* Main Welcome Message */}
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            ¡Bienvenido a FoodSave, {session?.user?.name?.split(' ')[0]}!
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Descubre packs sorpresa y empieza a ahorrar mientras ayudas a reducir el desperdicio de comida.
          </p>
          
          {/* Gamification Stats */}
          <div className="bg-gradient-to-r from-green-100 to-blue-100 border border-green-200 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-center mb-3">
              <span className="text-2xl mr-2">🎉</span>
              <h3 className="text-lg font-bold text-green-800">¡Ya formas parte del movimiento!</h3>
            </div>
            <p className="text-green-700 text-sm font-medium">
              +1,000 personas han salvado más de 10,000 comidas
            </p>
            <div className="mt-4 bg-white rounded-lg p-3">
              <p className="text-green-600 font-bold text-lg">
                🎯 Tu misión: rescatar tu primer pack sorpresa
              </p>
            </div>
          </div>

          {/* Main CTA */}
          <Link
            href="/packs"
            className="block w-full bg-green-500 hover:bg-green-600 text-white px-8 py-5 rounded-xl text-xl font-bold transition-all transform hover:scale-105 shadow-2xl mb-4"
          >
            🗺️ Rescatar Mi Primer Pack
          </Link>
          
          {/* Secondary action */}
          <Link
            href="/packs"
            className="block w-full text-green-600 hover:text-green-700 px-4 py-2 text-sm font-medium"
          >
            Explorar packs disponibles →
          </Link>
        </div>

        {/* Additional info */}
        <div className="mt-8 max-w-md text-center">
          <div className="grid grid-cols-3 gap-6 text-sm text-gray-600">
            <div>
              <div className="text-2xl mb-2">💰</div>
              <div className="font-semibold">Ahorra hasta 50%</div>
            </div>
            <div>
              <div className="text-2xl mb-2">🌍</div>
              <div className="font-semibold">Salva el planeta</div>
            </div>
            <div>
              <div className="text-2xl mb-2">😋</div>
              <div className="font-semibold">Descubre sabores</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
