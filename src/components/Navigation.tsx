'use client'

import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { useCleanSession } from '@/hooks/useCleanSession'
import { usePathname, useRouter } from 'next/navigation'
import { UserMenu } from '@/components/LogoutButton'
import { useState, useCallback } from 'react'

export default function Navigation() {
  const { data: session, status } = useCleanSession()
  const pathname = usePathname()
  const router = useRouter()
  const [isNavigating, setIsNavigating] = useState(false)
  const [targetPath, setTargetPath] = useState('')

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true
    if (path !== '/' && pathname?.startsWith(path)) return true
    return false
  }

  const handleNavigation = useCallback((href: string, e: React.MouseEvent) => {
    e.preventDefault()
    
    if (pathname === href) return // Already on this page
    
    setIsNavigating(true)
    setTargetPath(href)
    
    // Add smooth transition
    setTimeout(() => {
      router.push(href)
      setTimeout(() => {
        setIsNavigating(false)
        setTargetPath('')
      }, 300)
    }, 150)
  }, [pathname, router])

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
              onClick={(e) => handleNavigation('/', e)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 relative ${
                isActive('/') 
                  ? 'text-emerald-600 bg-emerald-50' 
                  : 'text-gray-700 hover:text-emerald-600 hover:bg-emerald-50'
              } ${isNavigating && targetPath === '/' ? 'opacity-50' : ''}`}
            >
              Home
              {isNavigating && targetPath === '/' && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </Link>
            <Link
              href="/packs"
              onClick={(e) => handleNavigation('/packs', e)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 relative ${
                isActive('/packs') 
                  ? 'text-emerald-600 bg-emerald-50' 
                  : 'text-gray-700 hover:text-emerald-600 hover:bg-emerald-50'
              } ${isNavigating && targetPath === '/packs' ? 'opacity-50' : ''}`}
            >
              Packs
              {isNavigating && targetPath === '/packs' && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </Link>
            <Link
              href="/restaurants"
              onClick={(e) => handleNavigation('/restaurants', e)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 relative ${
                isActive('/restaurants') 
                  ? 'text-emerald-600 bg-emerald-50' 
                  : 'text-gray-700 hover:text-emerald-600 hover:bg-emerald-50'
              } ${isNavigating && targetPath === '/restaurants' ? 'opacity-50' : ''}`}
            >
              Restaurantes
              {isNavigating && targetPath === '/restaurants' && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </Link>
            {session && (
              <Link
                href="/profile"
                onClick={(e) => handleNavigation('/profile', e)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 relative ${
                  isActive('/profile') 
                    ? 'text-emerald-600 bg-emerald-50' 
                    : 'text-gray-700 hover:text-emerald-600 hover:bg-emerald-50'
                } ${isNavigating && targetPath === '/profile' ? 'opacity-50' : ''}`}
              >
                Mis Órdenes
                {isNavigating && targetPath === '/profile' && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </Link>
            )}
          </div>

          {/* Right: Secondary Actions */}
          <div className="flex items-center space-x-4">
            
            {/* Notifications removed */}

            {/* User Menu */}
            {status === 'loading' ? (
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
            ) : session ? (
              <div className="hidden md:flex items-center">
                <UserMenu 
                  userName={session.user?.name || 'Usuario'}
                  userEmail={session.user?.email || ''}
                  userAvatar={session.user?.image || undefined}
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

            {/* Mobile menu button - OCULTO porque usamos navegación inferior */}
          </div>
        </div>

        {/* Mobile Menu - REMOVIDO porque usamos navegación inferior */}
      </div>
      
      {/* Loading bar */}
      {isNavigating && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500">
          <div className="h-full bg-emerald-600 animate-pulse"></div>
        </div>
      )}
    </nav>
  )
}
