'use client'

import { signIn, signOut } from 'next-auth/react'
import Link from 'next/link'
import { useCleanSession } from '@/hooks/useCleanSession'
import NotificationButton from './NotificationButton'
import { useState } from 'react'

export default function Navigation() {
  const { data: session, status } = useCleanSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 w-full z-[100] bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex justify-between items-center">
        {/* Left side - Logo */}
        <Link 
          href={session?.user?.role === 'ESTABLISHMENT' ? '/dashboard' : session?.user?.role === 'ADMIN' ? '/admin' : session ? '/packs' : '/'}
          className="flex items-center text-xl sm:text-2xl font-bold text-emerald-500 tracking-tight"
        >
          🌿 <span className="ml-1 text-gray-900">Zavo</span>
        </Link>

        {/* Center - Desktop Menu */}
        <div className="hidden lg:flex items-center gap-6 text-sm font-medium text-gray-700">
          {session?.user?.role === 'ADMIN' ? (
            <Link href="/admin" className="flex items-center gap-1 hover:text-emerald-600 transition">
              🔧 Admin Panel
            </Link>
          ) : session?.user?.role === 'ESTABLISHMENT' ? (
            <Link href="/dashboard" className="flex items-center gap-1 hover:text-emerald-600 transition">
              📊 Dashboard
            </Link>
          ) : (
            <>
              <Link href="/packs" className="flex items-center gap-1 hover:text-emerald-600 transition">
                📦 Packs
              </Link>
              <Link href="/restaurants" className="flex items-center gap-1 hover:text-emerald-600 transition">
                🏪 Restaurantes
              </Link>
              {session && (
                <Link href="/profile" className="flex items-center gap-1 hover:text-emerald-600 transition">
                  📦 Mis Órdenes
                </Link>
              )}
            </>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 sm:gap-3">
        {session && <NotificationButton />}
        
        {status === 'loading' ? (
          <div className="animate-pulse bg-gray-200 h-9 w-20 rounded-full"></div>
        ) : session ? (
          <button
            onClick={() => signOut()}
            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm"
          >
            <span>🚪</span>
            <span className="hidden sm:inline">Cerrar Sesión</span>
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => signIn()}
              className="text-gray-700 hover:text-emerald-600 px-3 py-2 rounded-md text-sm font-medium transition"
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

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 rounded-md text-gray-700 hover:text-emerald-600 hover:bg-gray-100 transition"
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

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-200">
          <div className="px-4 py-3 space-y-2">
            {session?.user?.role === 'ADMIN' ? (
              <Link 
                href="/admin" 
                className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                🔧 <span>Admin Panel</span>
              </Link>
            ) : session?.user?.role === 'ESTABLISHMENT' ? (
              <Link 
                href="/dashboard" 
                className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                📊 <span>Dashboard</span>
              </Link>
            ) : (
              <>
                <Link 
                  href="/" 
                  className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  🏠 <span>Home</span>
                </Link>
                <Link 
                  href="/packs" 
                  className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  📦 <span>Packs</span>
                </Link>
                <Link 
                  href="/restaurants" 
                  className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  🏪 <span>Restaurantes</span>
                </Link>
                {session && (
                  <Link 
                    href="/profile" 
                    className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 transition"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    📦 <span>Mis Órdenes</span>
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
