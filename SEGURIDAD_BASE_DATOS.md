# 🔒 Seguridad en la Base de Datos - TugoTugo

## ✅ Protecciones Implementadas

### 1. Contraseñas Hasheadas con bcrypt 🔐

**Estado**: ✅ IMPLEMENTADO

**Ubicaciones:**
- `src/lib/auth.ts` - Verificación de contraseñas
- `src/app/api/auth/verify-code/route.ts` - Registro de usuarios
- `src/app/api/admin/users/route.ts` - Creación de usuarios admin
- `src/app/api/admin/establishments/route.ts` - Creación de usuarios de restaurantes

**Configuración:**
```typescript
import bcrypt from 'bcryptjs'

// Hashear contraseña (rounds = 10-12)
const hashedPassword = await bcrypt.hash(password, 12)

// Verificar contraseña
const isValid = await bcrypt.compare(password, hashedPassword)
```

**Rounds recomendados:**
- Desarrollo: 10 rounds
- Producción: 12 rounds (implementado ✅)

**Seguridad:**
- ✅ Nunca se guarda contraseña en texto plano
- ✅ Salt único por contraseña
- ✅ Resistente a rainbow tables
- ✅ Resistente a brute force (computacionalmente costoso)

---

### 2. Prevención de SQL Injection 💉

**Estado**: ✅ IMPLEMENTADO

**Método**: Prisma ORM (queries parametrizadas)

**✅ SEGURO - Prisma ORM:**
```typescript
// Prisma usa queries parametrizadas automáticamente
await prisma.user.findUnique({
  where: { email: userEmail } // ✅ Seguro
})

await prisma.post.create({
  data: {
    title: userInput, // ✅ Seguro
    content: userContent // ✅ Seguro
  }
})
```

**❌ INSEGURO - SQL Raw (NO USADO en tu app):**
```typescript
// ❌ NUNCA HACER ESTO
await prisma.$queryRaw`SELECT * FROM users WHERE email = '${userInput}'`

// ✅ Si necesitas raw SQL, usa parámetros
await prisma.$queryRaw`SELECT * FROM users WHERE email = ${userInput}`
```

**Verificación:**
- ✅ No se encontró uso de `$queryRaw` en el código
- ✅ Todas las queries usan Prisma ORM
- ✅ Inputs validados con Zod antes de llegar a la DB

---

### 3. Permisos de Usuario de Base de Datos 👤

**Recomendaciones para PostgreSQL/Neon:**

#### Usuario de Aplicación (Producción):
```sql
-- Crear usuario con permisos limitados
CREATE USER tugotugo_app WITH PASSWORD 'strong_password';

-- Dar permisos solo en el schema público
GRANT CONNECT ON DATABASE tugotugo TO tugotugo_app;
GRANT USAGE ON SCHEMA public TO tugotugo_app;

-- Permisos de tablas (solo lo necesario)
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO tugotugo_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO tugotugo_app;

-- NO dar permisos de:
-- - CREATE DATABASE
-- - DROP TABLE
-- - ALTER TABLE (usar migraciones)
-- - SUPERUSER
```

#### Usuario de Migraciones (Desarrollo):
```sql
-- Usuario separado para migraciones
CREATE USER tugotugo_migrations WITH PASSWORD 'strong_password';

-- Permisos completos en schema público
GRANT ALL PRIVILEGES ON SCHEMA public TO tugotugo_migrations;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO tugotugo_migrations;
```

**Configuración en Neon/Vercel:**
- ✅ Usar connection pooling
- ✅ Limitar conexiones concurrentes
- ✅ Usar SSL/TLS para conexiones
- ✅ Rotar credenciales periódicamente

---

### 4. Protección de Datos Sensibles 🛡️

**Datos que NUNCA se exponen:**

```typescript
// ✅ CORRECTO - Excluir password en queries
const user = await prisma.user.findUnique({
  where: { id: userId },
  select: {
    id: true,
    email: true,
    name: true,
    role: true,
    // password: false ← NO incluir
  }
})

// ❌ INCORRECTO - Exponer todo
const user = await prisma.user.findUnique({
  where: { id: userId }
  // Incluye password! ❌
})
```

**Implementado en tu app:**
```typescript
// src/lib/auth.ts
const user = await prisma.user.findUnique({
  where: { email: credentials.email },
})

// Solo se usa internamente, nunca se retorna al cliente
if (!user || !user.password) {
  return null
}

const isPasswordValid = await bcrypt.compare(
  credentials.password,
  user.password
)

// Retornar sin password
return {
  id: user.id,
  email: user.email,
  name: user.name,
  role: user.role,
  // password NO incluido ✅
}
```

---

### 5. Backups y Recuperación 💾

**Recomendaciones:**

1. **Backups Automáticos:**
   - Neon/Vercel Postgres: Backups automáticos diarios
   - Retención: 7-30 días
   - Point-in-time recovery

2. **Backups Manuales:**
```bash
# Exportar base de datos
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Restaurar
psql $DATABASE_URL < backup_20250103.sql
```

3. **Estrategia 3-2-1:**
   - 3 copias de datos
   - 2 tipos de medios diferentes
   - 1 copia offsite

---

### 6. Auditoría de Base de Datos 📊

**Implementado:**
- ✅ Tabla `AuditLog` para trazabilidad
- ✅ Registro de todas las acciones CRUD
- ✅ Metadata de usuario, IP, timestamp

