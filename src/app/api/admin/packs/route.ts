import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Obtener todos los packs
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, message: 'No autorizado' },
        { status: 401 }
      )
    }

    const packs = await prisma.pack.findMany({
      include: {
        establishment: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            orders: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({
      success: true,
      data: packs,
    })
  } catch (error) {
    console.error('Error fetching packs:', error)
    return NextResponse.json(
      { success: false, message: 'Error al obtener packs' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar pack
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
    const packId = searchParams.get('id')

    if (!packId) {
      return NextResponse.json(
        { success: false, message: 'ID de pack requerido' },
        { status: 400 }
      )
    }

    // Verificar si tiene órdenes
    const pack = await prisma.pack.findUnique({
      where: { id: packId },
      include: {
        _count: {
          select: {
            orders: true,
          },
        },
      },
    })

    if (pack && pack._count.orders > 0) {
      return NextResponse.json(
        { success: false, message: 'No se puede eliminar un pack con órdenes asociadas' },
        { status: 400 }
      )
    }

    await prisma.pack.delete({
      where: { id: packId },
    })

    return NextResponse.json({
      success: true,
      message: 'Pack eliminado exitosamente',
    })
  } catch (error) {
    console.error('Error deleting pack:', error)
    return NextResponse.json(
      { success: false, message: 'Error al eliminar pack' },
      { status: 500 }
    )
  }
}

// PATCH - Actualizar estado del pack
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
    const { packId, isActive } = body

    if (!packId || isActive === undefined) {
      return NextResponse.json(
        { success: false, message: 'ID de pack y estado requeridos' },
        { status: 400 }
      )
    }

    const pack = await prisma.pack.update({
      where: { id: packId },
      data: { isActive },
    })

    return NextResponse.json({
      success: true,
      data: pack,
      message: 'Pack actualizado exitosamente',
    })
  } catch (error) {
    console.error('Error updating pack:', error)
    return NextResponse.json(
      { success: false, message: 'Error al actualizar pack' },
      { status: 500 }
    )
  }
}
