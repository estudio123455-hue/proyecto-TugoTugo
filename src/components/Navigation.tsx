'use client'

import { signIn, signOut } from 'next-auth/react'
import Link from 'next/link'
import { useState } from 'react'
import { getFirstName, getUserInitials } from '@/lib/user-utils'
import { useCleanSession } from '@/hooks/useCleanSession'
import ThemeToggle from './ThemeToggle'
import NotificationButton from './NotificationButton'

export default function Navigation() {
  const { data: session, status } = useCleanSession()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const getRoleDisplay = (role?: string) => {
    switch (role) {
      case 'CUSTOMER':
        return '🛒 Cliente'
      case 'ESTABLISHMENT':
        return '🏪 Restaurante'
      case 'ADMIN':
        return '🔧 Admin'
      default:
        return '👤 Usuario'
    }
  }

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-lg border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          <div className="flex items-center min-w-0">
            <Link 
              href={session?.user?.role === 'ESTABLISHMENT' ? '/dashboard' : session?.user?.role === 'ADMIN' ? '/admin' : session ? '/packs' : '/'}
              className="flex-shrink-0 flex items-center"
            >
              <span className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600 dark:text-green-400 whitespace-nowrap">
                🍃 FoodSave
              </span>
            </Link>

            <div className="hidden md:block ml-10">
              <div className="flex items-baseline space-x-4">
                <Link
                  href={session?.user?.role === 'ESTABLISHMENT' ? '/dashboard' : session?.user?.role === 'ADMIN' ? '/admin' : session ? '/packs' : '/'}
                  className="text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Home
                </Link>
                {/* Links según el rol */}
                {session?.user?.role === 'ADMIN' ? (
                  // Admin ve: Admin Panel
                  <Link
                    href="/admin"
                    className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium flex items-center"
                  >
                    🔧 Admin Panel
                  </Link>
                ) : session?.user?.role === 'ESTABLISHMENT' ? (
                  // Restaurante ve: Dashboard
                  <Link
                    href="/dashboard"
                    className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium flex items-center"
                  >
                    📊 Dashboard
                  </Link>
                ) : (
                  // Cliente ve: Find Packs, Restaurants, Feed
                  <>
                    <Link
                      href="/packs"
                      className="text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 px-3 py-2 rounded-md text-sm font-medium flex items-center"
                    >
                      🗺️ Find Packs
                    </Link>
                    <Link
                      href="/restaurants"
                      className="text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 px-3 py-2 rounded-md text-sm font-medium flex items-center"
                    >
                      🍽️ Restaurants
                    </Link>
                    <Link
                      href="/feed"
                      className="text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 px-3 py-2 rounded-md text-sm font-medium flex items-center"
                    >
                      📱 Feed
                    </Link>
                    {session && (
                      <Link
                        href="/profile"
                        className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium flex items-center"
                      >
                        📦 My Orders
                      </Link>
                    )}
                  </>
                )}
                <Link
                  href="/how-it-works"
                  className="text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 px-3 py-2 rounded-md text-sm font-medium"
                >
                  How it Works
                </Link>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-4">
            {/* Theme Toggle */}
            <ThemeToggle />
            
            {/* Notification Button - Solo para usuarios autenticados */}
            {session && <NotificationButton />}
            
            {status === 'loading' ? (
              <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-8 w-16 sm:w-20 rounded"></div>
            ) : session ? (
              <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-4">
                {/* User Menu Dropdown */}
                <div className="relative group">
                  <button className="flex items-center space-x-1 sm:space-x-2 lg:space-x-3 text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 px-2 sm:px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
                    {/* User Avatar */}
                    <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-xs sm:text-sm">
                      {getUserInitials(session.user?.name, session.user?.email)}
                    </div>
                    <div className="hidden lg:block text-left">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {getFirstName(session.user?.name)}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {getRoleDisplay(session.user?.role)}
                      </div>
                    </div>
                    <svg
                      className="w-4 h-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-600 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                          {getUserInitials(session.user?.name, session.user?.email)}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-gray-100">
                            {getFirstName(session.user?.name)}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {session.user?.email}
                          </div>
                          <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                            {getRoleDisplay(session.user?.role)}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-2">
                      {session.user?.role === 'ADMIN' ? (
                        <>
                          <Link
                            href="/admin"
                            className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-green-50 hover:text-green-600 rounded-lg transition-colors"
                          >
                            <span className="text-lg">🔧</span>
                            <div>
                              <div className="font-medium">Admin Panel</div>
                              <div className="text-xs text-gray-500">
                                Gestionar plataforma
                              </div>
                            </div>
                          </Link>
                        </>
                      ) : session.user?.role === 'ESTABLISHMENT' ? (
                        <>
                          <Link
                            href="/dashboard"
                            className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-green-50 hover:text-green-600 rounded-lg transition-colors"
                          >
                            <span className="text-lg">📊</span>
                            <div>
                              <div className="font-medium">Dashboard</div>
                              <div className="text-xs text-gray-500">
                                Gestionar tu restaurante
                              </div>
                            </div>
                          </Link>
                          <Link
                            href="/profile"
                            className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-green-50 hover:text-green-600 rounded-lg transition-colors"
                          >
                            <span className="text-lg">👤</span>
                            <div>
                              <div className="font-medium">Mi Perfil</div>
                              <div className="text-xs text-gray-500">
                                Configuración de cuenta
                              </div>
                            </div>
                          </Link>
                        </>
                      ) : (
                        <>
                          <Link
                            href="/packs"
                            className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-green-50 hover:text-green-600 rounded-lg transition-colors"
                          >
                            <span className="text-lg">🍽️</span>
                            <div>
                              <div className="font-medium">Explorar Packs</div>
                              <div className="text-xs text-gray-500">
                                Encuentra ofertas cerca
                              </div>
                            </div>
                          </Link>
                          <Link
                            href="/profile"
                            className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-green-50 hover:text-green-600 rounded-lg transition-colors"
                          >
                            <span className="text-lg">📦</span>
                            <div>
                              <div className="font-medium">Mis Órdenes</div>
                              <div className="text-xs text-gray-500">
                                Historial y reservas
                              </div>
                            </div>
                          </Link>
                          <Link
                            href="/profile"
                            className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-green-50 hover:text-green-600 rounded-lg transition-colors"
                          >
                            <span className="text-lg">🌱</span>
                            <div>
                              <div className="font-medium">Mi Impacto</div>
                              <div className="text-xs text-gray-500">
                                Comida salvada
                              </div>
                            </div>
                          </Link>
                        </>
                      )}

                      <hr className="my-2 border-gray-200" />

                      <button
                        onClick={() => signOut()}
                        className="flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors w-full text-left"
                      >
                        <span className="text-lg">🚪</span>
                        <div>
                          <div className="font-medium">Cerrar Sesión</div>
                          <div className="text-xs text-red-500">
                            Salir de la cuenta
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-1 sm:space-x-2">
                <button
                  onClick={() => signIn()}
                  className="text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium"
                >
                  <span className="hidden sm:inline">Iniciar Sesión</span>
                  <span className="sm:hidden">Entrar</span>
                </button>
                <Link
                  href="/packs"
                  className="bg-green-500 hover:bg-green-600 text-white px-3 sm:px-4 lg:px-6 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all shadow-lg whitespace-nowrap"
                >
                  <span className="hidden sm:inline">🗺️ Encuentra Packs</span>
                  <span className="sm:hidden">🗺️ Packs</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <svg
                className="h-6 w-6"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 24 24"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link
                href={session?.user?.role === 'ESTABLISHMENT' ? '/dashboard' : session?.user?.role === 'ADMIN' ? '/admin' : session ? '/packs' : '/'}
                className="text-gray-700 hover:text-green-600 block px-3 py-2 rounded-md text-base font-medium"
              >
                Home
              </Link>
              <Link
                href="/map"
                className="text-gray-700 hover:text-green-600 block px-3 py-2 rounded-md text-base font-medium"
              >
                Map
              </Link>
              {session?.user?.role === 'ESTABLISHMENT' && (
                <Link
                  href="/dashboard"
                  className="text-gray-700 hover:text-green-600 block px-3 py-2 rounded-md text-base font-medium"
                >
                  Dashboard
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
