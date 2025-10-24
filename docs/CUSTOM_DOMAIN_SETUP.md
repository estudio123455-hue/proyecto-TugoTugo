# 🌐 Configuración de Dominio Personalizado

## 🎯 **Opciones de Dominio**

### **Opción 1: Dominio Gratuito (.vercel.app)**
- ✅ **Actual**: `tu-proyecto.vercel.app`
- ✅ **Ventajas**: Gratuito, SSL automático, CDN global
- ❌ **Desventajas**: No es tu marca

### **Opción 2: Dominio Personalizado**
- 🎯 **Recomendado**: `tugotugo.com` o `tugotugo.co`
- ✅ **Ventajas**: Marca propia, profesional, SEO
- ❌ **Desventajas**: Costo anual (~$10-15 USD)

## 💰 **Proveedores de Dominios Recomendados**

### **Para Colombia (.co)**
- **Namecheap**: ~$25 USD/año
- **GoDaddy**: ~$30 USD/año
- **Hostinger**: ~$15 USD/año

### **Para Internacional (.com)**
- **Namecheap**: ~$12 USD/año
- **Cloudflare**: ~$10 USD/año
- **Google Domains**: ~$12 USD/año

## 🛠️ **Configuración en Vercel**

### **Paso 1: Comprar Dominio**
1. Elige proveedor (recomiendo **Namecheap**)
2. Busca disponibilidad de `tugotugo.com`
3. Compra por 1-2 años
4. Configura información de contacto

### **Paso 2: Agregar Dominio en Vercel**
1. Ve a **Vercel Dashboard**
2. Selecciona tu proyecto
3. Ve a **Settings** → **Domains**
4. Click **Add Domain**
5. Ingresa tu dominio: `tugotugo.com`
6. Click **Add**

### **Paso 3: Configurar DNS**
Vercel te dará instrucciones específicas, generalmente:

#### **Para Dominio Principal (tugotugo.com)**
```dns
Type: A
Name: @
Value: 76.76.19.61
```

#### **Para Subdominio (www.tugotugo.com)**
```dns
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### **Paso 4: Configurar en tu Proveedor**
1. **Namecheap**: Advanced DNS → Add Records
2. **GoDaddy**: DNS Management → Add Records
3. **Cloudflare**: DNS → Add Records

### **Paso 5: Verificar**
- Espera 24-48 horas para propagación
- Vercel verificará automáticamente
- SSL se configurará automáticamente

## 🔧 **Configuración Avanzada**

### **Redirecciones**
```javascript
// next.config.js
module.exports = {
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ]
  },
}
```

### **Subdominios**
- `app.tugotugo.com` → Aplicación principal
- `admin.tugotugo.com` → Panel de administración
- `api.tugotugo.com` → API endpoints

## 📧 **Actualizar Configuraciones**

### **Variables de Entorno**
```bash
# Actualizar en Vercel
NEXTAUTH_URL=https://tugotugo.com
SMTP_FROM=TugoTugo <noreply@tugotugo.com>
```

### **OAuth Providers**
```bash
# Google Console
Authorized redirect URIs:
- https://tugotugo.com/api/auth/callback/google
- https://www.tugotugo.com/api/auth/callback/google
```

### **Webhooks**
```bash
# MercadoPago
Webhook URL: https://tugotugo.com/api/mercadopago/webhook

# Stripe  
Webhook URL: https://tugotugo.com/api/webhooks/stripe
```

## 🔍 **SEO y Marketing**

### **Google Search Console**
1. Ir a [Google Search Console](https://search.google.com/search-console)
2. Agregar propiedad: `tugotugo.com`
3. Verificar dominio
4. Subir sitemap: `tugotugo.com/sitemap.xml`

### **Google Analytics**
```javascript
// Actualizar tracking
gtag('config', 'G-XXXXXXXXXX', {
  page_title: 'TugoTugo',
  page_location: 'https://tugotugo.com'
});
```

### **Social Media**
- **Facebook**: Actualizar URL de página
- **Instagram**: Actualizar link en bio
- **Twitter**: Actualizar URL de perfil

## 📱 **PWA y App Stores**

### **Manifest.json**
```json
{
  "name": "TugoTugo",
  "short_name": "TugoTugo",
  "start_url": "https://tugotugo.com",
  "scope": "https://tugotugo.com"
}
```

### **Apple App Site Association**
```json
// public/.well-known/apple-app-site-association
{
  "applinks": {
    "apps": [],
    "details": [
      {
        "appID": "TEAMID.com.tugotugo.app",
        "paths": ["*"]
      }
    ]
  }
}
```

## ✅ **Checklist Post-Configuración**

### **Verificación Técnica**
- [ ] Dominio resuelve correctamente
- [ ] SSL certificado activo (candado verde)
- [ ] Redirecciones funcionan
- [ ] Todas las páginas cargan

### **Verificación Funcional**
- [ ] Login/logout funciona
- [ ] Pagos procesan correctamente
- [ ] Emails llegan desde nuevo dominio
- [ ] Webhooks reciben en nueva URL

### **Verificación SEO**
- [ ] Google indexa nuevo dominio
- [ ] Meta tags actualizados
- [ ] Sitemap accesible
- [ ] Analytics tracking

### **Verificación Marketing**
- [ ] Redes sociales actualizadas
- [ ] Email signatures actualizados
- [ ] Material promocional actualizado

## 🚨 **Troubleshooting**

### **Dominio no resuelve**
- Verificar configuración DNS
- Esperar propagación (24-48h)
- Usar herramientas como `nslookup`

### **SSL no funciona**
- Verificar que Vercel detectó el dominio
- Forzar renovación en Vercel
- Verificar configuración DNS

### **Redirects no funcionan**
- Verificar `next.config.js`
- Redeploy después de cambios
- Verificar cache del navegador

---
**🎯 Resultado: tugotugo.com funcionando perfectamente con SSL y todas las integraciones**
