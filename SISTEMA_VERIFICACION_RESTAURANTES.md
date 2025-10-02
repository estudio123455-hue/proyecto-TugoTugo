# 🔐 SISTEMA COMPLETO DE VERIFICACIÓN DE RESTAURANTES

## ✅ Estado Actual (Ya Implementado)

### 1. Autenticación con Google OAuth
- ✅ Registro con Gmail
- ✅ Verificación automática de email
- ✅ Usuario creado en base de datos
- ✅ Inicio de sesión seguro

### 2. Formulario de Restaurante (Básico)
**Campos actuales:**
- ✅ Nombre del restaurante
- ✅ Descripción
- ✅ Dirección
- ✅ Coordenadas GPS (latitud/longitud)
- ✅ Teléfono
- ✅ Email
- ✅ Categoría

### 3. Base de Datos
- ✅ PostgreSQL en Vercel
- ✅ Modelo `Establishment` completo
- ✅ Relación con `User`

### 4. Sistema de Emails
- ✅ Nodemailer configurado
- ✅ SMTP con Gmail
- ✅ Usado para códigos de verificación

## 🚀 Mejoras a Implementar

### Fase 1: Campos Adicionales en Formulario

**Agregar al modelo Establishment:**
```prisma
model Establishment {
  // ... campos existentes
  
  // Nuevos campos
  openingHours  String?   // JSON con horarios
  images        String[]  // Array de URLs de fotos
  legalDocument String?   // URL del documento legal
  businessType  String?   // Tipo de negocio
  taxId         String?   // NIT o RUT
  
  // Estado de verificación
  verificationStatus String @default("PENDING") // PENDING, APPROVED, REJECTED
  verificationNotes  String? // Notas del admin
  approvedAt         DateTime?
  approvedBy         String? // ID del admin que aprobó
}
```

### Fase 2: Email de Confirmación al Dueño

**Cuando se registra un restaurante:**

1. **Email automático al dueño** con:
   - ✅ Resumen de datos enviados
   - ✅ Número de solicitud
   - ✅ Estado: "En revisión"
   - ✅ Próximos pasos

**Plantilla del email:**
```
Asunto: ✅ Solicitud de Restaurante Recibida - [Nombre del Restaurante]

Hola [Nombre del Dueño],

¡Gracias por registrar tu restaurante en FoodSave!

📋 RESUMEN DE TU SOLICITUD

Nombre del Restaurante: [Nombre]
Dirección: [Dirección]
Teléfono: [Teléfono]
Categoría: [Categoría]
Email: [Email]

🔍 ESTADO ACTUAL
Tu solicitud está en revisión. Nuestro equipo verificará la información en las próximas 24-48 horas.

📧 PRÓXIMOS PASOS
1. Recibirás un email cuando tu restaurante sea aprobado
2. Podrás empezar a publicar packs y ofertas
3. Tus clientes podrán encontrarte en la app

¿Tienes preguntas? Responde a este email.

Saludos,
Equipo FoodSave
```

### Fase 3: Panel de Aprobación para Admin

**Funcionalidades:**
- ✅ Ver lista de restaurantes pendientes
- ✅ Ver detalles completos del restaurante
- ✅ Ver documentos subidos
- ✅ Aprobar o rechazar
- ✅ Agregar notas

**Email de aprobación al dueño:**
```
Asunto: 🎉 ¡Tu Restaurante Ha Sido Aprobado!

Hola [Nombre],

¡Excelentes noticias! Tu restaurante [Nombre] ha sido aprobado.

✅ YA PUEDES:
- Publicar packs sorpresa
- Crear ofertas especiales
- Recibir pedidos de clientes

🚀 COMIENZA AHORA:
1. Inicia sesión en tu dashboard
2. Crea tu primer pack
3. ¡Empieza a vender!

Bienvenido a FoodSave,
Equipo FoodSave
```

## 📁 Estructura de Archivos a Crear

