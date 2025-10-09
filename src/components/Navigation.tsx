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
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

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
    <nav className="flex items-center justify-between px-8 py-3 backdrop-blur-md bg-white/70 dark:bg-zinc-900/70 border-b border-zinc-200 dark:border-zinc-800 shadow-sm sticky top-0 z-50 transition-all">
      {/* Left side */}
      <div className="flex items-center gap-6">
        <Link 
          href={session?.user?.role === 'ESTABLISHMENT' ? '/dashboard' : session?.user?.role === 'ADMIN' ? '/admin' : session ? '/packs' : '/'}
          className="flex items-center text-2xl font-bold text-emerald-500 tracking-tight"
        >
          🌿 <span className="ml-1 text-zinc-800 dark:text-white">Zavo</span>
        </Link>

        <div className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link href="/landing" className="text-zinc-700 dark:text-zinc-200 hover:text-emerald-500 transition">
            Home
          </Link>
          
          {session?.user?.role === 'ADMIN' ? (
            <Link href="/admin" className="flex items-center gap-1 text-zinc-700 dark:text-zinc-200 hover:text-emerald-500 transition">
              🔧 Admin Panel
            </Link>
          ) : session?.user?.role === 'ESTABLISHMENT' ? (
            <Link href="/dashboard" className="flex items-center gap-1 text-zinc-700 dark:text-zinc-200 hover:text-emerald-500 transition">
              📊 Dashboard
            </Link>
          ) : (
            <>
              <Link href="/packs" className="flex items-center gap-1 text-zinc-700 dark:text-zinc-200 hover:text-emerald-500 transition">
                📦 Find Packs
              </Link>
              <Link href="/restaurants" className="flex items-center gap-1 text-zinc-700 dark:text-zinc-200 hover:text-emerald-500 transition">
                🏪 Restaurants
              </Link>
              <Link href="/feed" className="flex items-center gap-1 text-zinc-700 dark:text-zinc-200 hover:text-emerald-500 transition">
                📱 Feed
              </Link>
              {session && (
                <Link href="/profile" className="flex items-center gap-1 text-zinc-700 dark:text-zinc-200 hover:text-emerald-500 transition">
                  📦 My Orders
                </Link>
              )}
            </>
          )}
          
          <Link href="/how-it-works" className="text-zinc-700 dark:text-zinc-200 hover:text-emerald-500 transition">
            How it Works
          </Link>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        <ThemeToggle />
        
        {session && <NotificationButton />}
        
        {status === 'loading' ? (
          <div className="animate-pulse bg-zinc-200 dark:bg-zinc-700 h-9 w-20 rounded-full"></div>
        ) : session ? (
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 px-3 py-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 transition cursor-pointer"
            >
              <div className="bg-gradient-to-tr from-emerald-400 to-blue-500 text-white w-9 h-9 flex items-center justify-center rounded-full font-semibold">
                {getUserInitials(session.user?.name, session.user?.email)}
              </div>
              <div className="hidden sm:flex flex-col leading-tight">
                <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                  {getFirstName(session.user?.name)}
                </span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  {getRoleDisplay(session.user?.role)}
                </span>
              </div>
            </button>

            {/* Dropdown Menu */}
            {isUserMenuOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setIsUserMenuOpen(false)}
                ></div>
                
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-zinc-800 rounded-lg shadow-xl border border-zinc-200 dark:border-zinc-700 z-50">
                  <div className="p-4 border-b border-zinc-200 dark:border-zinc-700">
                    <div className="flex items-center gap-3">
                      <div className="bg-gradient-to-tr from-emerald-400 to-blue-500 text-white w-12 h-12 flex items-center justify-center rounded-full font-bold">
                        {getUserInitials(session.user?.name, session.user?.email)}
                      </div>
                      <div>
                        <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                          {getFirstName(session.user?.name)}
                        </div>
                        <div className="text-sm text-zinc-500 dark:text-zinc-400">
                          {session.user?.email}
                        </div>
                        <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                          {getRoleDisplay(session.user?.role)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-2">
                    {session.user?.role === 'ADMIN' ? (
                      <Link
                        href="/admin"
                        className="flex items-center gap-3 px-4 py-3 text-zinc-700 dark:text-zinc-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-lg transition-colors"
                      >
                        <span className="text-lg">🔧</span>
                        <div>
                          <div className="font-medium">Admin Panel</div>
                          <div className="text-xs text-zinc-500 dark:text-zinc-400">
                            Gestionar plataforma
                          </div>
                        </div>
                      </Link>
                    ) : session.user?.role === 'ESTABLISHMENT' ? (
                      <>
                        <Link
                          href="/dashboard"
                          className="flex items-center gap-3 px-4 py-3 text-zinc-700 dark:text-zinc-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-lg transition-colors"
                        >
                          <span className="text-lg">📊</span>
                          <div>
                            <div className="font-medium">Dashboard</div>
                            <div className="text-xs text-zinc-500 dark:text-zinc-400">
                              Gestionar tu restaurante
                            </div>
                          </div>
                        </Link>
                        <Link
                          href="/profile"
                          className="flex items-center gap-3 px-4 py-3 text-zinc-700 dark:text-zinc-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-lg transition-colors"
                        >
                          <span className="text-lg">👤</span>
                          <div>
                            <div className="font-medium">Mi Perfil</div>
                            <div className="text-xs text-zinc-500 dark:text-zinc-400">
                              Configuración de cuenta
                            </div>
                          </div>
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link
                          href="/packs"
                          className="flex items-center gap-3 px-4 py-3 text-zinc-700 dark:text-zinc-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-lg transition-colors"
                        >
                          <span className="text-lg">🍽️</span>
                          <div>
                            <div className="font-medium">Explorar Packs</div>
                            <div className="text-xs text-zinc-500 dark:text-zinc-400">
                              Encuentra ofertas cerca
                            </div>
                          </div>
                        </Link>
                        <Link
                          href="/profile"
                          className="flex items-center gap-3 px-4 py-3 text-zinc-700 dark:text-zinc-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-lg transition-colors"
                        >
                          <span className="text-lg">📦</span>
                          <div>
                            <div className="font-medium">Mis Órdenes</div>
                            <div className="text-xs text-zinc-500 dark:text-zinc-400">
                              Historial y reservas
                            </div>
                          </div>
                        </Link>
                      </>
                    )}

                    <hr className="my-2 border-zinc-200 dark:border-zinc-700" />

                    <button
                      onClick={() => signOut()}
                      className="flex items-center gap-3 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors w-full text-left"
                    >
                      <span className="text-lg">🚪</span>
                      <div>
                        <div className="font-medium">Cerrar Sesión</div>
                        <div className="text-xs text-red-500 dark:text-red-400">
                          Salir de la cuenta
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => signIn()}
              className="text-zinc-700 dark:text-zinc-200 hover:text-emerald-500 px-3 py-2 rounded-md text-sm font-medium transition"
            >
              Iniciar Sesión
            </button>
            <Link
              href="/packs"
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-sm"
            >
              🗺️ Encuentra Packs
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
