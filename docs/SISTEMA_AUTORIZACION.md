# 🔐 Sistema de Autorización - TugoTugo

## 📋 Roles del Sistema

### 1. ADMIN (Administrador)
**Permisos completos:**
- ✅ Gestionar usuarios
- ✅ Gestionar todos los restaurantes
- ✅ Gestionar todos los posts y packs
- ✅ Ver todas las órdenes
- ✅ Ver reportes y estadísticas
- ✅ Exportar datos
- ✅ Ver logs de auditoría
- ✅ Enviar notificaciones

### 2. ESTABLISHMENT (Restaurante)
**Permisos limitados:**
- ✅ Gestionar su propio restaurante
- ✅ Crear/editar/eliminar sus propios posts
- ✅ Crear/editar/eliminar sus propios packs
- ✅ Ver y gestionar sus propias órdenes
- ❌ No puede ver datos de otros restaurantes
- ❌ No puede acceder a reportes globales
- ❌ No puede exportar datos del sistema

### 3. CUSTOMER (Cliente)
**Permisos básicos:**
- ✅ Ver restaurantes y packs disponibles
- ✅ Hacer pedidos
- ✅ Ver su historial de órdenes
- ❌ No puede crear restaurantes
- ❌ No puede crear posts o packs
- ❌ No puede ver datos de otros usuarios

---

## 🛡️ Middleware de Autorización

### Uso en APIs:

```typescript
import { requireAdmin, requireEstablishment, requireAuth } from '@/lib/authorization'

// Solo ADMIN
export async function GET() {
  const authResult = await requireAdmin()
  if (authResult instanceof NextResponse) {
    return authResult // Error 401 o 403
  }
  const session = authResult
  
  // Código de la API...
}

// ESTABLISHMENT o ADMIN
export async function POST() {
  const authResult = await requireEstablishment()
  if (authResult instanceof NextResponse) {
    return authResult
  }
  const session = authResult
  
  // Código de la API...
}

// Cualquier usuario autenticado
export async function GET() {
  const authResult = await requireAuth()
  if (authResult instanceof NextResponse) {
    return authResult
  }
  const session = authResult
  
  // Código de la API...
}
```

---

## 🔒 Verificación de Propiedad

Para recursos que pertenecen a un usuario específico:

```typescript
import { checkOwnership, isOwnerOrAdmin } from '@/lib/authorization'

// Verificar si puede modificar un recurso
const ownershipError = checkOwnership(session, resource.userId)
if (ownershipError) {
  return ownershipError // Error 403
}

// O verificar manualmente
if (!isOwnerOrAdmin(session, resource.userId)) {
  return NextResponse.json(
    { success: false, message: 'No autorizado' },
    { status: 403 }
  )
}
```

---

## 📊 Matriz de Permisos

| Permiso | ADMIN | ESTABLISHMENT | CUSTOMER |
|---------|-------|---------------|----------|
| Gestionar usuarios | ✅ | ❌ | ❌ |
| Gestionar restaurantes | ✅ | Solo el suyo | ❌ |
| Gestionar posts | ✅ | Solo los suyos | ❌ |
| Gestionar packs | ✅ | Solo los suyos | ❌ |
| Gestionar órdenes | ✅ | Solo las suyas | Solo las suyas |
| Ver reportes | ✅ | ❌ | ❌ |
| Exportar datos | ✅ | ❌ | ❌ |
| Ver logs de auditoría | ✅ | ❌ | ❌ |
| Enviar notificaciones | ✅ | ❌ | ❌ |

---

## 🚦 Códigos de Estado HTTP

### 200 OK
Solicitud exitosa

### 401 Unauthorized
- No hay sesión activa
- Token inválido o expirado
- **Acción**: Redirigir a login

### 403 Forbidden
- Usuario autenticado pero sin permisos
- Rol insuficiente para la acción
- **Acción**: Mostrar mensaje de error

### 404 Not Found
- Recurso no existe
- O usuario no tiene permiso para verlo

---

## 🔐 Rutas Protegidas

### `/api/admin/*` - Solo ADMIN
```typescript
export const dynamic = 'force-dynamic'

export async function GET() {
  const authResult = await requireAdmin()
  if (authResult instanceof NextResponse) return authResult
  // ...
}
```

### `/api/establishment/*` - ESTABLISHMENT o ADMIN
```typescript
export async function POST() {
  const authResult = await requireEstablishment()
  if (authResult instanceof NextResponse) return authResult
  // ...
}
```

