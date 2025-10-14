'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import MercadoPagoButton from '@/components/payment/MercadoPagoButton';
import MercadoPagoCheckout from '@/components/payment/MercadoPagoCheckout';
import { ShoppingCart, CreditCard, Package } from 'lucide-react';
import { toast } from 'sonner';

export default function ExampleCheckoutPage() {
  const { data: session } = useSession();
  const [selectedPack, setSelectedPack] = useState<any>(null);
  const [checkoutType, setCheckoutType] = useState<'button' | 'checkout'>('button');

  // Ejemplo de packs disponibles
  const examplePacks = [
    {
      id: 'pack_1',
      title: 'Pack Italiano Clásico',
      description: 'Pizza Margherita + Pasta Carbonara + Bebida',
      originalPrice: 3500,
      discountedPrice: 2500,
      restaurant: 'La Nonna Italiana',
      image: '/images/pack-italiano.jpg'
    },
    {
      id: 'pack_2', 
      title: 'Pack Burger Gourmet',
      description: 'Hamburguesa Premium + Papas + Milkshake',
      originalPrice: 2800,
      discountedPrice: 1900,
      restaurant: 'Burger House',
      image: '/images/pack-burger.jpg'
    },
    {
      id: 'pack_3',
      title: 'Pack Sushi Especial',
      description: '20 piezas variadas + Sopa Miso + Té Verde',
      originalPrice: 4200,
      discountedPrice: 3200,
      restaurant: 'Sakura Sushi',
      image: '/images/pack-sushi.jpg'
    }
  ];

  const handlePackSelect = (pack: any) => {
    setSelectedPack(pack);
  };

  const createOrderItems = (pack: any) => {
    return [
      {
        id: pack.id,
        title: pack.title,
        description: pack.description,
        quantity: 1,
        unit_price: pack.discountedPrice
      }
    ];
  };

  const generateOrderId = () => {
    return `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center p-6">
            <p>Debes iniciar sesión para ver este ejemplo.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🛒 Ejemplo de Checkout con Mercado Pago
          </h1>
          <p className="text-gray-600">
            Demostración completa de la integración de pagos en TugoTugo
          </p>
        </div>

        {/* Selector de tipo de checkout */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Tipo de Checkout</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button
                variant={checkoutType === 'button' ? 'primary' : 'outline'}
                onClick={() => setCheckoutType('button')}
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Botón Simple
              </Button>
              <Button
                variant={checkoutType === 'checkout' ? 'primary' : 'outline'}
                onClick={() => setCheckoutType('checkout')}
              >
                <Package className="mr-2 h-4 w-4" />
                Checkout Completo
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Lista de Packs */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Packs Disponibles</h2>
            <div className="space-y-4">
              {examplePacks.map((pack) => (
                <Card 
                  key={pack.id}
                  className={`cursor-pointer transition-all ${
                    selectedPack?.id === pack.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => handlePackSelect(pack)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{pack.title}</h3>
                        <p className="text-gray-600 text-sm mb-2">{pack.description}</p>
                        <p className="text-sm text-gray-500">{pack.restaurant}</p>
                        
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-lg font-bold text-green-600">
                            ${pack.discountedPrice}
                          </span>
                          <span className="text-sm text-gray-500 line-through">
                            ${pack.originalPrice}
                          </span>
                          <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                            {Math.round(((pack.originalPrice - pack.discountedPrice) / pack.originalPrice) * 100)}% OFF
                          </span>
                        </div>
                      </div>
                      
                      {selectedPack?.id === pack.id && (
                        <div className="ml-4">
                          <ShoppingCart className="h-6 w-6 text-blue-500" />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Área de Checkout */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Checkout</h2>
            
            {!selectedPack ? (
              <Card>
                <CardContent className="text-center p-8">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    Selecciona un pack para continuar con el pago
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {/* Resumen del pedido */}
                <Card>
                  <CardHeader>
                    <CardTitle>Resumen del Pedido</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>{selectedPack.title}</span>
                        <span>${selectedPack.discountedPrice}</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Cantidad</span>
                        <span>1</span>
                      </div>
                      <div className="border-t pt-2 font-semibold">
                        <div className="flex justify-between">
                          <span>Total</span>
                          <span>${selectedPack.discountedPrice}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Checkout Component */}
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {checkoutType === 'button' ? 'Pago Rápido' : 'Checkout Completo'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {checkoutType === 'button' ? (
                      <div className="space-y-4">
                        <p className="text-sm text-gray-600">
                          Serás redirigido a Mercado Pago para completar el pago de forma segura.
                        </p>
                        <MercadoPagoButton
                          items={createOrderItems(selectedPack)}
                          orderId={generateOrderId()}
                          onSuccess={(preferenceId) => {
                            toast.success('Redirigiendo a Mercado Pago...');
                            console.log('Preference ID:', preferenceId);
                          }}
                          onError={(error) => {
                            toast.error(`Error: ${error}`);
                          }}
                          className="w-full"
                        >
                          Pagar ${selectedPack.discountedPrice} con Mercado Pago
                        </MercadoPagoButton>
                      </div>
                    ) : (
                      <MercadoPagoCheckout
                        items={createOrderItems(selectedPack)}
                        orderId={generateOrderId()}
                        onReady={() => {
                          toast.success('Checkout listo para usar');
                        }}
                        onError={(error) => {
                          toast.error(`Error: ${error}`);
                        }}
                      />
                    )}
                  </CardContent>
                </Card>

                {/* Información adicional */}
                <Card>
                  <CardContent className="p-4">
                    <div className="text-xs text-gray-500 space-y-1">
                      <p>✅ Pago 100% seguro con Mercado Pago</p>
                      <p>✅ Acepta todas las tarjetas y métodos de pago</p>
                      <p>✅ Confirmación inmediata por email</p>
                      <p>✅ Código QR para retirar tu pedido</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>

        {/* Información de desarrollo */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>🔧 Información de Desarrollo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Estado actual:</h4>
              <ul className="text-sm space-y-1">
                <li>• Entorno: <strong>Desarrollo (Sandbox)</strong></li>
                <li>• Usuario: <strong>{session.user?.email}</strong></li>
                <li>• Pack seleccionado: <strong>{selectedPack?.title || 'Ninguno'}</strong></li>
                <li>• Tipo de checkout: <strong>{checkoutType}</strong></li>
              </ul>
              
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-sm text-yellow-800">
                  <strong>Nota:</strong> Este es un entorno de pruebas. Los pagos no son reales.
                  Usa las tarjetas de prueba de Mercado Pago para simular transacciones.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
