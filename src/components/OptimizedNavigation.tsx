'use client'

import React, { memo, useState, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Package, MapPin, User, Settings } from 'lucide-react'

interface NavigationItem {
  href: string
  icon: React.ComponentType<any>
  label: string
  isActive?: boolean
}

const navigationItems: NavigationItem[] = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/packs', icon: Package, label: 'Packs' },
  { href: '/restaurants', icon: MapPin, label: 'Restaurantes' },
  { href: '/profile', icon: User, label: 'Perfil' },
]

const OptimizedNavigation = memo(function OptimizedNavigation() {
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(false)

  const handleNavigation = useCallback((href: string) => {
    if (pathname !== href) {
      setIsLoading(true)
      // Reset loading after navigation
      setTimeout(() => setIsLoading(false), 500)
    }
  }, [pathname])

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">T</span>
            </div>
            <span className="font-bold text-xl text-gray-900">TugoTugo</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => handleNavigation(item.href)}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-green-100 text-green-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  } ${isLoading ? 'opacity-50' : ''}`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Loading bar */}
      {isLoading && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-500 animate-pulse"></div>
      )}
    </nav>
  )
})

export default OptimizedNavigation
