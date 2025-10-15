'use client'

import { useEffect, useState } from 'react'
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react'
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface MercadoPagoCheckoutProps {
  items: Array<{
    id: string;
    title: string;
    description?: string;
    quantity: number;
    unit_price: number;
  }>;
  orderId?: string;
  onReady?: () => void;
  onError?: (error: string) => void;
}

export default function MercadoPagoCheckout({
  items,
  orderId,
  onReady,
  onError
}: MercadoPagoCheckoutProps) {
  const [preferenceId, setPreferenceId] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Inicializar MercadoPago
    const publicKey = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY
    
    if (!publicKey) {
      const error = 'Clave pública de MercadoPago no configurada'
      toast.error(error)
      onError?.(error)
      return
    }

    initMercadoPago(publicKey, {
      locale: 'es-AR' // Cambiar según tu país
    })

    createPreference()
  }, [items, orderId])

  const createPreference = async () => {
    try {
      setLoading(true)

      const response = await fetch('/api/mercadopago/create-preference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items,
          orderId,
          backUrls: {
            success: `${window.location.origin}/payment/success`,
            failure: `${window.location.origin}/payment/failure`,
            pending: `${window.location.origin}/payment/pending`
          }
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error creando preferencia de pago')
      }

      const { id } = await response.json()
      setPreferenceId(id)
      onReady?.()

    } catch (error) {
      console.error('Error creando preferencia:', error)
      const errorMessage = error instanceof Error ? error.message : 'Error creando preferencia'
      toast.error(errorMessage)
      onError?.(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Preparando checkout...</span>
        </CardContent>
      </Card>
    )
  }

  if (!preferenceId) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-red-600">
            Error cargando el checkout. Por favor, intenta nuevamente.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Finalizar Pago</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Resumen de items */}
          <div className="space-y-2">
            <h4 className="font-medium">Resumen del pedido:</h4>
            {items.map((item, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span>{item.title} x{item.quantity}</span>
                <span>${(item.unit_price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="border-t pt-2 font-medium">
              <div className="flex justify-between">
                <span>Total:</span>
                <span>
                  ${items.reduce((total, item) => total + (item.unit_price * item.quantity), 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Wallet de MercadoPago */}
          <div className="mt-4">
            <Wallet
              initialization={{ preferenceId }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
