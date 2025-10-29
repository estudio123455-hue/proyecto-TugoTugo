import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Simulación de Stripe (para desarrollo)
// En producción, usar: import Stripe from 'stripe'
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Usuario no autenticado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { packId, quantity = 1, paymentMethod = 'card' } = body

    // Validar pack existe y está disponible
    const pack = await prisma.pack.findUnique({
      where: { id: packId },
      include: {
        establishment: {
          select: {
            id: true,
            name: true,
            address: true,
          }
        }
      }
    })

    if (!pack) {
      return NextResponse.json(
        { success: false, message: 'Pack no encontrado' },
        { status: 404 }
      )
    }

    if (!pack.isActive || pack.quantity < quantity) {
      return NextResponse.json(
        { success: false, message: 'Pack no disponible' },
        { status: 400 }
      )
    }

    // Calcular totales
    const subtotal = pack.discountedPrice * quantity
    const tax = subtotal * 0.19 // IVA Colombia 19%
    const total = subtotal + tax

    // Crear orden en la base de datos
    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        packId: pack.id,
        quantity: quantity,
        totalAmount: total,
        status: 'PENDING',
        paymentMethod: paymentMethod.toUpperCase(),
        paidAmount: total,
        pickupDate: new Date(), // Fecha de recogida (hoy por defecto)
        verificationCode: `TG${Date.now().toString().slice(-6)}`, // Código único
      }
    })

    // SIMULACIÓN DE STRIPE CHECKOUT
    // En producción, crear sesión real de Stripe:
    /*
    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'cop',
          product_data: {
            name: pack.title,
            description: `${pack.establishment.name} - ${pack.description}`,
          },
          unit_amount: Math.round(pack.discountedPrice * 100), // Stripe usa centavos
        },
        quantity: quantity,
      }],
      mode: 'payment',
      success_url: `${process.env.NEXTAUTH_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}&order_id=${order.id}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/packs`,
      metadata: {
        orderId: order.id,
        packId: pack.id,
        userId: session.user.id,
      }
    })
    */

    // Para desarrollo, simular éxito inmediato
    const simulatedCheckoutUrl = `/checkout/success?order_id=${order.id}&simulated=true`

    // Actualizar cantidad del pack
    await prisma.pack.update({
      where: { id: pack.id },
      data: { quantity: pack.quantity - quantity }
    })

    // Actualizar estado de la orden a COMPLETED (simulación)
    await prisma.order.update({
      where: { id: order.id },
      data: { 
        status: 'COMPLETED',
        paymentStatus: 'approved'
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Checkout creado exitosamente',
      data: {
        orderId: order.id,
        checkoutUrl: simulatedCheckoutUrl,
        // En producción: checkoutUrl: stripeSession.url,
        order: {
          id: order.id,
          packTitle: pack.title,
          establishmentName: pack.establishment.name,
          quantity: quantity,
          unitPrice: pack.discountedPrice,
          subtotal: subtotal,
          tax: tax,
          total: total,
          status: 'COMPLETED', // Simulación
          verificationCode: order.verificationCode
        }
      }
    })

  } catch (error) {
    console.error('❌ Error en checkout:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error procesando el pago',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// GET - Obtener información de checkout
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Usuario no autenticado' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('orderId')

    if (!orderId) {
      return NextResponse.json(
        { success: false, message: 'ID de orden requerido' },
        { status: 400 }
      )
    }

    const order = await prisma.order.findUnique({
      where: { 
        id: orderId,
        userId: session.user.id // Solo el usuario propietario
      },
      include: {
        pack: {
          include: {
            establishment: {
              select: {
                id: true,
                name: true,
                address: true,
                phone: true,
              }
            }
          }
        }
      }
    })

    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Orden no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: order
    })

  } catch (error) {
    console.error('❌ Error obteniendo checkout:', error)
    return NextResponse.json(
      { success: false, message: 'Error obteniendo información' },
      { status: 500 }
    )
  }
}
