# 🔑 Claves VAPID Correctas

## ⚠️ IMPORTANTE: Usa estas claves en lugar de las anteriores

Las claves anteriores tenían un formato incorrecto. Estas son las claves válidas generadas correctamente:

---

## 📋 Claves para Copiar:

### **Public Key (NEXT_PUBLIC_VAPID_PUBLIC_KEY):**
```
BKJeRlUCxb3oFW1Jj0vWxKS0Ive_8ymV4vmnIoiPaF1TFxrXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### **Private Key (VAPID_PRIVATE_KEY):**
```
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### **Subject (VAPID_SUBJECT):**
```
mailto:hello@tugotug.com
```

---

## 🔧 Cómo Configurar:

### **1. Local (.env.local):**

Crea o actualiza tu archivo `.env.local`:

```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY="BKJeRlUCxb3oFW1Jj0vWxKS0Ive_8ymV4vmnIoiPaF1TFxrXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
VAPID_PRIVATE_KEY="XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
VAPID_SUBJECT="mailto:hello@tugotug.com"
```

### **2. Vercel (Producción):**

1. Ve a: https://vercel.com/dashboard
2. Selecciona tu proyecto
3. Settings → Environment Variables
4. **ELIMINA** las variables VAPID antiguas
5. **AGREGA** estas nuevas:

```
Name: NEXT_PUBLIC_VAPID_PUBLIC_KEY
Value: BKJeRlUCxb3oFW1Jj0vWxKS0Ive_8ymV4vmnIoiPaF1TFxrXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
Environments: ✅ Production, ✅ Preview, ✅ Development

Name: VAPID_PRIVATE_KEY
Value: XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
Environments: ✅ Production, ✅ Preview, ✅ Development

Name: VAPID_SUBJECT
Value: mailto:hello@tugotug.com
Environments: ✅ Production, ✅ Preview, ✅ Development
```

6. **Redeploy** tu aplicación

---

## ✅ Verificar que Funciona:

1. Inicia sesión en tu app
2. Busca el botón de notificaciones en el navbar
3. Haz clic en "Activar Notificaciones"
4. Si no hay errores, ¡está funcionando! ✨

---

## 🐛 Si Ves el Error "Invalid raw ECDSA P-256 public key":

Significa que las claves antiguas todavía están en uso. Asegúrate de:

1. ✅ Actualizar `.env.local` con las nuevas claves
2. ✅ Reiniciar el servidor de desarrollo (`npm run dev`)
3. ✅ Actualizar las variables en Vercel
4. ✅ Hacer redeploy en Vercel

---

## 🔒 Seguridad:

⚠️ **NUNCA** compartas la **VAPID_PRIVATE_KEY** públicamente
✅ La **NEXT_PUBLIC_VAPID_PUBLIC_KEY** es segura para compartir (está en el cliente)

---

## 📚 Más Información:

- [Web Push Protocol](https://datatracker.ietf.org/doc/html/rfc8292)
- [VAPID Specification](https://datatracker.ietf.org/doc/html/draft-ietf-webpush-vapid)
- [web-push library](https://github.com/web-push-libs/web-push)

---

**¡Claves actualizadas correctamente!** 🎉
