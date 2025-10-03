import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// GET - Obtener establecimiento del usuario actual
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ESTABLISHMENT') {
      return NextResponse.json(
        { success: false, message: 'No autorizado' },
        { status: 401 }
      )
    }

    const establishment = await prisma.establishment.findUnique({
      where: { userId: session.user.id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
          },
        },
      },
    })

    if (!establishment) {
      return NextResponse.json(
        { success: false, message: 'No se encontró establecimiento' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: establishment,
    })
  } catch (error: any) {
    console.error('Error fetching establishment:', error)
    return NextResponse.json(
      { success: false, message: 'Error al obtener establecimiento' },
      { status: 500 }
    )
  }
}
