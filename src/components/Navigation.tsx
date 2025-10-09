'use client'

import { signIn, signOut } from 'next-auth/react'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { getFirstName, getUserInitials } from '@/lib/user-utils'
import { useCleanSession } from '@/hooks/useCleanSession'
import NotificationButton from './NotificationButton'

export default function Navigation() {
  const { data: session, status } = useCleanSession()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (isUserMenuOpen && !target.closest('.user-menu-container')) {
        setIsUserMenuOpen(false)
      }
    }

    if (isUserMenuOpen) {
      document.addEventListener('click', handleClickOutside)
    }

    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [isUserMenuOpen])

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
    <nav className="fixed top-0 left-0 w-full z-50 backdrop-blur-md bg-white/80 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
        {/* Left side */}
        <div className="flex items-center gap-8">
        <Link 
          href={session?.user?.role === 'ESTABLISHMENT' ? '/dashboard' : session?.user?.role === 'ADMIN' ? '/admin' : session ? '/packs' : '/'}
          className="flex items-center text-2xl font-bold text-emerald-500 tracking-tight"
        >
          🌿 <span className="ml-1 text-gray-900">Zavo</span>
        </Link>

        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-700">
          <Link href="/landing" className="hover:text-emerald-600 transition">
            Home
          </Link>
          
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
                📦 Find Packs
              </Link>
              <Link href="/restaurants" className="flex items-center gap-1 hover:text-emerald-600 transition">
                🏪 Restaurants
              </Link>
              <Link href="/feed" className="flex items-center gap-1 hover:text-emerald-600 transition">
                📱 Feed
              </Link>
              {session && (
                <Link href="/profile" className="flex items-center gap-1 hover:text-emerald-600 transition">
                  📦 My Orders
                </Link>
              )}
            </>
          )}
          
          <Link href="/how-it-works" className="hover:text-emerald-600 transition">
            How it Works
          </Link>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {session && <NotificationButton />}
        
        {status === 'loading' ? (
          <div className="animate-pulse bg-gray-200 h-9 w-20 rounded-full"></div>
        ) : session ? (
          <div className="relative group user-menu-container">
            <button 
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 rounded-full px-3 py-2 transition"
            >
              <div className="w-9 h-9 bg-gradient-to-tr from-emerald-400 to-blue-500 text-white rounded-full flex items-center justify-center font-semibold">
                {getUserInitials(session.user?.name, session.user?.email)}
              </div>
              <div className="hidden sm:flex flex-col leading-tight text-left">
                <span className="text-sm font-semibold text-gray-800">
                  {getFirstName(session.user?.name)}
                </span>
                <span className="text-xs text-gray-500">
                  {getRoleDisplay(session.user?.role)}
                </span>
              </div>
            </button>

            {/* Dropdown Menu */}
            <div className={`absolute right-0 mt-2 w-72 sm:w-64 bg-white border border-gray-200 shadow-xl rounded-2xl transition-all transform z-50 ${
              isUserMenuOpen 
                ? 'opacity-100 visible translate-y-0' 
                : 'opacity-0 invisible translate-y-1'
            } md:group-hover:opacity-100 md:group-hover:visible md:group-hover:translate-y-0`}>
              <div className="px-5 py-4 border-b border-gray-100">
                <span className="block text-base font-semibold text-gray-800 mb-1">
                  {getFirstName(session.user?.name)}
                </span>
                <span className="block text-sm text-gray-500 break-all leading-relaxed">
                  {session.user?.email}
                </span>
              </div>
              <div className="p-3 text-base text-gray-700">
                <Link 
                  href="/packs" 
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition"
                >
                  <span className="text-xl">🍽️</span>
                  <span className="font-medium">Explorar Packs</span>
                </Link>
                <Link 
                  href="/profile" 
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition"
                >
                  <span className="text-xl">📦</span>
                  <span className="font-medium">Mis Órdenes</span>
                </Link>
                <div className="border-t border-gray-100 my-2"></div>
                <button
                  onClick={() => {
                    setIsUserMenuOpen(false)
                    signOut()
                  }}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-50 active:bg-red-100 text-red-600 transition w-full text-left"
                >
                  <span className="text-xl">🚪</span>
                  <span className="font-medium">Cerrar Sesión</span>
                </button>
              </div>
            </div>
          </div>
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
      </div>
      </div>
    </nav>
  )
}
