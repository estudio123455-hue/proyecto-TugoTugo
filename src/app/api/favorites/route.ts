import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createAuditLog } from '@/lib/auditLog'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// GET - Obtener favoritos del usuario
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { success: false, message: 'No autenticado' },
        { status: 401 }
      )
    }

    const favorites = await prisma.favorite.findMany({
      where: { userId: session.user.id },
      include: {
        establishment: {
          include: {
            packs: {
              where: {
                isActive: true,
                quantity: { gt: 0 },
              },
              take: 3,
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({
      success: true,
      data: favorites,
    })
  } catch (error: any) {
    console.error('Error fetching favorites:', error)
    return NextResponse.json(
      { success: false, message: 'Error al obtener favoritos' },
      { status: 500 }
    )
  }
}

// POST - Agregar a favoritos
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { success: false, message: 'No autenticado' },
        { status: 401 }
      )
    }

    const { establishmentId } = await request.json()

    if (!establishmentId) {
      return NextResponse.json(
        { success: false, message: 'establishmentId requerido' },
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

    // Verificar si ya está en favoritos
    const existing = await prisma.favorite.findUnique({
      where: {
        userId_establishmentId: {
          userId: session.user.id,
          establishmentId,
        },
      },
    })

    if (existing) {
      return NextResponse.json(
        { success: false, message: 'Ya está en favoritos' },
        { status: 400 }
      )
    }

    // Agregar a favoritos
    const favorite = await prisma.favorite.create({
      data: {
        userId: session.user.id,
        establishmentId,
      },
      include: {
        establishment: true,
      },
    })

    await createAuditLog({
      action: 'CREATE',
      entityType: 'FAVORITE',
      entityId: favorite.id,
      userId: session.user.id,
      userName: session.user.name || session.user.email || undefined,
      changes: { establishmentId },
    })

    return NextResponse.json({
      success: true,
      data: favorite,
      message: 'Agregado a favoritos',
    })
  } catch (error: any) {
    console.error('Error adding favorite:', error)
    return NextResponse.json(
      { success: false, message: 'Error al agregar favorito' },
      { status: 500 }
    )
  }
}

// DELETE - Remover de favoritos
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { success: false, message: 'No autenticado' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const establishmentId = searchParams.get('establishmentId')

    if (!establishmentId) {
      return NextResponse.json(
        { success: false, message: 'establishmentId requerido' },
        { status: 400 }
      )
    }

    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_establishmentId: {
          userId: session.user.id,
          establishmentId,
        },
      },
    })

    if (!favorite) {
      return NextResponse.json(
        { success: false, message: 'No está en favoritos' },
        { status: 404 }
      )
    }

    await prisma.favorite.delete({
      where: { id: favorite.id },
    })

    await createAuditLog({
      action: 'DELETE',
      entityType: 'FAVORITE',
      entityId: favorite.id,
      userId: session.user.id,
      userName: session.user.name || session.user.email || undefined,
      changes: { establishmentId },
    })

    return NextResponse.json({
      success: true,
      message: 'Removido de favoritos',
    })
  } catch (error: any) {
    console.error('Error removing favorite:', error)
    return NextResponse.json(
      { success: false, message: 'Error al remover favorito' },
      { status: 500 }
    )
  }
}
