'use client'

import React, { useState, useRef, useEffect } from 'react'

interface VerificationCodeInputProps {
  length?: number
  onComplete: (inputCode: string) => void
  onResend?: () => void
  isLoading?: boolean
  error?: string
  email?: string
  canResend?: boolean
  resendCooldown?: number
}

export default function VerificationCodeInput({
  length = 6,
  onComplete,
  onResend,
  isLoading = false,
  error,
  email,
  canResend = true,
  resendCooldown = 120, // 2 minutes
}: VerificationCodeInputProps) {
  const [code, setCode] = useState<string[]>(new Array(length).fill(''))
  const [activeIndex, setActiveIndex] = useState(0)
  const [resendTimer, setResendTimer] = useState(0)
  const inputRefs = useRef<HTMLInputElement[]>([])

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendTimer])

  const handleChange = (index: number, value: string) => {
    if (isLoading) return

    const newCode = [...code]
    
    // Handle paste
    if (value.length > 1) {
      const pastedCode = value.slice(0, length).split('')
      for (let i = 0; i < length; i++) {
        newCode[i] = pastedCode[i] || ''
      }
      setCode(newCode)
      setActiveIndex(length - 1)
      
      // Check if complete
      if (pastedCode.length === length && pastedCode.every(digit => digit !== '')) {
        onComplete(pastedCode.join(''))
      }
      return
    }

    // Handle single character
    if (value === '' || /^\d$/.test(value)) {
      newCode[index] = value
      setCode(newCode)

      // Move to next input if value entered
      if (value && index < length - 1) {
        setActiveIndex(index + 1)
        inputRefs.current[index + 1]?.focus()
      }

      // Check if complete
      if (newCode.every(digit => digit !== '') && newCode.join('').length === length) {
        onComplete(newCode.join(''))
      }
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (isLoading) return

    if (e.key === 'Backspace') {
      if (code[index] === '' && index > 0) {
        // Move to previous input if current is empty
        setActiveIndex(index - 1)
        inputRefs.current[index - 1]?.focus()
      } else {
        // Clear current input
        const newCode = [...code]
        newCode[index] = ''
        setCode(newCode)
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      setActiveIndex(index - 1)
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      setActiveIndex(index + 1)
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleResend = () => {
    if (onResend && resendTimer === 0) {
      onResend()
      setResendTimer(resendCooldown)
      setCode(new Array(length).fill(''))
      setActiveIndex(0)
      inputRefs.current[0]?.focus()
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Ingresa el código de verificación
        </h2>
        {email && (
          <p className="text-gray-600">
            Enviamos un código de 6 dígitos a<br />
            <span className="font-semibold text-purple-600">{email}</span>
          </p>
        )}
      </div>

      {/* Code Input */}
      <div className="flex justify-center gap-3 mb-6">
        {code.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              if (el) inputRefs.current[index] = el
            }}
            type="text"
            inputMode="numeric"
            pattern="\d*"
            maxLength={length}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onFocus={() => setActiveIndex(index)}
            disabled={isLoading}
            className={`
              w-12 h-12 text-center text-xl font-bold border-2 rounded-lg
              transition-all duration-200
              ${activeIndex === index 
                ? 'border-purple-500 ring-2 ring-purple-200 bg-white' 
                : 'border-gray-300 bg-gray-50'
              }
              ${error 
                ? 'border-red-500 bg-red-50' 
                : ''
              }
              ${isLoading 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:border-purple-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200'
              }
            `}
          />
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm text-center">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-2 text-purple-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
            <span className="text-sm">Verificando código...</span>
          </div>
        </div>
      )}

      {/* Resend Section */}
      {canResend && onResend && (
        <div className="text-center">
          {resendTimer > 0 ? (
            <p className="text-gray-500 text-sm">
              Podrás solicitar un nuevo código en{' '}
              <span className="font-semibold text-purple-600">
                {formatTime(resendTimer)}
              </span>
            </p>
          ) : (
            <div>
              <p className="text-gray-600 text-sm mb-2">
                ¿No recibiste el código?
              </p>
              <button
                onClick={handleResend}
                disabled={isLoading}
                className="text-purple-600 hover:text-purple-700 font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reenviar código
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tips */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-blue-800 font-semibold text-sm mb-2">💡 Consejos:</h3>
        <ul className="text-blue-700 text-xs space-y-1">
          <li>• Revisa tu bandeja de entrada y carpeta de spam</li>
          <li>• El código expira en 15 minutos</li>
          <li>• Puedes pegar el código completo en cualquier casilla</li>
        </ul>
      </div>
    </div>
  )
}
