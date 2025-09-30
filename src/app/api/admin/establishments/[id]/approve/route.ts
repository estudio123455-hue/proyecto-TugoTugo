import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST - Aprobar restaurante (solo admin)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
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
            email: true,
            name: true,
          },
        },
      },
    })

    if (!establishment) {
      return NextResponse.json(
        { success: false, message: 'Restaurante no encontrado' },
        { status: 404 }
      )
    }

    // Aprobar restaurante
    const updated = await prisma.establishment.update({
      where: { id: params.id },
      data: { isApproved: true },
    })

    // TODO: Enviar email de notificación al restaurante
    console.log(`✅ Restaurante aprobado: ${establishment.name}`)
    console.log(`📧 Enviar email a: ${establishment.user.email}`)

    return NextResponse.json({
      success: true,
      data: updated,
      message: `Restaurante "${establishment.name}" aprobado exitosamente`,
    })
  } catch (error) {
    console.error('Error approving establishment:', error)
    return NextResponse.json(
      { success: false, message: 'Error al aprobar restaurante' },
      { status: 500 }
    )
  }
}
