# 🚀 Despliegue en Vercel - Nuevas Funcionalidades Admin

## ✅ Cambios Ya Realizados

- ✅ Código commiteado y pusheado a GitHub
- ✅ Errores de ESLint corregidos
- ✅ Vercel detectará automáticamente los cambios

---

## 🔧 Configuración Requerida en Vercel

### 1️⃣ Agregar Variables de Entorno

Ve a tu proyecto en Vercel:
**https://vercel.com/dashboard** → Tu Proyecto → **Settings** → **Environment Variables**

Agrega estas **5 variables nuevas**:

```
EMAIL_SERVER_HOST = smtp.gmail.com
EMAIL_SERVER_PORT = 587
EMAIL_SERVER_USER = tu-email@gmail.com
EMAIL_SERVER_PASSWORD = tu-contraseña-de-app-gmail
EMAIL_FROM = noreply@tugotugo.com
```

**Importante**: Aplica a **Production**, **Preview** y **Development**

---

### 2️⃣ Actualizar Build Command

Ve a: **Settings** → **General** → **Build & Development Settings**

**Build Command actual:**
```bash
prisma generate && next build
```

**Cambiar a:**
```bash
npx prisma generate && npx prisma migrate deploy && npm run build
```

Esto ejecutará automáticamente la migración de la tabla `AuditLog` en producción.

---

### 3️⃣ Forzar Redeploy

Después de configurar las variables y el build command:

**Opción A: Desde Dashboard**
1. Ve a **Deployments**
2. Click en el último deployment
3. Click en los **3 puntos** (⋮)
4. Click en **Redeploy**
5. Selecciona **Use existing Build Cache** (más rápido)

**Opción B: Desde Terminal**
```bash
vercel --prod
```

---

## 📋 Checklist de Verificación

Antes de hacer redeploy, verifica:

- [ ] Variables de email agregadas en Vercel
- [ ] Build command actualizado con `prisma migrate deploy`
- [ ] Variable `DATABASE_URL` apunta a base de datos de producción
- [ ] Variable `NEXTAUTH_URL` tiene la URL correcta de producción

---

## 🔍 Verificar el Deploy

Una vez que Vercel termine el deploy:

### 1. Revisar Logs de Build
En Vercel Dashboard → Deployments → Click en el deployment → Ver logs

**Busca estas líneas:**
```
✔ Generated Prisma Client
✔ Migrations applied successfully
✔ Build completed
```

### 2. Probar el Admin Panel
```
https://tu-dominio.vercel.app/admin
```

### 3. Probar Funcionalidades
- ✅ Crear restaurante
- ✅ Crear post
- ✅ Crear pack
- ✅ Exportar CSV
- ✅ Ver reportes
- ✅ Ver auditoría

---

## 🐛 Solución de Problemas

### Error: "Table AuditLog doesn't exist"

**Causa**: La migración no se ejecutó en producción

**Solución**: Ejecutar migración manualmente
```bash
# Conectar a base de datos de producción
DATABASE_URL="tu-url-de-produccion" npx prisma migrate deploy
```

### Error: "Cannot send email"

**Causa**: Variables de email no configuradas o incorrectas

**Solución**:
1. Verificar variables en Vercel Settings
2. Para Gmail: usar contraseña de aplicación (no la contraseña normal)
3. Verificar que el puerto sea 587

### Error: "Unauthorized" en /admin

**Causa**: Usuario no tiene rol ADMIN

**Solución**: Actualizar rol en base de datos
```sql
UPDATE "User" 
SET role = 'ADMIN' 
WHERE email = 'tu-email@gmail.com';
```

### Build falla en Vercel

**Causa**: Errores de TypeScript o ESLint

**Solución**: 
1. Revisar logs en Vercel
2. Ejecutar localmente: `npm run build`
3. Corregir errores
4. Commit y push

---

## 📊 Variables de Entorno Completas para Vercel

Asegúrate de tener TODAS estas variables:

```env
# Database
DATABASE_URL=postgresql://...

# NextAuth
NEXTAUTH_URL=https://tu-dominio.vercel.app
NEXTAUTH_SECRET=tu-secret-key-seguro

# Email (NUEVAS)
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=tu-email@gmail.com
EMAIL_SERVER_PASSWORD=tu-app-password
EMAIL_FROM=noreply@tugotugo.com

# OAuth (si los usas)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# Stripe (si lo usas)
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## 🎯 Resumen de Pasos

1. ✅ **Código pusheado** - Ya hecho
2. ⏳ **Agregar variables de email en Vercel** - Hazlo ahora
3. ⏳ **Actualizar Build Command** - Hazlo ahora
4. ⏳ **Hacer Redeploy** - Vercel lo hará automático o forzarlo
5. ⏳ **Verificar funcionalidades** - Después del deploy

---

## 🚀 Próximo Deploy Automático

Vercel ya detectó tu push y está haciendo el deploy. Puedes ver el progreso en:

**https://vercel.com/dashboard** → Tu Proyecto → **Deployments**

El deploy actual debería:
- ✅ Generar cliente Prisma
- ⚠️ Fallar si no tienes `prisma migrate deploy` en build command
- ✅ Compilar sin errores de ESLint (ya corregidos)

---

## 💡 Tip: Configuración Óptima

Para evitar problemas futuros, usa este build command:

```bash
npx prisma generate && npx prisma migrate deploy && npm run build
```

Esto garantiza que:
1. El cliente Prisma se genera
2. Las migraciones se aplican
3. El build se ejecuta correctamente

---

## 📞 Siguiente Paso

**Ve a Vercel Dashboard ahora y:**
1. Agrega las 5 variables de email
2. Actualiza el Build Command
3. Espera que termine el deploy actual o haz Redeploy

Una vez hecho esto, ¡todas las funcionalidades estarán disponibles en producción! 🎉
