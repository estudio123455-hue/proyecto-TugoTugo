'use client'

import { signIn, signOut } from 'next-auth/react'
import Link from 'next/link'
import { useCleanSession } from '@/hooks/useCleanSession'
import NotificationButton from './NotificationButton'
import { useState } from 'react'
import { usePathname } from 'next/navigation'

export default function Navigation() {
  const { data: session, status } = useCleanSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
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
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive('/') 
                  ? 'text-emerald-600 bg-emerald-50' 
                  : 'text-gray-700 hover:text-emerald-600 hover:bg-emerald-50'
              }`}
            >
              Home
            </Link>
            <Link
              href="/packs"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive('/packs') 
                  ? 'text-emerald-600 bg-emerald-50' 
                  : 'text-gray-700 hover:text-emerald-600 hover:bg-emerald-50'
              }`}
            >
              Packs
            </Link>
            <Link
              href="/restaurants"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
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
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
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
            
            {/* CTA Button */}
            <Link
              href="/packs"
              className="hidden md:inline-flex items-center px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-lg transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
            >
              <span className="mr-2">🎁</span>
              Ver nuevos packs
            </Link>

            {/* Notifications */}
            {session && <NotificationButton />}

            {/* User Menu */}
            {status === 'loading' ? (
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
            ) : session ? (
              <div className="hidden md:flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                    <span className="text-emerald-600 font-semibold text-sm">
                      {session.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {session.user?.name?.split(' ')[0] || 'Usuario'}
                  </span>
                </div>
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

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                href="/"
                className={`block px-3 py-2 rounded-lg text-base font-medium transition-colors ${
                  isActive('/') 
                    ? 'text-emerald-600 bg-emerald-50' 
                    : 'text-gray-700 hover:text-emerald-600 hover:bg-emerald-50'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/packs"
                className={`block px-3 py-2 rounded-lg text-base font-medium transition-colors ${
                  isActive('/packs') 
                    ? 'text-emerald-600 bg-emerald-50' 
                    : 'text-gray-700 hover:text-emerald-600 hover:bg-emerald-50'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Packs
              </Link>
              <Link
                href="/restaurants"
                className={`block px-3 py-2 rounded-lg text-base font-medium transition-colors ${
                  isActive('/restaurants') 
                    ? 'text-emerald-600 bg-emerald-50' 
                    : 'text-gray-700 hover:text-emerald-600 hover:bg-emerald-50'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Restaurantes
              </Link>
              {session && (
                <Link
                  href="/profile"
                  className={`block px-3 py-2 rounded-lg text-base font-medium transition-colors ${
                    isActive('/profile') 
                      ? 'text-emerald-600 bg-emerald-50' 
                      : 'text-gray-700 hover:text-emerald-600 hover:bg-emerald-50'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Mis Órdenes
                </Link>
              )}
              
              {/* Mobile Auth Buttons */}
              <div className="pt-4 border-t border-gray-200">
                {session ? (
                  <div className="px-3 py-2">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                        <span className="text-emerald-600 font-semibold text-sm">
                          {session.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        {session.user?.name || 'Usuario'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        signIn()
                        setMobileMenuOpen(false)
                      }}
                      className="block w-full text-left px-3 py-2 text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                    >
                      Iniciar Sesión
                    </button>
                    <Link
                      href="/auth/signup"
                      className="block px-3 py-2 bg-emerald-500 text-white rounded-lg text-center font-semibold"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Registrarse
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
