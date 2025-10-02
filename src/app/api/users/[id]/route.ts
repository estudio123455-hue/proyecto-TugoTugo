import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🗑️ [DELETE] Deleting user:', params.id)

    // Delete user (cascade will delete establishments, posts, and packs)
    await prisma.user.delete({
      where: { id: params.id },
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
