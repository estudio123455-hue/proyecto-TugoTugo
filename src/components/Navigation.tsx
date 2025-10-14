'use client'

import { signIn, signOut } from 'next-auth/react'
import Link from 'next/link'
import { useCleanSession } from '@/hooks/useCleanSession'
import NotificationButton from './NotificationButton'

export default function Navigation() {
  const { data: session, status } = useCleanSession()

  return (
    <nav className="fixed top-0 left-0 right-0 w-full z-[100] bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex justify-center items-center">
        {/* Centered Logo */}
        <Link 
          href="/"
          className="flex items-center text-xl sm:text-2xl font-bold text-emerald-500 tracking-tight"
        >
          🌿 <span className="ml-1 text-gray-900">Zavo</span>
        </Link>
      </div>

    </nav>
  )
}
