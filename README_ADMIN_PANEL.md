# 🎯 Panel de Administración Avanzado - TugoTugo

## 📋 Resumen Ejecutivo

Se han implementado **5 funcionalidades principales** para el panel de administración:

1. ✅ **Creación de Recursos** - Restaurantes, Posts y Packs desde el panel
2. ✅ **Exportación de Datos** - CSV/Excel de todos los recursos
3. ✅ **Reportes Avanzados** - Gráficas e insights del negocio
4. ✅ **Notificaciones Email** - Sistema completo con plantillas
5. ✅ **Logs de Auditoría** - Trazabilidad completa de acciones

---

## 🚀 Inicio Rápido (3 pasos)

### 1. Ejecutar Migración
```bash
npx prisma generate
npx prisma migrate dev --name add_audit_log
```

### 2. Configurar Email en `.env`
```env
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=tu-email@gmail.com
EMAIL_SERVER_PASSWORD=tu-app-password
EMAIL_FROM=noreply@tugotugo.com
```

### 3. Iniciar Servidor
```bash
npm run dev
```

**Acceder a**: http://localhost:3000/admin

---

## 📁 Archivos Creados

### APIs (7 nuevos endpoints)
```
src/app/api/admin/
├── establishments/route.ts (modificado - POST agregado)
├── posts/route.ts (modificado - POST agregado)
├── packs/route.ts (modificado - POST agregado)
├── export/route.ts ⭐ NUEVO
├── reports/route.ts ⭐ NUEVO
├── notify/route.ts ⭐ NUEVO
└── audit-logs/route.ts ⭐ NUEVO
```

### Componentes UI (5 nuevos)
```
src/components/admin/
├── CreateEstablishmentModal.tsx ⭐ NUEVO
├── CreatePostModal.tsx ⭐ NUEVO
├── CreatePackModal.tsx ⭐ NUEVO
├── ReportsTab.tsx ⭐ NUEVO
└── AuditLogsTab.tsx ⭐ NUEVO
```

### Utilidades (2 nuevas)
```
src/lib/
├── auditLog.ts ⭐ NUEVO
└── emailService.ts ⭐ NUEVO
```

### Base de Datos
```
prisma/
├── schema.prisma (modelo AuditLog agregado)
└── migrations/
    └── add_audit_log.sql ⭐ NUEVO
```

### Documentación (5 archivos)
```
├── ADMIN_FEATURES_GUIDE.md ⭐ Guía completa
├── IMPLEMENTATION_SUMMARY.md ⭐ Resumen técnico
├── QUICK_START.md ⭐ Inicio rápido
├── COMANDOS_UTILES.md ⭐ Comandos útiles
└── README_ADMIN_PANEL.md ⭐ Este archivo
```

---

## 🎨 Interfaz de Usuario

### Nuevas Pestañas en Admin Panel

```
┌─────────────────────────────────────────────────────┐
│  📊 Resumen │ 👥 Usuarios │ 🏪 Restaurantes │ ...  │
│  📈 Reportes │ 🔍 Auditoría                         │
└─────────────────────────────────────────────────────┘
```

**Pestaña Reportes**:
- Botones de exportación CSV (5 tipos)
- Sub-pestañas: Resumen, Ingresos, Crecimiento, Populares, Impacto
- Gráficas y métricas en tiempo real

**Pestaña Auditoría**:
- Tabla de logs con filtros
- Detalles expandibles de cambios
- Búsqueda por tipo de entidad y acción

**Botones "Crear"**:
- En Restaurantes: Botón verde "Crear Restaurante"
- En Posts: Botón verde "Crear Post"
- En Packs: Botón verde "Crear Pack"

---

## 🔌 Endpoints API

