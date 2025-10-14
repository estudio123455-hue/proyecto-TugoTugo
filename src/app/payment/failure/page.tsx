'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { XCircle, Home, RotateCcw } from 'lucide-react';

export default function PaymentFailurePage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const paymentId = searchParams.get('payment_id');
  const status = searchParams.get('status');
  const externalReference = searchParams.get('external_reference');

  const getErrorMessage = () => {
    switch (status) {
      case 'rejected':
        return 'El pago fue rechazado. Verifica los datos de tu tarjeta e intenta nuevamente.';
      case 'cancelled':
        return 'El pago fue cancelado.';
      default:
        return 'Hubo un problema procesando tu pago. Por favor, intenta nuevamente.';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <XCircle className="h-16 w-16 text-red-500" />
          </div>
          <CardTitle className="text-red-700">
            Pago No Completado
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-gray-600">
            {getErrorMessage()}
          </div>

          {paymentId && (
            <div className="space-y-2 text-sm bg-gray-50 p-3 rounded">
              <div className="flex justify-between">
                <span>ID de Pago:</span>
                <span className="font-mono">{paymentId}</span>
              </div>
              <div className="flex justify-between">
                <span>Estado:</span>
                <span className="capitalize">{status}</span>
              </div>
              {externalReference && (
                <div className="flex justify-between">
                  <span>Orden:</span>
                  <span className="font-mono">{externalReference}</span>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col gap-2 pt-4">
            <Button 
              onClick={() => router.back()}
              className="w-full"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Intentar Nuevamente
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => router.push('/dashboard')}
              className="w-full"
            >
              <Home className="mr-2 h-4 w-4" />
              Ir al Dashboard
            </Button>
          </div>

          <div className="text-xs text-gray-500 text-center">
            Si el problema persiste, contacta con soporte técnico.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
