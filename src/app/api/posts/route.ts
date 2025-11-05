import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Obtener posts públicos
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [Posts API] Fetching posts...')
    const { searchParams } = new URL(request.url)
    const establishmentId = searchParams.get('establishmentId')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Solo mostrar posts activos
    const where = establishmentId
      ? { 
          establishmentId, 
          isActive: true,
        }
      : { 
          isActive: true,
        }

    console.log('🔍 [Posts API] Query where:', where)

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

    console.log(`✅ [Posts API] Found ${posts.length} posts`)

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
    
    // Return empty data instead of error to prevent 500s
    return NextResponse.json({
      success: true,
      data: [],
      total: 0,
      limit: 20,
      offset: 0,
    })
  }
}

// POST - Crear post
export async function POST(request: NextRequest) {
  try {
    console.log('📝 [Posts API] Creating new post...')
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ESTABLISHMENT') {
      console.log('❌ [Posts API] Unauthorized')
      return NextResponse.json(
        { success: false, message: 'No autorizado' },
        { status: 401 }
      )
    }

    console.log('👤 [Posts API] User:', session.user.id)

    const establishment = await prisma.establishment.findUnique({
      where: { userId: session.user.id },
    })

    if (!establishment) {
      console.log('❌ [Posts API] Establishment not found')
      return NextResponse.json(
        { success: false, message: 'Restaurante no encontrado' },
        { status: 404 }
      )
    }

    console.log('🏪 [Posts API] Establishment:', establishment.id)

    const body = await request.json()
    const { title, content, images, price } = body

    console.log('📦 [Posts API] Data:', { title, content, price, images })

    if (!title || !content) {
      console.log('❌ [Posts API] Missing required fields')
      return NextResponse.json(
        { success: false, message: 'Título y contenido son requeridos' },
        { status: 400 }
      )
    }

    console.log('💾 [Posts API] Creating post in database...')

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

    console.log('✅ [Posts API] Post created:', post.id)

    // Emit WebSocket event for real-time updates
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('ws:post:created', { 
        detail: { postId: post.id, title: post.title }
      }))
    }

    return NextResponse.json({
      success: true,
      data: post,
      message: 'Publicación creada exitosamente',
    }, { status: 201 })
  } catch (error) {
    console.error('❌ [Posts API] Error creating post:', error)
    console.error('Stack:', error instanceof Error ? error.stack : 'No stack')
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error al crear publicación',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
