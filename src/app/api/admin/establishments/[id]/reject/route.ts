import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendRestaurantRejection } from '@/lib/email/restaurant-verification'

// POST - Rechazar restaurante (solo admin)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('❌ [Admin] Rejecting establishment:', params.id)
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      console.log('❌ [Admin] Unauthorized access attempt')
      return NextResponse.json(
        { success: false, message: 'No autorizado' },
        { status: 401 }
      )
    }

    const establishment = await prisma.establishment.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    })

    if (!establishment) {
      console.log('❌ [Admin] Establishment not found')
      return NextResponse.json(
        { success: false, message: 'Restaurante no encontrado' },
        { status: 404 }
      )
    }

    const body = await request.json().catch(() => ({}))
    const rejectionReason = body.reason || 'No se proporcionó una razón específica'

    // Rechazar restaurante
    const updated = await prisma.establishment.update({
      where: { id: params.id },
      data: { 
        isActive: false,
        // verificationStatus and verificationNotes will be added after migration
        ...(establishment.verificationStatus !== undefined && {
          verificationStatus: 'REJECTED',
          verificationNotes: rejectionReason,
        }),
      },
    })

    console.log(`❌ [Admin] Establishment rejected: ${establishment.name}`)
    console.log(`📝 [Admin] Reason: ${rejectionReason}`)

    // Enviar email de rechazo
    try {
      await sendRestaurantRejection(
        updated as any, 
        establishment.user as any, 
        rejectionReason
      )
      console.log('📧 [Admin] Rejection email sent')
    } catch (emailError) {
      console.error('⚠️ [Admin] Failed to send email:', emailError)
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: `Restaurante "${establishment.name}" rechazado`,
    })
  } catch (error) {
    console.error('❌ [Admin] Error rejecting establishment:', error)
    return NextResponse.json(
      { success: false, message: 'Error al rechazar restaurante' },
      { status: 500 }
    )
  }
}
