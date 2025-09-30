import { NextRequest, NextResponse } from 'next/server'
import { createVerifiedSession } from '@/lib/verified-sessions'

export async function POST(request: NextRequest) {
  try {
    const { email, role, accountType } = await request.json()

    if (!email || !role || !accountType) {
      return NextResponse.json(
        { message: 'Email, role y accountType son requeridos' },
        { status: 400 }
      )
    }

    // Generate a secure verified session token
    const token = createVerifiedSession(email, role, accountType)

    return NextResponse.json({
      success: true,
      token,
      message: 'Token de login creado correctamente',
    })
  } catch (error) {
    console.error('Error creating login token:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
