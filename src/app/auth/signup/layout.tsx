export const metadata = {
  title: 'Crear Cuenta - Zavo',
  description: 'Crea tu cuenta en Zavo',
}

import React from 'react'

export default function SignUpLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

// Disable caching for this page
export const dynamic = 'force-dynamic'
export const revalidate = 0
