import { Inter } from 'next/font/google'
import './globals.css'
import '@/styles/mobile.css'
import React from 'react'
import { Providers } from './providers'
import AuthGuard from '@/components/AuthGuard'
import BottomNavigation from '@/components/mobile/BottomNavigation'
import FloatingLogout from '@/components/FloatingLogout'
import ChatBot from '@/components/ChatBot'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Zavo - Reduce Food Waste',
  description:
    'Discover surprise food packs from local restaurants and reduce food waste',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <AuthGuard>
            <div className="with-bottom-nav">
              {children}
            </div>
            <BottomNavigation />
            <FloatingLogout />
            <ChatBot />
          </AuthGuard>
        </Providers>
      </body>
    </html>
  )
}
