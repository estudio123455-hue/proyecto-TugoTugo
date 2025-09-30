import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Obtener todos los posts (feed público)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const establishmentId = searchParams.get('establishmentId')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where = establishmentId
      ? { establishmentId, isActive: true }
      : { isActive: true }

    const posts = await prisma.post.findMany({
      where,
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
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
    })

    const total = await prisma.post.count({ where })

    return NextResponse.json({
      success: true,
      data: posts,
      total,
      limit,
      offset,
    })
  } catch (error) {
    console.error('Error fetching posts:', error)
    return NextResponse.json(
      { success: false, message: 'Error al obtener publicaciones' },
      { status: 500 }
    )
  }
}

// POST - Crear un nuevo post (solo restaurantes)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ESTABLISHMENT') {
      return NextResponse.json(
        { success: false, message: 'No autorizado' },
        { status: 401 }
      )
    }

    // Obtener el establishment del usuario
    const establishment = await prisma.establishment.findUnique({
      where: { userId: session.user.id },
    })

    if (!establishment) {
      return NextResponse.json(
        { success: false, message: 'Restaurante no encontrado' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { title, content, images, price } = body

    if (!title || !content) {
      return NextResponse.json(
        { success: false, message: 'Título y contenido son requeridos' },
        { status: 400 }
      )
    }

    const post = await prisma.post.create({
      data: {
        title,
        content,
        images: images || [],
        price: price ? parseFloat(price) : null,
        establishmentId: establishment.id,
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
      message: 'Publicación creada exitosamente',
    })
  } catch (error) {
    console.error('Error creating post:', error)
    return NextResponse.json(
      { success: false, message: 'Error al crear publicación' },
      { status: 500 }
    )
  }
}
