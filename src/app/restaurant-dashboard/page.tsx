'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import RestaurantStats from '@/components/restaurant/RestaurantStats'
import { Package, ShoppingCart, Menu, User, Home } from 'lucide-react'

export default function RestaurantDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (session && session.user.role !== 'ESTABLISHMENT') {
      router.push('/')
    }
  }, [session, status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    )
  }

  if (!session || session.user.role !== 'ESTABLISHMENT') {
    return null
  }

  const navItems = [
    {
      name: 'Dashboard',
      href: '/restaurant-dashboard',
      icon: Home,
      active: true,
    },
    {
      name: 'Packs',
      href: '/restaurant-dashboard/packs',
      icon: Package,
      active: false,
    },
    {
      name: 'Órdenes',
      href: '/restaurant-dashboard/orders',
      icon: ShoppingCart,
      active: false,
    },
    {
      name: 'Menú',
      href: '/restaurant-dashboard/menu',
      icon: Menu,
      active: false,
    },
    {
      name: 'Perfil',
      href: '/restaurant-dashboard/profile',
      icon: User,
      active: false,
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Dashboard del Restaurante
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Bienvenido, {session.user.name || session.user.email}
              </p>
            </div>
            <Link
              href="/"
              className="text-orange-600 hover:text-orange-700 font-medium"
            >
              Volver al inicio
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow mb-8">
          <nav className="flex overflow-x-auto">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 whitespace-nowrap
                  ${
                    item.active
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                  }
                  transition-colors
                `}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        {/* Stats Section */}
        <RestaurantStats />

        {/* Quick Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              📋 Guía Rápida
            </h3>
            <ul className="space-y-3 text-sm text-gray-700">
              <li className="flex items-start">
                <span className="text-orange-500 mr-2">•</span>
                <span>
                  <strong>Packs:</strong> Crea y gestiona tus packs sorpresa con horarios y precios
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-orange-500 mr-2">•</span>
                <span>
                  <strong>Órdenes:</strong> Revisa y actualiza el estado de las órdenes recibidas
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-orange-500 mr-2">•</span>
                <span>
                  <strong>Menú:</strong> Administra los items de tu menú y sus detalles
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-orange-500 mr-2">•</span>
                <span>
                  <strong>Perfil:</strong> Actualiza la información de tu establecimiento
                </span>
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-pink-50 rounded-lg shadow p-6 border border-orange-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              💡 Consejos para el Éxito
            </h3>
            <ul className="space-y-3 text-sm text-gray-700">
              <li className="flex items-start">
                <span className="text-orange-500 mr-2">✓</span>
                <span>Mantén tus packs actualizados con cantidades precisas</span>
              </li>
              <li className="flex items-start">
                <span className="text-orange-500 mr-2">✓</span>
                <span>Responde rápidamente a las órdenes para mejor experiencia</span>
              </li>
              <li className="flex items-start">
                <span className="text-orange-500 mr-2">✓</span>
                <span>Actualiza tu menú regularmente para atraer más clientes</span>
              </li>
              <li className="flex items-start">
                <span className="text-orange-500 mr-2">✓</span>
                <span>Completa tu perfil con fotos y descripción atractiva</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
