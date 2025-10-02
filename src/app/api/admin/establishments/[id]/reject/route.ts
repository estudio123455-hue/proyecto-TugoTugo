import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST - Rechazar restaurante (solo admin)
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

    const { reason } = await request.json()

    // Desactivar restaurante (rechazado)
    const updated = await prisma.establishment.update({
      where: { id: params.id },
      data: { 
        // isApproved: false, // Temporalmente deshabilitado - columna no existe
        isActive: false, // Desactivar completamente
      },
    })

    // TODO: Enviar email de notificación al restaurante
    console.log(`❌ Restaurante rechazado: ${establishment.name}`)
    console.log(`📧 Enviar email a: ${establishment.user.email}`)
    console.log(`📝 Razón: ${reason || 'No especificada'}`)

    return NextResponse.json({
      success: true,
      data: updated,
      message: `Restaurante "${establishment.name}" rechazado`,
    })
  } catch (error) {
    console.error('Error rejecting establishment:', error)
    return NextResponse.json(
      { success: false, message: 'Error al rechazar restaurante' },
      { status: 500 }
    )
  }
}
