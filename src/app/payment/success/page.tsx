'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { CheckCircle, Loader2, Home, Receipt } from 'lucide-react';
import { toast } from 'sonner';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [paymentInfo, setPaymentInfo] = useState<any>(null);

  const paymentId = searchParams.get('payment_id');
  const status = searchParams.get('status');
  const externalReference = searchParams.get('external_reference');

  useEffect(() => {
    if (paymentId) {
      fetchPaymentStatus();
    } else {
      setLoading(false);
    }
  }, [paymentId]);

  const fetchPaymentStatus = async () => {
    try {
      const response = await fetch(`/api/mercadopago/payment-status?payment_id=${paymentId}`);
      
      if (response.ok) {
        const data = await response.json();
        setPaymentInfo(data);
        
        if (data.status === 'approved') {
          toast.success('¡Pago confirmado exitosamente!');
        }
      }
    } catch (error) {
      console.error('Error obteniendo estado del pago:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="flex items-center justify-center p-6">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Verificando pago...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-green-700">
            ¡Pago Exitoso!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-gray-600">
            Tu pago ha sido procesado correctamente.
          </div>

          {paymentInfo && (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>ID de Pago:</span>
                <span className="font-mono">{paymentInfo.id}</span>
              </div>
              <div className="flex justify-between">
                <span>Monto:</span>
                <span>${paymentInfo.transaction_amount}</span>
              </div>
              <div className="flex justify-between">
                <span>Método:</span>
                <span>{paymentInfo.payment_method_id}</span>
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
              onClick={() => router.push('/dashboard')}
              className="w-full"
            >
              <Home className="mr-2 h-4 w-4" />
              Ir al Dashboard
            </Button>
            
            {externalReference && (
              <Button 
                variant="outline"
                onClick={() => router.push(`/orders/${externalReference}`)}
                className="w-full"
              >
                <Receipt className="mr-2 h-4 w-4" />
                Ver Orden
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
