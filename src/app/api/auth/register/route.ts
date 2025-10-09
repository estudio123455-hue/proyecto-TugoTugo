import { NextRequest, NextResponse } from 'next/server'
import { sendVerificationCodePersistent } from '@/lib/verification-persistent'

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, role } = await request.json()

    // Validate input
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    // Send verification code instead of creating user directly
    const result = await sendVerificationCodePersistent(email, name, 'REGISTRATION')
    
    if (!result.success) {
      return NextResponse.json(
        { message: result.message },
        { status: 400 }
      )
    }

    // Return success with instruction to verify
    return NextResponse.json({
      message: 'Código de verificación enviado. Revisa tu email.',
      success: true,
      requiresVerification: true,
      userData: { name, email, password, role }
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
