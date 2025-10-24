# 🔔 Configuración de Notificaciones Push

## 📋 Requisitos

- Node.js 18+
- Cuenta de Vercel (para producción)
- Navegador compatible con Web Push API

---

## 🔧 Configuración Inicial

### **Paso 1: Generar VAPID Keys**

Las VAPID keys son necesarias para autenticar las notificaciones push.

```bash
npx web-push generate-vapid-keys
```

Esto generará algo como:

```
=======================================
Public Key:
BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U

Private Key:
UUxI4O8-FbRouAevSmBQ6o8eDy6VV5pBCvvuaEVBfcM
=======================================
```

### **Paso 2: Configurar Variables de Entorno**

Agrega las siguientes variables a tu `.env.local`:

```env
# VAPID Keys para Push Notifications
NEXT_PUBLIC_VAPID_PUBLIC_KEY="BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U"
VAPID_PRIVATE_KEY="UUxI4O8-FbRouAevSmBQ6o8eDy6VV5pBCvvuaEVBfcM"
VAPID_SUBJECT="mailto:hello@tugotug.com"
```

⚠️ **IMPORTANTE:** 
- La `NEXT_PUBLIC_VAPID_PUBLIC_KEY` debe empezar con `NEXT_PUBLIC_` para estar disponible en el cliente
- Reemplaza el email en `VAPID_SUBJECT` con tu email real
- **NUNCA** compartas tu `VAPID_PRIVATE_KEY` públicamente

### **Paso 3: Configurar en Vercel**

1. Ve a tu proyecto en Vercel
2. Settings → Environment Variables
3. Agrega las 3 variables:
   - `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
   - `VAPID_PRIVATE_KEY`
   - `VAPID_SUBJECT`
4. Selecciona **Production**, **Preview**, **Development**
5. Redeploy

---

## 🚀 Uso en la Aplicación

### **Para Usuarios (Frontend)**

Agrega el botón de notificaciones en tu layout o navbar:

```tsx
import NotificationButton from '@/components/NotificationButton'

export default function Layout() {
  return (
    <div>
      <nav>
        {/* ... otros elementos ... */}
        <NotificationButton />
      </nav>
    </div>
  )
}
```

### **Para Enviar Notificaciones (Backend)**

```typescript
import { sendPushNotification, getNotificationTemplate } from '@/lib/notifications'
import { prisma } from '@/lib/prisma'

// Obtener suscripciones del usuario
const subscriptions = await prisma.pushSubscription.findMany({
  where: { userId: 'user-id' }
})

// Crear notificación
const notification = getNotificationTemplate('order_confirmed', {
  establishmentName: 'Restaurante XYZ',
  pickupTime: '18:00 - 20:00',
  orderId: 'order-123'
})

// Enviar a todas las suscripciones
for (const sub of subscriptions) {
  await sendPushNotification(
    {
      endpoint: sub.endpoint,
      keys: {
        p256dh: sub.p256dh,
        auth: sub.auth
      }
    },
    notification
  )
}
```

---

## 📱 Tipos de Notificaciones Disponibles

### **1. Nueva Orden (Restaurante)**
```typescript
getNotificationTemplate('new_order', {
  customerName: 'Juan Pérez',
  quantity: 2,
  orderId: 'order-123'
})
```

### **2. Orden Confirmada (Cliente)**
```typescript
getNotificationTemplate('order_confirmed', {
  establishmentName: 'Restaurante XYZ',
  pickupTime: '18:00 - 20:00',
  orderId: 'order-123'
})
```

### **3. Orden Lista (Cliente)**
```typescript
getNotificationTemplate('order_ready', {
  establishmentName: 'Restaurante XYZ',
  orderId: 'order-123'
})
```

### **4. Pack Por Expirar**
```typescript
getNotificationTemplate('pack_expiring', {
  packTitle: 'Pack Sorpresa',
  hoursLeft: 2,
  packId: 'pack-123'
})
```

### **5. Nuevo Pack Cerca**
```typescript
getNotificationTemplate('new_pack_nearby', {
  establishmentName: 'Restaurante XYZ',
  distance: '500m',
  packId: 'pack-123'
})
```

### **6. Nueva Reseña (Restaurante)**
```typescript
getNotificationTemplate('review_received', {
  customerName: 'Juan Pérez',
  rating: 5,
  reviewId: 'review-123'
})
```

### **7. Restaurante Aprobado**
```typescript
getNotificationTemplate('establishment_approved', {})
```

### **8. Restaurante Rechazado**
```typescript
getNotificationTemplate('establishment_rejected', {})
```

---

## 🧪 Probar Notificaciones

### **Desarrollo Local**

1. Inicia el servidor:
```bash
npm run dev
```

2. Abre http://localhost:3000
3. Haz clic en "Activar Notificaciones"
4. Acepta los permisos del navegador
5. Crea una orden de prueba
6. Deberías recibir una notificación

### **Producción**

Las notificaciones funcionan automáticamente en:
- Chrome (Desktop & Android)
- Firefox (Desktop & Android)
- Edge
- Safari 16+ (macOS 13+, iOS 16.4+)

---

## 🔍 Troubleshooting

### **"Push notifications are not supported"**
- Verifica que estés usando HTTPS (requerido)
- Verifica que el navegador soporte Web Push API
- En desarrollo, localhost está permitido

### **"Permission denied"**
- El usuario bloqueó las notificaciones
- Debe habilitarlas manualmente en la configuración del navegador

### **"Failed to save subscription"**
- Verifica que las VAPID keys estén configuradas
- Verifica que el usuario esté autenticado
- Revisa los logs del servidor

### **Notificaciones no llegan**
- Verifica que la suscripción esté guardada en la DB
- Verifica que el Service Worker esté registrado
- Revisa los logs del servidor para errores
- Verifica que las VAPID keys sean correctas

---

## 📊 Monitoreo

### **Ver Suscripciones Activas**

```sql
SELECT 
  u.email,
  COUNT(ps.id) as subscriptions
FROM "User" u
LEFT JOIN "PushSubscription" ps ON u.id = ps."userId"
GROUP BY u.id, u.email
HAVING COUNT(ps.id) > 0;
```

### **Limpiar Suscripciones Expiradas**

Las suscripciones expiradas se eliminan automáticamente cuando fallan al enviar.

---

## 🔒 Seguridad

- ✅ Las VAPID keys autentican las notificaciones
- ✅ Solo usuarios autenticados pueden suscribirse
- ✅ Las suscripciones están vinculadas a usuarios
- ✅ El Service Worker solo acepta notificaciones de tu servidor
- ✅ HTTPS requerido en producción

---

## 📚 Referencias

- [Web Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [VAPID](https://datatracker.ietf.org/doc/html/rfc8292)
- [web-push library](https://github.com/web-push-libs/web-push)

---

## ✅ Checklist de Implementación

- [x] Generar VAPID keys
- [x] Configurar variables de entorno
- [x] Crear modelo PushSubscription en DB
- [x] Implementar servicio de notificaciones
- [x] Crear Service Worker
- [x] Crear API endpoints
- [x] Crear componente UI
- [x] Integrar en webhooks
- [ ] Agregar a navbar/layout
- [ ] Probar en desarrollo
- [ ] Probar en producción
- [ ] Configurar cron job para packs por expirar

---

**¡Sistema de notificaciones push listo para usar!** 🎉
