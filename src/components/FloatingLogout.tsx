'use client'

import { useCleanSession } from '@/hooks/useCleanSession'
import LogoutButton from '@/components/LogoutButton'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function FloatingLogout() {
  const { data: session } = useCleanSession()
  const pathname = usePathname()
  const [isVisible, setIsVisible] = useState(false)

  // No mostrar en páginas de auth o si no hay sesión
  const shouldShow = session && !pathname?.startsWith('/auth')

  // Mostrar/ocultar basado en scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      setIsVisible(scrollY > 200) // Mostrar después de hacer scroll
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (!shouldShow) return null

  return (
    <>
      {/* Botón flotante para móvil */}
      <div 
        className={`fixed bottom-20 right-4 z-50 md:hidden transition-all duration-300 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'
        }`}
      >
        <div className="bg-white rounded-full shadow-lg border border-gray-200 p-2">
          <LogoutButton 
            variant="icon" 
            className="w-12 h-12 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          />
        </div>
      </div>

      {/* Indicador de usuario en la esquina para desktop */}
      <div className="hidden md:block fixed top-20 right-4 z-40">
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
              <span className="text-emerald-600 font-semibold text-sm">
                {session.user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <div className="text-sm">
              <p className="font-medium text-gray-900 truncate max-w-24">
                {session.user?.name?.split(' ')[0] || 'Usuario'}
              </p>
              <LogoutButton 
                variant="button" 
                className="text-xs px-2 py-1 mt-1"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

// Componente alternativo más discreto
export function QuickLogout() {
  const { data: session } = useCleanSession()
  const pathname = usePathname()

  if (!session || pathname?.startsWith('/auth')) return null

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200/50 p-2">
        <LogoutButton variant="icon" className="text-gray-600 hover:text-red-600" />
      </div>
    </div>
  )
}
