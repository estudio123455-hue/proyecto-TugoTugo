# ✅ Validaciones de Seguridad - TugoTugo

## 🔐 Validaciones Implementadas

### 1. Validación de Email 📧

**Ubicación**: `src/lib/validators.ts`

**Validaciones:**
- ✅ Formato válido (regex)
- ✅ Email único (no duplicados)
- ✅ Dominio válido (no temporales)
- ✅ Normalización (toLowerCase)

**Uso:**
```typescript
import { validateUniqueEmail, validateEmailDomain } from '@/lib/validators'

// Verificar que el email no esté en uso
const validation = await validateUniqueEmail(email)
if (!validation.isValid) {
  return { error: validation.error }
}

// Verificar que no sea email temporal
const domainValid = await validateEmailDomain(email)
if (!domainValid) {
  return { error: 'Email de dominio temporal no permitido' }
}
```

**Dominios bloqueados:**
- tempmail.com
- guerrillamail.com
- 10minutemail.com
- mailinator.com
- throwaway.email

---

### 2. Validación de Teléfono 📱

**Ubicación**: `src/lib/validators.ts`

**Formatos válidos para Colombia:**
- `+573001234567` - Celular con código de país
- `3001234567` - Celular sin código
- `6012345678` - Fijo con código de ciudad
- `12345678` - Fijo sin código

**Uso:**
```typescript
import { validateColombianPhone, formatColombianPhone } from '@/lib/validators'

const validation = validateColombianPhone(phone)
if (!validation.isValid) {
  return { error: validation.error }
}

// Guardar en formato internacional
const formattedPhone = validation.formatted // +573001234567
```

**Formateo automático:**
```typescript
const formatted = formatColombianPhone('3001234567')
// Resultado: "+57 300 123 4567"
```

---

### 3. Validación de NIT/RUT 🏢

**Ubicación**: `src/lib/validators.ts`

**Validaciones:**
- ✅ Formato correcto (9-10 dígitos)
- ✅ Dígito de verificación válido
- ✅ NIT único (no duplicados)
- ✅ Formateo automático

**Uso:**
```typescript
import { validateColombianNIT, validateUniqueNIT } from '@/lib/validators'

// Validar formato y dígito de verificación
const validation = validateColombianNIT(nit)
if (!validation.isValid) {
  return { error: validation.error }
}

// Verificar que no esté duplicado
const uniqueValidation = await validateUniqueNIT(nit)
if (!uniqueValidation.isValid) {
  return { error: uniqueValidation.error }
}

// Guardar en formato estándar
const formattedNIT = validation.formatted // 900123456-7
```

**Algoritmo de verificación:**
- Usa la fórmula oficial de la DIAN
- Multiplica cada dígito por números primos
- Calcula módulo 11
- Verifica dígito de control

---

### 4. Control de Duplicados 🚫

**Implementado en:**
- ✅ Email de usuarios (único)
- ✅ NIT de establecimientos (único)
- ✅ Nombre de establecimientos (verificación)

**En Prisma Schema:**
```prisma
model User {
  email String @unique // ← Único a nivel de DB
}

model Establishment {
  taxId String? @unique // ← NIT único
  userId String @unique // ← Un usuario = un restaurante
}
```

**Validación antes de crear:**
```typescript
import { validateEstablishmentData } from '@/lib/validators'

const validation = await validateEstablishmentData({
  name: data.name,
  email: data.email,
  nit: data.taxId,
  phone: data.phone,
})

if (!validation.isValid) {
  return NextResponse.json(
    { success: false, errors: validation.errors },
    { status: 400 }
  )
}
```

---

### 5. Validación con Zod 🔍

**Ubicación**: `src/lib/schemas.ts`

**Schemas actualizados:**

```typescript
// Establecimiento con NIT
export const establishmentSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email().toLowerCase().optional(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/).optional(),
  nit: z.string().regex(/^\d{9,10}-?\d?$/).optional(),
  // ... otros campos
})

// Usuario con email único
export const userSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string()
    .min(8)
    .regex(/[A-Z]/, 'Mayúscula requerida')
    .regex(/[a-z]/, 'Minúscula requerida')
    .regex(/[0-9]/, 'Número requerido'),
})
```

---

### 6. Protección contra Bots (Recomendado) 🤖

**Opciones:**

#### A. Google reCAPTCHA v3 (Invisible)

**Instalación:**
```bash
npm install react-google-recaptcha-v3
```

