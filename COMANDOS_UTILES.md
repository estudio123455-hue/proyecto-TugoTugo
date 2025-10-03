# 🛠️ Comandos Útiles - Panel de Administración

## 🚀 Configuración Inicial

```bash
# 1. Generar cliente Prisma (IMPORTANTE - ejecutar primero)
npx prisma generate

# 2. Ejecutar migración para crear tabla AuditLog
npx prisma migrate dev --name add_audit_log

# 3. Verificar que la tabla se creó
npx prisma studio
# Buscar "AuditLog" en la lista de tablas

# 4. Iniciar servidor de desarrollo
npm run dev
```

---

## 📊 Probar Endpoints con curl

### Crear Restaurante
```bash
curl -X POST http://localhost:3000/api/admin/establishments \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=TU_TOKEN" \
  -d '{
    "name": "Restaurante Demo",
    "email": "demo@restaurant.com",
    "address": "Calle 123",
    "latitude": 4.6097,
    "longitude": -74.0817,
    "category": "RESTAURANT",
    "phone": "1234567890",
    "description": "Restaurante de prueba"
  }'
```

### Crear Post
```bash
curl -X POST http://localhost:3000/api/admin/posts \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=TU_TOKEN" \
  -d '{
    "title": "Post Demo",
    "content": "Contenido del post de prueba",
    "establishmentId": "ID_DEL_RESTAURANTE",
    "price": 15000
  }'
```

### Crear Pack
```bash
curl -X POST http://localhost:3000/api/admin/packs \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=TU_TOKEN" \
  -d '{
    "title": "Pack Demo",
    "description": "Pack de prueba",
    "originalPrice": 20000,
    "discountedPrice": 10000,
    "quantity": 10,
    "availableFrom": "2025-10-04T08:00:00Z",
    "availableUntil": "2025-10-04T20:00:00Z",
    "pickupTimeStart": "18:00",
    "pickupTimeEnd": "20:00",
    "establishmentId": "ID_DEL_RESTAURANTE"
  }'
```

### Exportar Datos
```bash
# Exportar usuarios
curl http://localhost:3000/api/admin/export?type=users \
  -H "Cookie: next-auth.session-token=TU_TOKEN" \
  -o usuarios.csv

# Exportar restaurantes
curl http://localhost:3000/api/admin/export?type=establishments \
  -H "Cookie: next-auth.session-token=TU_TOKEN" \
  -o restaurantes.csv

# Exportar posts
curl http://localhost:3000/api/admin/export?type=posts \
  -H "Cookie: next-auth.session-token=TU_TOKEN" \
  -o posts.csv

# Exportar packs
curl http://localhost:3000/api/admin/export?type=packs \
  -H "Cookie: next-auth.session-token=TU_TOKEN" \
  -o packs.csv

# Exportar órdenes
curl http://localhost:3000/api/admin/export?type=orders \
  -H "Cookie: next-auth.session-token=TU_TOKEN" \
  -o ordenes.csv
```

### Obtener Reportes
```bash
# Resumen general
curl http://localhost:3000/api/admin/reports?type=overview \
  -H "Cookie: next-auth.session-token=TU_TOKEN"

# Ingresos
curl http://localhost:3000/api/admin/reports?type=revenue \
  -H "Cookie: next-auth.session-token=TU_TOKEN"

# Crecimiento
curl http://localhost:3000/api/admin/reports?type=growth \
  -H "Cookie: next-auth.session-token=TU_TOKEN"

# Populares
curl http://localhost:3000/api/admin/reports?type=popular \
  -H "Cookie: next-auth.session-token=TU_TOKEN"

# Impacto ambiental
curl http://localhost:3000/api/admin/reports?type=waste-saved \
  -H "Cookie: next-auth.session-token=TU_TOKEN"
```

### Enviar Notificación
```bash
# Aprobar restaurante
curl -X POST http://localhost:3000/api/admin/notify \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=TU_TOKEN" \
  -d '{
    "type": "establishment-approved",
    "recipientId": "ID_DEL_RESTAURANTE"
  }'

# Email personalizado
curl -X POST http://localhost:3000/api/admin/notify \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=TU_TOKEN" \
  -d '{
    "type": "custom",
    "data": {
      "email": "destinatario@email.com",
      "subject": "Asunto del email",
      "html": "<h1>Hola</h1><p>Contenido del email</p>"
    }
  }'
```

