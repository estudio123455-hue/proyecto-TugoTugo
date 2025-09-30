'use client'

import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'
import AuthLanding from './AuthLanding'

interface AuthGuardProps {
  children: ReactNode
}

// Páginas que NO requieren autenticación
const publicRoutes = [
  '/',
  '/auth',
  '/auth/verify',
  '/auth/verify-login',
  '/auth/callback',
  '/auth/confirm-email',
  '/auth/oauth-callback',
  '/privacy',
  '/terms',
  '/faq',
  '/how-it-works'
]

export default function AuthGuard({ children }: AuthGuardProps) {
  const { data: session, status } = useSession()
  const pathname = usePathname()

  // Si está cargando, mostrar loading
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-500 to-orange-400 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-xl font-semibold">Cargando FoodSave...</p>
        </div>
      </div>
    )
  }

  // Si está en una ruta pública, mostrar contenido normal
  if (publicRoutes.includes(pathname)) {
    return <>{children}</>
  }

  // Si no está autenticado y no está en ruta pública, mostrar landing de auth
  if (!session) {
    return <AuthLanding />
  }

  // Si está autenticado, mostrar contenido normal
  return <>{children}</>
}
