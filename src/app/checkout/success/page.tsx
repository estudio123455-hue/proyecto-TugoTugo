'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Navigation from '@/components/Navigation'
import { CheckCircle, MapPin, Clock, Phone, Download } from 'lucide-react'

interface OrderData {
  id: string
  packTitle: string
  establishmentName: string
  establishmentAddress: string
  quantity: number
  unitPrice: number
  totalAmount: number
  status: string
  createdAt: string
  paidAt: string
  pack: {
    pickupTimeStart: string
    pickupTimeEnd: string
    establishment: {
      name: string
      address: string
      phone?: string
    }
  }
}

export default function CheckoutSuccess() {
  const [orderData, setOrderData] = useState<OrderData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  
  const orderId = searchParams.get('order_id')
  const isSimulated = searchParams.get('simulated') === 'true'

  useEffect(() => {
    if (!orderId || !session) return

    fetchOrderData()
  }, [orderId, session])

  const fetchOrderData = async () => {
    try {
      const response = await fetch(`/api/checkout?orderId=${orderId}`)
      const data = await response.json()

      if (data.success) {
        setOrderData(data.data)
      } else {
        setError(data.message || 'Error obteniendo información de la orden')
      }
    } catch (error) {
      console.error('Error:', error)
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const generateReceipt = () => {
    if (!orderData) return

    const receiptContent = `
RECIBO DE COMPRA - TUGOTUGO
================================

Orden: ${orderData.id}
Fecha: ${new Date(orderData.createdAt).toLocaleString('es-CO')}
Estado: ${orderData.status}

PRODUCTO:
${orderData.packTitle}

RESTAURANTE:
${orderData.pack.establishment.name}
${orderData.pack.establishment.address}
${orderData.pack.establishment.phone ? `Tel: ${orderData.pack.establishment.phone}` : ''}

HORARIO DE RECOGIDA:
${orderData.pack.pickupTimeStart} - ${orderData.pack.pickupTimeEnd}

DETALLES:
Cantidad: ${orderData.quantity}
Precio unitario: $${orderData.unitPrice.toFixed(2)}
Total: $${orderData.totalAmount.toFixed(2)}

¡Gracias por tu compra!
Ayudas a reducir el desperdicio de comida 🌱
    `

    const blob = new Blob([receiptContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `recibo-${orderData.id}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Procesando tu compra...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !orderData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <div className="text-red-500 text-4xl mb-4">❌</div>
            <h1 className="text-xl font-semibold text-red-800 mb-2">Error</h1>
            <p className="text-red-600">{error}</p>
            <a 
              href="/packs" 
              className="inline-block mt-4 bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
            >
              Volver a Packs
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header de éxito */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ¡Compra Exitosa! 🎉
          </h1>
          <p className="text-lg text-gray-600">
            Tu pack sorpresa ha sido reservado
          </p>
          {isSimulated && (
            <div className="mt-2 inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
              🧪 Modo de prueba - Pago simulado
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Información del pedido */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              📦 Detalles del Pedido
            </h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900">{orderData.packTitle}</h3>
                <p className="text-gray-600">Cantidad: {orderData.quantity}</p>
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">${(orderData.unitPrice * orderData.quantity).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">IVA (19%):</span>
                  <span className="font-medium">${(orderData.totalAmount - (orderData.unitPrice * orderData.quantity)).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-lg font-bold border-t pt-2">
                  <span>Total:</span>
                  <span className="text-green-600">${orderData.totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">
                  <strong>Orden ID:</strong> {orderData.id}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Fecha:</strong> {new Date(orderData.createdAt).toLocaleString('es-CO')}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Estado:</strong> <span className="text-green-600 font-medium">{orderData.status}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Información de recogida */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              📍 Información de Recogida
            </h2>
            
            <div className="space-y-6">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900">{orderData.pack.establishment.name}</h3>
                  <p className="text-gray-600">{orderData.pack.establishment.address}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Clock className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900">Horario de Recogida</h3>
                  <p className="text-gray-600">
                    {orderData.pack.pickupTimeStart} - {orderData.pack.pickupTimeEnd}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Recuerda llegar en el horario indicado
                  </p>
                </div>
              </div>

              {orderData.pack.establishment.phone && (
                <div className="flex items-start space-x-3">
                  <Phone className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Teléfono</h3>
                    <p className="text-gray-600">{orderData.pack.establishment.phone}</p>
                  </div>
                </div>
              )}

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-2">🌱 Impacto Ambiental</h4>
                <p className="text-sm text-green-700">
                  ¡Felicitaciones! Has ayudado a salvar aproximadamente <strong>1.2 kg</strong> de comida 
                  del desperdicio y has reducido <strong>3.6 kg</strong> de CO₂.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={generateReceipt}
            className="flex items-center justify-center space-x-2 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Descargar Recibo</span>
          </button>
          
          <a
            href="/packs"
            className="flex items-center justify-center space-x-2 bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors"
          >
            <span>🛒</span>
            <span>Comprar Más Packs</span>
          </a>
          
          <a
            href="/profile"
            className="flex items-center justify-center space-x-2 bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
          >
            <span>👤</span>
            <span>Ver Mi Perfil</span>
          </a>
        </div>

        {/* Instrucciones adicionales */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-3">📋 Instrucciones Importantes</h3>
          <ul className="space-y-2 text-blue-800">
            <li className="flex items-start space-x-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Llega al restaurante en el horario indicado</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Muestra este recibo o menciona tu ID de orden</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Trae una bolsa reutilizable si es posible</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>¡Disfruta tu pack sorpresa y ayuda al planeta! 🌍</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
