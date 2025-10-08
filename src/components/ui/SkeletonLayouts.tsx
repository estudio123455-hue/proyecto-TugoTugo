import Skeleton, { SkeletonCard, SkeletonText, SkeletonImage, SkeletonAvatar } from './Skeleton'

export function SkeletonPackCard() {
  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden">
      <SkeletonImage aspectRatio="16/9" />
      <div className="p-4">
        <Skeleton variant="text" width="80%" className="mb-2" height={24} />
        <SkeletonText lines={2} className="mb-4" />
        <div className="flex items-center justify-between">
          <div>
            <Skeleton variant="text" width={60} height={16} className="mb-1" />
            <Skeleton variant="text" width={80} height={20} />
          </div>
          <Skeleton variant="rounded" width={100} height={36} />
        </div>
      </div>
    </div>
  )
}

export function SkeletonEstablishmentCard() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-start gap-4 mb-4">
        <Skeleton variant="rounded" width={80} height={80} />
        <div className="flex-1">
          <Skeleton variant="text" width="70%" height={24} className="mb-2" />
          <Skeleton variant="text" width="50%" height={16} className="mb-2" />
          <div className="flex items-center gap-2">
            <Skeleton variant="text" width={100} height={16} />
            <Skeleton variant="text" width={80} height={16} />
          </div>
        </div>
      </div>
      <SkeletonText lines={2} />
    </div>
  )
}

export function SkeletonOrderCard() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Skeleton variant="circular" width={48} height={48} />
          <div>
            <Skeleton variant="text" width={150} height={20} className="mb-2" />
            <Skeleton variant="text" width={100} height={16} />
          </div>
        </div>
        <Skeleton variant="rounded" width={80} height={24} />
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <Skeleton variant="text" width={60} height={14} className="mb-1" />
          <Skeleton variant="text" width={100} height={18} />
        </div>
        <div>
          <Skeleton variant="text" width={60} height={14} className="mb-1" />
          <Skeleton variant="text" width={80} height={18} />
        </div>
      </div>
      <Skeleton variant="rounded" width="100%" height={40} />
    </div>
  )
}

export function SkeletonReviewCard() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-start gap-4">
        <SkeletonAvatar size={48} />
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div>
              <Skeleton variant="text" width={120} height={18} className="mb-1" />
              <Skeleton variant="text" width={80} height={16} />
            </div>
            <Skeleton variant="text" width={60} height={14} />
          </div>
          <SkeletonText lines={3} />
        </div>
      </div>
    </div>
  )
}

export function SkeletonMenuItem() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <Skeleton variant="text" width="60%" height={20} className="mb-2" />
          <SkeletonText lines={2} />
        </div>
        <Skeleton variant="text" width={60} height={24} />
      </div>
      <div className="flex gap-2">
        <Skeleton variant="rounded" width={80} height={24} />
        <Skeleton variant="rounded" width={70} height={24} />
      </div>
    </div>
  )
}

export function SkeletonTable({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-200 p-4">
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} variant="text" width="80%" height={16} />
          ))}
        </div>
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="border-b border-gray-200 p-4">
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton key={colIndex} variant="text" width="90%" height={16} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export function SkeletonForm() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i}>
          <Skeleton variant="text" width={100} height={14} className="mb-2" />
          <Skeleton variant="rounded" width="100%" height={44} />
        </div>
      ))}
      <div className="flex gap-3 pt-4">
        <Skeleton variant="rounded" width={120} height={44} />
        <Skeleton variant="rounded" width={100} height={44} />
      </div>
    </div>
  )
}

export function SkeletonDashboard() {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <Skeleton variant="rounded" width={48} height={48} />
              <Skeleton variant="text" width={60} height={20} />
            </div>
            <Skeleton variant="text" width={100} height={16} className="mb-2" />
            <Skeleton variant="text" width={80} height={32} />
          </div>
        ))}
      </div>
      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  )
}

export function SkeletonList({ items = 5 }: { items?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 bg-white rounded-lg shadow">
          <SkeletonAvatar size={56} />
          <div className="flex-1">
            <Skeleton variant="text" width="60%" height={18} className="mb-2" />
            <Skeleton variant="text" width="40%" height={14} />
          </div>
          <Skeleton variant="rounded" width={80} height={36} />
        </div>
      ))}
    </div>
  )
}
