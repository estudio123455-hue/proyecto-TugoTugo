import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🗑️ [DELETE] Deleting user:', params.id)

    // First, delete the user's establishment if exists (this will cascade delete posts and packs)
    const userWithEstablishment = await prisma.user.findUnique({
      where: { id: params.id },
      include: {
        establishment: true,
      },
    })

    if (userWithEstablishment?.establishment) {
      console.log('🗑️ [DELETE] Deleting user establishment first')
      await prisma.establishment.delete({
        where: { id: userWithEstablishment.establishment.id },
      })
    }

    // Then delete the user
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
