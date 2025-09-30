import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Get email from query params
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { message: 'Email parameter required' },
        { status: 400 }
      )
    }

    // Check verification tokens for this email
    const verificationTokens = await prisma.verificationToken.findMany({
      where: {
        identifier: {
          startsWith: email,
        },
      },
      orderBy: {
        expires: 'desc',
      },
      take: 10,
    })

    // Check if EmailVerification table exists and has data
    let emailVerifications: any[] = []
    try {
      emailVerifications = await prisma.emailVerification.findMany({
        where: {
          email,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 10,
      })
    } catch (error: any) {
      console.log('EmailVerification table not available:', error.message)
    }

    // Check user status
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        emailVerified: true,
        createdAt: true,
      },
    })

    return NextResponse.json({
      email,
      user,
      verificationTokens: verificationTokens.map(token => ({
        identifier: token.identifier,
        token: token.token,
        expires: token.expires,
        isExpired: token.expires < new Date(),
      })),
      emailVerifications: emailVerifications.map(verification => ({
        id: verification.id,
        email: verification.email,
        code: verification.code,
        type: verification.type,
        expires: verification.expires,
        verified: verification.verified,
        attempts: verification.attempts,
        isExpired: verification.expires < new Date(),
      })),
      currentTime: new Date(),
      summary: {
        userExists: !!user,
        userVerified: !!user?.emailVerified,
        activeTokens: verificationTokens.filter(t => t.expires > new Date()).length,
        activeVerifications: emailVerifications.filter(v => v.expires > new Date() && !v.verified).length,
      },
    })
  } catch (error) {
    console.error('Debug verification error:', error)
    return NextResponse.json(
      { 
        error: 'Debug failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
