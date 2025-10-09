import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, message: 'No autorizado' },
        { status: 401 }
      )
    }

    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'ID de usuario requerido' },
        { status: 400 }
      )
    }

    // Verificar usuario manualmente
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        emailVerified: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Usuario verificado exitosamente',
      data: user,
    })
  } catch (error) {
    console.error('Error verifying user:', error)
    return NextResponse.json(
      { success: false, message: 'Error al verificar usuario' },
      { status: 500 }
    )
  }
}
