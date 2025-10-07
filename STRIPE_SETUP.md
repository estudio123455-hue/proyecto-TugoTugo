# 🔧 Configuración de Stripe en Vercel

## ❌ Problema Actual

El error "Error al procesar el pago" indica que **Stripe no está configurado correctamente** en Vercel.

---

## ✅ Solución: Configurar Variables de Entorno

### **Paso 1: Obtener tus claves de Stripe**

1. Ve a: https://dashboard.stripe.com/test/apikeys
2. Copia tus claves de **modo test**:
   - **Publishable key** (empieza con `pk_test_...`)
   - **Secret key** (empieza con `sk_test_...`)

### **Paso 2: Agregar en Vercel**

1. Ve a tu proyecto en Vercel: https://vercel.com/dashboard
2. Selecciona tu proyecto
3. Ve a **Settings** → **Environment Variables**
4. Agrega las siguientes variables:

```
STRIPE_SECRET_KEY=sk_test_TU_CLAVE_SECRETA_AQUI
STRIPE_PUBLISHABLE_KEY=pk_test_TU_CLAVE_PUBLICA_AQUI
```

5. Asegúrate de seleccionar **Production**, **Preview** y **Development**
6. Haz clic en **Save**

### **Paso 3: Redeploy**

Después de agregar las variables:

1. Ve a **Deployments**
2. Encuentra el último deployment
3. Haz clic en los 3 puntos (⋯)
4. Selecciona **Redeploy**

O simplemente haz un nuevo push:
```bash
git commit --allow-empty -m "trigger redeploy"
git push origin main
```

---

## 🔐 Variables Requeridas

Tu proyecto necesita estas variables en Vercel:

### **Stripe:**
- `STRIPE_SECRET_KEY` - Clave secreta (sk_test_...)
- `STRIPE_PUBLISHABLE_KEY` - Clave pública (pk_test_...)
- `STRIPE_WEBHOOK_SECRET` - Para webhooks (whsec_...)

### **Base de Datos:**
- `DATABASE_URL` - URL de PostgreSQL

### **Email (SMTP):**
- `SMTP_HOST` - smtp.gmail.com
- `SMTP_PORT` - 587
- `SMTP_USER` - tu-email@gmail.com
- `SMTP_PASSWORD` - tu-app-password

### **NextAuth:**
- `NEXTAUTH_URL` - https://tu-app.vercel.app
- `NEXTAUTH_SECRET` - Genera uno con: `openssl rand -base64 32`

---

## 🧪 Verificar Configuración

Después de configurar, prueba:

1. **Crear una orden** desde la app
2. Si funciona, verás la página de pago de Stripe
3. Usa tarjeta de prueba: `4242 4242 4242 4242`
   - Fecha: Cualquier fecha futura
   - CVC: Cualquier 3 dígitos
   - ZIP: Cualquier código

---

## 🚨 Errores Comunes

### **Error: "No API key provided"**
- Falta `STRIPE_SECRET_KEY` en Vercel

### **Error: "Invalid API Key"**
- La clave es incorrecta o está mal copiada
- Verifica que no tenga espacios al inicio/final

### **Error: "Amount must be at least..."**
- El precio del pack es menor a $3,000 COP
- Actualiza el precio del pack

---

## 📝 Checklist

- [ ] Obtener claves de Stripe (modo test)
- [ ] Agregar `STRIPE_SECRET_KEY` en Vercel
- [ ] Agregar `STRIPE_PUBLISHABLE_KEY` en Vercel
- [ ] Seleccionar todos los ambientes (Production, Preview, Development)
- [ ] Guardar cambios
- [ ] Redeploy la aplicación
- [ ] Probar creación de orden
- [ ] Verificar que aparezca página de pago de Stripe

---

## 🔗 Enlaces Útiles

- Dashboard de Stripe: https://dashboard.stripe.com
- Claves API: https://dashboard.stripe.com/test/apikeys
- Tarjetas de prueba: https://stripe.com/docs/testing
- Vercel Environment Variables: https://vercel.com/docs/concepts/projects/environment-variables

---

## 💡 Nota Importante

**Modo Test vs Producción:**

- **Test Mode** (sk_test_...): Para desarrollo, usa tarjetas de prueba
- **Live Mode** (sk_live_...): Para producción, cobra dinero real

**Siempre usa modo TEST hasta que estés listo para producción.**
