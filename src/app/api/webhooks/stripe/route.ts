import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'
import { sendOrderConfirmationEmail } from '@/lib/email'
import { generateVerificationCode, generateOrderQRCode } from '@/lib/qrcode'
// Notificaciones VAPID removidas

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-08-16',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const sig = request.headers.get('stripe-signature')

    if (!sig) {
      return NextResponse.json(
        { message: 'Missing stripe signature' },
        { status: 400 }
      )
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json(
        { message: 'Webhook signature verification failed' },
        { status: 400 }
      )
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        if (session.metadata?.orderId) {
          // Generate verification code
          const verificationCode = generateVerificationCode()

          // Update order status and reduce pack quantity
          const order = await prisma.$transaction(async tx => {
            const updatedOrder = await tx.order.update({
              where: { id: session.metadata!.orderId },
              data: { 
                status: 'CONFIRMED',
                verificationCode: verificationCode,
              },
              include: {
                pack: {
                  include: {
                    establishment: true,
                  },
                },
                user: true,
              },
            })

            // Reduce pack quantity
            await tx.pack.update({
              where: { id: updatedOrder.packId },
              data: {
                quantity: {
                  decrement: updatedOrder.quantity,
                },
              },
            })

            return updatedOrder
          })

          // Generate QR code
          let qrCodeDataURL: string | undefined
          try {
            qrCodeDataURL = await generateOrderQRCode(order.id, verificationCode)
          } catch (qrError) {
            console.error('Failed to generate QR code:', qrError)
          }

          // Send confirmation email with QR code
          try {
            if (order.user.email) {
              await sendOrderConfirmationEmail({
                to: order.user.email,
                userName: order.user.name || 'Customer',
                orderId: order.id,
                packTitle: order.pack.title,
                establishmentName: order.pack.establishment.name,
                establishmentAddress: order.pack.establishment.address,
                quantity: order.quantity,
                totalAmount: order.totalAmount,
                pickupDate: order.pickupDate.toISOString(),
                pickupTimeStart: order.pack.pickupTimeStart,
                pickupTimeEnd: order.pack.pickupTimeEnd,
                verificationCode: verificationCode,
                qrCodeDataURL: qrCodeDataURL,
              })
            }
          } catch (emailError) {
            console.error('Failed to send confirmation email:', emailError)
            // Don't fail the webhook if email fails
          }

          // Notificaciones push VAPID removidas

          console.log('Order confirmed:', session.metadata.orderId)
        }
        break
      }

      case 'checkout.session.expired': {
        const expiredSession = event.data.object as Stripe.Checkout.Session

        if (expiredSession.metadata?.orderId) {
          // Cancel the order
          await prisma.order.update({
            where: { id: expiredSession.metadata.orderId },
            data: { status: 'CANCELLED' },
          })

          console.log(
            'Order cancelled due to expired session:',
            expiredSession.metadata.orderId
          )
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { message: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}
