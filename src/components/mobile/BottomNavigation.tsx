'use client'

import { usePathname, useRouter } from 'next/navigation'
import { Home, Map, Package, User, ShoppingCart } from 'lucide-react'
import { useSession } from 'next-auth/react'

interface NavItem {
  name: string
  icon: React.ElementType
  href: string
  badge?: number
  requiresAuth?: boolean
}

export default function BottomNavigation() {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()

  // Ocultar la navegación completamente
  return null

  // Código original comentado por si lo necesitas después
  /*
  // Ocultar la navegación en páginas de autenticación y dashboard
  const hideNavigation = 
    pathname?.startsWith('/auth') || 
    pathname === '/register' ||
    pathname?.startsWith('/dashboard')

  if (hideNavigation) {
    return null
  }
  */

  const navItems: NavItem[] = [
    {
      name: 'Inicio',
      icon: Home,
      href: '/landing',
    },
    {
      name: 'Mapa',
      icon: Map,
      href: '/map',
    },
    {
      name: 'Packs',
      icon: Package,
      href: '/packs',
    },
    {
      name: 'Órdenes',
      icon: ShoppingCart,
      href: '/orders',
      requiresAuth: true,
    },
    {
      name: 'Perfil',
      icon: User,
      href: session ? '/profile' : '/auth/signin',
    },
  ]

  const handleNavigation = (item: NavItem) => {
    if (item.requiresAuth && !session) {
      router.push('/auth/signin')
    } else {
      router.push(item.href)
    }
  }

  const isActive = (href: string) => {
    if (href === '/landing') {
      return pathname === '/' || pathname === '/landing'
    }
    return pathname.startsWith(href)
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden safe-area-bottom">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)

          return (
            <button
              key={item.name}
              onClick={() => handleNavigation(item)}
              className={`
                flex flex-col items-center justify-center flex-1 h-full relative
                transition-colors duration-200
                ${active ? 'text-orange-500' : 'text-gray-600'}
                active:bg-gray-100
              `}
            >
              <div className="relative">
                <Icon className={`w-6 h-6 ${active ? 'stroke-[2.5]' : 'stroke-2'}`} />
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </div>
              <span className={`text-xs mt-1 ${active ? 'font-semibold' : 'font-medium'}`}>
                {item.name}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
