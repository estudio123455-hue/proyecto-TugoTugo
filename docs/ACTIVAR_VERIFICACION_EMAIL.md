# ✅ Sistema de Verificación de Email - REACTIVADO

## 🎯 Estado Actual

El sistema de verificación de email ha sido reactivado con las siguientes configuraciones:

### ✅ Completado Localmente:

1. **Base de datos actualizada** - Tabla `EmailVerification` sincronizada
2. **Variables de entorno configuradas** en `.env.local`:
   - ✅ SMTP_HOST
   - ✅ SMTP_PORT
   - ✅ SMTP_USER
   - ✅ SMTP_PASSWORD

### 📧 Cómo Funciona:

1. **Usuario se registra** → Se envía código de 6 dígitos al email
2. **Usuario ingresa código** en `/auth/verify`
3. **Sistema valida** el código (expira en 15 minutos)
4. **Cuenta verificada** → Usuario puede acceder

---

## ⚠️ PENDIENTE: Configurar en Vercel

Para que funcione en producción, debes agregar estas variables en Vercel:

### Variables SMTP para Vercel:

```
SMTP_HOST
smtp.gmail.com
```

```
SMTP_PORT
587
```

```
SMTP_USER
estudio.123455@gmail.com
```

```
SMTP_PASSWORD
eqkk uxlz yfzl qfbx
```

### Pasos en Vercel:

1. Ve a https://vercel.com/dashboard
2. Selecciona tu proyecto
3. **Settings** → **Environment Variables**
4. Agrega las 4 variables SMTP
5. **Deployments** → **Redeploy** el último deployment

---

## 🧪 Probar Localmente:

1. Inicia el servidor:
   ```bash
   npm run dev
   ```

2. Ve a http://localhost:3000/auth/signup

3. Registra un nuevo usuario

4. Revisa tu email (estudio.123455@gmail.com) para el código

5. Ingresa el código en la página de verificación

---

## 📋 APIs Disponibles:

- `POST /api/auth/register` - Registrar usuario y enviar código
- `POST /api/auth/verify-code` - Verificar código
- `POST /api/auth/send-verification` - Reenviar código

## 🔐 Seguridad:

- Códigos de 6 dígitos aleatorios
- Expiración: 15 minutos
- Máximo 5 intentos por código
- Prevención de spam: 1 código cada 2 minutos
- Limpieza automática de códigos expirados
