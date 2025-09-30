import { NextRequest, NextResponse } from 'next/server'
import { validateLoginToken } from '@/lib/temp-tokens'
// import { signIn } from 'next-auth/react'

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json(
        { message: 'Token es requerido' },
        { status: 400 }
      )
    }

    // Validate the token
    const tokenData = validateLoginToken(token)

    if (!tokenData.valid) {
      return NextResponse.json(
        { message: 'Token inválido o expirado' },
        { status: 400 }
      )
    }

    // Return the validated data for client-side login
    return NextResponse.json({
      success: true,
      email: tokenData.email,
      role: tokenData.role,
      accountType: tokenData.accountType,
    })
  } catch (error) {
    console.error('Error validating login token:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
