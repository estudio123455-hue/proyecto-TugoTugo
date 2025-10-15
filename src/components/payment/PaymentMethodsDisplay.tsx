'use client'

import { useEffect, useState } from 'react'
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Loader2, CreditCard, Smartphone, Building2, Receipt } from 'lucide-react'

interface PaymentMethod {
  id: string;
  name: string;
  payment_type_id: string;
  status: string;
  thumbnail?: string;
  secure_thumbnail?: string;
}

interface PaymentMethodsData {
  methods: { [key: string]: PaymentMethod[] };
  stats: {
    total: number;
    by_type: { [key: string]: number };
    active: number;
  };
  popular: PaymentMethod[];
}

export default function PaymentMethodsDisplay() {
  const [data, setData] = useState<PaymentMethodsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPaymentMethods()
  }, [])

  const fetchPaymentMethods = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/mercadopago/payment-methods')
      
      if (!response.ok) {
        throw new Error('Error obteniendo métodos de pago')
      }

      const result = await response.json()
      
      if (result.success) {
        setData(result.data)
      } else {
        throw new Error(result.message || 'Error desconocido')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'credit_card':
      case 'debit_card':
        return <CreditCard className="h-5 w-5" />
      case 'digital_wallet':
        return <Smartphone className="h-5 w-5" />
      case 'bank_transfer':
        return <Building2 className="h-5 w-5" />
      case 'ticket':
        return <Receipt className="h-5 w-5" />
      default:
        return <CreditCard className="h-5 w-5" />
    }
  }

  const getTypeName = (type: string) => {
    const names: { [key: string]: string } = {
      'credit_card': 'Tarjetas de Crédito',
      'debit_card': 'Tarjetas de Débito',
      'digital_wallet': 'Billeteras Digitales',
      'bank_transfer': 'Transferencias Bancarias',
      'ticket': 'Pagos en Efectivo',
      'atm': 'Cajeros Automáticos'
    }
    return names[type] || type
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Cargando métodos de pago...</span>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <p className="font-medium">Error cargando métodos de pago</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Estadísticas */}
      <Card>
        <CardHeader>
          <CardTitle>📊 Estadísticas de Métodos de Pago</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{data.stats.total}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{data.stats.active}</div>
              <div className="text-sm text-gray-600">Activos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{Object.keys(data.methods).length}</div>
              <div className="text-sm text-gray-600">Tipos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{data.popular.length}</div>
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
            {data.popular.map((method) => (
              <div
                key={method.id}
                className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                {method.secure_thumbnail ? (
                  <img
                    src={method.secure_thumbnail}
                    alt={method.name}
                    className="w-8 h-8 object-contain"
                  />
                ) : (
                  <div className="w-8 h-8 flex items-center justify-center">
                    {getTypeIcon(method.payment_type_id)}
                  </div>
                )}
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
        {Object.entries(data.methods).map(([type, methods]) => (
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
                    {method.secure_thumbnail ? (
                      <img
                        src={method.secure_thumbnail}
                        alt={method.name}
                        className="w-10 h-10 object-contain"
                      />
                    ) : (
                      <div className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded">
                        {getTypeIcon(method.payment_type_id)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{method.name}</p>
                      <p className="text-sm text-gray-500">{method.id}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span
                          className={`inline-block w-2 h-2 rounded-full ${
                            method.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                          }`}
                        />
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
  )
}
