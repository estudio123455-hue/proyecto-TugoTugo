import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-08-16',
})

export async function POST(request: NextRequest) {
  try {
    // Log para debug
    console.log('🔍 Creating order - Stripe key exists:', !!process.env.STRIPE_SECRET_KEY)
    
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { packId, quantity } = await request.json()

    if (!packId || !quantity || quantity < 1) {
      return NextResponse.json(
        { message: 'Invalid request data' },
        { status: 400 }
      )
    }

    // Get pack details
    const pack = await prisma.pack.findUnique({
      where: { id: packId },
      include: {
        establishment: true,
      },
    })

    if (!pack) {
      return NextResponse.json({ message: 'Pack not found' }, { status: 404 })
    }

    if (pack.quantity < quantity) {
      return NextResponse.json(
        { message: 'Not enough packs available' },
        { status: 400 }
      )
    }

    if (!pack.isActive || new Date(pack.availableUntil) < new Date()) {
      return NextResponse.json(
        { message: 'Pack is no longer available' },
        { status: 400 }
      )
    }

    const totalAmount = pack.discountedPrice * quantity

    // Stripe minimum amount for COP is 3000 (about $0.75 USD)
    const unitAmount = Math.round(pack.discountedPrice)
    if (unitAmount < 3000) {
      return NextResponse.json(
        { message: 'El monto mínimo para pagos es $3,000 COP' },
        { status: 400 }
      )
    }

    // Create order
    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        packId: packId,
        quantity: quantity,
        totalAmount: totalAmount,
        pickupDate: new Date(pack.availableFrom),
        status: 'PENDING',
      },
    })

    // Create Stripe checkout session
    let stripeSession
    try {
      stripeSession = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'cop',
              product_data: {
                name: `${pack.title} - ${pack.establishment.name}`,
                description: pack.description,
              },
              unit_amount: unitAmount, // COP doesn't use decimals
            },
            quantity: quantity,
          },
        ],
        mode: 'payment',
        success_url: `${request.nextUrl.origin}/orders/${order.id}/success`,
        cancel_url: `${request.nextUrl.origin}/map`,
        metadata: {
          orderId: order.id,
        },
      })
    } catch (stripeError: any) {
      // Delete the order if Stripe fails
      await prisma.order.delete({ where: { id: order.id } })
      
      console.error('❌ Stripe error:', stripeError)
      console.error('Error type:', stripeError.type)
      console.error('Error code:', stripeError.code)
      
      return NextResponse.json(
        { 
          message: 'Error al procesar el pago. Por favor intenta de nuevo.',
          error: stripeError.message,
          details: process.env.NODE_ENV === 'development' ? {
            type: stripeError.type,
            code: stripeError.code,
            hasKey: !!process.env.STRIPE_SECRET_KEY
          } : undefined
        },
        { status: 500 }
      )
    }

    // Update order with Stripe session ID
    await prisma.order.update({
      where: { id: order.id },
      data: { stripePaymentId: stripeSession.id },
    })

    return NextResponse.json({
      paymentUrl: stripeSession.url,
      orderId: order.id,
    })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const orders = await prisma.order.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        pack: {
          include: {
            establishment: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