### Obtener Logs de Auditoría
```bash
# Todos los logs
curl http://localhost:3000/api/admin/audit-logs \
  -H "Cookie: next-auth.session-token=TU_TOKEN"

# Filtrar por tipo de entidad
curl "http://localhost:3000/api/admin/audit-logs?entityType=ESTABLISHMENT" \
  -H "Cookie: next-auth.session-token=TU_TOKEN"

# Con paginación
curl "http://localhost:3000/api/admin/audit-logs?limit=50&offset=0" \
  -H "Cookie: next-auth.session-token=TU_TOKEN"
```

---

## 🗄️ Comandos de Base de Datos

```bash
# Ver estructura de la base de datos
npx prisma studio

# Resetear base de datos (¡CUIDADO! Borra todos los datos)
npx prisma migrate reset

# Crear nueva migración
npx prisma migrate dev --name nombre_de_migracion

# Aplicar migraciones pendientes
npx prisma migrate deploy

# Ver estado de migraciones
npx prisma migrate status

# Formatear schema.prisma
npx prisma format
```

---

## 🧪 Comandos de Testing

```bash
# Ejecutar tests
npm test

# Ejecutar tests en modo watch
npm test -- --watch

# Verificar tipos TypeScript
npm run type-check

# Linter
npm run lint

# Fix linter
npm run lint -- --fix
```

---

## 📦 Comandos de Build

```bash
# Build para producción
npm run build

# Iniciar en producción
npm start

# Analizar bundle
npm run build -- --analyze
```

---

## 🔍 Debugging

```bash
# Ver logs de Prisma
DEBUG=prisma:* npm run dev

# Ver logs de Next.js
DEBUG=* npm run dev

# Verificar variables de entorno
node -e "console.log(process.env)"
```

---

## 📧 Configurar Email (Gmail)

```bash
# 1. Ir a Google Account
# https://myaccount.google.com/

# 2. Seguridad → Verificación en 2 pasos → Activar

# 3. Contraseñas de aplicaciones → Generar

# 4. Agregar al .env:
# EMAIL_SERVER_USER=tu-email@gmail.com
# EMAIL_SERVER_PASSWORD=contraseña-generada
```

---

## 🚨 Solución de Problemas

```bash
# Limpiar caché de Next.js
rm -rf .next

# Limpiar node_modules y reinstalar
rm -rf node_modules package-lock.json
npm install

# Regenerar cliente Prisma
npx prisma generate

# Verificar conexión a base de datos
npx prisma db pull

# Ver logs del servidor
npm run dev 2>&1 | tee server.log
```

---

## 📊 Consultas SQL Útiles

```sql
-- Ver todos los logs de auditoría
SELECT * FROM "AuditLog" ORDER BY "createdAt" DESC LIMIT 50;

-- Logs por tipo de acción
SELECT action, COUNT(*) 
FROM "AuditLog" 
GROUP BY action;

-- Logs por usuario
SELECT "userName", COUNT(*) 
FROM "AuditLog" 
GROUP BY "userName" 
ORDER BY COUNT(*) DESC;

-- Logs de hoy
SELECT * FROM "AuditLog" 
WHERE "createdAt" >= CURRENT_DATE 
ORDER BY "createdAt" DESC;

-- Logs de creación de restaurantes
SELECT * FROM "AuditLog" 
WHERE "entityType" = 'ESTABLISHMENT' 
AND action = 'CREATE';
```

---

## 🔐 Crear Usuario Admin

```sql
-- Crear usuario admin directamente en la base de datos
INSERT INTO "User" (id, email, name, password, role, "emailVerified", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid()::text,
  'admin@tugotugo.com',
  'Admin',
  '$2a$10$hash_de_contraseña', -- Usar bcrypt para hashear
  'ADMIN',
  NOW(),
  NOW(),
  NOW()
);
```

```bash
# O usar el script de hash de contraseña
npx tsx scripts/hash-password.ts
```

---

## 📝 Notas Importantes

1. **Siempre ejecutar `npx prisma generate` después de cambios en schema.prisma**
2. **Los tokens de sesión expiran - renovar si los comandos curl fallan**
3. **Usar Prisma Studio para verificar datos: `npx prisma studio`**
4. **Los logs de auditoría se crean automáticamente en todas las operaciones**
5. **Las exportaciones CSV están en formato UTF-8**

---

## 🎯 Flujo de Trabajo Recomendado

```bash
# 1. Desarrollo
npm run dev

# 2. Hacer cambios en código

# 3. Si cambias schema.prisma:
npx prisma generate
npx prisma migrate dev

# 4. Verificar tipos
npm run type-check

# 5. Verificar linter
npm run lint

# 6. Build de prueba
npm run build

# 7. Commit
git add .
git commit -m "feat: descripción del cambio"
git push
```
