import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST - Convertir un usuario en ADMIN (usar solo una vez)
export async function POST(request: NextRequest) {
  try {
    const { email, secretKey } = await request.json()

    // Clave secreta para proteger este endpoint
    // IMPORTANTE: Cambia esto por tu propia clave secreta
    const SETUP_SECRET = process.env.ADMIN_SETUP_SECRET || 'mi-clave-secreta-123'

    if (secretKey !== SETUP_SECRET) {
      return NextResponse.json(
        { success: false, message: 'Clave secreta incorrecta' },
        { status: 401 }
      )
    }

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email es requerido' },
        { status: 400 }
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

    // Convertir a ADMIN
    const updatedUser = await prisma.user.update({
      where: { email },
      data: { role: 'ADMIN' },
    })

    return NextResponse.json({
      success: true,
      message: `Usuario ${email} convertido a ADMIN exitosamente`,
      data: {
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
      },
    })
  } catch (error) {
    console.error('Error setting up admin:', error)
    return NextResponse.json(
      { success: false, message: 'Error al configurar admin' },
      { status: 500 }
    )
  }
}
