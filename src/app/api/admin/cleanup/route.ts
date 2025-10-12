import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(request: Request) {
  try {
    // Verificar token de seguridad
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    
    const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'admin-cleanup-token-123'
    
    if (token !== ADMIN_TOKEN) {
      return NextResponse.json(
        { message: 'Unauthorized. Invalid admin token.' },
        { status: 401 }
      )
    }

    console.log('🧹 Starting database cleanup...')

    // Obtener conteos antes de eliminar
    const beforeCounts = {
      orders: await prisma.order.count(),
      packs: await prisma.pack.count(),
      establishments: await prisma.establishment.count(),
      users: await prisma.user.count(),
      posts: await prisma.post.count(),
      reviews: await prisma.review.count(),
      favorites: await prisma.favorite.count(),
    }

    console.log('📊 Before cleanup:', beforeCounts)

    // Eliminar en orden correcto (respetando foreign keys)
    
    // 1. Eliminar órdenes
    console.log('🗑️ Deleting orders...')
    await prisma.order.deleteMany({})
    
    // 2. Eliminar packs
    console.log('🗑️ Deleting packs...')
    await prisma.pack.deleteMany({})
    
    // 3. Eliminar posts
    console.log('🗑️ Deleting posts...')
    await prisma.post.deleteMany({})
    
    // 4. Eliminar reviews
    console.log('🗑️ Deleting reviews...')
    await prisma.review.deleteMany({})
    
    // 5. Eliminar favorites
    console.log('🗑️ Deleting favorites...')
    await prisma.favorite.deleteMany({})
    
    // 6. Eliminar menu items
    console.log('🗑️ Deleting menu items...')
    await prisma.menuItem.deleteMany({})
    
    // 7. Eliminar establecimientos
    console.log('🗑️ Deleting establishments...')
    await prisma.establishment.deleteMany({})
    
    // 8. Eliminar cuentas y sesiones
    console.log('🗑️ Deleting accounts and sessions...')
    await prisma.account.deleteMany({})
    await prisma.session.deleteMany({})
    
    // 9. Eliminar usuarios
    console.log('🗑️ Deleting users...')
    await prisma.user.deleteMany({})
    
    // 10. Eliminar otros datos
    console.log('🗑️ Deleting other data...')
    await prisma.emailVerification.deleteMany({})
    await prisma.auditLog.deleteMany({})
    await prisma.pushSubscription.deleteMany({})

    // Obtener conteos después de eliminar
    const afterCounts = {
      orders: await prisma.order.count(),
      packs: await prisma.pack.count(),
      establishments: await prisma.establishment.count(),
      users: await prisma.user.count(),
      posts: await prisma.post.count(),
      reviews: await prisma.review.count(),
      favorites: await prisma.favorite.count(),
    }

    console.log('📊 After cleanup:', afterCounts)
    console.log('✅ Database cleanup completed!')

    return NextResponse.json({
      message: 'Database cleaned successfully! 🧹',
      before: beforeCounts,
      after: afterCounts,
      deleted: {
        orders: beforeCounts.orders - afterCounts.orders,
        packs: beforeCounts.packs - afterCounts.packs,
        establishments: beforeCounts.establishments - afterCounts.establishments,
        users: beforeCounts.users - afterCounts.users,
        posts: beforeCounts.posts - afterCounts.posts,
        reviews: beforeCounts.reviews - afterCounts.reviews,
        favorites: beforeCounts.favorites - afterCounts.favorites,
      }
    })
  } catch (error) {
    console.error('❌ Error during cleanup:', error)
    
    return NextResponse.json(
      {
        message: 'Error during database cleanup',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// Endpoint para eliminar solo packs
export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    const action = searchParams.get('action')
    
    const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'admin-cleanup-token-123'
    
    if (token !== ADMIN_TOKEN) {
      return NextResponse.json(
        { message: 'Unauthorized. Invalid admin token.' },
        { status: 401 }
      )
    }

    if (action === 'packs-only') {
      console.log('🗑️ Deleting only packs...')
      
      const packCount = await prisma.pack.count()
      await prisma.pack.deleteMany({})
      
      return NextResponse.json({
        message: 'All packs deleted successfully! 📦',
        deleted: {
          packs: packCount
        }
      })
    }
    
    if (action === 'establishments-only') {
      console.log('🗑️ Deleting establishments and related data...')
      
      // Contar antes
      const counts = {
        orders: await prisma.order.count(),
        packs: await prisma.pack.count(),
        establishments: await prisma.establishment.count(),
        posts: await prisma.post.count(),
      }
      
      // Eliminar en orden
      await prisma.order.deleteMany({})
      await prisma.pack.deleteMany({})
      await prisma.post.deleteMany({})
      await prisma.review.deleteMany({})
      await prisma.favorite.deleteMany({})
      await prisma.menuItem.deleteMany({})
      await prisma.establishment.deleteMany({})
      
      return NextResponse.json({
        message: 'All establishments and related data deleted! 🏪',
        deleted: counts
      })
    }

    return NextResponse.json(
      { message: 'Invalid action. Use ?action=packs-only or ?action=establishments-only' },
      { status: 400 }
    )
  } catch (error) {
    console.error('❌ Error during selective cleanup:', error)
    
    return NextResponse.json(
      {
        message: 'Error during selective cleanup',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
