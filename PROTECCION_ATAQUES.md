# 🛡️ Protección contra Ataques Comunes - TugoTugo

## ✅ Protecciones Implementadas

### 1. Rate Limiting 🚦

**Ubicación**: `src/lib/rateLimit.ts`

**Configuración por defecto:**
- 10 requests por minuto por IP
- Ventana de tiempo: 60 segundos
- Headers informativos en respuestas

**Uso en APIs:**
```typescript
import { withRateLimit } from '@/lib/rateLimit'

export const GET = withRateLimit(
  async (request: Request) => {
    // Tu código aquí
  },
  {
    interval: 60 * 1000, // 1 minuto
    uniqueTokenPerInterval: 10, // 10 requests
  }
)
```

**Respuesta cuando se excede:**
```json
{
  "success": false,
  "message": "Demasiadas solicitudes. Intenta de nuevo más tarde.",
  "error": "RATE_LIMIT_EXCEEDED"
}
```

**Headers de respuesta:**
- `X-RateLimit-Limit`: Límite máximo
- `X-RateLimit-Remaining`: Requests restantes
- `X-RateLimit-Reset`: Cuándo se resetea
- `Retry-After`: Segundos para reintentar

---

### 2. Validación de Entrada con Zod ✅

**Ubicación**: `src/lib/schemas.ts`

**Schemas disponibles:**
- `userSchema` - Usuarios
- `establishmentSchema` - Restaurantes
- `postSchema` - Posts
- `packSchema` - Packs
- `orderSchema` - Órdenes
- `loginSchema` - Login
- `registerSchema` - Registro

**Uso:**
```typescript
import { validateRequestBody, packSchema } from '@/lib/schemas'

export async function POST(request: Request) {
  const validation = await validateRequestBody(request, packSchema)
  
  if (!validation.success) {
    return NextResponse.json(
      { success: false, errors: validation.errors },
      { status: 400 }
    )
  }
  
  const data = validation.data
  // Datos validados y seguros
}
```

**Validaciones incluidas:**
- ✅ Tipos de datos correctos
- ✅ Longitud de strings
- ✅ Formato de emails
- ✅ Formato de URLs
- ✅ Rangos numéricos
- ✅ Patrones regex
- ✅ Validaciones cruzadas (ej: password === confirmPassword)

---

### 3. Sanitización de HTML (XSS) 🧹

**Ubicación**: `src/lib/validation.ts`

**Protección contra:**
- Cross-Site Scripting (XSS)
- Inyección de scripts
- HTML malicioso

**Uso:**
```typescript
import { sanitizeHtml } from '@/lib/validation'

const cleanContent = sanitizeHtml(userInput)
```

**Tags permitidos:**
- Texto: `p`, `br`, `strong`, `em`, `u`
- Títulos: `h1`, `h2`, `h3`, `h4`, `h5`, `h6`
- Listas: `ul`, `ol`, `li`
- Enlaces: `a` (con `href`, `target`, `rel`)

---

### 4. Headers de Seguridad 🔒

**Ubicación**: `src/middleware.ts` y `next.config.js`

**Headers implementados:**

| Header | Valor | Protección |
|--------|-------|------------|
| `X-Content-Type-Options` | nosniff | MIME sniffing |
| `X-Frame-Options` | DENY | Clickjacking |
| `X-XSS-Protection` | 1; mode=block | XSS |
| `Referrer-Policy` | strict-origin-when-cross-origin | Info leakage |
| `Permissions-Policy` | camera=(), microphone=() | API abuse |
| `Strict-Transport-Security` | max-age=31536000 | HTTPS enforcement |

---

### 5. CSRF Protection 🔐

**Implementado mediante:**
- ✅ SameSite cookies (`lax`)
- ✅ CORS whitelist
- ✅ Origin verification
- ✅ NextAuth.js CSRF tokens

**Configuración:**
```typescript
// src/lib/auth.ts
cookies: {
  sessionToken: {
    options: {
      httpOnly: true,
      sameSite: 'lax', // ← Protección CSRF
      secure: true,
    },
  },
}
```

---

### 6. SQL Injection Prevention 💉

**Protección mediante:**
- ✅ Prisma ORM (queries parametrizadas)
- ✅ Validación con Zod
- ✅ Sanitización de inputs

**Prisma previene automáticamente:**
```typescript
// ✅ SEGURO - Prisma usa queries parametrizadas
await prisma.user.findUnique({
  where: { email: userInput }
})

// ❌ INSEGURO - SQL raw (evitar)
await prisma.$queryRaw`SELECT * FROM users WHERE email = '${userInput}'`
```

---

### 7. Brute Force Protection 🔨

**Protección mediante:**
- ✅ Rate limiting en login (5 intentos/minuto)
- ✅ Passwords hasheados con bcrypt
- ✅ Lockout temporal después de fallos

