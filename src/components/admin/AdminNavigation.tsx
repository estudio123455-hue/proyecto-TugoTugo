'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Building, 
  Users, 
  ShieldCheck, 
  BarChart3, 
  Settings,
  LogOut
} from 'lucide-react'
import { signOut } from 'next-auth/react'

const navigation = [
  {
    name: 'Dashboard',
    href: '/admin/verification-dashboard',
    icon: LayoutDashboard,
    description: 'Panel principal de administración'
  },
  {
    name: 'Restaurantes',
    href: '/admin/restaurants',
    icon: Building,
    description: 'Gestionar restaurantes'
  },
  {
    name: 'Usuarios',
    href: '/admin/users',
    icon: Users,
    description: 'Gestionar usuarios'
  },
  {
    name: 'Verificaciones',
    href: '/admin/verifications',
    icon: ShieldCheck,
    description: 'Sistema de verificación'
  },
  {
    name: 'Reportes',
    href: '/admin/reports',
    icon: BarChart3,
    description: 'Estadísticas y reportes'
  },
  {
    name: 'Configuración',
    href: '/admin/settings',
    icon: Settings,
    description: 'Configuración del sistema'
  }
]

export default function AdminNavigation() {
  const pathname = usePathname()

  const handleLogout = async () => {
    await signOut({ 
      callbackUrl: '/',
      redirect: true 
    })
  }

  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo y título */}
          <div className="flex items-center py-4">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold text-gray-900">
                🛡️ Panel de Administración
              </h1>
            </div>
          </div>

          {/* Navegación */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                  title={item.description}
                >
                  <item.icon className="w-4 h-4 mr-2" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* Logout */}
          <div className="flex items-center">
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar Sesión
            </button>
          </div>
        </div>

        {/* Navegación móvil */}
        <div className="md:hidden pb-4">
          <div className="grid grid-cols-2 gap-2">
            {navigation.slice(0, 4).map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="w-4 h-4 mr-2" />
                  {item.name}
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