**Queries auditadas:**
```typescript
await createAuditLog({
  action: 'CREATE',
  entityType: 'USER',
  entityId: user.id,
  userId: session.user.id,
  userName: session.user.name,
  changes: { email: user.email, role: user.role },
  metadata: { ip: request.headers.get('x-forwarded-for') }
})
```

---

### 7. Encriptación de Datos 🔐

**En tránsito:**
- ✅ SSL/TLS para conexiones a DB
- ✅ Certificados válidos
- ✅ Neon/Vercel usan TLS 1.3

**En reposo:**
- ✅ Neon/Vercel encriptan datos en disco
- ✅ AES-256 encryption
- ✅ Backups encriptados

**Datos sensibles adicionales:**
```typescript
// Si necesitas encriptar datos adicionales
import crypto from 'crypto'

const algorithm = 'aes-256-gcm'
const key = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex')

function encrypt(text: string) {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv(algorithm, key, iv)
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  const authTag = cipher.getAuthTag()
  
  return {
    encrypted,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex')
  }
}
```

---

### 8. Validación de Datos antes de DB 🔍

**Implementado con Zod:**
```typescript
import { validateWithSchema, userSchema } from '@/lib/schemas'

export async function POST(request: Request) {
  const body = await request.json()
  
  // Validar ANTES de tocar la DB
  const validation = validateWithSchema(userSchema, body)
  
  if (!validation.success) {
    return NextResponse.json(
      { errors: validation.errors },
      { status: 400 }
    )
  }
  
  // Datos validados y seguros
  const user = await prisma.user.create({
    data: validation.data
  })
}
```

**Protecciones:**
- ✅ Tipos de datos correctos
- ✅ Longitudes validadas
- ✅ Formatos verificados
- ✅ Sanitización de HTML
- ✅ Prevención de inyección

---

## 📋 Checklist de Seguridad de Base de Datos

### ✅ Implementado:
- [x] Contraseñas hasheadas con bcrypt (12 rounds)
- [x] Prisma ORM (previene SQL injection)
- [x] No uso de `$queryRaw` sin sanitizar
- [x] Validación con Zod antes de DB
- [x] Passwords nunca expuestos en responses
- [x] Auditoría de acciones en DB
- [x] SSL/TLS para conexiones
- [x] Encriptación en reposo (Neon/Vercel)

### 🔄 Recomendado (Configurar en Neon/Vercel):
- [ ] Usuario de DB con permisos limitados
- [ ] Connection pooling configurado
- [ ] Límite de conexiones concurrentes
- [ ] Backups automáticos habilitados
- [ ] Alertas de uso de recursos
- [ ] Rotación de credenciales periódica

---

## 🎯 Mejores Prácticas

### ✅ HACER:
```typescript
// 1. Usar Prisma ORM
await prisma.user.findUnique({ where: { id } })

// 2. Validar con Zod
const validation = validateWithSchema(schema, data)

// 3. Hashear passwords
const hash = await bcrypt.hash(password, 12)

// 4. Excluir campos sensibles
select: { id: true, email: true } // Sin password

// 5. Auditar acciones
await createAuditLog({ action, entityType, entityId })
```

### ❌ EVITAR:
```typescript
// 1. SQL raw sin parámetros
await prisma.$queryRaw`SELECT * FROM users WHERE id = '${id}'`

// 2. Passwords en texto plano
data: { password: plainPassword } // ❌

// 3. Exponer datos sensibles
return user // Incluye password ❌

// 4. Sin validación
await prisma.user.create({ data: untrustedInput }) // ❌

// 5. Permisos de superadmin en producción
GRANT ALL PRIVILEGES // ❌
```

---

## 🔐 Variables de Entorno Seguras

**`.env` (nunca commitear):**
```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/db?sslmode=require"

# Encryption (si se usa)
ENCRYPTION_KEY="hex_key_de_32_bytes"

# NextAuth
NEXTAUTH_SECRET="secret_muy_seguro_y_largo"
```

**Seguridad:**
- ✅ Usar `.env.local` en desarrollo
- ✅ Variables en Vercel para producción
- ✅ Nunca commitear `.env`
- ✅ Rotar secrets periódicamente
- ✅ Usar secrets managers (Vercel, AWS Secrets Manager)

---

## 📊 Monitoreo y Alertas

**Métricas a monitorear:**
1. Conexiones activas a DB
2. Queries lentas (> 1 segundo)
3. Errores de conexión
4. Uso de CPU/memoria
5. Tamaño de base de datos
6. Intentos de login fallidos

**Herramientas:**
- Neon Dashboard
- Vercel Analytics
- Prisma Studio (desarrollo)
- Sentry (errores)

---

## ✅ Resumen

**Tu aplicación tiene:**
- ✅ Contraseñas seguras con bcrypt
- ✅ Prevención de SQL injection con Prisma
- ✅ Validación exhaustiva de datos
- ✅ Auditoría completa
- ✅ Encriptación en tránsito y reposo
- ✅ No exposición de datos sensibles

**Próximos pasos recomendados:**
1. Configurar usuario de DB con permisos limitados
2. Habilitar backups automáticos
3. Configurar alertas de monitoreo
4. Documentar proceso de recuperación ante desastres

**¡Tu base de datos está protegida con las mejores prácticas!** 🔒🚀
