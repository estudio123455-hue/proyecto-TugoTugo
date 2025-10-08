import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createAuditLog } from '@/lib/auditLog'

// PUT - Actualizar reseña
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { success: false, message: 'No autenticado' },
        { status: 401 }
      )
    }

    const { id } = await params
    const { rating, comment } = await request.json()

    // Validar rating
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, message: 'Rating debe estar entre 1 y 5' },
        { status: 400 }
      )
    }

    // Verificar que la reseña existe y pertenece al usuario
    const existingReview = await prisma.review.findUnique({
      where: { id },
    })

    if (!existingReview) {
      return NextResponse.json(
        { success: false, message: 'Reseña no encontrada' },
        { status: 404 }
      )
    }

    if (existingReview.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, message: 'No autorizado' },
        { status: 403 }
      )
    }

    // Actualizar reseña
    const updatedReview = await prisma.review.update({
      where: { id },
      data: { rating, comment },
      include: {
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

    await createAuditLog({
      action: 'UPDATE',
      entityType: 'REVIEW',
      entityId: updatedReview.id,
      userId: session.user.id,
      userName: session.user.name || session.user.email || undefined,
      changes: { rating, comment },
    })

    return NextResponse.json({
      success: true,
      data: updatedReview,
      message: 'Reseña actualizada exitosamente',
    })
  } catch (error: any) {
    console.error('Error updating review:', error)
    return NextResponse.json(
      { success: false, message: 'Error al actualizar reseña' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar reseña
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { success: false, message: 'No autenticado' },
        { status: 401 }
      )
    }

    const { id } = await params

    // Verificar que la reseña existe y pertenece al usuario
    const existingReview = await prisma.review.findUnique({
      where: { id },
    })

    if (!existingReview) {
      return NextResponse.json(
        { success: false, message: 'Reseña no encontrada' },
        { status: 404 }
      )
    }

    if (existingReview.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, message: 'No autorizado' },
        { status: 403 }
      )
    }

    // Eliminar reseña
    await prisma.review.delete({
      where: { id },
    })

    await createAuditLog({
      action: 'DELETE',
      entityType: 'REVIEW',
      entityId: id,
      userId: session.user.id,
      userName: session.user.name || session.user.email || undefined,
      changes: { deleted: true },
    })

    return NextResponse.json({
      success: true,
      message: 'Reseña eliminada exitosamente',
    })
  } catch (error: any) {
    console.error('Error deleting review:', error)
    return NextResponse.json(
      { success: false, message: 'Error al eliminar reseña' },
      { status: 500 }
    )
  }
}
