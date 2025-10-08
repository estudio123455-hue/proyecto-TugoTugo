'use client'

import { ButtonHTMLAttributes, ReactNode } from 'react'

interface TouchFriendlyButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  icon?: ReactNode
}

export default function TouchFriendlyButton({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  icon,
  className = '',
  ...props
}: TouchFriendlyButtonProps) {
  const variants = {
    primary: 'bg-orange-500 text-white hover:bg-orange-600 active:bg-orange-700',
    secondary: 'bg-gray-500 text-white hover:bg-gray-600 active:bg-gray-700',
    outline: 'border-2 border-orange-500 text-orange-500 hover:bg-orange-50 active:bg-orange-100',
    ghost: 'text-orange-500 hover:bg-orange-50 active:bg-orange-100',
    danger: 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700',
  }

  const sizes = {
    sm: 'px-4 py-2 text-sm min-h-[40px]',
    md: 'px-6 py-3 text-base min-h-[44px]',
    lg: 'px-8 py-4 text-lg min-h-[48px]',
  }

  return (
    <button
      className={`
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        rounded-lg font-semibold
        flex items-center justify-center gap-2
        transition-all duration-200
        active:scale-[0.98]
        disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
        touch-manipulation
        ${className}
      `}
      {...props}
    >
      {icon}
      {children}
    </button>
  )
}
