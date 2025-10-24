# ⚙️ Configuración de Variables de Entorno

## 🔧 Configuración Local (.env.local)

Crea un archivo `.env.local` en la raíz del proyecto con el siguiente contenido:

```env
# Database
DATABASE_URL="tu-url-de-base-de-datos"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="genera-uno-con-openssl-rand-base64-32"

# Stripe
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Email (SMTP)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="tu-email@gmail.com"
SMTP_PASSWORD="tu-app-password"

# VAPID Keys para Push Notifications
NEXT_PUBLIC_VAPID_PUBLIC_KEY="BNkzCU6_V9BwoHH1mS-ncQ-Be3DIoQs9RHqIw2-E7ySikKFQF7GzOHQumVQO8_pSHL8Pk6wzZycHbHhPmzxRVs8"
VAPID_PRIVATE_KEY="TolMMc01X8ABpgQ6OANMmsPPH--tXXeZRBh5JaT7yPU"
VAPID_SUBJECT="mailto:hello@tugotug.com"
```

---

## ☁️ Configuración en Vercel

### **Paso 1: Ir a Configuración**
1. Ve a https://vercel.com/dashboard
2. Selecciona tu proyecto
3. Click en **Settings**
4. Click en **Environment Variables**

### **Paso 2: Agregar Variables**

Agrega las siguientes variables una por una:

#### **Database:**
- **Name:** `DATABASE_URL`
- **Value:** Tu URL de Neon PostgreSQL
- **Environments:** ✅ Production, ✅ Preview, ✅ Development

#### **NextAuth:**
- **Name:** `NEXTAUTH_URL`
- **Value:** `https://tu-app.vercel.app`
- **Environments:** ✅ Production

- **Name:** `NEXTAUTH_SECRET`
- **Value:** (genera uno con `openssl rand -base64 32`)
- **Environments:** ✅ Production, ✅ Preview, ✅ Development

#### **Stripe:**
- **Name:** `STRIPE_PUBLISHABLE_KEY`
- **Value:** `pk_test_...`
- **Environments:** ✅ Production, ✅ Preview, ✅ Development

- **Name:** `STRIPE_SECRET_KEY`
- **Value:** `sk_test_...`
- **Environments:** ✅ Production, ✅ Preview, ✅ Development

- **Name:** `STRIPE_WEBHOOK_SECRET`
- **Value:** `whsec_...`
- **Environments:** ✅ Production

#### **Email (SMTP):**
- **Name:** `SMTP_HOST`
- **Value:** `smtp.gmail.com`
- **Environments:** ✅ Production, ✅ Preview, ✅ Development

- **Name:** `SMTP_PORT`
- **Value:** `587`
- **Environments:** ✅ Production, ✅ Preview, ✅ Development

- **Name:** `SMTP_USER`
- **Value:** `tu-email@gmail.com`
- **Environments:** ✅ Production, ✅ Preview, ✅ Development

- **Name:** `SMTP_PASSWORD`
- **Value:** Tu app password de Gmail
- **Environments:** ✅ Production, ✅ Preview, ✅ Development

#### **Push Notifications (VAPID):**
- **Name:** `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
- **Value:** `BNkzCU6_V9BwoHH1mS-ncQ-Be3DIoQs9RHqIw2-E7ySikKFQF7GzOHQumVQO8_pSHL8Pk6wzZycHbHhPmzxRVs8`
- **Environments:** ✅ Production, ✅ Preview, ✅ Development

- **Name:** `VAPID_PRIVATE_KEY`
- **Value:** `TolMMc01X8ABpgQ6OANMmsPPH--tXXeZRBh5JaT7yPU`
- **Environments:** ✅ Production, ✅ Preview, ✅ Development

- **Name:** `VAPID_SUBJECT`
- **Value:** `mailto:hello@tugotug.com` (reemplaza con tu email)
- **Environments:** ✅ Production, ✅ Preview, ✅ Development

### **Paso 3: Redeploy**

Después de agregar todas las variables:

1. Ve a **Deployments**
2. Click en el último deployment
3. Click en los 3 puntos (⋯)
4. Click **Redeploy**

O simplemente haz un nuevo push:
```bash
git commit --allow-empty -m "trigger redeploy with env vars"
git push origin main
```

---

## ✅ Verificar Configuración

### **Local:**
```bash
# Verificar que las variables estén cargadas
npm run dev

# Deberías ver en la consola:
# ✅ VAPID keys configured
```

### **Producción:**
1. Abre tu app en Vercel
2. Abre la consola del navegador
3. Intenta activar notificaciones
4. Si funciona, las variables están correctas ✅

---

## 🔒 Seguridad

⚠️ **NUNCA** compartas estas claves públicamente:
- `STRIPE_SECRET_KEY`
- `VAPID_PRIVATE_KEY`
- `SMTP_PASSWORD`
- `NEXTAUTH_SECRET`
- `DATABASE_URL`

✅ **Estas claves SÍ son públicas:**
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
- `STRIPE_PUBLISHABLE_KEY`

---

## 📝 Checklist

- [ ] Crear archivo `.env.local`
- [ ] Copiar todas las variables
- [ ] Reemplazar valores de ejemplo con tus claves reales
- [ ] Agregar variables en Vercel
- [ ] Redeploy en Vercel
- [ ] Probar en desarrollo local
- [ ] Probar en producción

---

**¡Configuración completa!** 🎉
