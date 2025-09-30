'use client'

import React from 'react'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export default class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="text-6xl mb-6">🍽️</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              ¡Ups! Algo salió mal
            </h1>
            <p className="text-gray-600 mb-6">
              No te preocupes, nuestro equipo está trabajando para solucionarlo.
              Mientras tanto, puedes intentar recargar la página.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                🔄 Recargar página
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="w-full text-gray-500 hover:text-gray-700 px-6 py-2"
              >
                🏠 Volver al inicio
              </button>
            </div>
            
            {/* Impact message even on error */}
            <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-green-700 text-sm">
                🌱 Mientras solucionamos esto, recuerda que juntos hemos salvado más de 2,847 kg de comida este mes
              </p>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
