'use client'

import { Suspense, ReactNode } from 'react'
import LoadingSpinner from './LoadingSpinner'
import { SkeletonCard } from './Skeleton'

interface SuspenseBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  type?: 'spinner' | 'skeleton' | 'custom'
}

export default function SuspenseBoundary({
  children,
  fallback,
  type = 'spinner',
}: SuspenseBoundaryProps) {
  const defaultFallbacks = {
    spinner: (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" text="Cargando..." />
      </div>
    ),
    skeleton: (
      <div className="space-y-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    ),
    custom: fallback,
  }

  return (
    <Suspense fallback={fallback || defaultFallbacks[type]}>
      {children}
    </Suspense>
  )
}

export function PageSuspense({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner size="xl" text="Cargando página..." />
        </div>
      }
    >
      {children}
    </Suspense>
  )
}

export function CardSuspense({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<SkeletonCard />}>
      {children}
    </Suspense>
  )
}
