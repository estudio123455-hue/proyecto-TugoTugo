import { NextResponse } from 'next/server'

// Almacenamiento en memoria para rate limiting
// En producción, usar Redis o similar
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

interface RateLimitConfig {
  interval: number // Ventana de tiempo en ms
  uniqueTokenPerInterval: number // Máximo de requests en la ventana
}

/**
 * Rate limiter simple basado en IP
 * @param identifier - IP o identificador único
 * @param config - Configuración del rate limit
 * @returns true si está dentro del límite, false si excedió
 */
export function rateLimit(
  identifier: string,
  config: RateLimitConfig = {
    interval: 60 * 1000, // 1 minuto
    uniqueTokenPerInterval: 10, // 10 requests por minuto
  }
): { success: boolean; limit: number; remaining: number; reset: number } {
  const now = Date.now()
  const tokenData = rateLimitMap.get(identifier)

  if (!tokenData || now > tokenData.resetTime) {
    // Nueva ventana de tiempo
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + config.interval,
    })
    return {
      success: true,
      limit: config.uniqueTokenPerInterval,
      remaining: config.uniqueTokenPerInterval - 1,
      reset: now + config.interval,
    }
  }

  if (tokenData.count >= config.uniqueTokenPerInterval) {
    // Límite excedido
    return {
      success: false,
      limit: config.uniqueTokenPerInterval,
      remaining: 0,
      reset: tokenData.resetTime,
    }
  }

  // Incrementar contador
  tokenData.count++
  return {
    success: true,
    limit: config.uniqueTokenPerInterval,
    remaining: config.uniqueTokenPerInterval - tokenData.count,
    reset: tokenData.resetTime,
  }
}

/**
 * Middleware de rate limiting para APIs
 */
export function withRateLimit(
  handler: Function,
  config?: RateLimitConfig
) {
  return async (request: Request, ...args: any[]) => {
    // Obtener IP del request
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown'

    const result = rateLimit(ip, config)

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Demasiadas solicitudes. Intenta de nuevo más tarde.',
          error: 'RATE_LIMIT_EXCEEDED',
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': result.limit.toString(),
            'X-RateLimit-Remaining': result.remaining.toString(),
            'X-RateLimit-Reset': new Date(result.reset).toISOString(),
            'Retry-After': Math.ceil((result.reset - Date.now()) / 1000).toString(),
          },
        }
      )
    }

    // Agregar headers de rate limit a la respuesta
    const response = await handler(request, ...args)
    
    if (response instanceof NextResponse) {
      response.headers.set('X-RateLimit-Limit', result.limit.toString())
      response.headers.set('X-RateLimit-Remaining', result.remaining.toString())
      response.headers.set('X-RateLimit-Reset', new Date(result.reset).toISOString())
    }

    return response
  }
}

/**
 * Limpiar entradas antiguas del mapa (ejecutar periódicamente)
 */
export function cleanupRateLimitMap() {
  const now = Date.now()
  for (const [key, value] of rateLimitMap.entries()) {
    if (now > value.resetTime) {
      rateLimitMap.delete(key)
    }
  }
}

// Limpiar cada 5 minutos
if (typeof window === 'undefined') {
  setInterval(cleanupRateLimitMap, 5 * 60 * 1000)
}
