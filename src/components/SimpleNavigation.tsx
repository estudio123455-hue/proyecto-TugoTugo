'use client'

import Link from 'next/link'
import { useCleanSession } from '@/hooks/useCleanSession'
import { usePathname } from 'next/navigation'
import { UserMenu } from '@/components/LogoutButton'
import { signIn } from 'next-auth/react'

export default function SimpleNavigation() {
  const { data: session, status } = useCleanSession()
  const pathname = usePathname()

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true
    if (path !== '/' && pathname?.startsWith(path)) return true
    return false
  }

  return (
    <nav className="fixed top-0 left-0 right-0 w-full z-[100] bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Left: Logo + Brand */}
          <div className="flex items-center">
            <Link 
              href="/"
              className="flex items-center text-xl font-bold text-emerald-500 tracking-tight hover:text-emerald-600 transition-colors"
            >
              🌿 <span className="ml-2 text-gray-900">Zavo</span>
            </Link>
          </div>

          {/* Center: Main Navigation (Desktop) */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
                isActive('/') 
                  ? 'text-emerald-600 bg-emerald-50' 
                  : 'text-gray-700 hover:text-emerald-600 hover:bg-emerald-50'
              }`}
            >
              Home
            </Link>
            <Link
              href="/packs"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
                isActive('/packs') 
                  ? 'text-emerald-600 bg-emerald-50' 
                  : 'text-gray-700 hover:text-emerald-600 hover:bg-emerald-50'
              }`}
            >
              Packs
            </Link>
            <Link
              href="/restaurants"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
                isActive('/restaurants') 
                  ? 'text-emerald-600 bg-emerald-50' 
                  : 'text-gray-700 hover:text-emerald-600 hover:bg-emerald-50'
              }`}
            >
              Restaurantes
            </Link>
            {session && (
              <Link
                href="/profile"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
                  isActive('/profile') 
                    ? 'text-emerald-600 bg-emerald-50' 
                    : 'text-gray-700 hover:text-emerald-600 hover:bg-emerald-50'
                }`}
              >
                Mis Órdenes
              </Link>
            )}
          </div>

          {/* Right: Secondary Actions */}
          <div className="flex items-center space-x-4">
            
            {/* User Menu */}
            {status === 'authenticated' && session ? (
              <div className="flex items-center space-x-3">
                <UserMenu 
                  user={session.user}
                  onSignOut={() => {}}
                />
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-3">
                <button
                  onClick={() => signIn()}
                  className="text-gray-700 hover:text-emerald-600 px-3 py-2 text-sm font-medium transition-colors"
                >
                  Iniciar Sesión
                </button>
                <Link
                  href="/auth/signup"
                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  Registrarse
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
