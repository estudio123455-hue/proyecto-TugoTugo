import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Obtener todos los establecimientos
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, message: 'No autorizado' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const where = status ? { verificationStatus: status } : {}

    const establishments = await prisma.establishment.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            packs: true,
            posts: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({
      success: true,
      data: establishments,
    })
  } catch (error) {
    console.error('Error fetching establishments:', error)
    return NextResponse.json(
      { success: false, message: 'Error al obtener establecimientos' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar establecimiento
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, message: 'No autorizado' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const establishmentId = searchParams.get('id')

    if (!establishmentId) {
      return NextResponse.json(
        { success: false, message: 'ID de establecimiento requerido' },
        { status: 400 }
      )
    }

    await prisma.establishment.delete({
      where: { id: establishmentId },
    })

    return NextResponse.json({
      success: true,
      message: 'Establecimiento eliminado exitosamente',
    })
  } catch (error) {
    console.error('Error deleting establishment:', error)
    return NextResponse.json(
      { success: false, message: 'Error al eliminar establecimiento' },
      { status: 500 }
    )
  }
}

// PATCH - Actualizar estado de verificación
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, message: 'No autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { establishmentId, verificationStatus, verificationNotes, isActive } = body

    if (!establishmentId) {
      return NextResponse.json(
        { success: false, message: 'ID de establecimiento requerido' },
        { status: 400 }
      )
    }

    const updateData: any = {}
    
    if (verificationStatus) {
      updateData.verificationStatus = verificationStatus
      if (verificationStatus === 'APPROVED') {
        updateData.approvedAt = new Date()
        updateData.approvedBy = session.user.id
      }
    }
    
    if (verificationNotes !== undefined) {
      updateData.verificationNotes = verificationNotes
    }
    
    if (isActive !== undefined) {
      updateData.isActive = isActive
    }

    const establishment = await prisma.establishment.update({
      where: { id: establishmentId },
      data: updateData,
    })

    return NextResponse.json({
      success: true,
      data: establishment,
      message: 'Establecimiento actualizado exitosamente',
    })
  } catch (error) {
    console.error('Error updating establishment:', error)
    return NextResponse.json(
      { success: false, message: 'Error al actualizar establecimiento' },
      { status: 500 }
    )
  }
}
