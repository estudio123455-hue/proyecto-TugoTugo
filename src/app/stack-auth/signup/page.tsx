'use client'

import { SignUp } from '@stackframe/react'
import Navigation from '@/components/Navigation'

export default function StackSignUpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <Navigation />
      <div className="flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              ¡Únete a FoodSave!
            </h1>
            <p className="text-gray-600">
              Crea tu cuenta y empieza a reducir el desperdicio de comida
            </p>
          </div>
          
          <SignUp />
        </div>
      </div>
    </div>
  )
}
