import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Obtener un post específico
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const post = await prisma.post.findUnique({
      where: { id: params.id },
      include: {
        establishment: {
          select: {
            id: true,
            name: true,
            image: true,
            category: true,
            address: true,
          },
        },
      },
    })

    if (!post) {
      return NextResponse.json(
        { success: false, message: 'Publicación no encontrada' },
        { status: 404 }
      )
    }

    // Incrementar vistas
    await prisma.post.update({
      where: { id: params.id },
      data: { views: { increment: 1 } },
    })

    return NextResponse.json({
      success: true,
      data: post,
    })
  } catch (error) {
    console.error('Error fetching post:', error)
    return NextResponse.json(
      { success: false, message: 'Error al obtener publicación' },
      { status: 500 }
    )
  }
}

// PUT - Actualizar un post (solo el dueño)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ESTABLISHMENT') {
      return NextResponse.json(
        { success: false, message: 'No autorizado' },
        { status: 401 }
      )
    }

    const establishment = await prisma.establishment.findUnique({
      where: { userId: session.user.id },
    })

    if (!establishment) {
      return NextResponse.json(
        { success: false, message: 'Restaurante no encontrado' },
        { status: 404 }
      )
    }

    // Verificar que el post pertenece al restaurante
    const existingPost = await prisma.post.findUnique({
      where: { id: params.id },
    })

    if (!existingPost) {
      return NextResponse.json(
        { success: false, message: 'Publicación no encontrada' },
        { status: 404 }
      )
    }

    if (existingPost.establishmentId !== establishment.id) {
      return NextResponse.json(
        { success: false, message: 'No tienes permiso para editar esta publicación' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { title, content, images, price, isActive } = body

    const post = await prisma.post.update({
      where: { id: params.id },
      data: {
        ...(title && { title }),
        ...(content && { content }),
        ...(images && { images }),
        ...(price !== undefined && { price: price ? parseFloat(price) : null }),
        ...(isActive !== undefined && { isActive }),
      },
      include: {
        establishment: {
          select: {
            id: true,
            name: true,
            image: true,
            category: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: post,
      message: 'Publicación actualizada exitosamente',
    })
  } catch (error) {
    console.error('Error updating post:', error)
    return NextResponse.json(
      { success: false, message: 'Error al actualizar publicación' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar un post (solo el dueño)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ESTABLISHMENT') {
      return NextResponse.json(
        { success: false, message: 'No autorizado' },
        { status: 401 }
      )
    }

    const establishment = await prisma.establishment.findUnique({
      where: { userId: session.user.id },
    })

    if (!establishment) {
      return NextResponse.json(
        { success: false, message: 'Restaurante no encontrado' },
        { status: 404 }
      )
    }

    // Verificar que el post pertenece al restaurante
    const existingPost = await prisma.post.findUnique({
      where: { id: params.id },
    })

    if (!existingPost) {
      return NextResponse.json(
        { success: false, message: 'Publicación no encontrada' },
        { status: 404 }
      )
    }

    if (existingPost.establishmentId !== establishment.id) {
      return NextResponse.json(
        { success: false, message: 'No tienes permiso para eliminar esta publicación' },
        { status: 403 }
      )
    }

    await prisma.post.delete({
      where: { id: params.id },
    })

    return NextResponse.json({
      success: true,
      message: 'Publicación eliminada exitosamente',
    })
  } catch (error) {
    console.error('Error deleting post:', error)
    return NextResponse.json(
      { success: false, message: 'Error al eliminar publicación' },
      { status: 500 }
      )
  }
}