**Configuración:**
```typescript
// src/app/layout.tsx
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3'

export default function RootLayout({ children }) {
  return (
    <GoogleReCaptchaProvider reCaptchaKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}>
      {children}
    </GoogleReCaptchaProvider>
  )
}
```

**En formulario de registro:**
```typescript
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3'

const { executeRecaptcha } = useGoogleReCaptcha()

const handleSubmit = async () => {
  if (!executeRecaptcha) return
  
  const token = await executeRecaptcha('register')
  
  // Enviar token al backend
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ ...data, recaptchaToken: token })
  })
}
```

**Verificar en backend:**
```typescript
// Verificar token de reCAPTCHA
const verifyResponse = await fetch(
  `https://www.google.com/recaptcha/api/siteverify`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`,
  }
)

const verifyData = await verifyResponse.json()

if (!verifyData.success || verifyData.score < 0.5) {
  return NextResponse.json(
    { success: false, message: 'Verificación de bot fallida' },
    { status: 400 }
  )
}
```

#### B. Honeypot (Alternativa simple)

**En formulario:**
```tsx
{/* Campo oculto que los bots llenarán */}
<input
  type="text"
  name="website"
  style={{ display: 'none' }}
  tabIndex={-1}
  autoComplete="off"
/>
```

**En backend:**
```typescript
const { website } = await request.json()

// Si el campo honeypot está lleno, es un bot
if (website) {
  return NextResponse.json(
    { success: false, message: 'Registro inválido' },
    { status: 400 }
  )
}
```

---

## 📋 Validación Completa de Establecimiento

### Ejemplo de uso completo:

```typescript
import { validateRequestBody, establishmentSchema } from '@/lib/schemas'
import { validateEstablishmentData } from '@/lib/validators'

export async function POST(request: Request) {
  // 1. Validar formato con Zod
  const schemaValidation = await validateRequestBody(request, establishmentSchema)
  if (!schemaValidation.success) {
    return NextResponse.json(
      { success: false, errors: schemaValidation.errors },
      { status: 400 }
    )
  }

  const data = schemaValidation.data

  // 2. Validar duplicados y formatos específicos
  const uniqueValidation = await validateEstablishmentData({
    name: data.name,
    email: data.email,
    nit: data.nit,
    phone: data.phone,
  })

  if (!uniqueValidation.isValid) {
    return NextResponse.json(
      { success: false, errors: uniqueValidation.errors },
      { status: 400 }
    )
  }

  // 3. Formatear datos
  const formattedData = {
    ...data,
    phone: data.phone ? validateColombianPhone(data.phone).formatted : undefined,
    taxId: data.nit ? validateColombianNIT(data.nit).formatted : undefined,
    email: data.email?.toLowerCase(),
  }

  // 4. Crear establecimiento
  const establishment = await prisma.establishment.create({
    data: formattedData
  })

  return NextResponse.json({ success: true, data: establishment })
}
```

---

## ✅ Checklist de Validaciones

### Implementado:
- [x] Validación de formato de email
- [x] Email único (no duplicados)
- [x] Dominios de email temporales bloqueados
- [x] Validación de teléfono colombiano
- [x] Formateo automático de teléfono
- [x] Validación de NIT colombiano
- [x] Dígito de verificación de NIT
- [x] NIT único (no duplicados)
- [x] Nombre de establecimiento único
- [x] Schemas con Zod
- [x] Índices en base de datos

### Recomendado (Opcional):
- [ ] Google reCAPTCHA v3
- [ ] Honeypot en formularios
- [ ] Verificación de email por código
- [ ] Verificación de teléfono por SMS
- [ ] Límite de registros por IP/día

---

## 🎯 Migración de Base de Datos

Para aplicar los cambios del schema (taxId único + índices):

```bash
# Generar migración
npx prisma migrate dev --name add_unique_taxid_and_indexes

# O en producción (Vercel)
npx prisma db push
```

---

## 📊 Resumen de Validaciones

| Campo | Validación | Único | Formato |
|-------|-----------|-------|---------|
| Email | ✅ Regex + Dominio | ✅ | lowercase |
| Teléfono | ✅ Regex Colombia | ❌ | +57XXXXXXXXXX |
| NIT | ✅ Dígito verificación | ✅ | XXXXXXXXX-X |
| Nombre | ✅ Longitud | ✅ | - |
| Password | ✅ Complejidad | ❌ | bcrypt hash |

---

**¡Sistema de validaciones completo implementado!** ✅🔒
