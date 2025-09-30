# 🔧 VERIFICACIÓN DE VARIABLES DE ENTORNO EN VERCEL

## ✅ Variables OBLIGATORIAS en Vercel:

### 1. **NEXTAUTH_URL** (CRÍTICO)
```
NEXTAUTH_URL=https://app-rho-sandy.vercel.app
```

### 2. **NEXTAUTH_SECRET** (CRÍTICO)
```
NEXTAUTH_SECRET=tu-secret-super-largo-y-seguro-minimo-32-caracteres
```

### 3. **GOOGLE_CLIENT_ID** (CRÍTICO)
```
GOOGLE_CLIENT_ID=tu-google-client-id.apps.googleusercontent.com
```

### 4. **GOOGLE_CLIENT_SECRET** (CRÍTICO)
```
GOOGLE_CLIENT_SECRET=tu-google-client-secret
```

## 🔍 **CÓMO VERIFICAR EN VERCEL:**

1. **Ve a:** https://vercel.com/dashboard
2. **Selecciona tu proyecto:** app-rho-sandy
3. **Settings → Environment Variables**
4. **Verifica que TODAS las variables estén presentes**

## 🚨 **SI FALTAN VARIABLES:**

1. **Click "Add New"**
2. **Name:** NEXTAUTH_URL
3. **Value:** https://app-rho-sandy.vercel.app
4. **Environment:** Production, Preview, Development
5. **Click "Save"**

## 🔄 **DESPUÉS DE AGREGAR VARIABLES:**

1. **Ve a Deployments**
2. **Click "Redeploy"** en el último deployment
3. **Espera 2-3 minutos**

## ✅ **VERIFICACIÓN FINAL:**

1. **Ve a:** https://app-rho-sandy.vercel.app/auth
2. **Click "Continuar con Google"**
3. **Debe redirigir a Google sin error 400**
4. **Después de autorizar, debe regresar a la home**

## 🎯 **URI DE REDIRECCIÓN EN GOOGLE:**

En Google Cloud Console, asegúrate de tener:
```
https://app-rho-sandy.vercel.app/api/auth/callback/google
```
