import { Inter } from 'next/font/google'
import './globals.css'
import React from 'react'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'FoodSave - Reduce Food Waste',
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
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
