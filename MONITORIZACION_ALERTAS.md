# 📊 Monitorización y Alertas - TugoTugo

## ✅ Sistema de Auditoría Implementado

### 1. Logs de Auditoría 📝

**Ubicación**: `src/lib/auditLog.ts`

**Tabla en DB**: `AuditLog`

**Campos registrados:**
- `action` - Acción realizada (CREATE, UPDATE, DELETE, APPROVE, REJECT)
- `entityType` - Tipo de entidad (USER, ESTABLISHMENT, POST, PACK, ORDER)
- `entityId` - ID del recurso afectado
- `userId` - Usuario que realizó la acción
- `userName` - Nombre del usuario
- `changes` - Cambios realizados (JSON)
- `metadata` - Información adicional (JSON)
- `ipAddress` - IP del usuario
- `userAgent` - Navegador/dispositivo
- `createdAt` - Timestamp

**Ejemplo de uso:**
```typescript
import { createAuditLog } from '@/lib/auditLog'

await createAuditLog({
  action: 'CREATE',
  entityType: 'PACK',
  entityId: pack.id,
  userId: session.user.id,
  userName: session.user.name || session.user.email || undefined,
  changes: { title: pack.title, price: pack.discountedPrice },
  metadata: { establishmentId: pack.establishmentId },
  ipAddress: request.headers.get('x-forwarded-for') || undefined,
  userAgent: request.headers.get('user-agent') || undefined,
})
```

---

### 2. Sistema de Monitorización 🔍

**Ubicación**: `src/lib/monitoring.ts`

**Eventos monitoreados:**
- ✅ Login exitoso
- ✅ Login fallido
- ✅ Logout
- ✅ Errores de API
- ✅ Rate limit excedido
- ✅ Acceso no autorizado
- ✅ Actividad sospechosa
- ✅ Exportación de datos
- ✅ Acciones de admin

**Niveles de severidad:**
- `INFO` - Eventos normales
- `WARNING` - Eventos que requieren atención
- `ERROR` - Errores que afectan funcionalidad
- `CRITICAL` - Eventos críticos que requieren acción inmediata

---

### 3. Logging de Intentos de Login ��

**Login Exitoso:**
```typescript
import { logSuccessfulLogin } from '@/lib/monitoring'

await logSuccessfulLogin(
  user.id,
  user.email,
  request.headers.get('x-forwarded-for') || 'unknown',
  request.headers.get('user-agent') || 'unknown'
)
```

**Login Fallido:**
```typescript
import { logFailedLogin } from '@/lib/monitoring'

await logFailedLogin(
  email,
  request.headers.get('x-forwarded-for') || 'unknown',
  request.headers.get('user-agent') || 'unknown',
  'Contraseña incorrecta'
)
```

**Detección de Brute Force:**
- Múltiples intentos fallidos desde la misma IP
- Múltiples intentos fallidos para el mismo email
- Alerta automática cuando se detecta patrón sospechoso

---

### 4. Logging de Errores de API 🚨

```typescript
import { logApiError } from '@/lib/monitoring'

try {
  // Código de la API
} catch (error: any) {
  await logApiError(
    '/api/admin/users',
    'POST',
    500,
    error.message,
    session?.user.id,
    request.headers.get('x-forwarded-for') || undefined
  )
  
  return NextResponse.json(
    { success: false, message: 'Error interno' },
    { status: 500 }
  )
}
```

---

### 5. Logging de Accesos No Autorizados 🔒

```typescript
import { logUnauthorizedAccess } from '@/lib/monitoring'

if (!session || session.user.role !== 'ADMIN') {
  await logUnauthorizedAccess(
    '/api/admin/users',
    session?.user.id,
    session?.user.email,
    request.headers.get('x-forwarded-for') || undefined,
    request.headers.get('user-agent') || undefined
  )
  
  return NextResponse.json(
    { success: false, message: 'No autorizado' },
    { status: 403 }
  )
}
```

