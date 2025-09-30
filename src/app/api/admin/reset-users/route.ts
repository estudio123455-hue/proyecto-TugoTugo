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

    // 1. Borrar órdenes
    const deletedOrders = await prisma.order.deleteMany({})
    console.log(`✅ ${deletedOrders.count} órdenes eliminadas`)

    // 2. Borrar posts
    const deletedPosts = await prisma.post.deleteMany({})
    console.log(`✅ ${deletedPosts.count} posts eliminados`)

    // 3. Borrar packs
    const deletedPacks = await prisma.pack.deleteMany({})
    console.log(`✅ ${deletedPacks.count} packs eliminados`)

    // 4. Borrar establishments
    const deletedEstablishments = await prisma.establishment.deleteMany({})
    console.log(`✅ ${deletedEstablishments.count} establecimientos eliminados`)

    // 5. Borrar sessions
    const deletedSessions = await prisma.session.deleteMany({})
    console.log(`✅ ${deletedSessions.count} sesiones eliminadas`)

    // 6. Borrar accounts
    const deletedAccounts = await prisma.account.deleteMany({})
    console.log(`✅ ${deletedAccounts.count} cuentas eliminadas`)

    // 7. Borrar verification tokens
    const deletedTokens = await prisma.verificationToken.deleteMany({})
    console.log(`✅ ${deletedTokens.count} tokens eliminados`)

    // 8. Borrar email verifications
    const deletedEmailVerifications = await prisma.emailVerification.deleteMany({})
    console.log(`✅ ${deletedEmailVerifications.count} verificaciones eliminadas`)

    // 9. Finalmente, borrar usuarios
    const deletedUsers = await prisma.user.deleteMany({})
    console.log(`✅ ${deletedUsers.count} usuarios eliminados`)

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
