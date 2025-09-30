import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// DELETE - Borrar todos los usuarios (SOLO PARA DESARROLLO)
export async function DELETE(request: NextRequest) {
  try {
    const { secretKey } = await request.json()

    // Clave secreta para proteger este endpoint
    const RESET_SECRET = process.env.RESET_SECRET || 'reset-database-123'

    if (secretKey !== RESET_SECRET) {
      return NextResponse.json(
        { success: false, message: 'Clave secreta incorrecta' },
        { status: 401 }
      )
    }

    // Borrar en orden correcto (respetando relaciones)
    console.log('🗑️ Borrando datos...')

    let deletedOrders = { count: 0 }
    let deletedPosts = { count: 0 }
    let deletedPacks = { count: 0 }
    let deletedEstablishments = { count: 0 }
    let deletedSessions = { count: 0 }
    let deletedAccounts = { count: 0 }
    let deletedTokens = { count: 0 }
    let deletedEmailVerifications = { count: 0 }
    let deletedUsers = { count: 0 }

    try {
      // 1. Borrar órdenes
      deletedOrders = await prisma.order.deleteMany({})
      console.log(`✅ ${deletedOrders.count} órdenes eliminadas`)
    } catch (e) {
      console.log('⚠️ No hay órdenes para borrar')
    }

    try {
      // 2. Borrar posts
      deletedPosts = await prisma.post.deleteMany({})
      console.log(`✅ ${deletedPosts.count} posts eliminados`)
    } catch (e) {
      console.log('⚠️ No hay posts para borrar')
    }

    try {
      // 3. Borrar packs
      deletedPacks = await prisma.pack.deleteMany({})
      console.log(`✅ ${deletedPacks.count} packs eliminados`)
    } catch (e) {
      console.log('⚠️ No hay packs para borrar')
    }

    try {
      // 4. Borrar establishments
      deletedEstablishments = await prisma.establishment.deleteMany({})
      console.log(`✅ ${deletedEstablishments.count} establecimientos eliminados`)
    } catch (e) {
      console.log('⚠️ No hay establecimientos para borrar')
    }

    try {
      // 5. Borrar sessions
      deletedSessions = await prisma.session.deleteMany({})
      console.log(`✅ ${deletedSessions.count} sesiones eliminadas`)
    } catch (e) {
      console.log('⚠️ No hay sesiones para borrar')
    }

    try {
      // 6. Borrar accounts
      deletedAccounts = await prisma.account.deleteMany({})
      console.log(`✅ ${deletedAccounts.count} cuentas eliminadas`)
    } catch (e) {
      console.log('⚠️ No hay cuentas para borrar')
    }

    try {
      // 7. Borrar verification tokens
      deletedTokens = await prisma.verificationToken.deleteMany({})
      console.log(`✅ ${deletedTokens.count} tokens eliminados`)
    } catch (e) {
      console.log('⚠️ No hay tokens para borrar')
    }

    try {
      // 8. Borrar email verifications
      deletedEmailVerifications = await prisma.emailVerification.deleteMany({})
      console.log(`✅ ${deletedEmailVerifications.count} verificaciones eliminadas`)
    } catch (e) {
      console.log('⚠️ No hay verificaciones para borrar')
    }

    try {
      // 9. Finalmente, borrar usuarios
      deletedUsers = await prisma.user.deleteMany({})
      console.log(`✅ ${deletedUsers.count} usuarios eliminados`)
    } catch (e) {
      console.log('⚠️ No hay usuarios para borrar')
    }

    return NextResponse.json({
      success: true,
      message: 'Base de datos limpiada exitosamente',
      deleted: {
        users: deletedUsers.count,
        establishments: deletedEstablishments.count,
        packs: deletedPacks.count,
        posts: deletedPosts.count,
        orders: deletedOrders.count,
        sessions: deletedSessions.count,
        accounts: deletedAccounts.count,
        tokens: deletedTokens.count,
        emailVerifications: deletedEmailVerifications.count,
      },
    })
  } catch (error) {
    console.error('Error resetting database:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error al limpiar base de datos',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
