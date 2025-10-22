'use client'

import React from 'react'
import { useCleanSession } from '@/hooks/useCleanSession'
import { usePathname } from 'next/navigation'
import LogoutButton, { UserMenu } from './LogoutButton'
import Link from 'next/link'
interface GlobalHeaderProps {
  title?: string
  showBack?: boolean
  actions?: React.ReactNode
}

export default function GlobalHeader({ 
  title, 
  showBack = false, 
  actions 
}: GlobalHeaderProps) {
  const { data: session, status } = useCleanSession()
  const pathname = usePathname()

  // No mostrar en páginas de auth
  if (pathname?.startsWith('/auth')) {
    return null
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Left side */}
          <div className="flex items-center space-x-4">
            {showBack && (
              <button
                onClick={() => window.history.back()}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            
            {title && (
              <h1 className="text-xl font-semibold text-gray-900 truncate">
                {title}
              </h1>
            )}
          </div>

          {/* Center - Logo for mobile */}
          {!title && (
            <div className="md:hidden">
              <Link 
                href="/"
                className="flex items-center text-lg font-bold text-emerald-500"
              >
                🌿 <span className="ml-1 text-gray-900">Zavo</span>
              </Link>
            </div>
          )}

          {/* Right side */}
          <div className="flex items-center space-x-3">
            {actions}
            
            {status === 'loading' ? (
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
            ) : session ? (
              <div className="flex items-center space-x-2">
                {/* Desktop: User menu hidden - logout only available on mobile */}
                <div className="hidden md:block">
                  <div className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700">
                    <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                      <span className="text-emerald-600 font-semibold text-sm">
                        {session.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <span className="font-medium">
                      {session.user?.name?.split(' ')[0] || 'Usuario'}
                    </span>
                  </div>
                </div>
                
                {/* Mobile: Simple logout button */}
                <div className="md:hidden">
                  <LogoutButton variant="icon" />
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/auth/signin"
                  className="text-gray-700 hover:text-emerald-600 px-3 py-2 text-sm font-medium transition-colors"
                >
                  Iniciar Sesión
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

// Hook para usar en páginas
export function useGlobalHeader() {
  return {
    setTitle: (title: string) => {
      // Esto se puede expandir para manejar el estado global del título
      document.title = `${title} - Zavo`
    }
  }
}
