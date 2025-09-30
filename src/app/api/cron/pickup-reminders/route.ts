import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendPickupReminderEmail } from '@/lib/email'

export async function GET(request: NextRequest) {
  try {
    // Verify this is a legitimate cron job request (you can add auth header check)
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    // Get current time
    const now = new Date()
    
    // Get tomorrow's date for pickup reminders (send reminder 24 hours before)
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)
    
    const dayAfterTomorrow = new Date(tomorrow)
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1)

    // Find confirmed orders that need pickup reminders
    // Send reminder 24 hours before pickup time
    const ordersNeedingReminders = await prisma.order.findMany({
      where: {
        status: 'CONFIRMED',
        pickupDate: {
          gte: tomorrow,
          lt: dayAfterTomorrow,
        },
        // Only send reminder once - you might want to add a field to track this
      },
      include: {
        user: true,
        pack: {
          include: {
            establishment: true,
          },
        },
      },
    })

    let remindersSent = 0
    const errors = []

    for (const order of ordersNeedingReminders) {
      try {
        if (order.user.email) {
          await sendPickupReminderEmail({
            to: order.user.email,
            userName: order.user.name || 'Customer',
            packTitle: order.pack.title,
            establishmentName: order.pack.establishment.name,
            establishmentAddress: order.pack.establishment.address,
            establishmentPhone: order.pack.establishment.phone || undefined,
            pickupDate: order.pickupDate.toISOString(),
            pickupTimeStart: order.pack.pickupTimeStart,
            pickupTimeEnd: order.pack.pickupTimeEnd,
          })

          // Update order to mark reminder as sent (you might want to add a field for this)
          await prisma.order.update({
            where: { id: order.id },
            data: { 
              status: 'READY_FOR_PICKUP' // Update status to indicate reminder sent
            },
          })

          remindersSent++
        }
      } catch (error) {
        console.error(`Failed to send reminder for order ${order.id}:`, error)
        errors.push({
          orderId: order.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    // Also send reminders for orders that are 2 hours before pickup
    const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000)
    const threeHoursFromNow = new Date(now.getTime() + 3 * 60 * 60 * 1000)

    const urgentReminders = await prisma.order.findMany({
      where: {
        status: 'READY_FOR_PICKUP',
        pickupDate: {
          gte: twoHoursFromNow,
          lt: threeHoursFromNow,
        },
      },
      include: {
        user: true,
        pack: {
          include: {
            establishment: true,
          },
        },
      },
    })

    for (const order of urgentReminders) {
      try {
        if (order.user.email) {
          // Send a more urgent reminder
          await sendPickupReminderEmail({
            to: order.user.email,
            userName: order.user.name || 'Customer',
            packTitle: order.pack.title,
            establishmentName: order.pack.establishment.name,
            establishmentAddress: order.pack.establishment.address,
            establishmentPhone: order.pack.establishment.phone || undefined,
            pickupDate: order.pickupDate.toISOString(),
            pickupTimeStart: order.pack.pickupTimeStart,
            pickupTimeEnd: order.pack.pickupTimeEnd,
          })

          remindersSent++
        }
      } catch (error) {
        console.error(`Failed to send urgent reminder for order ${order.id}:`, error)
        errors.push({
          orderId: order.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    return NextResponse.json({
      success: true,
      remindersSent,
      ordersProcessed: ordersNeedingReminders.length + urgentReminders.length,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error) {
    console.error('Cron job error:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to process pickup reminders',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Allow this endpoint to be called by cron services
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
