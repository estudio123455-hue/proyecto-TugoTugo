'use client'

import { ReactNode } from 'react'

interface MobileFabProps {
  icon: ReactNode
  onClick: () => void
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center'
  label?: string
}

export default function MobileFab({
  icon,
  onClick,
  position = 'bottom-right',
  label,
}: MobileFabProps) {
  const positionClasses = {
    'bottom-right': 'bottom-20 right-4',
    'bottom-left': 'bottom-20 left-4',
    'bottom-center': 'bottom-20 left-1/2 -translate-x-1/2',
  }

  return (
    <button
      onClick={onClick}
      className={`
        fixed ${positionClasses[position]} z-40
        bg-orange-500 hover:bg-orange-600 active:bg-orange-700
        text-white rounded-full shadow-lg
        ${label ? 'px-6 py-4' : 'w-14 h-14'}
        flex items-center justify-center gap-2
        transition-all duration-200
        active:scale-95
        md:hidden
      `}
    >
      {icon}
      {label && <span className="font-semibold">{label}</span>}
    </button>
  )
}
