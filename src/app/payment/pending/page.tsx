'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Clock, Home, RefreshCw } from 'lucide-react';

export default function PaymentPendingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const paymentId = searchParams.get('payment_id');
  const status = searchParams.get('status');
  const externalReference = searchParams.get('external_reference');

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <Clock className="h-16 w-16 text-yellow-500" />
          </div>
          <CardTitle className="text-yellow-700">
            Pago Pendiente
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-gray-600">
            Tu pago está siendo procesado. Te notificaremos cuando se complete.
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-medium text-yellow-800 mb-2">¿Qué significa esto?</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• El pago puede tardar hasta 24 horas en procesarse</li>
              <li>• Recibirás una notificación cuando se confirme</li>
              <li>• No es necesario realizar el pago nuevamente</li>
            </ul>
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
              onClick={() => window.location.reload()}
              variant="outline"
              className="w-full"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Verificar Estado
            </Button>
            
            <Button 
              onClick={() => router.push('/dashboard')}
              className="w-full"
            >
              <Home className="mr-2 h-4 w-4" />
              Ir al Dashboard
            </Button>
          </div>

          <div className="text-xs text-gray-500 text-center">
            Puedes cerrar esta página. Te notificaremos por email cuando el pago se complete.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
