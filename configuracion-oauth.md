# 🔐 Configuración OAuth para Google y GitHub

## 🎯 Variables de entorno que necesitas agregar en Vercel:

### Google OAuth:
```
GOOGLE_CLIENT_ID=tu-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=tu-google-client-secret
```

### GitHub OAuth:
```
GITHUB_CLIENT_ID=tu-github-client-id
GITHUB_CLIENT_SECRET=tu-github-client-secret
```

---

## 📱 PASO 1: Configurar Google OAuth

### 1. Ve a Google Cloud Console:
https://console.cloud.google.com/

### 2. Crear/Seleccionar proyecto:
- Crea un nuevo proyecto o selecciona uno existente
- Nombre sugerido: "FoodSave App"

### 3. Habilitar Google+ API:
- Ve a "APIs & Services" → "Library"
- Busca "Google+ API" 
- Click "Enable"

### 4. Crear credenciales OAuth:
- Ve a "APIs & Services" → "Credentials"
- Click "Create Credentials" → "OAuth 2.0 Client IDs"
- Application type: "Web application"
- Name: "FoodSave Web App"

### 5. Configurar URLs autorizadas:
**Authorized JavaScript origins:**
```
https://app-tu-deployment.vercel.app
```

**Authorized redirect URIs:**
```
https://app-tu-deployment.vercel.app/api/auth/callback/google
```

### 6. Copiar credenciales:
- Client ID (empieza con números.apps.googleusercontent.com)
- Client Secret (cadena aleatoria)

---

## 🐙 PASO 2: Configurar GitHub OAuth

### 1. Ve a GitHub Settings:
https://github.com/settings/developers

### 2. Crear OAuth App:
- Click "New OAuth App"
- Application name: "FoodSave App"
- Homepage URL: `https://app-tu-deployment.vercel.app`
- Authorization callback URL: `https://app-tu-deployment.vercel.app/api/auth/callback/github`

### 3. Copiar credenciales:
- Client ID 
- Client Secret (generar nuevo si es necesario)

---

## ⚙️ PASO 3: Configurar en Vercel

### Ve a Vercel → Settings → Environment Variables y agrega:

```bash
# Google OAuth
GOOGLE_CLIENT_ID=123456789-abcdef.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-tu-google-secret

# GitHub OAuth  
GITHUB_CLIENT_ID=tu-github-client-id
GITHUB_CLIENT_SECRET=tu-github-secret

# Asegurate de que tengas también:
NEXTAUTH_URL=https://app-tu-deployment.vercel.app
NEXTAUTH_SECRET=tu-nextauth-secret
```

---

## 🔄 PASO 4: Redeploy

Después de agregar las variables:
1. Ve a Deployments en Vercel
2. Click "..." → "Redeploy"  
3. Espera 2-3 minutos

---

## 🧪 PASO 5: Probar

Ve a tu app y deberías ver botones de:
- "Continuar con Google" 
- "Continuar con GitHub"

---

## ❗ URLs importantes para tu proyecto:

**Tu app:** https://app-rho-sandy.vercel.app (o la más reciente)

**Callback URLs que necesitas configurar:**
- Google: `https://tu-app.vercel.app/api/auth/callback/google`
- GitHub: `https://tu-app.vercel.app/api/auth/callback/github`
