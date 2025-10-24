# ⚡ CONFIGURAR VERCEL AHORA (2 minutos)

## 🎯 Ya tienes la contraseña de Gmail - Solo copia y pega

---

## 📧 PASO 1: Agregar Variables en Vercel (2 minutos)

Ve a: **https://vercel.com/dashboard** → Tu Proyecto → **Settings** → **Environment Variables**

### Copiar y pegar estas 5 variables:

**Variable 1:**
```
Name: EMAIL_SERVER_HOST
Value: smtp.gmail.com
```
✓ Production ✓ Preview ✓ Development → **Save**

**Variable 2:**
```
Name: EMAIL_SERVER_PORT
Value: 587
```
✓ Production ✓ Preview ✓ Development → **Save**

**Variable 3:**
```
Name: EMAIL_SERVER_USER
Value: [TU EMAIL DE GMAIL]
```
✓ Production ✓ Preview ✓ Development → **Save**

**Variable 4:**
```
Name: EMAIL_SERVER_PASSWORD
Value: [TU CONTRASEÑA DE APP QUE YA TIENES]
```
✓ Production ✓ Preview ✓ Development → **Save**

**Variable 5:**
```
Name: EMAIL_FROM
Value: noreply@tugotugo.com
```
✓ Production ✓ Preview ✓ Development → **Save**

---

## 🔧 PASO 2: Actualizar Build Command (30 segundos)

Ve a: **Settings** → **General** → **Build & Development Settings**

Click en **Edit** en "Build Command"

Cambiar a:
```bash
npx prisma generate && npx prisma migrate deploy && npm run build
```

Click en **Save**

---

## 🚀 PASO 3: Redeploy (1 click)

Ve a: **Deployments** → Click en el último → **⋮** (tres puntos) → **Redeploy**

Esperar 2-3 minutos...

---

## ✅ PASO 4: Verificar

Una vez que diga "Ready":

Ir a: `https://tu-dominio.vercel.app/admin`

Probar:
- ✅ Pestaña "Restaurantes" → Botón "Crear Restaurante"
- ✅ Pestaña "Reportes" → Botones de exportación CSV
- ✅ Pestaña "Reportes" → Ver gráficas
- ✅ Pestaña "Auditoría" → Ver logs

---

## 🎉 ¡LISTO!

Después de estos 4 pasos, tendrás:

✅ Creación de restaurantes, posts y packs  
✅ Exportación de datos a CSV/Excel  
✅ Gráficas y reportes avanzados  
✅ Notificaciones por email  
✅ Logs de auditoría  

**Todo funcionando en producción** 🚀

---

## 📝 Resumen Ultra Rápido

1. Vercel → Settings → Environment Variables → Agregar 5 variables de email
2. Settings → Build Command → Cambiar a incluir `prisma migrate deploy`
3. Deployments → Redeploy
4. Esperar y probar en /admin

**Tiempo total: ~5 minutos**
