'use client'

import { SessionProvider } from 'next-auth/react'
import { ReactNode } from 'react'
import { ThemeProvider } from '@/contexts/ThemeContext'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider>
      <SessionProvider 
        refetchInterval={30} // Refetch session every 30 seconds for better reactivity
        refetchOnWindowFocus={true} // Refetch when window gets focus
        refetchWhenOffline={false} // Don't refetch when offline
      >
        {children}
      </SessionProvider>
    </ThemeProvider>
  )
}
