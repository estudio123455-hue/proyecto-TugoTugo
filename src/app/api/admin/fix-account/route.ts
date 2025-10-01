import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST - Arreglar cuenta de admin (temporal)
export async function POST(request: NextRequest) {
  try {
    const { email, secretKey } = await request.json()

    const SECRET = process.env.ADMIN_SETUP_SECRET || 'mi-clave-secreta-123'

    if (secretKey !== SECRET) {
      return NextResponse.json(
        { success: false, message: 'Clave secreta incorrecta' },
        { status: 401 }
      )
    }

    // Buscar el usuario
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // Cambiar a ADMIN (que es tipo CUSTOMER pero con permisos de admin)
    const updatedUser = await prisma.user.update({
      where: { email },
      data: { role: 'ADMIN' },
    })

    return NextResponse.json({
      success: true,
      message: `Usuario ${email} actualizado a ADMIN exitosamente`,
      data: {
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
      },
    })
  } catch (error) {
    console.error('Error fixing account:', error)
    return NextResponse.json(
      { success: false, message: 'Error al actualizar cuenta' },
      { status: 500 }
    )
  }
}
