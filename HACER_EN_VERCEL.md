# ⚡ QUÉ HACER EN VERCEL (5 minutos)

## 🎯 Paso 1: Ir a Vercel
https://vercel.com/dashboard

Selecciona tu proyecto: **proyecto-TugoTugo**

---

## 📧 Paso 2: Agregar Variables de Email

Click en: **Settings** → **Environment Variables** → **Add New**

Copia y pega estas 5 variables (una por una):

```
Nombre: EMAIL_SERVER_HOST
Valor: smtp.gmail.com
Environments: ✓ Production ✓ Preview ✓ Development
```

```
Nombre: EMAIL_SERVER_PORT
Valor: 587
Environments: ✓ Production ✓ Preview ✓ Development
```

```
Nombre: EMAIL_SERVER_USER
Valor: [TU-EMAIL@gmail.com]
Environments: ✓ Production ✓ Preview ✓ Development
```

```
Nombre: EMAIL_SERVER_PASSWORD
Valor: [CONTRASEÑA DE APP - ver abajo cómo obtenerla]
Environments: ✓ Production ✓ Preview ✓ Development
```

```
Nombre: EMAIL_FROM
Valor: noreply@tugotugo.com
Environments: ✓ Production ✓ Preview ✓ Development
```

---

## 🔐 Obtener Contraseña de App de Gmail

1. Ir a: https://myaccount.google.com/apppasswords
2. Si pide activar verificación en 2 pasos, hacerlo
3. Nombre de la app: "TugoTugo Vercel"
4. Click en "Crear"
5. Copiar la contraseña de 16 caracteres
6. Pegarla en `EMAIL_SERVER_PASSWORD` en Vercel

---

## 🔧 Paso 3: Actualizar Build Command

Click en: **Settings** → **General** → **Build & Development Settings**

En **Build Command**, cambiar de:
```
prisma generate && next build
```

A:
```
npx prisma generate && npx prisma migrate deploy && npm run build
```

Click en **Save**

---

## 🚀 Paso 4: Hacer Redeploy

1. Click en pestaña **Deployments**
2. Click en el deployment más reciente
3. Click en los **3 puntos** (⋮) arriba a la derecha
4. Click en **Redeploy**
5. Seleccionar **Use existing Build Cache**
6. Click en **Redeploy**

Esperar 2-3 minutos...

---

## ✅ Paso 5: Verificar

Una vez que el deploy termine (status: Ready):

1. Ir a: `https://tu-dominio.vercel.app/admin`
2. Iniciar sesión con tu cuenta ADMIN
3. Probar:
   - ✅ Crear restaurante (pestaña Restaurantes → botón verde)
   - ✅ Exportar CSV (pestaña Reportes → botones de exportación)
   - ✅ Ver reportes (pestaña Reportes → diferentes sub-pestañas)
   - ✅ Ver auditoría (pestaña Auditoría)

---

## 🎉 ¡LISTO!

Después de estos 5 pasos, todas las funcionalidades estarán activas en producción:

✅ Creación de restaurantes, posts y packs  
✅ Exportación de datos a CSV/Excel  
✅ Gráficas y reportes avanzados  
✅ Notificaciones por email  
✅ Logs de auditoría  

---

## 🐛 Si Algo Falla

**Build falla:**
- Revisar logs en Vercel Deployments
- Verificar que el Build Command esté correcto

**No puedes acceder a /admin:**
- Verificar que tu usuario tenga rol 'ADMIN' en la base de datos

**Emails no se envían:**
- Verificar que las variables de email estén correctas
- Verificar que usaste contraseña de app (no la contraseña normal de Gmail)

---

**¿Dudas?** Revisa `VERCEL_DEPLOYMENT.md` para más detalles.
