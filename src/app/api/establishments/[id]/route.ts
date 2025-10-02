import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const establishment = await prisma.establishment.findUnique({
      where: { id: params.id },
      include: {
        packs: {
          where: {
            isActive: true,
            quantity: {
              gt: 0,
            },
          },
        },
      },
    })

    if (!establishment) {
      return NextResponse.json(
        { message: 'Establishment not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(establishment)
  } catch (error) {
    console.error('Error fetching establishment:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🗑️ [DELETE] Deleting establishment:', params.id)

    // Delete establishment (cascade will delete posts and packs)
    await prisma.establishment.delete({
      where: { id: params.id },
    })

    console.log('✅ [DELETE] Establishment deleted successfully')

    return NextResponse.json({
      success: true,
      message: 'Establishment deleted successfully',
    })
  } catch (error) {
    console.error('❌ [DELETE] Error deleting establishment:', error)
    return NextResponse.json(
      { 
        success: false,
        message: 'Error deleting establishment',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
