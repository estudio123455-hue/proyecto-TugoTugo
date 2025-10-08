interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  color?: 'primary' | 'white' | 'gray'
  fullScreen?: boolean
  text?: string
}

export default function LoadingSpinner({
  size = 'md',
  color = 'primary',
  fullScreen = false,
  text,
}: LoadingSpinnerProps) {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
    xl: 'w-16 h-16 border-4',
  }

  const colors = {
    primary: 'border-orange-500 border-t-transparent',
    white: 'border-white border-t-transparent',
    gray: 'border-gray-500 border-t-transparent',
  }

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={`
          ${sizes[size]}
          ${colors[color]}
          rounded-full
          animate-spin
        `}
      />
      {text && (
        <p className="text-sm text-gray-600 font-medium">{text}</p>
      )}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        {spinner}
      </div>
    )
  }

  return spinner
}

export function LoadingDots({ size = 'md', color = 'primary' }: { size?: 'sm' | 'md' | 'lg'; color?: 'primary' | 'white' | 'gray' }) {
  const sizes = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-3 h-3',
  }

  const colors = {
    primary: 'bg-orange-500',
    white: 'bg-white',
    gray: 'bg-gray-500',
  }

  return (
    <div className="flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`
            ${sizes[size]}
            ${colors[color]}
            rounded-full
            animate-bounce
          `}
          style={{
            animationDelay: `${i * 0.15}s`,
          }}
        />
      ))}
    </div>
  )
}

export function LoadingBar({ progress, className = '' }: { progress?: number; className?: string }) {
  return (
    <div className={`w-full bg-gray-200 rounded-full h-2 overflow-hidden ${className}`}>
      <div
        className={`
          h-full bg-orange-500 transition-all duration-300
          ${progress === undefined ? 'animate-pulse' : ''}
        `}
        style={{
          width: progress !== undefined ? `${progress}%` : '100%',
        }}
      />
    </div>
  )
}

export function LoadingOverlay({ text }: { text?: string }) {
  return (
    <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-10">
      <LoadingSpinner size="lg" text={text} />
    </div>
  )
}
