'use client';

import { useState } from 'react';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { CreditCard, Smartphone, Building2, Receipt, Eye, EyeOff } from 'lucide-react';

// Datos de ejemplo para demostración
const demoPaymentMethods = {
  methods: {
    credit_card: [
      {
        id: 'visa',
        name: 'Visa',
        payment_type_id: 'credit_card',
        status: 'active',
        thumbnail: 'https://http2.mlstatic.com/storage/logos-api-admin/a5f047d0-9be0-11ec-aad4-c3381f368aaf-m.svg',
        secure_thumbnail: 'https://http2.mlstatic.com/storage/logos-api-admin/a5f047d0-9be0-11ec-aad4-c3381f368aaf-m.svg'
      },
      {
        id: 'master',
        name: 'Mastercard',
        payment_type_id: 'credit_card',
        status: 'active',
        thumbnail: 'https://http2.mlstatic.com/storage/logos-api-admin/aa2b8f70-5c85-11ec-ae75-df2bef173be2-m.svg',
        secure_thumbnail: 'https://http2.mlstatic.com/storage/logos-api-admin/aa2b8f70-5c85-11ec-ae75-df2bef173be2-m.svg'
      },
      {
        id: 'amex',
        name: 'American Express',
        payment_type_id: 'credit_card',
        status: 'active',
        thumbnail: 'https://http2.mlstatic.com/storage/logos-api-admin/ce454480-445f-11eb-bf78-3b1ee7bf744c-m.svg',
        secure_thumbnail: 'https://http2.mlstatic.com/storage/logos-api-admin/ce454480-445f-11eb-bf78-3b1ee7bf744c-m.svg'
      }
    ],
    debit_card: [
      {
        id: 'debvisa',
        name: 'Visa Débito',
        payment_type_id: 'debit_card',
        status: 'active',
        thumbnail: 'https://http2.mlstatic.com/storage/logos-api-admin/a5f047d0-9be0-11ec-aad4-c3381f368aaf-m.svg',
        secure_thumbnail: 'https://http2.mlstatic.com/storage/logos-api-admin/a5f047d0-9be0-11ec-aad4-c3381f368aaf-m.svg'
      },
      {
        id: 'debmaster',
        name: 'Mastercard Débito',
        payment_type_id: 'debit_card',
        status: 'active',
        thumbnail: 'https://http2.mlstatic.com/storage/logos-api-admin/aa2b8f70-5c85-11ec-ae75-df2bef173be2-m.svg',
        secure_thumbnail: 'https://http2.mlstatic.com/storage/logos-api-admin/aa2b8f70-5c85-11ec-ae75-df2bef173be2-m.svg'
      }
    ],
    digital_wallet: [
      {
        id: 'mercadopago',
        name: 'Mercado Pago',
        payment_type_id: 'digital_wallet',
        status: 'active',
        thumbnail: 'https://http2.mlstatic.com/storage/logos-api-admin/0a187de0-f2fa-11eb-8e0d-6f4af49bf82e-m.svg',
        secure_thumbnail: 'https://http2.mlstatic.com/storage/logos-api-admin/0a187de0-f2fa-11eb-8e0d-6f4af49bf82e-m.svg'
      }
    ],
    ticket: [
      {
        id: 'rapipago',
        name: 'Rapipago',
        payment_type_id: 'ticket',
        status: 'active',
        thumbnail: 'https://http2.mlstatic.com/storage/logos-api-admin/443c0270-2c9c-11ec-b040-7b3c4f5b8d2c-m.svg',
        secure_thumbnail: 'https://http2.mlstatic.com/storage/logos-api-admin/443c0270-2c9c-11ec-b040-7b3c4f5b8d2c-m.svg'
      },
      {
        id: 'pagofacil',
        name: 'Pago Fácil',
        payment_type_id: 'ticket',
        status: 'active',
        thumbnail: 'https://http2.mlstatic.com/storage/logos-api-admin/f3d8750c-8d10-11ec-b040-7b3c4f5b8d2c-m.svg',
        secure_thumbnail: 'https://http2.mlstatic.com/storage/logos-api-admin/f3d8750c-8d10-11ec-b040-7b3c4f5b8d2c-m.svg'
      }
    ],
    bank_transfer: [
      {
        id: 'pse',
        name: 'PSE',
        payment_type_id: 'bank_transfer',
        status: 'active',
        thumbnail: 'https://http2.mlstatic.com/storage/logos-api-admin/312238e0-571a-11eb-9a5d-e1b85ae8f222-m.svg',
        secure_thumbnail: 'https://http2.mlstatic.com/storage/logos-api-admin/312238e0-571a-11eb-9a5d-e1b85ae8f222-m.svg'
      }
    ]
  },
  stats: {
    total: 8,
    by_type: {
      credit_card: 3,
      debit_card: 2,
      digital_wallet: 1,
      ticket: 2,
      bank_transfer: 1
    },
    active: 8
  },
  popular: [
    {
      id: 'visa',
      name: 'Visa',
      payment_type_id: 'credit_card',
      thumbnail: 'https://http2.mlstatic.com/storage/logos-api-admin/a5f047d0-9be0-11ec-aad4-c3381f368aaf-m.svg',
      secure_thumbnail: 'https://http2.mlstatic.com/storage/logos-api-admin/a5f047d0-9be0-11ec-aad4-c3381f368aaf-m.svg'
    },
    {
      id: 'master',
      name: 'Mastercard',
      payment_type_id: 'credit_card',
      thumbnail: 'https://http2.mlstatic.com/storage/logos-api-admin/aa2b8f70-5c85-11ec-ae75-df2bef173be2-m.svg',
      secure_thumbnail: 'https://http2.mlstatic.com/storage/logos-api-admin/aa2b8f70-5c85-11ec-ae75-df2bef173be2-m.svg'
    },
    {
      id: 'mercadopago',
      name: 'Mercado Pago',
      payment_type_id: 'digital_wallet',
      thumbnail: 'https://http2.mlstatic.com/storage/logos-api-admin/0a187de0-f2fa-11eb-8e0d-6f4af49bf82e-m.svg',
      secure_thumbnail: 'https://http2.mlstatic.com/storage/logos-api-admin/0a187de0-f2fa-11eb-8e0d-6f4af49bf82e-m.svg'
    }
  ]
};

