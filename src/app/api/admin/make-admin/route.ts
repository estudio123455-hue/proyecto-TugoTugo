import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    console.log('🔐 [Make Admin] Solicitud para convertir en admin...')
    
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { message: 'Debes estar autenticado' },
        { status: 401 }
      )
    }

    const { adminCode } = await request.json()
    
    // Código de seguridad temporal - cámbialo por algo seguro
    const ADMIN_CODE = 'ADMIN2024'
    
    if (adminCode !== ADMIN_CODE) {
      console.log('❌ [Make Admin] Código incorrecto:', adminCode)
      return NextResponse.json(
        { message: 'Código de administrador incorrecto' },
        { status: 403 }
      )
    }

    console.log('🔐 [Make Admin] Convirtiendo a admin:', session.user.email)

    // Actualizar rol del usuario
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: { role: 'ADMIN' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    })

    console.log('✅ [Make Admin] Usuario convertido a admin:', updatedUser.email)

    return NextResponse.json({
      success: true,
      message: 'Usuario convertido a administrador exitosamente',
      user: updatedUser
    })

  } catch (error) {
    console.error('❌ [Make Admin] Error:', error)
    return NextResponse.json(
      { 
        success: false,
        message: 'Error al convertir en administrador',
        error: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
}
