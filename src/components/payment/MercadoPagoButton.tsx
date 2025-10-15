'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import { Loader2, CreditCard } from 'lucide-react'
import { toast } from 'sonner'

interface MercadoPagoButtonProps {
  items: Array<{
    id: string;
    title: string;
    description?: string;
    quantity: number;
    unit_price: number;
  }>;
  orderId?: string;
  onSuccess?: (preferenceId: string) => void;
  onError?: (error: string) => void;
  className?: string;
  children?: React.ReactNode;
}

export default function MercadoPagoButton({
  items,
  orderId,
  onSuccess,
  onError,
  className,
  children
}: MercadoPagoButtonProps) {
  const [loading, setLoading] = useState(false)

  const handlePayment = async () => {
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

      const { id, init_point, sandbox_init_point } = await response.json()

      // Usar sandbox_init_point en desarrollo, init_point en producción
      const paymentUrl = process.env.NODE_ENV === 'development' 
        ? sandbox_init_point 
        : init_point

      // Redirigir a MercadoPago
      window.location.href = paymentUrl

      onSuccess?.(id)

    } catch (error) {
      console.error('Error procesando pago:', error)
      const errorMessage = error instanceof Error ? error.message : 'Error procesando pago'
      toast.error(errorMessage)
      onError?.(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={handlePayment}
      disabled={loading || items.length === 0}
      className={className}
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Procesando...
        </>
      ) : (
        <>
          <CreditCard className="mr-2 h-4 w-4" />
          {children || 'Pagar con Mercado Pago'}
        </>
      )}
    </Button>
  )
}
