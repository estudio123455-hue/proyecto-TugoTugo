'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function Welcome() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [preferences, setPreferences] = useState({
    city: '',
    foodTypes: [] as string[],
    location: null as { lat: number; lng: number } | null,
  })

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin')
      return
    }
  }, [session, status, router])

  const handleLocationRequest = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          setPreferences({
            ...preferences,
            location: {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            },
          })
          setCurrentStep(2)
        },
        error => {
          console.error('Error getting location:', error)
          // Si no puede obtener ubicación, continúa al paso 2
          setCurrentStep(2)
        }
      )
    } else {
      setCurrentStep(2)
    }
  }

  const foodOptions = [
    { id: 'pizza', name: '🍕 Pizza', emoji: '🍕' },
    { id: 'sushi', name: '🍣 Sushi', emoji: '🍣' },
    { id: 'burger', name: '🍔 Hamburguesas', emoji: '🍔' },
    { id: 'healthy', name: '🥗 Saludable', emoji: '🥗' },
    { id: 'dessert', name: '🍰 Postres', emoji: '🍰' },
    { id: 'coffee', name: '☕ Café & Panadería', emoji: '☕' },
    { id: 'asian', name: '🥢 Asiática', emoji: '🥢' },
    { id: 'mexican', name: '🌮 Mexicana', emoji: '🌮' },
  ]

  const toggleFoodPreference = (foodId: string) => {
    setPreferences({
      ...preferences,
      foodTypes: preferences.foodTypes.includes(foodId)
        ? preferences.foodTypes.filter(id => id !== foodId)
        : [...preferences.foodTypes, foodId],
    })
  }

  const handleFinish = () => {
    // Aquí podrías guardar las preferencias del usuario
    router.push('/packs')
  }

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
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Step 1: Welcome */}
          {currentStep === 1 && (
            <>
              <div className="text-6xl mb-6">🌱</div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                ¡Bienvenido a FoodSave, {session?.user?.name?.split(' ')[0]}!
              </h1>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Descubre packs sorpresa y empieza a ahorrar mientras ayudas a
                reducir el desperdicio de comida.
              </p>

              {/* Gamification touch */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
                <p className="text-green-800 text-sm font-medium">
                  🎉 Ya formas parte de +1,000 personas que han salvado más de
                  10,000 comidas
                </p>
              </div>

              <div className="space-y-4">
                <button
                  onClick={handleLocationRequest}
                  className="w-full bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-xl text-lg font-bold transition-all transform hover:scale-105 shadow-lg"
                >
                  📍 Buscar Packs Cerca de Mí
                </button>

                <Link
                  href="/packs"
                  className="block w-full text-green-600 hover:text-green-700 px-4 py-2 text-sm font-medium"
                >
                  Omitir y explorar →
                </Link>
              </div>
            </>
          )}

          {/* Step 2: Food Preferences */}
          {currentStep === 2 && (
            <>
              <div className="text-5xl mb-6">🍽️</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                ¿Qué tipo de comida te gusta?
              </h2>
              <p className="text-gray-600 mb-6">
                Selecciona tus favoritas para personalizar tu experiencia
              </p>

              <div className="grid grid-cols-2 gap-3 mb-8">
                {foodOptions.map(food => (
                  <button
                    key={food.id}
                    onClick={() => toggleFoodPreference(food.id)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      preferences.foodTypes.includes(food.id)
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 hover:border-green-300 text-gray-700'
                    }`}
                  >
                    <div className="text-2xl mb-1">{food.emoji}</div>
                    <div className="text-xs font-medium">
                      {food.name.replace(food.emoji + ' ', '')}
                    </div>
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleFinish}
                  className="w-full bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-xl text-lg font-bold transition-all shadow-lg"
                >
                  🚀 ¡Rescatar mi Primer Pack!
                </button>

                <button
                  onClick={handleFinish}
                  className="w-full text-gray-500 hover:text-gray-700 px-4 py-2 text-sm"
                >
                  Continuar sin preferencias
                </button>
              </div>
            </>
          )}

          {/* Progress indicator */}
          <div className="flex justify-center mt-6 space-x-2">
            <div
              className={`w-2 h-2 rounded-full ${currentStep >= 1 ? 'bg-green-500' : 'bg-gray-300'}`}
            ></div>
            <div
              className={`w-2 h-2 rounded-full ${currentStep >= 2 ? 'bg-green-500' : 'bg-gray-300'}`}
            ></div>
          </div>
        </div>

        {/* Skip all button */}
        <Link
          href="/packs"
          className="mt-6 text-gray-500 hover:text-gray-700 text-sm underline"
        >
          Saltar bienvenida
        </Link>
      </div>
    </div>
  )
}
