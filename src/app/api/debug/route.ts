import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Verificar variables de entorno básicas
    const envCheck = {
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'NOT_SET',
      NEXTAUTH_URL: process.env.NEXTAUTH_URL ? 'SET' : 'NOT_SET',
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'SET' : 'NOT_SET',
    }

    return NextResponse.json({
      status: 'ok',
      message: 'Debug endpoint working',
      environment: envCheck,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        message: 'Debug endpoint failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