### Creación de Recursos
| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/admin/establishments` | POST | Crear restaurante |
| `/api/admin/posts` | POST | Crear post |
| `/api/admin/packs` | POST | Crear pack |

### Exportación
| Endpoint | Método | Parámetros |
|----------|--------|------------|
| `/api/admin/export` | GET | `?type=users\|establishments\|posts\|packs\|orders` |

### Reportes
| Endpoint | Método | Parámetros |
|----------|--------|------------|
| `/api/admin/reports` | GET | `?type=overview\|revenue\|growth\|popular\|waste-saved` |

### Notificaciones
| Endpoint | Método | Body |
|----------|--------|------|
| `/api/admin/notify` | POST | `{type, recipientId, data}` |

### Auditoría
| Endpoint | Método | Parámetros |
|----------|--------|------------|
| `/api/admin/audit-logs` | GET | `?entityType=&limit=&offset=` |

---

## 📊 Funcionalidades Detalladas

### 1. Creación de Recursos

**Restaurantes**:
- Formulario completo con validación
- Crea usuario automáticamente si no existe
- Aprobación automática desde admin
- Campos: nombre, email, dirección, ubicación, categoría, etc.

**Posts**:
- Selección de restaurante
- Título, contenido, precio opcional
- Soporte para imágenes

**Packs**:
- Precios original y con descuento
- Cantidad disponible
- Fechas y horarios de disponibilidad
- Horarios de recogida

### 2. Exportación de Datos

**Formatos**: CSV (UTF-8, compatible con Excel)

**Tipos disponibles**:
- **Usuarios**: ID, Nombre, Email, Rol, Verificado, Fecha
- **Restaurantes**: Datos completos + usuario asociado
- **Posts**: Título, restaurante, precio, estadísticas
- **Packs**: Precios, cantidad, órdenes, disponibilidad
- **Órdenes**: Pack, usuario, total, estado, fechas

### 3. Reportes Avanzados

**Resumen General**:
- Totales del sistema
- Usuarios por rol
- Órdenes por estado
- Ingresos totales

**Ingresos**:
- Gráfica por día (30 días)
- Total del período
- Tendencias

**Crecimiento**:
- Nuevos usuarios/día
- Nuevos restaurantes/día
- Análisis de 30 días

**Populares**:
- Top 10 packs más vendidos
- Top 10 restaurantes más activos
- Métricas de engagement

**Impacto Ambiental**:
- Comidas salvadas
- Kg de comida salvada
- Ahorro económico
- CO₂ evitado (estimación: 2.5kg CO₂/kg comida)

### 4. Notificaciones por Email

**Plantillas incluidas**:
- ✅ Restaurante aprobado
- ✅ Restaurante rechazado
- ✅ Nueva orden recibida
- ✅ Bienvenida a usuarios
- ✅ Email personalizado

**Características**:
- HTML responsivo
- Integración con Nodemailer
- Configuración SMTP flexible
- Soporte para Gmail, Outlook, etc.

### 5. Logs de Auditoría

**Información registrada**:
- Acción (CREATE, UPDATE, DELETE, APPROVE, REJECT)
- Tipo de entidad (USER, ESTABLISHMENT, POST, PACK, ORDER)
- ID de la entidad
- Usuario que realizó la acción
- Cambios realizados (JSON)
- Metadata adicional
- Timestamp
- IP y User Agent (opcional)

**Características**:
- Registro automático en todas las operaciones
- Filtros por tipo y acción
- Vista detallada de cambios
- Búsqueda y paginación

---

## 🔧 Configuración

### Variables de Entorno Requeridas

```env
# Base de datos
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="tu-secret-key"

# Email (NUEVO)
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="tu-email@gmail.com"
EMAIL_SERVER_PASSWORD="tu-app-password"
EMAIL_FROM="noreply@tugotugo.com"
```

### Configurar Gmail

1. Ir a [Google Account](https://myaccount.google.com/)
2. Seguridad → Verificación en 2 pasos → Activar
3. Contraseñas de aplicaciones → Generar nueva
4. Usar esa contraseña en `EMAIL_SERVER_PASSWORD`

---

## 🧪 Testing

### Probar Creación de Restaurante
```
1. Admin → Restaurantes → "Crear Restaurante"
2. Llenar formulario
3. Submit
4. Verificar en tabla
5. Revisar log en Auditoría
```

### Probar Exportación
```
1. Admin → Reportes
2. Click en "Usuarios"
3. Se descarga CSV
4. Abrir con Excel
```

### Probar Reportes
```
1. Admin → Reportes
2. Navegar entre pestañas
3. Verificar datos y gráficas
```

### Probar Auditoría
```
1. Admin → Auditoría
2. Filtrar por ESTABLISHMENT
3. Ver detalles de cambios
```

---

## 📈 Métricas y KPIs

El sistema ahora puede medir:

- **Operacionales**: Total usuarios, restaurantes, posts, packs, órdenes
- **Financieros**: Ingresos totales, ingresos por día, tendencias
- **Crecimiento**: Nuevos usuarios/día, nuevos restaurantes/día
- **Engagement**: Packs más populares, restaurantes más activos
- **Impacto**: Comidas salvadas, kg salvados, CO₂ evitado, ahorro económico

---

## 🔒 Seguridad

- ✅ Autenticación requerida en todos los endpoints
- ✅ Verificación de rol ADMIN
- ✅ Validación de datos en formularios
- ✅ Logs de auditoría para trazabilidad
- ✅ Sanitización de inputs
- ✅ Protección contra inyección SQL (Prisma)

---

## 🐛 Troubleshooting

### Error: "Property 'auditLog' does not exist"
```bash
npx prisma generate
```

### Error al enviar emails
- Verificar credenciales en `.env`
- Para Gmail: usar contraseña de aplicación
- Verificar puerto (587 para TLS)

### CSV no se descarga
- Verificar autenticación como ADMIN
- Verificar sesión activa
- Revisar consola del navegador

### Migración falla
```bash
# Verificar si tabla existe
npx prisma studio

