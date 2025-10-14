'use client';

import { useSession } from 'next-auth/react';
import PaymentMethodsDisplay from '@/components/payment/PaymentMethodsDisplay';
import Card, { CardContent } from '@/components/ui/Card';

export default function PaymentMethodsPage() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-8"></div>
            <div className="space-y-4">
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-48 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card>
            <CardContent className="text-center p-8">
              <h2 className="text-xl font-semibold mb-4">Acceso Requerido</h2>
              <p className="text-gray-600 mb-4">
                Debes iniciar sesión para ver los métodos de pago disponibles.
              </p>
              <a
                href="/auth/signin"
                className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Iniciar Sesión
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            💳 Métodos de Pago Disponibles
          </h1>
          <p className="text-gray-600">
            Explora todos los métodos de pago que acepta TugoTugo a través de Mercado Pago
          </p>
        </div>

        {/* Información importante */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-800 mb-2">ℹ️ Información Importante</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Todos los pagos son procesados de forma segura por Mercado Pago</li>
                <li>• Los métodos disponibles pueden variar según tu ubicación</li>
                <li>• Algunos métodos pueden tener límites mínimos o máximos</li>
                <li>• La disponibilidad puede cambiar según el establecimiento</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Componente principal */}
        <PaymentMethodsDisplay />

        {/* Footer informativo */}
        <Card className="mt-8">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="font-medium text-gray-900 mb-2">
                ¿Tienes problemas con algún método de pago?
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Si experimentas dificultades con algún método de pago, contacta con nuestro soporte.
              </p>
              <div className="flex justify-center space-x-4">
                <a
                  href="mailto:soporte@tugotug.com"
                  className="text-blue-600 hover:text-blue-700 text-sm"
                >
                  📧 Enviar Email
                </a>
                <a
                  href="https://wa.me/1234567890"
                  className="text-green-600 hover:text-green-700 text-sm"
                >
                  📱 WhatsApp
                </a>
                <a
                  href="/help"
                  className="text-gray-600 hover:text-gray-700 text-sm"
                >
                  ❓ Centro de Ayuda
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
