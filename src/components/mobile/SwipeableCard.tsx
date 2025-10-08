'use client'

import { useState, useRef, useEffect, ReactNode } from 'react'

interface SwipeableCardProps {
  children: ReactNode
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  leftAction?: ReactNode
  rightAction?: ReactNode
  threshold?: number
}

export default function SwipeableCard({
  children,
  onSwipeLeft,
  onSwipeRight,
  leftAction,
  rightAction,
  threshold = 100,
}: SwipeableCardProps) {
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const [swiping, setSwiping] = useState(false)
  const [offset, setOffset] = useState(0)
  const cardRef = useRef<HTMLDivElement>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX)
    setSwiping(true)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!swiping) return
    const currentTouch = e.targetTouches[0].clientX
    const diff = currentTouch - touchStart
    setOffset(diff)
    setTouchEnd(currentTouch)
  }

  const handleTouchEnd = () => {
    if (!swiping) return
    setSwiping(false)

    const swipeDistance = touchEnd - touchStart

    if (Math.abs(swipeDistance) > threshold) {
      if (swipeDistance > 0 && onSwipeRight) {
        onSwipeRight()
      } else if (swipeDistance < 0 && onSwipeLeft) {
        onSwipeLeft()
      }
    }

    setOffset(0)
    setTouchStart(0)
    setTouchEnd(0)
  }

  return (
    <div className="relative overflow-hidden">
      {/* Background Actions */}
      {leftAction && (
        <div className="absolute left-0 top-0 bottom-0 flex items-center pl-4">
          {leftAction}
        </div>
      )}
      {rightAction && (
        <div className="absolute right-0 top-0 bottom-0 flex items-center pr-4">
          {rightAction}
        </div>
      )}

      {/* Card Content */}
      <div
        ref={cardRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: `translateX(${offset}px)`,
          transition: swiping ? 'none' : 'transform 0.3s ease-out',
        }}
        className="bg-white relative z-10"
      >
        {children}
      </div>
    </div>
  )
}
