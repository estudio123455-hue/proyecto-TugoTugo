import { NextRequest, NextResponse } from 'next/server'
import { shouldRequireEmailVerification } from '@/lib/security'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { message: 'Email es requerido' },
        { status: 400 }
      )
    }

    // Get user info
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        role: true,
        createdAt: true,
        name: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { message: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // Get request info for security analysis
    // Check if verification is required
    const securityCheck = await shouldRequireEmailVerification(email)

    return NextResponse.json({
      requiresVerification: securityCheck.requiresVerification,
      reason: securityCheck.reason,
      user: {
        name: user.name,
        role: user.role,
        isNewAccount: Date.now() - user.createdAt.getTime() < 7 * 24 * 60 * 60 * 1000,
      },
    })
  } catch (error) {
    console.error('Error checking verification requirement:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
