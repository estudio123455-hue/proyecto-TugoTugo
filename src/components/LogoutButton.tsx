'use client'

import { signOut } from 'next-auth/react'
import { LogOut, User } from 'lucide-react'
import { useState } from 'react'

interface LogoutButtonProps {
  variant?: 'button' | 'dropdown' | 'icon'
  className?: string
}

export default function LogoutButton({ 
  variant = 'button', 
  className = ''
}: LogoutButtonProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await signOut({ 
        callbackUrl: '/',
        redirect: true 
      })
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
      setIsLoggingOut(false)
    }
  }

  if (variant === 'icon') {
    return (
      <button
        onClick={handleLogout}
        disabled={isLoggingOut}
        className={`p-2.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 border border-transparent hover:border-red-200 hover:shadow-sm disabled:opacity-50 ${className}`}
        title="Cerrar Sesión"
      >
        {isLoggingOut ? (
          <div className="w-5 h-5 border-2 border-gray-300 border-t-red-500 rounded-full animate-spin" />
        ) : (
          <LogOut className="w-5 h-5" />
        )}
      </button>
    )
  }

  if (variant === 'dropdown') {
    return (
      <button
        onClick={handleLogout}
        disabled={isLoggingOut}
        className={`w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all duration-150 disabled:opacity-50 ${className}`}
      >
        <LogOut className="w-4 h-4 mr-3 text-gray-400" />
        {isLoggingOut ? 'Cerrando sesión...' : 'Cerrar Sesión'}
      </button>
    )
  }

  return (
    <button
      onClick={handleLogout}
      disabled={isLoggingOut}
      className={`inline-flex items-center px-5 py-2.5 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105 active:scale-95 disabled:transform-none ${className}`}
    >
      {isLoggingOut ? (
        <>
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
          Cerrando...
        </>
      ) : (
        <>
          <LogOut className="w-4 h-4 mr-2" />
          Cerrar Sesión
        </>
      )}
    </button>
  )
}

// Componente de menú de usuario con dropdown
export function UserMenu({ 
  userName, 
  userEmail, 
  userAvatar 
}: { 
  userName?: string; 
  userEmail?: string; 
  userAvatar?: string;
}) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 p-2 rounded-xl hover:bg-gray-50 transition-all duration-200 border border-transparent hover:border-gray-200 hover:shadow-sm"
      >
        <div className="w-9 h-9 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-full flex items-center justify-center ring-2 ring-emerald-100">
          {userAvatar ? (
            <img 
              src={userAvatar} 
              alt={userName} 
              className="w-9 h-9 rounded-full object-cover"
            />
          ) : (
            <span className="text-emerald-700 font-bold text-sm">
              {userName?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          )}
        </div>
        <div className="hidden md:block text-left min-w-0 flex-1">
          <p className="text-sm font-semibold text-gray-800 truncate max-w-[120px]">
            {userName || 'Usuario'}
          </p>
          {userEmail && (
            <p className="text-xs text-gray-500 truncate max-w-[120px]">
              {userEmail}
            </p>
          )}
        </div>
        <div className="hidden md:block">
          <svg 
            className="w-4 h-4 text-gray-400 transition-transform duration-200" 
            style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {isOpen && (
        <>
          {/* Overlay para cerrar el menú */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown menu */}
          <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-20 animate-in slide-in-from-top-2 duration-200">
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-sm font-semibold text-gray-900 truncate">{userName}</p>
              {userEmail && (
                <p className="text-xs text-gray-500 truncate mt-1">{userEmail}</p>
              )}
            </div>
            
            <div className="py-1">
              <a
                href="/profile"
                className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-all duration-150"
                onClick={() => setIsOpen(false)}
              >
                <User className="w-4 h-4 mr-3 text-gray-400" />
                Mi Perfil
              </a>
              
              <a
                href="/orders"
                className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-all duration-150"
                onClick={() => setIsOpen(false)}
              >
                <span className="w-4 h-4 mr-3 text-gray-400">📦</span>
                Mis Órdenes
              </a>
            </div>
            
            <div className="border-t border-gray-100 mt-1 pt-1">
              <LogoutButton variant="dropdown" />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
