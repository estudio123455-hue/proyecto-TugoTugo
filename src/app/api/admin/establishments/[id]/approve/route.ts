import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendRestaurantApproval } from '@/lib/email/restaurant-verification'

// POST - Aprobar restaurante (solo admin)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('✅ [Admin] Approving establishment:', params.id)
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

    // Aprobar restaurante
    const updated = await prisma.establishment.update({
      where: { id: params.id },
      data: { 
        isActive: true,
        // @ts-ignore - verificationStatus will be added after migration
        verificationStatus: 'APPROVED',
        // @ts-ignore - approvedAt will be added after migration
        approvedAt: new Date(),
        // @ts-ignore - approvedBy will be added after migration
        approvedBy: session.user.id,
      } as any,
    })

    console.log(`✅ [Admin] Establishment approved: ${establishment.name}`)

    // Enviar email de aprobación
    try {
      await sendRestaurantApproval(updated as any, establishment.user as any)
      console.log('📧 [Admin] Approval email sent')
    } catch (emailError) {
      console.error('⚠️ [Admin] Failed to send email:', emailError)
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: `Restaurante "${establishment.name}" aprobado exitosamente`,
    })
  } catch (error) {
    console.error('❌ [Admin] Error approving establishment:', error)
    return NextResponse.json(
      { success: false, message: 'Error al aprobar restaurante' },
      { status: 500 }
    )
  }
}