**Configuración recomendada:**
```typescript
// Login endpoint
export const POST = withRateLimit(
  async (request: Request) => {
    // Login logic
  },
  {
    interval: 60 * 1000, // 1 minuto
    uniqueTokenPerInterval: 5, // Solo 5 intentos
  }
)
```

---

### 8. File Upload Security 📁

**Validaciones:**
```typescript
import { validateFile } from '@/lib/validation'

const validation = validateFile(file, {
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp']
})

if (!validation.isValid) {
  // Rechazar archivo
}
```

---

## 🎯 Matriz de Protecciones

| Ataque | Protección | Implementado |
|--------|-----------|--------------|
| **Brute Force** | Rate limiting | ✅ |
| **SQL Injection** | Prisma ORM + Validación | ✅ |
| **XSS** | Sanitización HTML + CSP | ✅ |
| **CSRF** | SameSite cookies + CORS | ✅ |
| **Clickjacking** | X-Frame-Options | ✅ |
| **MIME Sniffing** | X-Content-Type-Options | ✅ |
| **DDoS** | Rate limiting + Vercel | ✅ |
| **Session Hijacking** | httpOnly + secure cookies | ✅ |
| **Man-in-the-Middle** | HTTPS + HSTS | ✅ |
| **File Upload** | Validación tipo/tamaño | ✅ |

---

## 📝 Ejemplos de Uso

### Ejemplo 1: API con Rate Limiting y Validación
```typescript
import { withRateLimit } from '@/lib/rateLimit'
import { validateRequestBody, packSchema } from '@/lib/schemas'
import { requireAdmin } from '@/lib/authorization'

export const POST = withRateLimit(
  async (request: Request) => {
    // 1. Verificar autorización
    const authResult = await requireAdmin()
    if (authResult instanceof NextResponse) return authResult
    
    // 2. Validar datos
    const validation = await validateRequestBody(request, packSchema)
    if (!validation.success) {
      return NextResponse.json(
        { success: false, errors: validation.errors },
        { status: 400 }
      )
    }
    
    // 3. Datos seguros y validados
    const data = validation.data
    
    // 4. Crear pack
    const pack = await prisma.pack.create({ data })
    
    return NextResponse.json({ success: true, data: pack })
  },
  {
    interval: 60 * 1000,
    uniqueTokenPerInterval: 20, // 20 packs por minuto máximo
  }
)
```

### Ejemplo 2: Sanitizar contenido de usuario
```typescript
import { sanitizeHtml } from '@/lib/validation'

export async function POST(request: Request) {
  const { content } = await request.json()
  
  // Sanitizar HTML antes de guardar
  const cleanContent = sanitizeHtml(content)
  
  await prisma.post.create({
    data: {
      content: cleanContent, // ✅ Seguro
    }
  })
}
```

### Ejemplo 3: Validación completa de formulario
```typescript
import { validateWithSchema, registerSchema } from '@/lib/schemas'

export async function POST(request: Request) {
  const body = await request.json()
  
  const validation = validateWithSchema(registerSchema, body)
  
  if (!validation.success) {
    return NextResponse.json(
      {
        success: false,
        message: 'Datos inválidos',
        errors: validation.errors
      },
      { status: 400 }
    )
  }
  
  // validation.data está tipado y validado
  const { name, email, password } = validation.data
}
```

---

## 🔧 Configuración Recomendada

### Rate Limits por Tipo de Endpoint:

| Endpoint | Límite | Ventana |
|----------|--------|---------|
| Login | 5 requests | 1 minuto |
| Registro | 3 requests | 5 minutos |
| APIs públicas | 30 requests | 1 minuto |
| APIs admin | 60 requests | 1 minuto |
| Upload de archivos | 5 requests | 5 minutos |

---

## ✅ Checklist de Seguridad

- ✅ Rate limiting en endpoints sensibles
- ✅ Validación con Zod en todos los inputs
- ✅ Sanitización de HTML en contenido de usuario
- ✅ Headers de seguridad configurados
- ✅ CORS whitelist configurado
- ✅ Cookies seguras (httpOnly, secure, sameSite)
- ✅ Prisma ORM para prevenir SQL injection
- ✅ Passwords hasheados con bcrypt
- ✅ HTTPS forzado en producción
- ✅ Validación de archivos subidos
- ✅ Logs de auditoría para trazabilidad

---

## 🚀 Próximos Pasos (Opcional)

### Mejoras Futuras:
1. **Redis para Rate Limiting** - Escalar mejor en múltiples instancias
2. **WAF (Web Application Firewall)** - Cloudflare o AWS WAF
3. **2FA (Two-Factor Auth)** - Autenticación de dos factores
4. **IP Blacklisting** - Bloquear IPs maliciosas
5. **Honeypots** - Detectar bots
6. **Security Monitoring** - Sentry, LogRocket

---

**Tu aplicación está protegida contra los ataques más comunes!** 🛡️🚀
