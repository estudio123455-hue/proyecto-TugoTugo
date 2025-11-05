'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCleanSession } from '@/hooks/useCleanSession'
import { UserMenu } from '@/components/LogoutButton'
import { signIn } from 'next-auth/react'
import { memo } from 'react'

// Memoized navigation component for maximum performance
const UltraFastNavigation = memo(function UltraFastNavigation() {
  const pathname = usePathname()
  const { data: session, status } = useCleanSession()

  // Ultra-fast active check with memoization
  const isActive = (path: string) => pathname === path || (path !== '/' && pathname?.startsWith(path))

  return (
    <nav className="fixed top-0 left-0 right-0 w-full z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo - No hover effects for max performance */}
          <Link 
            href="/"
            className="flex items-center text-xl font-bold text-emerald-600"
            prefetch={true}
          >
            🌿 <span className="ml-2 text-gray-900">TugoTugo</span>
          </Link>

          {/* Main Navigation - Simplified classes for performance */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              href="/"
              prefetch={true}
              className={isActive('/') 
                ? 'px-4 py-2 text-sm font-medium text-emerald-600 bg-emerald-50 rounded-lg' 
                : 'px-4 py-2 text-sm font-medium text-gray-700 hover:text-emerald-600 rounded-lg'
              }
            >
              Home
            </Link>
            
            <Link
              href="/packs"
              prefetch={true}
              className={isActive('/packs') 
                ? 'px-4 py-2 text-sm font-medium text-emerald-600 bg-emerald-50 rounded-lg' 
                : 'px-4 py-2 text-sm font-medium text-gray-700 hover:text-emerald-600 rounded-lg'
              }
            >
              Packs
            </Link>
            
            <Link
              href="/restaurants"
              prefetch={true}
              className={isActive('/restaurants') 
                ? 'px-4 py-2 text-sm font-medium text-emerald-600 bg-emerald-50 rounded-lg' 
                : 'px-4 py-2 text-sm font-medium text-gray-700 hover:text-emerald-600 rounded-lg'
              }
            >
              Restaurantes
            </Link>

            {/* Profile link only if authenticated */}
            {status === 'authenticated' && session && (
              <Link
                href="/profile"
                prefetch={true}
                className={isActive('/profile') 
                  ? 'px-4 py-2 text-sm font-medium text-emerald-600 bg-emerald-50 rounded-lg' 
                  : 'px-4 py-2 text-sm font-medium text-gray-700 hover:text-emerald-600 rounded-lg'
                }
              >
                Mis Órdenes
              </Link>
            )}
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {status === 'authenticated' && session ? (
              <UserMenu 
                userName={session.user?.name || ''}
                userEmail={session.user?.email || ''}
                userAvatar={session.user?.image || ''}
              />
            ) : status === 'unauthenticated' ? (
              <button
                onClick={() => signIn()}
                className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg"
              >
                Iniciar Sesión
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-gray-200/50 bg-white/95">
        <div className="flex justify-around py-2">
          <Link
            href="/"
            prefetch={true}
            className={`flex flex-col items-center py-2 px-3 text-xs ${
              isActive('/') ? 'text-emerald-600' : 'text-gray-600'
            }`}
          >
            <span className="text-lg mb-1">🏠</span>
            Home
          </Link>
          
          <Link
            href="/packs"
            prefetch={true}
            className={`flex flex-col items-center py-2 px-3 text-xs ${
              isActive('/packs') ? 'text-emerald-600' : 'text-gray-600'
            }`}
          >
            <span className="text-lg mb-1">📦</span>
            Packs
          </Link>
          
          <Link
            href="/restaurants"
            prefetch={true}
            className={`flex flex-col items-center py-2 px-3 text-xs ${
              isActive('/restaurants') ? 'text-emerald-600' : 'text-gray-600'
            }`}
          >
            <span className="text-lg mb-1">🍽️</span>
            Restaurantes
          </Link>

          {status === 'authenticated' && session && (
            <Link
              href="/profile"
              prefetch={true}
              className={`flex flex-col items-center py-2 px-3 text-xs ${
                isActive('/profile') ? 'text-emerald-600' : 'text-gray-600'
              }`}
            >
              <span className="text-lg mb-1">👤</span>
              Perfil
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
})

export default UltraFastNavigation