---

### 6. Panel de Auditoría en Admin 🎯

**Ubicación**: `/admin` → Pestaña "Auditoría"

**Funcionalidades:**
- ✅ Ver todos los logs de auditoría
- ✅ Filtrar por tipo de entidad
- ✅ Filtrar por acción
- ✅ Filtrar por usuario
- ✅ Ver detalles de cambios
- ✅ Ver metadata e IP

**Endpoint**: `/api/admin/audit-logs`

**Filtros disponibles:**
```typescript
GET /api/admin/audit-logs?entityType=USER&action=CREATE&limit=50
```

---

## 📊 Métricas y Estadísticas

### Dashboard de Seguridad

**Métricas clave:**
1. **Intentos de login**
   - Exitosos vs fallidos
   - Por día/hora
   - Por IP

2. **Accesos no autorizados**
   - Endpoints más atacados
   - IPs sospechosas
   - Patrones de ataque

3. **Errores de API**
   - Por endpoint
   - Por código de estado
   - Frecuencia

4. **Rate limiting**
   - IPs bloqueadas
   - Endpoints más limitados
   - Tendencias

5. **Actividad de usuarios**
   - Acciones por usuario
   - Acciones por rol
   - Horarios de actividad

---

## 🚨 Sistema de Alertas

### Alertas Automáticas

**Eventos que generan alertas:**

1. **Críticas (CRITICAL):**
   - Múltiples intentos de login fallidos (>10 en 5 min)
   - Acceso no autorizado a datos sensibles
   - Errores críticos de base de datos
   - Caída de servicios esenciales

2. **Advertencias (WARNING):**
   - Rate limit excedido frecuentemente
   - Errores 500 en APIs
   - Acciones sospechosas de usuarios
   - Cambios en configuración crítica

3. **Informativas (INFO):**
   - Exportación de datos
   - Creación de usuarios admin
   - Cambios en permisos
   - Backups completados

### Canales de Alertas

**Implementar según necesidad:**

1. **Email:**
```typescript
async function sendCriticalAlert(data: MonitoringData) {
  await sendEmail({
    to: process.env.ADMIN_EMAIL,
    subject: `🚨 Alerta Crítica: ${data.event}`,
    html: `
      <h2>Evento Crítico Detectado</h2>
      <p><strong>Tipo:</strong> ${data.event}</p>
      <p><strong>Severidad:</strong> ${data.severity}</p>
      <p><strong>Usuario:</strong> ${data.email || 'Anónimo'}</p>
      <p><strong>IP:</strong> ${data.ip}</p>
      <p><strong>Detalles:</strong> ${data.errorMessage}</p>
    `
  })
}
```

2. **Slack/Discord:**
```typescript
async function sendSlackAlert(data: MonitoringData) {
  await fetch(process.env.SLACK_WEBHOOK_URL!, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: `🚨 *${data.severity}*: ${data.event}`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Usuario:* ${data.email}\n*IP:* ${data.ip}\n*Endpoint:* ${data.endpoint}`
          }
        }
      ]
    })
  })
}
```

3. **SMS (Twilio):**
```typescript
async function sendSmsAlert(data: MonitoringData) {
  // Solo para eventos críticos
  if (data.severity === Severity.CRITICAL) {
    await twilioClient.messages.create({
      body: `🚨 ALERTA CRÍTICA: ${data.event} - ${data.errorMessage}`,
      to: process.env.ADMIN_PHONE,
      from: process.env.TWILIO_PHONE
    })
  }
}
```

---

## 📈 Análisis y Reportes

### Reportes Automáticos

**Diarios:**
- Resumen de actividad
- Intentos de login fallidos
- Errores de API
- Usuarios más activos

**Semanales:**
- Tendencias de seguridad
- Patrones de uso
- Recomendaciones de seguridad
- Métricas de rendimiento

**Mensuales:**
- Análisis completo de seguridad
- Comparativa con mes anterior
- Proyecciones
- Auditoría de cumplimiento

---

## 🔍 Consultas Útiles

### Ver últimos 100 logs de auditoría
```typescript
const logs = await getAuditLogs({ limit: 100 })
```

### Ver logs de un usuario específico
```typescript
const logs = await getAuditLogs({ 
  userId: 'user-id',
  limit: 50 
})
```

### Ver logs de un tipo de entidad
```typescript
const logs = await getAuditLogs({ 
  entityType: 'PACK',
  action: 'DELETE',
  limit: 20 
})
```

### Estadísticas de seguridad
```typescript
import { getSecurityStats } from '@/lib/monitoring'

