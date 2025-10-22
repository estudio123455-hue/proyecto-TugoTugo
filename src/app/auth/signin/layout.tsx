export const metadata = {
  title: 'Iniciar Sesión - Zavo',
  description: 'Inicia sesión en Zavo',
}

import React from 'react'

export default function SignInLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

// Disable caching for this page
export const dynamic = 'force-dynamic'
export const revalidate = 0
