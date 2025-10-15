import { NextRequest, NextResponse } from 'next/server'
import { MercadoPagoConfig, Preference } from 'mercadopago'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
  options: {
    timeout: 5000,
    idempotencyKey: 'abc'
  }
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { items, orderId, backUrls } = body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Items requeridos' }, { status: 400 })
    }

    const preference = new Preference(client)

    const preferenceData = {
      items: items.map((item: any) => ({
        id: item.id,
        title: item.title,
        description: item.description || '',
        quantity: item.quantity,
        unit_price: item.unit_price,
        currency_id: 'ARS' // Cambiar según tu país
      })),
      payer: {
        email: session.user.email || undefined,
        name: session.user.name || 'Usuario',
      },
      back_urls: {
        success: backUrls?.success || `${process.env.NEXTAUTH_URL}/payment/success`,
        failure: backUrls?.failure || `${process.env.NEXTAUTH_URL}/payment/failure`,
        pending: backUrls?.pending || `${process.env.NEXTAUTH_URL}/payment/pending`
      },
      auto_return: 'approved',
      external_reference: orderId || `order_${Date.now()}`,
      notification_url: `${process.env.NEXTAUTH_URL}/api/mercadopago/webhook`,
      metadata: {
        user_id: session.user.id,
        order_id: orderId
      }
    }

    const result = await preference.create({ body: preferenceData })

    return NextResponse.json({
      id: result.id,
      init_point: result.init_point,
      sandbox_init_point: result.sandbox_init_point
    })

  } catch (error) {
    console.error('Error creando preferencia de MercadoPago:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
