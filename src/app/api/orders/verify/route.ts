import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isValidVerificationCode } from '@/lib/qrcode'
import { createAuditLog } from '@/lib/auditLog'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

/**
 * POST /api/orders/verify
 * Verifica un código QR y marca la orden como completada
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'No autenticado' },
        { status: 401 }
      )
    }

    const { verificationCode } = await request.json()

    if (!verificationCode) {
      return NextResponse.json(
        { success: false, message: 'Código de verificación requerido' },
        { status: 400 }
      )
    }

    // Validar formato del código
    if (!isValidVerificationCode(verificationCode)) {
      return NextResponse.json(
        { success: false, message: 'Código de verificación inválido' },
        { status: 400 }
      )
    }

    // Buscar la orden por código de verificación
    const order = await prisma.order.findUnique({
      where: { verificationCode },
      include: {
        pack: {
          include: {
            establishment: true,
          },
        },
        user: true,
      },
    })

    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Orden no encontrada' },
        { status: 404 }
      )
    }

    // Verificar que el usuario sea el dueño del restaurante
    const establishment = order.pack.establishment
    if (establishment.userId !== session.user.id) {
      return NextResponse.json(
        {
          success: false,
          message: 'No tienes permiso para verificar esta orden',
        },
        { status: 403 }
      )
    }

    // Verificar que la orden esté confirmada
    if (order.status !== 'CONFIRMED') {
      return NextResponse.json(
        {
          success: false,
          message: `La orden no está en estado CONFIRMED (estado actual: ${order.status})`,
        },
        { status: 400 }
      )
    }

    // Verificar que no haya sido verificada previamente
    if (order.verifiedAt) {
      return NextResponse.json(
        {
          success: false,
          message: 'Esta orden ya fue verificada',
          verifiedAt: order.verifiedAt,
        },
        { status: 400 }
      )
    }

    // Marcar como completada
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        status: 'COMPLETED',
        verifiedAt: new Date(),
      },
      include: {
        pack: true,
        user: true,
      },
    })

    // Registrar en audit log
    await createAuditLog({
      action: 'UPDATE',
      entityType: 'ORDER',
      entityId: order.id,
      userId: session.user.id,
      userName: session.user.name || session.user.email || undefined,
      changes: {
        status: 'COMPLETED',
        verifiedAt: new Date().toISOString(),
      },
      metadata: JSON.stringify({
        verificationCode,
        establishmentId: establishment.id,
        establishmentName: establishment.name,
      }),
    })

    return NextResponse.json({
      success: true,
      message: 'Orden verificada exitosamente',
      data: {
        orderId: updatedOrder.id,
        customerName: updatedOrder.user.name,
        customerEmail: updatedOrder.user.email,
        packTitle: updatedOrder.pack.title,
        quantity: updatedOrder.quantity,
        totalAmount: updatedOrder.totalAmount,
        verifiedAt: updatedOrder.verifiedAt,
      },
    })
  } catch (error: any) {
    console.error('Error verifying order:', error)
    return NextResponse.json(
      { success: false, message: 'Error al verificar la orden' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/orders/verify?code=XXX
 * Consulta información de una orden por código de verificación (sin marcarla como completada)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'No autenticado' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const verificationCode = searchParams.get('code')

    if (!verificationCode) {
      return NextResponse.json(
        { success: false, message: 'Código de verificación requerido' },
        { status: 400 }
      )
    }

    // Validar formato del código
    if (!isValidVerificationCode(verificationCode)) {
      return NextResponse.json(
        { success: false, message: 'Código de verificación inválido' },
        { status: 400 }
      )
    }

    // Buscar la orden
    const order = await prisma.order.findUnique({
      where: { verificationCode },
      include: {
        pack: {
          include: {
            establishment: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Orden no encontrada' },
        { status: 404 }
      )
    }

    // Verificar que el usuario sea el dueño del restaurante
    const establishment = order.pack.establishment
    if (establishment.userId !== session.user.id) {
      return NextResponse.json(
        {
          success: false,
          message: 'No tienes permiso para ver esta orden',
        },
        { status: 403 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        orderId: order.id,
        status: order.status,
        verifiedAt: order.verifiedAt,
        customer: {
          name: order.user.name,
          email: order.user.email,
          image: order.user.image,
        },
        pack: {
          title: order.pack.title,
          description: order.pack.description,
        },
        quantity: order.quantity,
        totalAmount: order.totalAmount,
        pickupDate: order.pickupDate,
        pickupTimeStart: order.pack.pickupTimeStart,
        pickupTimeEnd: order.pack.pickupTimeEnd,
        createdAt: order.createdAt,
      },
    })
  } catch (error: any) {
    console.error('Error fetching order:', error)
    return NextResponse.json(
      { success: false, message: 'Error al consultar la orden' },
      { status: 500 }
    )
  }
}
