import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// PATCH - Actualizar estado de verificación de restaurante
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const params = await context.params
    const body = await request.json()
    const { isVerified } = body
    const restaurantId = params.id

    if (typeof isVerified !== 'boolean') {
      return NextResponse.json(
        { error: 'isVerified debe ser un valor booleano' },
        { status: 400 }
      )
    }

    // Verificar que el restaurante existe y es de tipo ESTABLISHMENT
    const restaurant = await prisma.user.findFirst({
      where: {
        id: restaurantId,
        role: 'ESTABLISHMENT'
      }
    })

    if (!restaurant) {
      return NextResponse.json(
        { error: 'Restaurante no encontrado' },
        { status: 404 }
      )
    }

    // Actualizar estado de verificación del usuario y establecimiento
    const verificationStatus = isVerified ? 'APPROVED' : 'PENDING'
    
    await prisma.user.update({
      where: { id: restaurantId },
      data: { 
        verificationStatus,
        updatedAt: new Date()
      }
    })

    // También actualizar el establecimiento
    await prisma.establishment.updateMany({
      where: { userId: restaurantId },
      data: {
        verificationStatus,
        approvedAt: isVerified ? new Date() : null,
        updatedAt: new Date()
      }
    })

    // Obtener datos actualizados
    const updatedRestaurant = await prisma.user.findUnique({
      where: { id: restaurantId },
      select: {
        id: true,
        name: true,
        email: true,
        verificationStatus: true,
        updatedAt: true,
        establishment: {
          select: {
            verificationStatus: true,
            approvedAt: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: `Restaurante ${isVerified ? 'verificado' : 'desverificado'} exitosamente`,
      restaurant: updatedRestaurant
    })

  } catch (error) {
    console.error('Error updating restaurant verification:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
