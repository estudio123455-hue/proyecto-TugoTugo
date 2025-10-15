import { NextRequest, NextResponse } from 'next/server'
import { MercadoPagoConfig, Payment } from 'mercadopago'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const paymentId = searchParams.get('payment_id')
    const orderId = searchParams.get('order_id')

    if (!paymentId && !orderId) {
      return NextResponse.json(
        { error: 'Se requiere payment_id o order_id' },
        { status: 400 }
      )
    }

    let paymentInfo = null

    if (paymentId) {
      // Buscar por ID de pago
      const payment = new Payment(client)
      paymentInfo = await payment.get({ id: paymentId })
    } else if (orderId) {
      // Buscar en la base de datos por order_id
      const { prisma } = await import('@/lib/prisma')
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        select: { paymentId: true, status: true, paymentStatus: true }
      })

      if (order?.paymentId) {
        const payment = new Payment(client)
        paymentInfo = await payment.get({ id: order.paymentId })
      }
    }

    if (!paymentInfo) {
      return NextResponse.json({ error: 'Pago no encontrado' }, { status: 404 })
    }

    return NextResponse.json({
      id: paymentInfo.id,
      status: paymentInfo.status,
      status_detail: paymentInfo.status_detail,
      payment_method_id: paymentInfo.payment_method_id,
      transaction_amount: paymentInfo.transaction_amount,
      currency_id: paymentInfo.currency_id,
      date_created: paymentInfo.date_created,
      date_approved: paymentInfo.date_approved,
      external_reference: paymentInfo.external_reference
    })

  } catch (error) {
    console.error('Error obteniendo estado del pago:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
