'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'

export default function ConfirmEmail() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''
  const { resendConfirmation } = useAuth()
  const [isResending, setIsResending] = useState(false)
  const [resendMessage, setResendMessage] = useState('')

  const handleResend = async () => {
    if (!email) return

    setIsResending(true)
    setResendMessage('')

    try {
      await resendConfirmation(email)
      setResendMessage('✅ Email de confirmación reenviado!')
    } catch (error) {
      setResendMessage('❌ Error al reenviar. Intenta de nuevo.')
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* Email Icon */}
        <div className="text-8xl mb-6">📧</div>

        {/* Main Message */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          ¡Revisa tu Email!
        </h1>

        <p className="text-lg text-gray-600 mb-6">
          Te enviamos un correo de confirmación a:
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="font-medium text-blue-800">{email}</p>
        </div>

        <p className="text-gray-600 mb-8">
          Haz clic en el enlace del email para activar tu cuenta y empezar a
          rescatar packs sorpresa.
        </p>

        {/* Resend Section */}
        <div className="border-t border-gray-200 pt-6">
          <p className="text-sm text-gray-500 mb-4">¿No recibiste el email?</p>

          {resendMessage && (
            <div
              className={`mb-4 p-3 rounded-lg text-sm ${
                resendMessage.includes('✅')
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              {resendMessage}
            </div>
          )}

          <button
            onClick={handleResend}
            disabled={isResending || !email}
            className="bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 text-white px-6 py-3 rounded-lg font-medium transition-colors mb-4 w-full"
          >
            {isResending ? 'Reenviando...' : '📤 Reenviar Email'}
          </button>
        </div>

        {/* Help Section */}
        <div className="bg-gray-50 rounded-lg p-4 mt-6">
          <h3 className="font-semibold text-gray-900 mb-2">💡 Consejos:</h3>
          <ul className="text-sm text-gray-600 space-y-1 text-left">
            <li>• Revisa tu carpeta de spam/promociones</li>
            <li>• El email puede tardar hasta 5 minutos</li>
            <li>• Asegúrate de que el email esté escrito correctamente</li>
          </ul>
        </div>

        {/* Back to login */}
        <div className="mt-8">
          <Link
            href="/auth/signin"
            className="text-green-600 hover:text-green-700 text-sm underline"
          >
            ← Volver al login
          </Link>
        </div>
      </div>
    </div>
  )
}