const stats = await getSecurityStats(7) // Últimos 7 días
```

---

## 🛠️ Implementación en Endpoints

### Ejemplo completo con logging:

```typescript
import { requireAdmin } from '@/lib/authorization'
import { createAuditLog } from '@/lib/auditLog'
import { logApiError, getRequestInfo } from '@/lib/monitoring'
import { validateRequestBody, packSchema } from '@/lib/schemas'

export async function POST(request: Request) {
  const requestInfo = getRequestInfo(request)
  
  try {
    // 1. Autorización
    const authResult = await requireAdmin()
    if (authResult instanceof NextResponse) return authResult
    const session = authResult

    // 2. Validación
    const validation = await validateRequestBody(request, packSchema)
    if (!validation.success) {
      return NextResponse.json(
        { success: false, errors: validation.errors },
        { status: 400 }
      )
    }

    // 3. Crear pack
    const pack = await prisma.pack.create({
      data: validation.data
    })

    // 4. Auditoría
    await createAuditLog({
      action: 'CREATE',
      entityType: 'PACK',
      entityId: pack.id,
      userId: session.user.id,
      userName: session.user.name || session.user.email || undefined,
      changes: { title: pack.title, price: pack.discountedPrice },
      ipAddress: requestInfo.ip,
      userAgent: requestInfo.userAgent,
    })

    return NextResponse.json({ success: true, data: pack })
    
  } catch (error: any) {
    // 5. Log de error
    await logApiError(
      requestInfo.pathname,
      requestInfo.method,
      500,
      error.message,
      undefined,
      requestInfo.ip
    )
    
    return NextResponse.json(
      { success: false, message: 'Error interno' },
      { status: 500 }
    )
  }
}
```

---

## ✅ Checklist de Monitorización

- [x] Sistema de auditoría implementado
- [x] Logs de auditoría en base de datos
- [x] Panel de auditoría en admin
- [x] Logging de intentos de login
- [x] Logging de errores de API
- [x] Logging de accesos no autorizados
- [x] Sistema de monitorización creado
- [x] Detección de brute force
- [ ] Alertas por email (configurar)
- [ ] Alertas por Slack (configurar)
- [ ] Reportes automáticos (configurar)
- [ ] Dashboard de métricas (opcional)

---

## 🎯 Próximos Pasos

### Mejoras Recomendadas:

1. **Crear tabla SecurityLog**
```sql
CREATE TABLE "SecurityLog" (
  "id" TEXT PRIMARY KEY,
  "event" TEXT NOT NULL,
  "severity" TEXT NOT NULL,
  "userId" TEXT,
  "email" TEXT,
  "ip" TEXT,
  "userAgent" TEXT,
  "endpoint" TEXT,
  "method" TEXT,
  "statusCode" INTEGER,
  "errorMessage" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP DEFAULT NOW()
);
```

2. **Integrar con Sentry**
```bash
npm install @sentry/nextjs
```

3. **Configurar alertas por email**
- Usar servicio de email existente
- Definir umbrales de alerta
- Configurar destinatarios

4. **Dashboard de métricas**
- Gráficas de actividad
- Tendencias de seguridad
- KPIs en tiempo real

---

**Tu aplicación tiene un sistema completo de monitorización y auditoría!** 📊🔒
