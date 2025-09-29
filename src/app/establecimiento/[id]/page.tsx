'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import PackCard from '@/components/PackCard'

interface Establishment {
  id: string
  name: string
  description: string | null
  address: string
  phone: string | null
  email: string | null
  image: string | null
  category: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface Pack {
  id: string
  title: string
  description: string
  originalPrice: number
  discountedPrice: number
  quantity: number
  availableFrom: string
  availableUntil: string
  pickupTimeStart: string
  pickupTimeEnd: string
  isActive: boolean
  establishment: Establishment
}

export default function EstablishmentProfile() {
  const params = useParams()
  const [establishment, setEstablishment] = useState<Establishment | null>(null)
  const [packs, setPacks] = useState<Pack[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (params.id) {
      fetchEstablishment(params.id as string)
    }
  }, [params.id])

  const fetchEstablishment = async (id: string) => {
    try {
      setLoading(true)

      // Fetch establishment details
      const establishmentResponse = await fetch(`/api/establishments/${id}`)
      if (!establishmentResponse.ok) {
        throw new Error('Establecimiento no encontrado')
      }
      const establishmentData = await establishmentResponse.json()
      setEstablishment(establishmentData)

      // Fetch packs from this establishment
      const packsResponse = await fetch(
        `/api/packs/public?establishmentId=${id}`
      )
      if (packsResponse.ok) {
        const packsData = await packsResponse.json()
        setPacks(packsData)
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Error al cargar el establecimiento'
      )
    } finally {
      setLoading(false)
    }
  }

  const getCategoryEmoji = (category: string) => {
    const categoryMap: { [key: string]: string } = {
      RESTAURANT: '🍽️',
      CAFE: '☕',
      BAKERY: '🥖',
      SUPERMARKET: '🛒',
      GROCERY: '🏪',
      OTHER: '🏢',
    }
    return categoryMap[category] || '🏢'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fresh-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando establecimiento...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !establishment) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="text-6xl mb-4">😔</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Establecimiento no encontrado
            </h2>
            <p className="text-gray-600 mb-6">
              {error ||
                'El establecimiento que buscas no existe o no está disponible'}
            </p>
            <Link
              href="/packs"
              className="inline-flex items-center bg-fresh-600 hover:bg-fresh-700 text-white px-6 py-3 rounded-xl font-semibold transition-all"
            >
              Ver todos los establecimientos
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      {/* Hero Section */}
      <section className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex flex-col lg:flex-row items-start gap-8">
            {/* Establishment Image */}
            <div className="w-full lg:w-1/3">
              <div className="aspect-square bg-gradient-to-br from-fresh-100 to-warm-100 rounded-2xl flex items-center justify-center overflow-hidden">
                {establishment.image ? (
                  <img
                    src={establishment.image}
                    alt={establishment.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-8xl">
                    {getCategoryEmoji(establishment.category)}
                  </span>
                )}
              </div>
            </div>

            {/* Establishment Info */}
            <div className="w-full lg:w-2/3">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-2">
                    {establishment.name}
                  </h1>
                  <div className="flex items-center text-gray-600 mb-4">
                    <span className="mr-2">
                      {getCategoryEmoji(establishment.category)}
                    </span>
                    <span className="capitalize">
                      {establishment.category.toLowerCase()}
                    </span>
                  </div>
                </div>
              </div>

              {establishment.description && (
                <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                  {establishment.description}
                </p>
              )}

              {/* Contact Info */}
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center text-gray-600">
                  <span className="mr-3 text-xl">📍</span>
                  <span>{establishment.address}</span>
                </div>

                {establishment.phone && (
                  <div className="flex items-center text-gray-600">
                    <span className="mr-3 text-xl">📞</span>
                    <a
                      href={`tel:${establishment.phone}`}
                      className="hover:text-fresh-600 transition-colors"
                    >
                      {establishment.phone}
                    </a>
                  </div>
                )}

                {establishment.email && (
                  <div className="flex items-center text-gray-600">
                    <span className="mr-3 text-xl">📧</span>
                    <a
                      href={`mailto:${establishment.email}`}
                      className="hover:text-fresh-600 transition-colors"
                    >
                      {establishment.email}
                    </a>
                  </div>
                )}
              </div>

              {/* Status Badge */}
              <div className="inline-flex items-center">
                <div
                  className={`px-4 py-2 rounded-full text-sm font-medium ${
                    establishment.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  <span className="mr-2">
                    {establishment.isActive ? '✅' : '❌'}
                  </span>
                  {establishment.isActive ? 'Activo' : 'Inactivo'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Packs Section */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              Packs disponibles
            </h2>
            <span className="bg-fresh-100 text-fresh-800 px-3 py-1 rounded-full text-sm font-medium">
              {packs.filter(pack => pack.isActive).length} disponibles
            </span>
          </div>

          {packs.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {packs
                .filter(pack => pack.isActive)
                .map(pack => (
                  <PackCard key={pack.id} pack={pack} />
                ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No hay packs disponibles
              </h3>
              <p className="text-gray-600 mb-6">
                Este establecimiento no tiene packs disponibles en este momento
              </p>
              <Link
                href="/packs"
                className="inline-flex items-center text-fresh-600 hover:text-fresh-700 font-semibold"
              >
                Ver otros establecimientos
                <span className="ml-2">→</span>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-gradient-to-r from-fresh-600 to-warm-500 py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            ¿Te gusta {establishment.name}?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Descubre más establecimientos como este y ayuda a reducir el
            desperdicio de comida
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/packs"
              className="inline-flex items-center bg-white text-fresh-600 hover:bg-gray-50 px-8 py-4 rounded-xl font-semibold transition-all shadow-lg"
            >
              <span className="mr-2">🔍</span>
              Explorar más establecimientos
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
