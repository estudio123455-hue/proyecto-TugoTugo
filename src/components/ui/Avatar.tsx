import { HTMLAttributes } from 'react'
import { User } from 'lucide-react'

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string | null
  alt?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  fallback?: string
  status?: 'online' | 'offline' | 'away' | 'busy'
}

export default function Avatar({
  src,
  alt = 'Avatar',
  size = 'md',
  fallback,
  status,
  className = '',
  ...props
}: AvatarProps) {
  const sizes = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
    '2xl': 'w-20 h-20 text-2xl',
  }

  const statusColors = {
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    away: 'bg-yellow-500',
    busy: 'bg-red-500',
  }

  const statusSizes = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
    xl: 'w-3.5 h-3.5',
    '2xl': 'w-4 h-4',
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className={`relative inline-block ${className}`} {...props}>
      <div
        className={`
          ${sizes[size]}
          rounded-full overflow-hidden
          bg-gradient-to-br from-primary-400 to-secondary-400
          flex items-center justify-center
          text-white font-semibold
        `}
      >
        {src ? (
          <img
            src={src}
            alt={alt}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
        ) : fallback ? (
          <span>{getInitials(fallback)}</span>
        ) : (
          <User className="w-1/2 h-1/2" />
        )}
      </div>

      {status && (
        <span
          className={`
            absolute bottom-0 right-0
            ${statusSizes[size]}
            ${statusColors[status]}
            rounded-full border-2 border-white
          `}
        />
      )}
    </div>
  )
}

export function AvatarGroup({
  avatars,
  max = 3,
  size = 'md',
}: {
  avatars: Array<{ src?: string | null; alt?: string; fallback?: string }>
  max?: number
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
}) {
  const displayAvatars = avatars.slice(0, max)
  const remaining = avatars.length - max

  return (
    <div className="flex -space-x-2">
      {displayAvatars.map((avatar, index) => (
        <Avatar
          key={index}
          {...avatar}
          size={size}
          className="ring-2 ring-white"
        />
      ))}
      {remaining > 0 && (
        <div
          className={`
            ${
              size === 'xs'
                ? 'w-6 h-6 text-xs'
                : size === 'sm'
                ? 'w-8 h-8 text-sm'
                : size === 'md'
                ? 'w-10 h-10 text-base'
                : size === 'lg'
                ? 'w-12 h-12 text-lg'
                : size === 'xl'
                ? 'w-16 h-16 text-xl'
                : 'w-20 h-20 text-2xl'
            }
            rounded-full bg-gray-200 ring-2 ring-white
            flex items-center justify-center
            text-gray-600 font-semibold
          `}
        >
          +{remaining}
        </div>
      )}
    </div>
  )
}
