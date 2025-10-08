import { LucideIcon, LucideProps } from 'lucide-react'
import { forwardRef } from 'react'

interface IconProps extends Omit<LucideProps, 'size'> {
  icon: LucideIcon
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'muted'
}

const Icon = forwardRef<SVGSVGElement, IconProps>(
  ({ icon: IconComponent, size = 'md', variant = 'default', className = '', ...props }, ref) => {
    const sizes = {
      xs: 'w-3 h-3',
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6',
      xl: 'w-8 h-8',
      '2xl': 'w-10 h-10',
    }

    const variants = {
      default: 'text-current',
      primary: 'text-primary-600',
      secondary: 'text-secondary-600',
      success: 'text-green-600',
      warning: 'text-yellow-600',
      danger: 'text-red-600',
      muted: 'text-gray-400',
    }

    return (
      <IconComponent
        ref={ref}
        className={`${sizes[size]} ${variants[variant]} ${className}`}
        {...props}
      />
    )
  }
)

Icon.displayName = 'Icon'

export default Icon

// Icon wrapper con background
export function IconCircle({
  icon: IconComponent,
  size = 'md',
  variant = 'primary',
  className = '',
}: {
  icon: LucideIcon
  size?: 'sm' | 'md' | 'lg'
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info'
  className?: string
}) {
  const containerSizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  }

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }

  const variants = {
    primary: 'bg-primary-100 text-primary-600',
    secondary: 'bg-secondary-100 text-secondary-600',
    success: 'bg-green-100 text-green-600',
    warning: 'bg-yellow-100 text-yellow-600',
    danger: 'bg-red-100 text-red-600',
    info: 'bg-blue-100 text-blue-600',
  }

  return (
    <div
      className={`
        ${containerSizes[size]}
        ${variants[variant]}
        rounded-full flex items-center justify-center
        ${className}
      `}
    >
      <IconComponent className={iconSizes[size]} />
    </div>
  )
}

// Icon con badge
export function IconWithBadge({
  icon: IconComponent,
  badge,
  size = 'md',
  className = '',
}: {
  icon: LucideIcon
  badge?: number | string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }

  const badgeSizes = {
    sm: 'w-3 h-3 text-[8px]',
    md: 'w-4 h-4 text-[10px]',
    lg: 'w-5 h-5 text-xs',
  }

  return (
    <div className={`relative inline-block ${className}`}>
      <IconComponent className={sizes[size]} />
      {badge !== undefined && (
        <span
          className={`
            absolute -top-1 -right-1
            ${badgeSizes[size]}
            bg-red-500 text-white
            rounded-full flex items-center justify-center
            font-bold
          `}
        >
          {typeof badge === 'number' && badge > 9 ? '9+' : badge}
        </span>
      )}
    </div>
  )
}
