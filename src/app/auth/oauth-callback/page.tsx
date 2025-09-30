'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function OAuthCallback() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') {
      return // Still loading
    }

    if (status === 'authenticated' && session) {
      // User is authenticated, redirect to home
      console.log('OAuth callback: User authenticated, redirecting to home')
      router.push('/')
    } else {
      // Authentication failed, redirect to auth page
      console.log('OAuth callback: Authentication failed, redirecting to auth')
      router.push('/auth')
    }
  }, [session, status, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-500 to-orange-400 flex items-center justify-center">
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 text-center text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold mb-2">Completando autenticación...</h2>
        <p className="text-white/80">Por favor espera mientras procesamos tu login.</p>
      </div>
    </div>
  )
}