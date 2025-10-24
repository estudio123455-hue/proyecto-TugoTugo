# 🚨 URGENT: Fix Google OAuth Error 400 - redirect_uri_mismatch

## ❌ Error Actual:
```
Error 400: redirect_uri_mismatch
You can't sign in because TuGood Ugo sent an invalid request
```

## ✅ SOLUCIÓN INMEDIATA (5 minutos):

### **Paso 1: Ir a Google Cloud Console**
1. **Abre:** https://console.cloud.google.com/
2. **Selecciona proyecto:** TuGood Ugo
3. **Ve a:** APIs & Services → Credentials

### **Paso 2: Encontrar OAuth 2.0 Client ID**
1. **Busca:** "OAuth 2.0 Client IDs" 
2. **Haz clic** en el nombre de tu client (probablemente "Web client" o similar)
3. **Haz clic en el ícono de editar** (lápiz)

### **Paso 3: AGREGAR ESTAS URIs EXACTAS**

En **"Authorized redirect URIs"** agrega **EXACTAMENTE** estas URLs:

```
https://app-rho-sandy.vercel.app/api/auth/callback/google
```

**¡IMPORTANTE!** Esta es la URI que NextAuth usa por defecto para Google.

### **Paso 4: Verificar Variables de Entorno en Vercel**

Ve a tu proyecto en Vercel → Settings → Environment Variables:

```bash
GOOGLE_CLIENT_ID=tu_client_id_de_google
GOOGLE_CLIENT_SECRET=tu_client_secret_de_google
NEXTAUTH_URL=https://app-rho-sandy.vercel.app
NEXTAUTH_SECRET=cualquier_string_aleatorio_largo
```

### **Paso 5: Guardar y Esperar**
1. **Guarda** los cambios en Google Cloud Console
2. **Espera 2-3 minutos** para que se propague
3. **Prueba** el login con Google

## 🎯 **URI Correcta para NextAuth:**

NextAuth.js usa automáticamente esta estructura:
```
https://tu-dominio.com/api/auth/callback/[provider]
```

Para Google:
```
https://app-rho-sandy.vercel.app/api/auth/callback/google
```

## 🔍 **Cómo Verificar que Funciona:**

1. **Ve a tu app:** https://app-rho-sandy.vercel.app/auth
2. **Haz clic:** "Continuar con Google"
3. **Debe funcionar** sin error 400
4. **Redirección automática** a la página principal

## 🚀 **Resultado Esperado:**

```
Usuario → "Continuar con Google" → Google Auth → Página Principal ✅
```

En lugar de:
```
Usuario → "Continuar con Google" → Error 400 ❌
```

## ⚡ **ACCIÓN INMEDIATA:**

**¡Solo agrega esta URI en Google Cloud Console:**
```
https://app-rho-sandy.vercel.app/api/auth/callback/google
```

¡Y el problema se solucionará inmediatamente! 🎉
