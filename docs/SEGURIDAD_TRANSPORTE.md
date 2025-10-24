# 🔒 Seguridad en el Transporte - TugoTugo

## ✅ HTTPS Configurado

Vercel proporciona HTTPS automáticamente para todos los deployments:
- ✅ Certificados SSL/TLS gratuitos
- ✅ Renovación automática
- ✅ HTTP redirige automáticamente a HTTPS
- ✅ HSTS (HTTP Strict Transport Security) habilitado

## 🛡️ CORS Configurado

### Orígenes Permitidos:
- Tu dominio de producción
- localhost (desarrollo)
- Dominios específicos que agregues

### Headers CORS:
- `Access-Control-Allow-Origin`: Solo orígenes permitidos
- `Access-Control-Allow-Credentials`: true
- `Access-Control-Allow-Methods`: GET, POST, PUT, PATCH, DELETE
- `Access-Control-Max-Age`: 24 horas

## 🔐 Headers de Seguridad

### Implementados en `middleware.ts` y `next.config.js`:

1. **X-Content-Type-Options: nosniff**
   - Previene MIME type sniffing

2. **X-Frame-Options: DENY**
   - Previene clickjacking

3. **X-XSS-Protection: 1; mode=block**
   - Protección contra XSS

4. **Referrer-Policy: strict-origin-when-cross-origin**
   - Control de información de referrer

5. **Permissions-Policy**
   - Controla permisos de APIs del navegador

6. **Strict-Transport-Security (HSTS)**
   - Fuerza HTTPS en producción
   - max-age: 1 año
   - includeSubDomains
   - preload

## 📝 Configuración

### Actualizar dominios permitidos:
Edita `src/middleware.ts`:
```typescript
const ALLOWED_ORIGINS = [
  process.env.NEXTAUTH_URL,
  'https://tugotugo.vercel.app',
  'https://tu-dominio-custom.com', // Agregar aquí
]
```

## ✅ Checklist de Seguridad

- ✅ HTTPS habilitado (Vercel)
- ✅ CORS configurado
- ✅ Headers de seguridad
- ✅ Cookies seguras (httpOnly, secure, sameSite)
- ✅ JWT firmado
- ✅ Passwords hasheados
- ✅ Autorización por roles
- ✅ Auditoría de acciones
