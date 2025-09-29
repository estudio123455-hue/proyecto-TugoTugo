'use client'

import { SessionProvider } from 'next-auth/react'
import { StackProvider } from '@stackframe/react'
import { stackClientApp } from '@/stack/client'
import { ReactNode } from 'react'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <StackProvider app={stackClientApp}>
        {children}
      </StackProvider>
    </SessionProvider>
  )
}
