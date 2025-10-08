import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log('🗑️ [DELETE] Deleting user:', id)

    // Delete in order: establishment -> accounts -> sessions -> orders -> user
    
    // 1. Delete establishment (cascades to posts and packs)
    await prisma.establishment.deleteMany({
      where: { userId: id },
    })

    // 2. Delete accounts
    await prisma.account.deleteMany({
      where: { userId: id },
    })

    // 3. Delete sessions
    await prisma.session.deleteMany({
      where: { userId: id },
    })

    // 4. Delete orders
    await prisma.order.deleteMany({
      where: { userId: id },
    })

    // 5. Finally delete user
    await prisma.user.delete({
      where: { id },
    })

    console.log('✅ [DELETE] User deleted successfully')

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully',
    })
  } catch (error) {
    console.error('❌ [DELETE] Error deleting user:', error)
    return NextResponse.json(
      { 
        success: false,
        message: 'Error deleting user',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
