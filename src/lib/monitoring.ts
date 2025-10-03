// Tipos de eventos a monitorear
export enum MonitoringEvent {
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILED = 'LOGIN_FAILED',
  LOGOUT = 'LOGOUT',
  API_ERROR = 'API_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  DATA_EXPORT = 'DATA_EXPORT',
  ADMIN_ACTION = 'ADMIN_ACTION',
}

// Niveles de severidad
export enum Severity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL',
}

interface MonitoringData {
  event: MonitoringEvent
  severity: Severity
  userId?: string
  email?: string
  ip?: string
  userAgent?: string
  endpoint?: string
  method?: string
  statusCode?: number
  errorMessage?: string
  metadata?: Record<string, any>
}

/**
 * Registrar evento de monitorización
 */
export async function logMonitoringEvent(data: MonitoringData) {
  try {
    // Log en consola para desarrollo
    const timestamp = new Date().toISOString()
    const logMessage = `[${timestamp}] [${data.severity}] ${data.event}: ${data.email || data.userId || 'anonymous'} - ${data.endpoint || ''}`
    
    if (data.severity === Severity.ERROR || data.severity === Severity.CRITICAL) {
      console.error(logMessage, data)
    } else if (data.severity === Severity.WARNING) {
      console.warn(logMessage, data)
    } else {
      console.log(logMessage, data)
    }

    // Guardar en base de datos (opcional - crear tabla SecurityLog)
    // await prisma.securityLog.create({ data: { ... } })

    // Enviar alertas críticas
    if (data.severity === Severity.CRITICAL) {
      await sendCriticalAlert(data)
    }

    return true
  } catch (error) {
    console.error('Error logging monitoring event:', error)
    return false
  }
}

/**
 * Registrar intento de login fallido
 */
export async function logFailedLogin(
  email: string,
  ip: string,
  userAgent: string,
  reason: string
) {
  await logMonitoringEvent({
    event: MonitoringEvent.LOGIN_FAILED,
    severity: Severity.WARNING,
    email,
    ip,
    userAgent,
    errorMessage: reason,
    metadata: { timestamp: new Date() },
  })

  // Verificar si hay múltiples intentos fallidos
  await checkBruteForce(email, ip)
}

/**
 * Registrar login exitoso
 */
export async function logSuccessfulLogin(
  userId: string,
  email: string,
  ip: string,
  userAgent: string
) {
  await logMonitoringEvent({
    event: MonitoringEvent.LOGIN_SUCCESS,
    severity: Severity.INFO,
    userId,
    email,
    ip,
    userAgent,
  })
}

/**
 * Registrar error de API
 */
export async function logApiError(
  endpoint: string,
  method: string,
  statusCode: number,
  errorMessage: string,
  userId?: string,
  ip?: string
) {
  const severity = statusCode >= 500 ? Severity.ERROR : Severity.WARNING

  await logMonitoringEvent({
    event: MonitoringEvent.API_ERROR,
    severity,
    userId,
    ip,
    endpoint,
    method,
    statusCode,
    errorMessage,
  })
}

/**
 * Registrar acceso no autorizado
 */
export async function logUnauthorizedAccess(
  endpoint: string,
  userId?: string,
  email?: string,
  ip?: string,
  userAgent?: string
) {
  await logMonitoringEvent({
    event: MonitoringEvent.UNAUTHORIZED_ACCESS,
    severity: Severity.WARNING,
    userId,
    email,
    ip,
    userAgent,
    endpoint,
  })
}

/**
 * Registrar exceso de rate limit
 */
export async function logRateLimitExceeded(
  ip: string,
  endpoint: string,
  userAgent?: string
) {
  await logMonitoringEvent({
    event: MonitoringEvent.RATE_LIMIT_EXCEEDED,
    severity: Severity.WARNING,
    ip,
    userAgent,
    endpoint,
  })
}

/**
 * Registrar exportación de datos
 */
export async function logDataExport(
  userId: string,
  email: string,
  exportType: string,
  ip: string
) {
  await logMonitoringEvent({
    event: MonitoringEvent.DATA_EXPORT,
    severity: Severity.INFO,
    userId,
    email,
    ip,
    metadata: { exportType },
  })
}

/**
 * Detectar posible brute force
 */
async function checkBruteForce(email: string, ip: string) {
  // En producción, usar Redis para tracking
  // Por ahora, solo log si es crítico
  
  // Simulación: si hay más de 5 intentos en 5 minutos
  // En producción, implementar con Redis o similar
  
  await logMonitoringEvent({
    event: MonitoringEvent.SUSPICIOUS_ACTIVITY,
    severity: Severity.WARNING,
    email,
    ip,
    errorMessage: 'Múltiples intentos de login fallidos detectados',
  })
}

/**
 * Enviar alerta crítica (email, Slack, etc.)
 */
async function sendCriticalAlert(data: MonitoringData) {
  // En producción, enviar email o notificación a Slack
  console.error('🚨 ALERTA CRÍTICA:', data)
  
  // Ejemplo: enviar email al admin
  // await sendEmail({
  //   to: process.env.ADMIN_EMAIL,
  //   subject: `🚨 Alerta Crítica: ${data.event}`,
  //   html: `<p>Se detectó un evento crítico:</p><pre>${JSON.stringify(data, null, 2)}</pre>`
  // })
}

/**
 * Obtener estadísticas de seguridad
 */
export async function getSecurityStats(days: number = 7) {
  // En producción, consultar tabla SecurityLog
  // Por ahora, retornar estructura de ejemplo
  
  return {
    period: `Últimos ${days} días`,
    loginAttempts: {
      successful: 0,
      failed: 0,
    },
    unauthorizedAccess: 0,
    rateLimitExceeded: 0,
    apiErrors: 0,
    suspiciousActivity: 0,
  }
}
/**
 * Middleware para logging automático de requests
 */
export function createRequestLogger() {
  return async (request: Request, ...args: any[]) => {
    // Obtener IP del request
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown'
    const method = request.method
    const url = new URL(request.url)
    const endpoint = url.pathname

    try {
      // const response = await handler(request)
      
      const duration = Date.now() - startTime
      
      // Log de request exitoso
      console.log(`[${method}] ${endpoint} - ${duration}ms - IP: ${ip}`)
      
      return response
    } catch (error: any) {
      const duration = Date.now() - startTime
      
      // Log de error
      await logApiError(
        endpoint,
        method,
        500,
        error.message,
        undefined,
        ip
      )
      
      console.error(`[${method}] ${endpoint} - ERROR - ${duration}ms - IP: ${ip}`, error)
      
      throw error
    }
  }
}

/**
 * Helper para extraer información de request
 */
export function getRequestInfo(request: Request) {
  return {
    ip: request.headers.get('x-forwarded-for') || 
        request.headers.get('x-real-ip') || 
        'unknown',
    userAgent: request.headers.get('user-agent') || 'unknown',
    method: request.method,
    url: request.url,
    pathname: new URL(request.url).pathname,
  }
}
