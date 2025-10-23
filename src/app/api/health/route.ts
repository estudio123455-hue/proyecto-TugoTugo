import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * Health Check Endpoint
 * Verifica el estado de la aplicación y sus dependencias
 */
export async function GET() {
  const startTime = Date.now()
  
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`
    
    // Check TensorFlow.js (if available)
    let aiStatus = 'unknown'
    try {
      if (typeof window !== 'undefined') {
        const tf = await import('@tensorflow/tfjs')
        await tf.ready()
        aiStatus = 'ready'
      } else {
        aiStatus = 'server-side'
      }
    } catch (error) {
      aiStatus = 'error'
    }

    const responseTime = Date.now() - startTime
    
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      responseTime: `${responseTime}ms`,
      services: {
        database: 'connected',
        ai: aiStatus,
        auth: process.env.NEXTAUTH_SECRET ? 'configured' : 'missing',
        payments: {
          stripe: process.env.STRIPE_SECRET_KEY ? 'configured' : 'missing',
          mercadopago: process.env.MERCADOPAGO_ACCESS_TOKEN ? 'configured' : 'missing'
        },
        email: process.env.SMTP_HOST ? 'configured' : 'missing',
        monitoring: process.env.SENTRY_DSN ? 'configured' : 'missing'
      },
      features: {
        pwa: 'enabled',
        maps: 'enabled',
        chat: 'enabled',
        qr: 'enabled',
        notifications: 'enabled'
      },
      uptime: process.uptime ? `${Math.floor(process.uptime())}s` : 'unknown'
    }

    return NextResponse.json(healthData, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
    
  } catch (error) {
    console.error('Health check failed:', error)
    
    const errorData = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      responseTime: `${Date.now() - startTime}ms`
    }
    
    return NextResponse.json(errorData, { 
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  }
}
