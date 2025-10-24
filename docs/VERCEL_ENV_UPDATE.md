# 🔧 Actualizar Variables de Entorno en Vercel

## ⚠️ IMPORTANTE: Debes agregar estas variables en Vercel

Para que la aplicación funcione correctamente en producción, necesitas agregar estas variables de entorno en Vercel:

### Pasos:

1. Ve a tu proyecto en Vercel: https://vercel.com/dashboard
2. Selecciona tu proyecto `app-rho-sandy`
3. Ve a **Settings** → **Environment Variables**
4. Agrega las siguientes variables:

### Variables a agregar:

```
NEXTAUTH_URL
https://app-rho-sandy.vercel.app
```

```
NEXTAUTH_SECRET
kWUxQuqJx0uZrXdgr5wN8w92tyY96c25BIM2/MvR0wI=
```

### Después de agregar las variables:

1. Ve a la pestaña **Deployments**
2. Haz clic en los tres puntos (...) del último deployment
3. Selecciona **Redeploy**
4. Marca la opción **Use existing Build Cache** (opcional)
5. Haz clic en **Redeploy**

Esto aplicará las nuevas variables de entorno y solucionará el error "Invalid raw ECDSA P-256 public key".

---

## ✅ Variables actuales en .env.local (local)

El archivo `.env.local` ya ha sido actualizado con:
- ✅ DATABASE_URL
- ✅ NEXTAUTH_URL
- ✅ NEXTAUTH_SECRET

Ahora solo falta actualizar Vercel.
