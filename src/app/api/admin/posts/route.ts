import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Obtener todos los posts
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, message: 'No autorizado' },
        { status: 401 }
      )
    }

    const posts = await prisma.post.findMany({
      include: {
        establishment: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({
      success: true,
      data: posts,
    })
  } catch (error) {
    console.error('Error fetching posts:', error)
    return NextResponse.json(
      { success: false, message: 'Error al obtener posts' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar post
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
    const postId = searchParams.get('id')

    if (!postId) {
      return NextResponse.json(
        { success: false, message: 'ID de post requerido' },
        { status: 400 }
      )
    }

    await prisma.post.delete({
      where: { id: postId },
    })

    return NextResponse.json({
      success: true,
      message: 'Post eliminado exitosamente',
    })
  } catch (error) {
    console.error('Error deleting post:', error)
    return NextResponse.json(
      { success: false, message: 'Error al eliminar post' },
      { status: 500 }
    )
  }
}

// PATCH - Actualizar estado del post
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
    const { postId, isActive } = body

    if (!postId || isActive === undefined) {
      return NextResponse.json(
        { success: false, message: 'ID de post y estado requeridos' },
        { status: 400 }
      )
    }

    const post = await prisma.post.update({
      where: { id: postId },
      data: { isActive },
    })

    return NextResponse.json({
      success: true,
      data: post,
      message: 'Post actualizado exitosamente',
    })
  } catch (error) {
    console.error('Error updating post:', error)
    return NextResponse.json(
      { success: false, message: 'Error al actualizar post' },
      { status: 500 }
    )
  }
}
