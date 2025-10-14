'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCleanSession } from '@/hooks/useCleanSession'
import LogoutButton from '@/components/LogoutButton'

export default function BottomNavigation() {
  const pathname = usePathname()
  const { data: session } = useCleanSession()

  // No mostrar en páginas de auth o admin
  if (pathname?.startsWith('/auth') || pathname?.startsWith('/admin')) {
    return null
  }

  // Navegación para usuarios normales
  const userNavItems = [
    { href: '/', icon: '🏠', label: 'Home' },
    { href: '/packs', icon: '📦', label: 'Packs' },
    { href: '/restaurants', icon: '🏪', label: 'Restaurantes' },
    { href: '/profile', icon: '👤', label: 'Perfil' },
  ]

  // Navegación para establecimientos
  const establishmentNavItems = [
    { href: '/dashboard', icon: '📊', label: 'Dashboard' },
    { href: '/restaurant/packs', icon: '📦', label: 'Packs' },
    { href: '/restaurant/orders', icon: '🛒', label: 'Órdenes' },
    { href: '/profile', icon: '👤', label: 'Perfil' },
  ]

  const navItems = session?.user?.role === 'ESTABLISHMENT' ? establishmentNavItems : userNavItems

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== '/' && pathname?.startsWith(item.href))
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 py-2 px-1 transition-colors ${
                isActive 
                  ? 'text-emerald-600 font-semibold' 
                  : 'text-gray-800 hover:text-gray-900'
              }`}
            >
              <div className="text-xl mb-1">{item.icon}</div>
              <span className={`text-xs leading-tight ${isActive ? 'font-bold' : 'font-semibold'}`}>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