### 1. Migración de Base de Datos
```sql
-- prisma/migrations/add_verification_fields.sql
ALTER TABLE "Establishment" 
ADD COLUMN IF NOT EXISTS "openingHours" TEXT,
ADD COLUMN IF NOT EXISTS "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS "legalDocument" TEXT,
ADD COLUMN IF NOT EXISTS "businessType" TEXT,
ADD COLUMN IF NOT EXISTS "taxId" TEXT,
ADD COLUMN IF NOT EXISTS "verificationStatus" TEXT DEFAULT 'PENDING',
ADD COLUMN IF NOT EXISTS "verificationNotes" TEXT,
ADD COLUMN IF NOT EXISTS "approvedAt" TIMESTAMP,
ADD COLUMN IF NOT EXISTS "approvedBy" TEXT;
```

### 2. Servicio de Email
```typescript
// src/lib/email/restaurant-verification.ts
export async function sendRestaurantConfirmation(establishment, user) {
  // Enviar email de confirmación
}

export async function sendRestaurantApproval(establishment, user) {
  // Enviar email de aprobación
}

export async function sendRestaurantRejection(establishment, user, reason) {
  // Enviar email de rechazo
}
```

### 3. API Endpoints
```typescript
// src/app/api/admin/restaurants/[id]/approve/route.ts
POST - Aprobar restaurante

// src/app/api/admin/restaurants/[id]/reject/route.ts
POST - Rechazar restaurante

// src/app/api/upload/route.ts
POST - Subir fotos y documentos
```

### 4. Componentes Frontend
```typescript
// src/components/dashboard/EnhancedEstablishmentSetup.tsx
- Formulario completo con todos los campos
- Upload de fotos
- Upload de documento legal
- Selector de horarios

// src/app/admin/verification/page.tsx
- Panel de aprobación
- Lista de pendientes
- Detalles de cada restaurante
```

## 🔧 Tecnologías Usadas (Ya en tu proyecto)

- ✅ **Backend**: Next.js API Routes
- ✅ **Base de datos**: PostgreSQL (Vercel)
- ✅ **Autenticación**: NextAuth + Google OAuth
- ✅ **Email**: Nodemailer + Gmail SMTP
- ✅ **Almacenamiento**: Cloudinary (para fotos) - A configurar

## 📊 Flujo Completo

```
1. Usuario se registra con Google
   ↓
2. Google verifica el email
   ↓
3. Usuario completa formulario de restaurante
   - Datos básicos
   - Horarios
   - Fotos
   - Documento legal (opcional)
   ↓
4. Sistema guarda en BD con status "PENDING"
   ↓
5. Email automático al dueño
   "Tu solicitud fue recibida"
   ↓
6. Admin revisa en panel
   ↓
7a. APROBADO                    7b. RECHAZADO
    - Email de aprobación           - Email con razón
    - Status = APPROVED             - Status = REJECTED
    - Restaurante visible           - Puede volver a aplicar
   ↓
8. Dueño puede publicar packs
```

## ⏱️ Tiempo de Implementación

- **Fase 1** (Campos adicionales): 2-3 horas
- **Fase 2** (Emails): 1-2 horas
- **Fase 3** (Panel admin): 3-4 horas

**Total**: 6-9 horas de desarrollo

## 🎯 Prioridad de Implementación

### Alta Prioridad (Implementar Ya)
1. ✅ Email de confirmación al registrar restaurante
2. ✅ Campo de estado de verificación
3. ✅ Panel básico de aprobación para admin

### Media Prioridad (Siguiente Sprint)
4. Upload de fotos
5. Horarios de atención
6. Documento legal

### Baja Prioridad (Futuro)
7. Sistema de notificaciones en app
8. Chat entre admin y dueño
9. Analytics de verificación

## 📝 Próximos Pasos

¿Quieres que implemente:
1. **Email de confirmación** cuando se registra un restaurante?
2. **Panel de aprobación** para admin?
3. **Campos adicionales** en el formulario?

Dime cuál prefieres y lo implemento ahora mismo! 🚀
