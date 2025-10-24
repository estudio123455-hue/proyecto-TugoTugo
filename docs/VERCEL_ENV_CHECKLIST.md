# ✅ Checklist de Variables de Entorno - Vercel

## 🎯 **Verificación Rápida**
Visita: `https://tu-app.vercel.app/api/health` para ver el estado de configuración.

## 🔐 **Variables CRÍTICAS (Requeridas)**

### **1. Base de Datos**
```bash
DATABASE_URL=postgresql://user:pass@host:port/db?sslmode=require
```
- [ ] ✅ Configurada en Vercel
- [ ] ✅ Conexión verificada

### **2. Autenticación**
```bash
NEXTAUTH_URL=https://tu-app.vercel.app
NEXTAUTH_SECRET=tu-secreto-super-seguro-32-chars-minimo
```
- [ ] ✅ NEXTAUTH_URL configurada
- [ ] ✅ NEXTAUTH_SECRET configurada (32+ caracteres)

### **3. OAuth Google**
```bash
GOOGLE_CLIENT_ID=tu-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=tu-secret
```
- [ ] ✅ Client ID configurado
- [ ] ✅ Client Secret configurado
- [ ] ✅ Redirect URLs actualizados en Google Console

## 💳 **Variables de PAGO (Críticas)**

### **4. MercadoPago**
```bash
MERCADOPAGO_ACCESS_TOKEN=TEST-o-APP_USR-token
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=TEST-o-APP_USR-public
MERCADOPAGO_WEBHOOK_SECRET=tu-webhook-secret
```
- [ ] ✅ Access Token configurado
- [ ] ✅ Public Key configurado
- [ ] ✅ Webhook Secret configurado

### **5. Stripe (Opcional)**
```bash
STRIPE_PUBLISHABLE_KEY=pk_test_o_pk_live_
STRIPE_SECRET_KEY=sk_test_o_sk_live_
STRIPE_WEBHOOK_SECRET=whsec_
```
- [ ] ✅ Publishable Key configurado
- [ ] ✅ Secret Key configurado
- [ ] ✅ Webhook Secret configurado

## 📧 **Variables de EMAIL (Importantes)**

### **6. SMTP**
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-app-password
SMTP_FROM=TugoTugo <noreply@tugotugo.com>
```
- [ ] ✅ Host configurado
- [ ] ✅ Puerto configurado
- [ ] ✅ Usuario configurado
- [ ] ✅ Contraseña configurada
- [ ] ✅ From configurado

## 🔔 **Variables de NOTIFICACIONES (Opcionales)**

### **7. Firebase**
```bash
FIREBASE_PROJECT_ID=tu-proyecto
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@tu-proyecto.iam.gserviceaccount.com
```
- [ ] ✅ Project ID configurado
- [ ] ✅ Private Key configurado (con \n)
- [ ] ✅ Client Email configurado

## 📊 **Variables de MONITOREO (Recomendadas)**

### **8. Sentry**
```bash
SENTRY_DSN=https://xxx@sentry.io/xxx
SENTRY_ORG=tu-organizacion
SENTRY_PROJECT=tu-proyecto
```
- [ ] ✅ DSN configurado
- [ ] ✅ Organización configurada
- [ ] ✅ Proyecto configurado

### **9. Analytics**
```bash
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
```
- [ ] ✅ Analytics ID configurado

## 🗺️ **Variables de MAPAS (Opcionales)**

### **10. Google Maps**
```bash
GOOGLE_MAPS_API_KEY=tu-api-key
```
- [ ] ✅ API Key configurado
- [ ] ✅ APIs habilitadas (Maps, Places, Geocoding)

## 🛠️ **Cómo Configurar en Vercel**

### **Paso 1: Acceder a Configuración**
1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecciona tu proyecto
3. Ve a **Settings** → **Environment Variables**

### **Paso 2: Agregar Variables**
1. Click **Add New**
2. Ingresa **Name** y **Value**
3. Selecciona **Production** (y Preview si necesitas)
4. Click **Save**

### **Paso 3: Redeploy**
1. Ve a **Deployments**
2. Click **Redeploy** en el último deployment
3. Espera a que complete

## 🔍 **Verificación Post-Configuración**

### **Health Check**
```bash
curl https://tu-app.vercel.app/api/health
```

Debe retornar:
```json
{
  "status": "healthy",
  "services": {
    "database": "connected",
    "auth": "configured",
    "payments": {
      "stripe": "configured",
      "mercadopago": "configured"
    },
    "email": "configured",
    "monitoring": "configured"
  }
}
```

### **Tests Funcionales**
- [ ] ✅ Login con Google funciona
- [ ] ✅ Páginas cargan sin errores
- [ ] ✅ Base de datos responde
- [ ] ✅ Pagos de prueba funcionan
- [ ] ✅ Emails se envían

## 🚨 **Troubleshooting**

### **Error: Database Connection**
- Verifica formato de `DATABASE_URL`
- Confirma que la DB acepta conexiones SSL
- Revisa whitelist de IPs

### **Error: NextAuth**
- `NEXTAUTH_URL` debe ser exactamente tu dominio
- `NEXTAUTH_SECRET` mínimo 32 caracteres
- Verifica redirect URLs en Google Console

### **Error: Payments**
- Confirma tokens de TEST vs PRODUCCIÓN
- Verifica webhooks configurados
- Revisa logs en dashboard de pagos

### **Error: Email**
- Verifica credenciales SMTP
- Confirma que Gmail permite "apps menos seguras"
- Usa contraseña de aplicación, no la personal

---
**🎯 Objetivo: Todos los ✅ marcados = App lista para producción**