# Ejecutar SQL manualmente si es necesario
psql -U usuario -d database -f prisma/migrations/add_audit_log.sql
```

---

## 📚 Documentación

| Archivo | Descripción |
|---------|-------------|
| `QUICK_START.md` | Inicio rápido en 3 pasos |
| `ADMIN_FEATURES_GUIDE.md` | Guía completa de funcionalidades |
| `IMPLEMENTATION_SUMMARY.md` | Resumen técnico de implementación |
| `COMANDOS_UTILES.md` | Comandos útiles y ejemplos |
| `README_ADMIN_PANEL.md` | Este archivo |

---

## ✅ Checklist de Implementación

- [x] Modelo AuditLog en schema.prisma
- [x] Migración SQL creada
- [x] Utilidades de auditoría (auditLog.ts)
- [x] Servicio de email (emailService.ts)
- [x] Endpoint de creación de restaurantes
- [x] Endpoint de creación de posts
- [x] Endpoint de creación de packs
- [x] Endpoint de exportación CSV
- [x] Endpoint de reportes
- [x] Endpoint de notificaciones
- [x] Endpoint de logs de auditoría
- [x] Modal de creación de restaurantes
- [x] Modal de creación de posts
- [x] Modal de creación de packs
- [x] Componente de reportes
- [x] Componente de auditoría
- [x] Integración en panel admin
- [x] Documentación completa
- [x] Scripts de configuración
- [x] Variables de entorno actualizadas

---

## 🎉 Resultado Final

### Antes
- Panel admin básico con visualización
- Sin creación de recursos
- Sin exportación de datos
- Sin reportes avanzados
- Sin notificaciones
- Sin auditoría

### Después
- ✅ Creación completa de recursos desde UI
- ✅ Exportación CSV de todos los datos
- ✅ 5 tipos de reportes con gráficas
- ✅ Sistema de notificaciones por email
- ✅ Logs de auditoría completos
- ✅ Trazabilidad total del sistema

---

## 🚀 Próximos Pasos Sugeridos

1. **Inmediato**:
   - Ejecutar migración: `npx prisma generate && npx prisma migrate dev`
   - Configurar email en `.env`
   - Probar funcionalidades

2. **Corto plazo**:
   - Configurar notificaciones automáticas
   - Personalizar plantillas de email
   - Agregar más métricas a reportes

3. **Mediano plazo**:
   - Dashboard en tiempo real con WebSockets
   - Exportación a PDF
   - Gráficas interactivas con Chart.js
   - Notificaciones push

---

## 💡 Tips

- Usa `npx prisma studio` para ver la base de datos visualmente
- Los logs de auditoría se crean automáticamente
- Los CSV están en UTF-8, compatibles con Excel
- Las notificaciones son asíncronas, no bloquean la UI
- Todos los endpoints requieren autenticación ADMIN

---

## 📞 Soporte

Para más información, consulta:
- `ADMIN_FEATURES_GUIDE.md` - Guía detallada
- `COMANDOS_UTILES.md` - Comandos y ejemplos
- `QUICK_START.md` - Inicio rápido

---

**Versión**: 1.0.0  
**Fecha**: Octubre 2025  
**Estado**: ✅ Producción Ready
