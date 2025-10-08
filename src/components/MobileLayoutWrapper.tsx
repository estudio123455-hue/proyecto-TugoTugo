'use client'

import { ReactNode } from 'react'
import { useMobile } from '@/hooks/useMobile'

interface MobileLayoutWrapperProps {
  children: ReactNode
  showBottomNav?: boolean
  className?: string
}

export default function MobileLayoutWrapper({
  children,
  showBottomNav = false,
  className = '',
}: MobileLayoutWrapperProps) {
  const isMobile = useMobile()

  return (
    <div className={`mobile-layout-wrapper ${className}`}>
      <main className={`
        container-mobile
        ${showBottomNav && isMobile ? 'pb-20' : ''}
      `}>
        {children}
      </main>
    </div>
  )
}
