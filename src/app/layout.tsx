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
  title: 'TugoTugo - Reduce Food Waste',
  description: 'Conecta con restaurantes locales y reduce el desperdicio alimentario con IA personalizada',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
  manifest: '/manifest.json',
  themeColor: '#10B981',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'TugoTugo'
  },
  icons: {
    icon: [
      { url: '/icons/icon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' }
    ],
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
    ]
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'msapplication-TileColor': '#10B981',
    'msapplication-config': '/browserconfig.xml'
  }
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
