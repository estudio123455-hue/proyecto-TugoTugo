# Guía de Nuevas Funcionalidades del Panel de Administración

## 🎉 Funcionalidades Implementadas

### 1. **Creación de Recursos desde el Panel**

#### ✅ Crear Restaurantes
- **Ubicación**: Panel Admin → Pestaña "Restaurantes" → Botón "Crear Restaurante"
- **Características**:
  - Formulario completo con todos los campos necesarios
  - Crea automáticamente un usuario asociado si no existe
  - Aprobación automática al crear desde admin
  - Validación de campos requeridos

#### ✅ Crear Posts
- **Ubicación**: Panel Admin → Pestaña "Posts" → Botón "Crear Post"
- **Características**:
  - Selección de restaurante existente
  - Campos: título, contenido, precio (opcional)
  - Soporte para imágenes

#### ✅ Crear Packs
- **Ubicación**: Panel Admin → Pestaña "Packs" → Botón "Crear Pack"
- **Características**:
  - Formulario completo con precios, cantidades y horarios
  - Validación de fechas y horarios de disponibilidad
  - Asociación con restaurantes existentes

---

### 2. **Exportación de Datos a CSV**

#### 📊 Tipos de Exportación Disponibles
- **Ubicación**: Panel Admin → Pestaña "Reportes" → Sección "Exportar Datos"

**Exportaciones disponibles**:
1. **Usuarios** (`/api/admin/export?type=users`)
   - ID, Nombre, Email, Rol, Verificado, Fecha Creación

2. **Restaurantes** (`/api/admin/export?type=establishments`)
   - ID, Nombre, Categoría, Dirección, Email, Teléfono, Estado, Usuario

3. **Posts** (`/api/admin/export?type=posts`)
   - ID, Título, Restaurante, Precio, Activo, Likes, Vistas

4. **Packs** (`/api/admin/export?type=packs`)
   - ID, Título, Restaurante, Precios, Cantidad, Órdenes, Disponibilidad

5. **Órdenes** (`/api/admin/export?type=orders`)
   - ID, Pack, Restaurante, Usuario, Cantidad, Total, Estado, Fecha

**Uso**: Click en el botón correspondiente para descargar el archivo CSV

---

### 3. **Reportes y Gráficas Avanzadas**

#### 📈 Tipos de Reportes

**1. Resumen General** (`/api/admin/reports?type=overview`)
- Métricas totales del sistema
- Usuarios por rol
- Órdenes por estado
- Ingresos totales

**2. Reporte de Ingresos** (`/api/admin/reports?type=revenue`)
- Ingresos por día (últimos 30 días)
- Total de ingresos del período
- Gráfica de tendencias

**3. Reporte de Crecimiento** (`/api/admin/reports?type=growth`)
- Nuevos usuarios por día
- Nuevos restaurantes por día
- Análisis de crecimiento (30 días)

**4. Elementos Populares** (`/api/admin/reports?type=popular`)
- Top 10 packs más vendidos
- Top 10 restaurantes más activos
- Métricas de engagement

**5. Impacto Ambiental** (`/api/admin/reports?type=waste-saved`)
- Comidas salvadas del desperdicio
- Kilogramos de comida salvada
- Ahorro económico total
- CO₂ evitado (estimación)

---

### 4. **Sistema de Notificaciones por Email**

#### 📧 Endpoint: `/api/admin/notify`

**Tipos de Notificaciones**:

1. **Restaurante Aprobado**
   ```json
   {
     "type": "establishment-approved",
     "recipientId": "establishment_id"
   }
   ```

2. **Restaurante Rechazado**
   ```json
   {
     "type": "establishment-rejected",
     "recipientId": "establishment_id",
     "data": {
       "reason": "Motivo del rechazo"
     }
   }
   ```

3. **Bienvenida a Usuario**
   ```json
   {
     "type": "welcome-user",
     "recipientId": "user_id"
   }
   ```

4. **Email Personalizado**
   ```json
   {
     "type": "custom",
     "data": {
       "email": "destinatario@email.com",
       "subject": "Asunto del email",
       "html": "<p>Contenido HTML</p>"
     }
   }
   ```

