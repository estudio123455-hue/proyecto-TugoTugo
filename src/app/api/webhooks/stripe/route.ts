import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'
import { sendOrderConfirmationEmail } from '@/lib/email'
import { generateVerificationCode, generateOrderQRCode } from '@/lib/qrcode'
import { sendPushNotification, getNotificationTemplate } from '@/lib/notifications'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-08-16',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const headersList = headers()
    const sig = headersList.get('stripe-signature')

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

          // Enviar notificación push al cliente
          try {
            const userSubscriptions = await prisma.pushSubscription.findMany({
              where: { userId: order.userId },
            })

            if (userSubscriptions.length > 0) {
              const notification = getNotificationTemplate('order_confirmed', {
                establishmentName: order.pack.establishment.name,
                pickupTime: `${order.pack.pickupTimeStart} - ${order.pack.pickupTimeEnd}`,
                orderId: order.id,
              })

              for (const sub of userSubscriptions) {
                await sendPushNotification(
                  {
                    endpoint: sub.endpoint,
                    keys: {
                      p256dh: sub.p256dh,
                      auth: sub.auth,
                    },
                  },
                  notification
                )
              }
            }
          } catch (pushError) {
            console.error('Failed to send push notification:', pushError)
            // Don't fail the webhook if push fails
          }

          // Enviar notificación push al restaurante
          try {
            const establishment = order.pack.establishment
            const restaurantSubscriptions = await prisma.pushSubscription.findMany({
              where: { userId: establishment.userId },
            })

            if (restaurantSubscriptions.length > 0) {
              const notification = getNotificationTemplate('new_order', {
                customerName: order.user.name || order.user.email,
                quantity: order.quantity,
                orderId: order.id,
              })

              for (const sub of restaurantSubscriptions) {
                await sendPushNotification(
                  {
                    endpoint: sub.endpoint,
                    keys: {
                      p256dh: sub.p256dh,
                      auth: sub.auth,
                    },
                  },
                  notification
                )
              }
            }
          } catch (pushError) {
            console.error('Failed to send push notification to restaurant:', pushError)
            // Don't fail the webhook if push fails
          }

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
