# Debug: Internal Server Error al Publicar Restaurantes

## Problema Reportado
Error interno del servidor (500) al intentar publicar/crear un restaurante.

## Posibles Causas

### 1. **Problema de Autenticación/Rol**
- El usuario debe tener `role: 'ESTABLISHMENT'` para crear un restaurante
- Verificar que la sesión esté activa y tenga el rol correcto

### 2. **Validación de Datos**
- Campos requeridos: `name`, `address`, `latitude`, `longitude`, `category`
- Los campos `latitude` y `longitude` deben ser números (Float en Prisma)
- Campos opcionales: `description`, `phone`, `email`

### 3. **Restricción de Base de Datos**
- Solo puede haber **un establecimiento por usuario** (relación 1:1)
- Si el usuario ya tiene un establecimiento, retorna error 400

### 4. **Problemas de Tipo de Datos**
- `latitude` y `longitude` deben parsearse a Float
- Strings vacíos pueden causar errores en campos opcionales

## Cambios Aplicados

### ✅ Mejoras en `/api/establishment/setup/route.ts`

1. **Logging detallado** para debugging:
   - Log de inicio de proceso
   - Log de sesión y rol del usuario
   - Log de datos recibidos
   - Log de creación exitosa
   - Log detallado de errores con stack trace

2. **Conversión de tipos**:
   ```typescript
   latitude: parseFloat(data.latitude),
   longitude: parseFloat(data.longitude),
   ```

3. **Valores por defecto para campos opcionales**:
   ```typescript
   description: data.description || '',
   phone: data.phone || '',
   email: data.email || '',
   ```

4. **Auto-aprobación**:
   ```typescript
   isApproved: true, // Auto-approve for now
   ```
   - Antes: `isApproved: false` (requería aprobación de admin)
   - Ahora: `isApproved: true` (aprobado automáticamente)

5. **Respuesta de error mejorada**:
   ```typescript
   return NextResponse.json(
     { 
       message: 'Internal server error',
       error: error instanceof Error ? error.message : 'Unknown error'
     },
     { status: 500 }
   )
   ```

### ✅ Mejoras en `EstablishmentSetup.tsx`

1. **Logging en el cliente**:
   - Log antes de enviar request
   - Log del status de respuesta
   - Log de datos recibidos
   - Log de errores

2. **Mejor manejo de errores**:
   ```typescript
   const errorMsg = data.error 
     ? `${data.message}: ${data.error}` 
     : data.message || 'Failed to create establishment'
   ```

## Cómo Debuggear

### Paso 1: Verificar Logs del Servidor
Cuando intentes crear un restaurante, busca en la consola del servidor:

```
🏪 [Setup] Starting establishment setup...
👤 [Setup] User: [ID] Role: [ROLE]
📝 [Setup] Received data: { name, category, address }
💾 [Setup] Creating establishment...
✅ [Setup] Establishment created: [ID]
```

### Paso 2: Verificar Logs del Cliente
En la consola del navegador:

```
🚀 Sending establishment setup request...
📡 Response status: [STATUS]
📦 Response data: [DATA]
```

### Paso 3: Errores Comunes

#### Error 401 - Unauthorized
```
❌ [Setup] Unauthorized - no session
```
**Solución**: El usuario no está autenticado. Hacer login primero.

#### Error 403 - Access Denied
```
❌ [Setup] Access denied - wrong role: CUSTOMER
```
**Solución**: El usuario no tiene rol `ESTABLISHMENT`. Debe registrarse como restaurante.

#### Error 400 - Establishment Already Exists
```
⚠️ [Setup] Establishment already exists for user
```
**Solución**: El usuario ya tiene un restaurante creado. No puede crear otro.

#### Error 500 - Internal Server Error
```
❌ [Setup] Error setting up establishment: [ERROR MESSAGE]
Error details: [DETAILS]
Stack: [STACK TRACE]
```
**Solución**: Ver el mensaje de error específico en los logs.

## Verificación en Base de Datos

### Verificar usuario tiene rol correcto:
```sql
SELECT id, email, role FROM "User" WHERE email = 'tu-email@example.com';
```

### Verificar si ya existe establecimiento:
```sql
SELECT * FROM "Establishment" WHERE "userId" = 'USER_ID';
```

### Crear establecimiento manualmente (si es necesario):
```sql
INSERT INTO "Establishment" (
  id, name, description, address, latitude, longitude, 
  phone, email, category, "isActive", "isApproved", 
  "userId", "createdAt", "updatedAt"
) VALUES (
  gen_random_uuid(), 
  'Mi Restaurante', 
  'Descripción', 
  'Dirección completa',
  4.711, 
  -74.0721,
  '+57 321 123 4567',
  'contacto@restaurante.com',
  'RESTAURANT',
  true,
  true,
  'USER_ID_AQUI',
  NOW(),
  NOW()
);
```

## Próximos Pasos

1. **Intentar crear restaurante** y revisar logs
2. **Copiar el error exacto** de la consola del servidor
3. **Verificar en la base de datos** el estado del usuario
4. **Compartir los logs** para análisis más detallado

## Notas Adicionales

- El campo `isApproved` ahora está en `true` por defecto para evitar el flujo de aprobación
- Los campos opcionales ahora tienen valores por defecto (`''`) para evitar errores de NULL
- Los números de coordenadas se parsean explícitamente a Float
- Todos los errores ahora incluyen el mensaje específico del error
