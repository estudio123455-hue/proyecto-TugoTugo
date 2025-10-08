'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import MenuEditor from '@/components/restaurant/MenuEditor'
import { Package, ShoppingCart, Menu, User, Home } from 'lucide-react'

export default function MenuPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (session && session.user.role !== 'ESTABLISHMENT') {
      router.push('/')
    }
  }, [session, status, router])

  if (status === 'loading' || !session || session.user.role !== 'ESTABLISHMENT') {
    return null
  }

  const navItems = [
    { name: 'Dashboard', href: '/restaurant-dashboard', icon: Home, active: false },
    { name: 'Packs', href: '/restaurant-dashboard/packs', icon: Package, active: false },
    { name: 'Órdenes', href: '/restaurant-dashboard/orders', icon: ShoppingCart, active: false },
    { name: 'Menú', href: '/restaurant-dashboard/menu', icon: Menu, active: true },
    { name: 'Perfil', href: '/restaurant-dashboard/profile', icon: User, active: false },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Gestión de Menú</h1>
            <Link href="/" className="text-orange-600 hover:text-orange-700 font-medium">
              Volver al inicio
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow mb-8">
          <nav className="flex overflow-x-auto">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 whitespace-nowrap
                  ${item.active ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'}
                  transition-colors
                `}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        <MenuEditor />
      </div>
    </div>
  )
}
