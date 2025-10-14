'use client';

import { signOut } from 'next-auth/react';
import { LogOut, User } from 'lucide-react';
import { useState } from 'react';

interface LogoutButtonProps {
  variant?: 'button' | 'dropdown' | 'icon';
  className?: string;
  showUserInfo?: boolean;
  userName?: string;
}

export default function LogoutButton({ 
  variant = 'button', 
  className = '',
  showUserInfo = false,
  userName = ''
}: LogoutButtonProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut({ 
        callbackUrl: '/',
        redirect: true 
      });
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      setIsLoggingOut(false);
    }
  };

  if (variant === 'icon') {
    return (
      <button
        onClick={handleLogout}
        disabled={isLoggingOut}
        className={`p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 ${className}`}
        title="Cerrar Sesión"
      >
        {isLoggingOut ? (
          <div className="w-5 h-5 border-2 border-gray-300 border-t-red-500 rounded-full animate-spin" />
        ) : (
          <LogOut className="w-5 h-5" />
        )}
      </button>
    );
  }

  if (variant === 'dropdown') {
    return (
      <button
        onClick={handleLogout}
        disabled={isLoggingOut}
        className={`w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors ${className}`}
      >
        <LogOut className="w-4 h-4 mr-3" />
        {isLoggingOut ? 'Cerrando sesión...' : 'Cerrar Sesión'}
      </button>
    );
  }

  return (
    <button
      onClick={handleLogout}
      disabled={isLoggingOut}
      className={`inline-flex items-center px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white text-sm font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md ${className}`}
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
  );
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
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
          {userAvatar ? (
            <img 
              src={userAvatar} 
              alt={userName} 
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <span className="text-emerald-600 font-semibold text-sm">
              {userName?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          )}
        </div>
        <div className="hidden md:block text-left">
          <p className="text-sm font-medium text-gray-700">
            {userName?.split(' ')[0] || 'Usuario'}
          </p>
          {userEmail && (
            <p className="text-xs text-gray-500 truncate max-w-32">
              {userEmail}
            </p>
          )}
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
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
            <div className="px-4 py-2 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-900">{userName}</p>
              {userEmail && (
                <p className="text-xs text-gray-500 truncate">{userEmail}</p>
              )}
            </div>
            
            <a
              href="/profile"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <User className="w-4 h-4 mr-3" />
              Mi Perfil
            </a>
            
            <a
              href="/orders"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <span className="w-4 h-4 mr-3">📦</span>
              Mis Órdenes
            </a>
            
            <div className="border-t border-gray-100 mt-1">
              <LogoutButton variant="dropdown" />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