**Plantillas Incluidas**:
- ✅ Aprobación de restaurante
- ✅ Rechazo de restaurante
- ✅ Nueva orden recibida
- ✅ Bienvenida a nuevos usuarios

---

### 5. **Logs de Auditoría**

#### 🔍 Sistema Completo de Auditoría

**Ubicación**: Panel Admin → Pestaña "Auditoría"

**Información Registrada**:
- ✅ Acción realizada (CREATE, UPDATE, DELETE, APPROVE, REJECT)
- ✅ Tipo de entidad afectada
- ✅ ID de la entidad
- ✅ Usuario que realizó la acción
- ✅ Cambios realizados (JSON)
- ✅ Metadata adicional
- ✅ Fecha y hora
- ✅ IP y User Agent (opcional)

**Filtros Disponibles**:
- Por tipo de entidad (Usuario, Restaurante, Post, Pack, Orden)
- Por tipo de acción
- Por usuario
- Por rango de fechas

**Endpoint API**: `/api/admin/audit-logs`

**Ejemplo de consulta**:
```
GET /api/admin/audit-logs?entityType=ESTABLISHMENT&limit=50
```

---

## 🔧 Configuración Requerida

### 1. Variables de Entorno para Email

Agregar al archivo `.env`:

```env
# Email Configuration
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=tu-email@gmail.com
EMAIL_SERVER_PASSWORD=tu-contraseña-de-aplicacion
EMAIL_FROM=noreply@tugotugo.com
```

### 2. Migración de Base de Datos

**Ejecutar la migración para crear la tabla AuditLog**:

```bash
# Opción 1: Usando Prisma
npx prisma migrate dev --name add_audit_log

# Opción 2: Ejecutar SQL directamente
psql -U tu_usuario -d tu_base_de_datos -f prisma/migrations/add_audit_log.sql

# Opción 3: Generar cliente Prisma
npx prisma generate
```

---

## 📋 Endpoints API Creados

### Gestión de Recursos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/admin/establishments` | Crear restaurante |
| POST | `/api/admin/posts` | Crear post |
| POST | `/api/admin/packs` | Crear pack |

### Exportación

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/admin/export?type={type}` | Exportar datos a CSV |

### Reportes

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/admin/reports?type={type}` | Obtener reportes |

### Notificaciones

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/admin/notify` | Enviar notificación por email |

### Auditoría

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/admin/audit-logs` | Obtener logs de auditoría |

---

## 🎨 Componentes UI Creados

### Modales de Creación
- `CreateEstablishmentModal.tsx` - Crear restaurantes
- `CreatePostModal.tsx` - Crear posts
- `CreatePackModal.tsx` - Crear packs

### Pestañas de Reportes
- `ReportsTab.tsx` - Reportes y exportaciones
- `AuditLogsTab.tsx` - Logs de auditoría

---

## 🚀 Próximos Pasos

1. **Ejecutar la migración de base de datos**:
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

2. **Configurar variables de entorno para email**

3. **Reiniciar el servidor de desarrollo**:
   ```bash
   npm run dev
   ```

4. **Acceder al panel de admin**:
   - URL: `http://localhost:3000/admin`
   - Requiere usuario con rol `ADMIN`

---

## 📝 Notas Importantes

- ⚠️ Los logs de auditoría requieren que la tabla `AuditLog` exista en la base de datos
- ⚠️ Las notificaciones por email requieren configuración SMTP válida
- ⚠️ Los TypeScript errors sobre `auditLog` se resolverán después de ejecutar `npx prisma generate`
- ✅ Todas las acciones administrativas se registran automáticamente en los logs
- ✅ Los CSV se generan en formato UTF-8 compatible con Excel

---

## 🐛 Solución de Problemas

### Error: "Property 'auditLog' does not exist"
**Solución**: Ejecutar `npx prisma generate` después de actualizar el schema

### Error al enviar emails
**Solución**: Verificar configuración SMTP y credenciales en `.env`

### CSV no se descarga
**Solución**: Verificar que el usuario tenga rol ADMIN y la sesión esté activa

---

## 📚 Recursos Adicionales

- **Prisma Docs**: https://www.prisma.io/docs
- **Nodemailer Docs**: https://nodemailer.com/
- **Next.js API Routes**: https://nextjs.org/docs/api-routes/introduction
