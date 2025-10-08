import { HTMLAttributes } from 'react'

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded'
  width?: string | number
  height?: string | number
  animation?: 'pulse' | 'wave' | 'none'
}

export default function Skeleton({
  variant = 'rectangular',
  width,
  height,
  animation = 'pulse',
  className = '',
  style,
  ...props
}: SkeletonProps) {
  const variants = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    rounded: 'rounded-lg',
  }

  const animations = {
    pulse: 'animate-pulse',
    wave: 'skeleton',
    none: '',
  }

  const inlineStyle = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
    ...style,
  }

  return (
    <div
      className={`
        bg-gray-200
        ${variants[variant]}
        ${animations[animation]}
        ${className}
      `}
      style={inlineStyle}
      {...props}
    />
  )
}

// Skeleton presets for common use cases
export function SkeletonText({ lines = 3, className = '' }: { lines?: number; className?: string }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          width={i === lines - 1 ? '80%' : '100%'}
        />
      ))}
    </div>
  )
}

export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
      <div className="flex items-start gap-4 mb-4">
        <Skeleton variant="circular" width={48} height={48} />
        <div className="flex-1">
          <Skeleton variant="text" width="60%" className="mb-2" />
          <Skeleton variant="text" width="40%" />
        </div>
      </div>
      <SkeletonText lines={3} />
    </div>
  )
}

export function SkeletonAvatar({ size = 40, className = '' }: { size?: number; className?: string }) {
  return (
    <Skeleton
      variant="circular"
      width={size}
      height={size}
      className={className}
    />
  )
}

export function SkeletonButton({ className = '' }: { className?: string }) {
  return (
    <Skeleton
      variant="rounded"
      height={44}
      width={120}
      className={className}
    />
  )
}

export function SkeletonImage({ aspectRatio = '16/9', className = '' }: { aspectRatio?: string; className?: string }) {
  return (
    <Skeleton
      variant="rounded"
      className={className}
      style={{ aspectRatio }}
    />
  )
}

// Skeleton específicos para componentes comunes
export function CardSkeleton() {
  return (
    <div className="animate-pulse bg-white rounded-lg shadow overflow-hidden">
      <div className="h-48 bg-gray-200"></div>
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="flex items-center justify-between mt-4">
          <div className="h-6 bg-gray-200 rounded w-20"></div>
          <div className="h-8 bg-gray-200 rounded w-24"></div>
        </div>
      </div>
    </div>
  )
}

export function PackCardSkeleton() {
  return (
    <div className="animate-pulse bg-white rounded-lg shadow overflow-hidden">
      <div className="h-48 bg-gray-200"></div>
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-3 bg-gray-200 rounded w-16"></div>
          <div className="h-3 bg-gray-200 rounded w-20"></div>
        </div>
        <div className="h-6 bg-gray-200 rounded w-4/5"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
        <div className="flex items-center justify-between pt-4 border-t">
          <div>
            <div className="h-3 bg-gray-200 rounded w-16 mb-1"></div>
            <div className="h-6 bg-gray-200 rounded w-20"></div>
          </div>
          <div className="h-10 bg-gray-200 rounded w-28"></div>
        </div>
      </div>
    </div>
  )
}

export function EstablishmentCardSkeleton() {
  return (
    <div className="animate-pulse bg-white rounded-lg shadow p-6">
      <div className="flex items-start gap-4">
        <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0"></div>
        <div className="flex-1 space-y-3">
          <div className="h-6 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="flex items-center gap-2">
            <div className="h-4 bg-gray-200 rounded w-24"></div>
            <div className="h-4 bg-gray-200 rounded w-20"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function OrderCardSkeleton() {
  return (
    <div className="animate-pulse bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
          <div className="space-y-2">
            <div className="h-5 bg-gray-200 rounded w-32"></div>
            <div className="h-4 bg-gray-200 rounded w-24"></div>
          </div>
        </div>
        <div className="h-6 bg-gray-200 rounded w-20"></div>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="space-y-1">
          <div className="h-3 bg-gray-200 rounded w-16"></div>
          <div className="h-5 bg-gray-200 rounded w-24"></div>
        </div>
        <div className="space-y-1">
          <div className="h-3 bg-gray-200 rounded w-16"></div>
          <div className="h-5 bg-gray-200 rounded w-20"></div>
        </div>
      </div>
      <div className="h-10 bg-gray-200 rounded w-full"></div>
    </div>
  )
}

export function ReviewCardSkeleton() {
  return (
    <div className="animate-pulse bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-gray-200 rounded-full flex-shrink-0"></div>
        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-5 bg-gray-200 rounded w-32"></div>
              <div className="h-4 bg-gray-200 rounded w-24"></div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-16"></div>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function MenuItemSkeleton() {
  return (
    <div className="animate-pulse bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 space-y-2">
          <div className="h-5 bg-gray-200 rounded w-2/3"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-4/5"></div>
        </div>
        <div className="h-6 bg-gray-200 rounded w-16 ml-4"></div>
      </div>
      <div className="flex gap-2">
        <div className="h-6 bg-gray-200 rounded w-20"></div>
        <div className="h-6 bg-gray-200 rounded w-16"></div>
      </div>
    </div>
  )
}

export function TableRowSkeleton({ columns = 4 }: { columns?: number }) {
  return (
    <div className="animate-pulse border-b border-gray-200 p-4">
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} className="h-4 bg-gray-200 rounded"></div>
        ))}
      </div>
    </div>
  )
}

export function FormSkeleton({ fields = 4 }: { fields?: number }) {
  return (
    <div className="animate-pulse space-y-4">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i}>
          <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
          <div className="h-11 bg-gray-200 rounded w-full"></div>
        </div>
      ))}
      <div className="flex gap-3 pt-4">
        <div className="h-11 bg-gray-200 rounded w-32"></div>
        <div className="h-11 bg-gray-200 rounded w-24"></div>
      </div>
    </div>
  )
}

export function DashboardStatSkeleton() {
  return (
    <div className="animate-pulse bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
        <div className="h-5 bg-gray-200 rounded w-16"></div>
      </div>
      <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
      <div className="h-8 bg-gray-200 rounded w-20"></div>
    </div>
  )
}

export function ListItemSkeleton() {
  return (
    <div className="animate-pulse flex items-center gap-4 p-4 bg-white rounded-lg shadow">
      <div className="w-14 h-14 bg-gray-200 rounded-full flex-shrink-0"></div>
      <div className="flex-1 space-y-2">
        <div className="h-5 bg-gray-200 rounded w-2/3"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
      <div className="h-9 bg-gray-200 rounded w-20"></div>
    </div>
  )
}

export function PageHeaderSkeleton() {
  return (
    <div className="animate-pulse space-y-4 mb-8">
      <div className="h-10 bg-gray-200 rounded w-1/3"></div>
      <div className="h-5 bg-gray-200 rounded w-2/3"></div>
      <div className="flex gap-3">
        <div className="h-10 bg-gray-200 rounded w-32"></div>
        <div className="h-10 bg-gray-200 rounded w-28"></div>
      </div>
    </div>
  )
}
