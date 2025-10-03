# 🚀 Inicio Rápido - Nuevas Funcionalidades Admin

## ⚡ Configuración en 3 Pasos

### 1️⃣ Ejecutar Script de Configuración

**Windows (PowerShell):**
```powershell
.\scripts\setup-admin-features.ps1
```

**Linux/Mac:**
```bash
chmod +x scripts/setup-admin-features.sh
./scripts/setup-admin-features.sh
```

**Manual:**
```bash
npx prisma generate
npx prisma migrate dev --name add_audit_log
```

---

### 2️⃣ Configurar Variables de Entorno

Agregar al archivo `.env`:

```env
# Email para notificaciones
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=tu-email@gmail.com
EMAIL_SERVER_PASSWORD=tu-contraseña-de-app
EMAIL_FROM=noreply@tugotugo.com
```

**Para Gmail:**
1. Ir a [Cuenta de Google](https://myaccount.google.com/)
2. Seguridad → Verificación en 2 pasos (activar)
3. Contraseñas de aplicaciones → Generar nueva
4. Usar esa contraseña en `EMAIL_SERVER_PASSWORD`

---

### 3️⃣ Iniciar el Servidor

```bash
npm run dev
```

Acceder a: **http://localhost:3000/admin**

---

## 🎯 Funcionalidades Disponibles

### 📝 Crear Recursos
- **Restaurantes**: Admin → Restaurantes → "Crear Restaurante"
- **Posts**: Admin → Posts → "Crear Post"
- **Packs**: Admin → Packs → "Crear Pack"

### 📊 Exportar Datos
- Admin → Reportes → Botones de exportación
- Formatos: CSV (compatible con Excel)
- Tipos: Usuarios, Restaurantes, Posts, Packs, Órdenes

### 📈 Ver Reportes
- Admin → Reportes
  - **Resumen**: Métricas generales
  - **Ingresos**: Gráfica de ingresos por día
  - **Crecimiento**: Nuevos usuarios y restaurantes
  - **Populares**: Top packs y restaurantes
  - **Impacto**: Comida salvada y CO₂ evitado

### 📧 Enviar Notificaciones
```bash
# Ejemplo con curl
curl -X POST http://localhost:3000/api/admin/notify \
  -H "Content-Type: application/json" \
  -d '{
    "type": "establishment-approved",
    "recipientId": "establishment_id"
  }'
```

### 🔍 Ver Logs de Auditoría
- Admin → Auditoría
- Filtrar por tipo de entidad o acción
- Ver detalles de cambios

---

## 🧪 Probar las Funcionalidades

### 1. Crear un Restaurante
```
1. Ir a Admin → Restaurantes
2. Click en "Crear Restaurante"
3. Llenar el formulario
4. Submit
5. Verificar en la tabla
6. Revisar log en Admin → Auditoría
```

### 2. Exportar Datos
```
1. Ir a Admin → Reportes
2. Click en "Usuarios" (o cualquier otro)
3. Se descarga archivo CSV
4. Abrir con Excel
```

### 3. Ver Reportes
```
1. Ir a Admin → Reportes
2. Navegar entre pestañas:
   - Resumen
   - Ingresos
   - Crecimiento
   - Populares
   - Impacto
```

### 4. Revisar Auditoría
```
1. Ir a Admin → Auditoría
2. Filtrar por tipo: ESTABLISHMENT
3. Ver detalles de la creación anterior
```

---

## 🐛 Solución de Problemas

### Error: "Property 'auditLog' does not exist"
```bash
npx prisma generate
```

### Error al enviar emails
1. Verificar credenciales en `.env`
2. Para Gmail: usar contraseña de aplicación
3. Verificar puerto (587 para TLS, 465 para SSL)

### CSV no se descarga
1. Verificar que estás autenticado como ADMIN
2. Abrir consola del navegador para ver errores
3. Verificar que la sesión esté activa

### Migración falla
```bash
# Si la tabla ya existe, es normal
# Verificar en la base de datos:
psql -U usuario -d database -c "\dt AuditLog"

# Si no existe, ejecutar SQL manualmente:
psql -U usuario -d database -f prisma/migrations/add_audit_log.sql
```

---

## 📚 Documentación Completa

- **ADMIN_FEATURES_GUIDE.md** - Guía detallada de todas las funcionalidades
- **IMPLEMENTATION_SUMMARY.md** - Resumen técnico de la implementación
- **env.example** - Ejemplo de variables de entorno

---

## ✅ Checklist de Verificación

- [ ] Migración ejecutada (`npx prisma generate`)
- [ ] Variables de email configuradas en `.env`
- [ ] Servidor iniciado (`npm run dev`)
- [ ] Acceso al panel admin funcionando
- [ ] Creación de restaurante probada
- [ ] Exportación CSV probada
- [ ] Reportes visualizados
- [ ] Logs de auditoría visibles

---

## 🎉 ¡Listo!

Todas las funcionalidades están implementadas y listas para usar:

✅ Creación de restaurantes, posts y packs  
✅ Exportación de datos a CSV/Excel  
✅ Gráficas y reportes avanzados  
✅ Notificaciones por email  
✅ Logs de auditoría  

**¿Necesitas ayuda?** Consulta la documentación completa en `ADMIN_FEATURES_GUIDE.md`
