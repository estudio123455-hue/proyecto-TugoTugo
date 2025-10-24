# 🚀 Configuración de Producción en Vercel

## 📋 **Variables de Entorno Requeridas**

### **1. 🔐 Seguridad Básica**
```bash
# En Vercel Dashboard > Settings > Environment Variables
NEXTAUTH_URL=https://tu-dominio.vercel.app
NEXTAUTH_SECRET=tu-secreto-super-seguro-minimo-32-caracteres
NODE_ENV=production
VERCEL_ENV=production
```

### **2. 🗄️ Base de Datos**
```bash
# Railway, PlanetScale, Supabase, etc.
DATABASE_URL=postgresql://user:pass@host:port/db?sslmode=require
```

### **3. 🔑 Autenticación OAuth**
```bash
# Google Console > Credentials
GOOGLE_CLIENT_ID=tu-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=tu-client-secret
```

### **4. 💳 Sistemas de Pago**

#### **MercadoPago (Producción)**
```bash
MERCADOPAGO_ACCESS_TOKEN=APP_USR_tu-token-de-produccion
MERCADOPAGO_PUBLIC_KEY=APP_USR_tu-public-key-produccion
MERCADOPAGO_WEBHOOK_SECRET=tu-webhook-secret-seguro
```

#### **Stripe (Producción)**
```bash
STRIPE_PUBLISHABLE_KEY=pk_live_tu-publishable-key
STRIPE_SECRET_KEY=sk_live_tu-secret-key
STRIPE_WEBHOOK_SECRET=whsec_tu-webhook-secret
```

### **5. 📧 Sistema de Email**
```bash
# Gmail, SendGrid, Mailgun, etc.
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-app-password
SMTP_FROM=TugoTugo <noreply@tugotugo.com>
```

### **6. 🔔 Notificaciones Push**
```bash
# Firebase Console > Project Settings > Service Accounts
FIREBASE_PROJECT_ID=tu-proyecto-firebase
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\ntu-private-key\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@tu-proyecto.iam.gserviceaccount.com
```

### **7. 🗺️ Mapas (Opcional)**
```bash
# Google Cloud Console > APIs & Services > Credentials
GOOGLE_MAPS_API_KEY=tu-google-maps-api-key
```

### **8. 📊 Monitoreo (Opcional)**
```bash
# Sentry.io
SENTRY_DSN=https://xxx@sentry.io/xxx
SENTRY_ORG=tu-organizacion
SENTRY_PROJECT=tu-proyecto

# Google Analytics
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
```

## 🛠️ **Pasos para Configurar en Vercel**

### **1. Acceder a Configuración**
1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecciona tu proyecto TugoTugo
3. Ve a **Settings** > **Environment Variables**

### **2. Agregar Variables**
1. Click en **Add New**
2. Ingresa **Name** y **Value**
3. Selecciona **Production** environment
4. Click **Save**

### **3. Variables Críticas Primero**
Configura en este orden de prioridad:
1. `DATABASE_URL`
2. `NEXTAUTH_SECRET`
3. `NEXTAUTH_URL`
4. `MERCADOPAGO_ACCESS_TOKEN`
5. `SMTP_*` variables

### **4. Redeploy**
Después de agregar variables:
1. Ve a **Deployments**
2. Click en **Redeploy** en el último deployment
3. Verifica que no hay errores

## ✅ **Checklist de Verificación**

- [ ] **Base de datos** conectada y migraciones ejecutadas
- [ ] **NextAuth** funcionando con login/logout
- [ ] **MercadoPago** procesando pagos de prueba
- [ ] **Emails** enviándose correctamente
- [ ] **SSL/HTTPS** activo y funcionando
- [ ] **Dominio personalizado** configurado (opcional)

## 🚨 **Seguridad**

### **Secretos Seguros**
- Usa `openssl rand -base64 32` para generar secretos
- Nunca commits secretos al repositorio
- Rota secretos regularmente

### **CORS y CSP**
```javascript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ]
  },
}
```

## 🔧 **Troubleshooting**

### **Error: Database Connection**
- Verifica `DATABASE_URL` format
- Confirma que la DB acepta conexiones SSL
- Revisa firewall/whitelist de IPs

### **Error: NextAuth**
- `NEXTAUTH_URL` debe coincidir exactamente con tu dominio
- `NEXTAUTH_SECRET` mínimo 32 caracteres
- Verifica OAuth redirect URLs

### **Error: Payments**
- Confirma que usas tokens de PRODUCCIÓN
- Verifica webhook endpoints configurados
- Revisa logs de errores en dashboard de pagos

---
*Configuración actualizada: Octubre 2025*
