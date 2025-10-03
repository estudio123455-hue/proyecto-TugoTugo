import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createAuditLog } from '@/lib/auditLog'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// GET - Obtener reseñas de un establecimiento
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const establishmentId = searchParams.get('establishmentId')

    if (!establishmentId) {
      return NextResponse.json(
        { success: false, message: 'establishmentId requerido' },
        { status: 400 }
      )
    }

    const reviews = await prisma.review.findMany({
      where: { establishmentId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Calcular promedio de rating
    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0

    return NextResponse.json({
      success: true,
      data: {
        reviews,
        avgRating: Math.round(avgRating * 10) / 10,
        totalReviews: reviews.length,
      },
    })
  } catch (error: any) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json(
      { success: false, message: 'Error al obtener reseñas' },
      { status: 500 }
    )
  }
}

// POST - Crear reseña
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { success: false, message: 'No autenticado' },
        { status: 401 }
      )
    }

    const { establishmentId, rating, comment } = await request.json()

    // Validar rating
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, message: 'Rating debe estar entre 1 y 5' },
        { status: 400 }
      )
    }

    // Verificar que el establecimiento existe
    const establishment = await prisma.establishment.findUnique({
      where: { id: establishmentId },
    })

    if (!establishment) {
      return NextResponse.json(
        { success: false, message: 'Establecimiento no encontrado' },
        { status: 404 }
      )
    }

    // Verificar si ya existe una reseña
    const existingReview = await prisma.review.findUnique({
      where: {
        userId_establishmentId: {
          userId: session.user.id,
          establishmentId,
        },
      },
    })

    if (existingReview) {
      // Actualizar reseña existente
      const updatedReview = await prisma.review.update({
        where: { id: existingReview.id },
        data: { rating, comment },
        include: {
          user: {
            select: {
              id: true,
              name: true,
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
        message: 'Reseña actualizada',
      })
    }

    // Crear nueva reseña
    const review = await prisma.review.create({
      data: {
        rating,
        comment,
        establishmentId,
        userId: session.user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    })

    await createAuditLog({
      action: 'CREATE',
      entityType: 'REVIEW',
      entityId: review.id,
      userId: session.user.id,
      userName: session.user.name || session.user.email || undefined,
      changes: { rating, comment, establishmentId },
    })

    return NextResponse.json({
      success: true,
      data: review,
      message: 'Reseña creada exitosamente',
    })
  } catch (error: any) {
    console.error('Error creating review:', error)
    return NextResponse.json(
      { success: false, message: 'Error al crear reseña' },
      { status: 500 }
    )
  }
}