### `/api/orders/*` - Usuario autenticado
```typescript
export async function GET() {
  const authResult = await requireAuth()
  if (authResult instanceof NextResponse) return authResult
  
  // Filtrar solo sus órdenes si no es ADMIN
  const where = session.user.role === 'ADMIN' 
    ? {} 
    : { userId: session.user.id }
  // ...
}
```

---

## 🛠️ Funciones Disponibles

### `requireAdmin()`
Requiere rol ADMIN

### `requireEstablishment()`
Requiere rol ESTABLISHMENT o ADMIN

### `requireAuth()`
Requiere cualquier usuario autenticado

### `isOwnerOrAdmin(session, resourceOwnerId)`
Verifica si es dueño del recurso o ADMIN

### `checkOwnership(session, resourceOwnerId)`
Retorna error si no es dueño ni ADMIN

### `hasPermission(role, permission)`
Verifica si un rol tiene un permiso específico

---

## 📝 Ejemplos de Uso

### Ejemplo 1: Endpoint solo para ADMIN
```typescript
// src/app/api/admin/users/route.ts
import { requireAdmin } from '@/lib/authorization'

export async function GET() {
  const authResult = await requireAdmin()
  if (authResult instanceof NextResponse) return authResult
  
  const users = await prisma.user.findMany()
  return NextResponse.json({ success: true, data: users })
}
```

### Ejemplo 2: Endpoint con verificación de propiedad
```typescript
// src/app/api/posts/[id]/route.ts
import { requireAuth, checkOwnership } from '@/lib/authorization'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAuth()
  if (authResult instanceof NextResponse) return authResult
  const session = authResult
  
  const post = await prisma.post.findUnique({
    where: { id: params.id },
    include: { establishment: true }
  })
  
  if (!post) {
    return NextResponse.json(
      { success: false, message: 'Post no encontrado' },
      { status: 404 }
    )
  }
  
  // Verificar que sea dueño o ADMIN
  const ownershipError = checkOwnership(
    session, 
    post.establishment.userId
  )
  if (ownershipError) return ownershipError
  
  await prisma.post.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
```

### Ejemplo 3: Filtrar datos según rol
```typescript
// src/app/api/orders/route.ts
import { requireAuth } from '@/lib/authorization'
import { UserRole } from '@/lib/authorization'

export async function GET() {
  const authResult = await requireAuth()
  if (authResult instanceof NextResponse) return authResult
  const session = authResult
  
  // ADMIN ve todas, otros solo las suyas
  const where = session.user.role === UserRole.ADMIN
    ? {}
    : { userId: session.user.id }
  
  const orders = await prisma.order.findMany({ where })
  return NextResponse.json({ success: true, data: orders })
}
```

---

## ✅ Mejores Prácticas

1. **Siempre verificar autenticación primero**
   ```typescript
   const authResult = await requireAdmin()
   if (authResult instanceof NextResponse) return authResult
   ```

2. **Verificar propiedad en recursos específicos**
   ```typescript
   const ownershipError = checkOwnership(session, resource.userId)
   if (ownershipError) return ownershipError
   ```

3. **Filtrar datos según rol**
   ```typescript
   const where = session.user.role === 'ADMIN' 
     ? {} 
     : { userId: session.user.id }
   ```

4. **Usar códigos HTTP correctos**
   - 401: No autenticado
   - 403: Sin permisos
   - 404: No encontrado

5. **Registrar acciones en auditoría**
   ```typescript
   await createAuditLog({
     action: 'DELETE',
     entityType: 'POST',
     entityId: post.id,
     userId: session.user.id,
     userName: session.user.name || session.user.email
   })
   ```

---

## 🔄 Migración de Endpoints Existentes

Para actualizar endpoints existentes:

**Antes:**
```typescript
const session = await getServerSession(authOptions)
if (!session || session.user.role !== 'ADMIN') {
  return NextResponse.json({ success: false }, { status: 401 })
}
```

**Después:**
```typescript
const authResult = await requireAdmin()
if (authResult instanceof NextResponse) return authResult
const session = authResult
```

---

## 🎯 Resumen

✅ **Sistema de roles** implementado (ADMIN, ESTABLISHMENT, CUSTOMER)  
✅ **Middleware centralizado** para verificación de permisos  
✅ **Verificación de propiedad** de recursos  
✅ **Matriz de permisos** clara y documentada  
✅ **Códigos HTTP** apropiados  
✅ **Fácil de usar** y mantener  

**Tu aplicación tiene un sistema de autorización robusto y escalable!** 🔒
