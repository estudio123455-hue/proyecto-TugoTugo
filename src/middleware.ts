import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { initializeDatabase } from './lib/db-init'

// Lista de orígenes permitidos
const ALLOWED_ORIGINS = [
  process.env.NEXTAUTH_URL || 'http://localhost:3000',
  'https://tugotugo.vercel.app', // Tu dominio de producción
  // Agregar otros dominios permitidos aquí
]

// Rutas que requieren CORS
const CORS_PATHS = ['/api/']

// Variable para rastrear si la DB ya fue inicializada
let dbInitialized = false

export async function middleware(request: NextRequest) {
  // Inicializar base de datos en la primera request a la API
  if (!dbInitialized && request.nextUrl.pathname.startsWith('/api/')) {
    try {
      await initializeDatabase()
      dbInitialized = true
    } catch (error) {
      console.warn('Database initialization failed in middleware:', error)
    }
  }
  const origin = request.headers.get('origin')
  const pathname = request.nextUrl.pathname

  // Verificar si la ruta necesita CORS
  const needsCORS = CORS_PATHS.some((path) => pathname.startsWith(path))

  if (needsCORS) {
    // Verificar origen
    const isAllowedOrigin = origin && (
      ALLOWED_ORIGINS.includes(origin) ||
      origin.includes('localhost') ||
      origin.includes('127.0.0.1')
    )

    // Manejar preflight requests (OPTIONS)
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': isAllowedOrigin ? origin : ALLOWED_ORIGINS[0],
          'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
          'Access-Control-Allow-Credentials': 'true',
          'Access-Control-Max-Age': '86400', // 24 horas
        },
      })
    }

    // Para otras requests, agregar headers CORS
    const response = NextResponse.next()

    if (isAllowedOrigin) {
      response.headers.set('Access-Control-Allow-Origin', origin)
      response.headers.set('Access-Control-Allow-Credentials', 'true')
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
    }

    // Headers de seguridad adicionales
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-XSS-Protection', '1; mode=block')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    response.headers.set(
      'Permissions-Policy',
      'camera=(), microphone=(), geolocation=(self)'
    )

    // Strict-Transport-Security (HSTS) - Solo en producción
    if (process.env.NODE_ENV === 'production') {
      response.headers.set(
        'Strict-Transport-Security',
        'max-age=31536000; includeSubDomains; preload'
      )
    }

    return response
  }

  // Para rutas que no necesitan CORS, solo agregar headers de seguridad
  const response = NextResponse.next()
  
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    )
  }

  return response
}

// Configurar en qué rutas se ejecuta el middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