export default function DemoPaymentMethodsPage() {
  const [showJson, setShowJson] = useState(false);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'credit_card':
      case 'debit_card':
        return <CreditCard className="h-5 w-5" />;
      case 'digital_wallet':
        return <Smartphone className="h-5 w-5" />;
      case 'bank_transfer':
        return <Building2 className="h-5 w-5" />;
      case 'ticket':
        return <Receipt className="h-5 w-5" />;
      default:
        return <CreditCard className="h-5 w-5" />;
    }
  };

  const getTypeName = (type: string) => {
    const names: { [key: string]: string } = {
      'credit_card': 'Tarjetas de Crédito',
      'debit_card': 'Tarjetas de Débito',
      'digital_wallet': 'Billeteras Digitales',
      'bank_transfer': 'Transferencias Bancarias',
      'ticket': 'Pagos en Efectivo',
      'atm': 'Cajeros Automáticos'
    };
    return names[type] || type;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🧪 Demo - Métodos de Pago de MercadoPago
          </h1>
          <p className="text-gray-600">
            Demostración de cómo se verían los métodos de pago reales (datos de ejemplo)
          </p>
        </div>

        {/* Alerta de Demo */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-medium text-yellow-800 mb-2">🧪 Modo Demo</h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Estos son datos de ejemplo para mostrar cómo funciona la integración</li>
                <li>• Para ver datos reales, necesitas configurar credenciales válidas de MercadoPago</li>
                <li>• Consulta el archivo <code>COMO_OBTENER_CREDENCIALES.md</code> para más información</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Controles */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Opciones de Vista</h3>
                <p className="text-sm text-gray-600">Explora los datos de diferentes formas</p>
              </div>
              <Button
                variant="outline"
                onClick={() => setShowJson(!showJson)}
              >
                {showJson ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
                {showJson ? 'Ocultar JSON' : 'Ver JSON'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {showJson ? (
          /* Vista JSON */
          <Card>
            <CardHeader>
              <CardTitle>📄 Respuesta JSON de la API</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm">
                {JSON.stringify(demoPaymentMethods, null, 2)}
              </pre>
            </CardContent>
          </Card>
        ) : (
          /* Vista Visual */
          <div className="space-y-6">
            {/* Estadísticas */}
            <Card>
              <CardHeader>
                <CardTitle>📊 Estadísticas de Métodos de Pago</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{demoPaymentMethods.stats.total}</div>
                    <div className="text-sm text-gray-600">Total</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{demoPaymentMethods.stats.active}</div>
                    <div className="text-sm text-gray-600">Activos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{Object.keys(demoPaymentMethods.methods).length}</div>
                    <div className="text-sm text-gray-600">Tipos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{demoPaymentMethods.popular.length}</div>
                    <div className="text-sm text-gray-600">Populares</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Métodos Populares */}
            <Card>
              <CardHeader>
                <CardTitle>🌟 Métodos Más Populares</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {demoPaymentMethods.popular.map((method) => (
                    <div
                      key={method.id}
                      className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <img
                        src={method.secure_thumbnail}
                        alt={method.name}
                        className="w-8 h-8 object-contain"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{method.name}</p>
                        <p className="text-xs text-gray-500">{method.id}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Métodos por Tipo */}
            <div className="grid gap-6">
              {Object.entries(demoPaymentMethods.methods).map(([type, methods]) => (
                <Card key={type}>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      {getTypeIcon(type)}
                      <span>{getTypeName(type)}</span>
                      <span className="text-sm font-normal text-gray-500">
                        ({methods.length} métodos)
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {methods.map((method) => (
                        <div
                          key={method.id}
                          className="flex items-center space-x-3 p-3 border rounded-lg"
                        >
                          <img
                            src={method.secure_thumbnail}
                            alt={method.name}
                            className="w-10 h-10 object-contain"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{method.name}</p>
                            <p className="text-sm text-gray-500">{method.id}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="inline-block w-2 h-2 rounded-full bg-green-500" />
                              <span className="text-xs text-gray-500 capitalize">
                                {method.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <Card className="mt-8">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="font-medium text-gray-900 mb-2">
                ¿Quieres ver datos reales?
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Configura tus credenciales de MercadoPago para obtener los métodos de pago reales disponibles en tu país.
              </p>
              <div className="flex justify-center space-x-4">
                <a
                  href="/COMO_OBTENER_CREDENCIALES.md"
                  className="text-blue-600 hover:text-blue-700 text-sm"
                >
                  📖 Guía de Credenciales
                </a>
                <a
                  href="https://developers.mercadopago.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 hover:text-green-700 text-sm"
                >
                  🌐 MercadoPago Developers
                </a>
                <a
                  href="/example-checkout"
                  className="text-purple-600 hover:text-purple-700 text-sm"
                >
                  🛒 Ver Demo de Checkout
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
