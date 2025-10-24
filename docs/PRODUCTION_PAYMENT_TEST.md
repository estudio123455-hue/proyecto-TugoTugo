# 💳 Testing de Pagos en Producción

## 🎯 **Plan de Testing Completo**

### **Pre-requisitos**
- [ ] Variables de entorno configuradas en Vercel
- [ ] App desplegada y funcionando
- [ ] Health check retorna "configured" para pagos

## 🧪 **Test 1: MercadoPago**

### **Configuración de Test**
```bash
# En Vercel Environment Variables
MERCADOPAGO_ACCESS_TOKEN=TEST-5959445917314837-101419-d8d9210d58a47d93f49513e4c318ee33-370982518
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=TEST-567494d9-fd53-4c37-8148-fc60f0940e78
MERCADOPAGO_WEBHOOK_SECRET=tugotug-webhook-secret-2024
```

### **Tarjetas de Prueba**
```javascript
// Visa - Pago APROBADO
Número: 4509 9535 6623 3704
CVV: 123
Vencimiento: 11/25
Nombre: APRO

// Mastercard - Pago RECHAZADO
Número: 5031 7557 3453 0604
CVV: 123
Vencimiento: 11/25
Nombre: OTHE

// Visa - Pago PENDIENTE
Número: 4235 6477 2802 5682
CVV: 123
Vencimiento: 11/25
Nombre: CONT
```

### **Flujo de Testing**
1. **Ir a tu app**: `https://tu-app.vercel.app/packs`
2. **Seleccionar un pack** disponible
3. **Proceder al checkout**
4. **Usar tarjeta APRO** para pago exitoso
5. **Verificar**:
   - [ ] Pago procesado correctamente
   - [ ] Email de confirmación recibido
   - [ ] QR code generado
   - [ ] Orden visible en `/orders`
   - [ ] Estado en base de datos actualizado

### **Test de Webhook**
```bash
# Verificar que el webhook se recibe
curl -X GET https://tu-app.vercel.app/api/mercadopago/payment-status/PAYMENT_ID
```

## 🧪 **Test 2: Stripe (Si está configurado)**

### **Configuración de Test**
```bash
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### **Tarjetas de Prueba**
```javascript
// Visa - Pago EXITOSO
Número: 4242 4242 4242 4242
CVV: cualquier 3 dígitos
Vencimiento: cualquier fecha futura

// Visa - Pago RECHAZADO (fondos insuficientes)
Número: 4000 0000 0000 0002

// Visa - Requiere 3D Secure
Número: 4000 0025 0000 3155
```

### **Flujo de Testing**
1. **Cambiar a Stripe** en checkout
2. **Usar tarjeta 4242...** 
3. **Verificar mismo flujo** que MercadoPago

## 🔄 **Test 3: Webhooks**

### **MercadoPago Webhook**
```bash
# Endpoint esperado
POST https://tu-app.vercel.app/api/mercadopago/webhook

# Eventos a verificar
- payment.created
- payment.updated
- payment.approved
- payment.rejected
```

### **Stripe Webhook**
```bash
# Endpoint esperado
POST https://tu-app.vercel.app/api/webhooks/stripe

# Eventos a verificar
- payment_intent.succeeded
- payment_intent.payment_failed
```

### **Verificación de Webhooks**
1. **Ir a dashboard de MercadoPago/Stripe**
2. **Revisar logs de webhooks**
3. **Confirmar que se reciben correctamente**
4. **Verificar respuesta 200 OK**

## 📧 **Test 4: Sistema de Emails**

### **Verificar Emails Automáticos**
Después de cada pago exitoso, verificar:
- [ ] **Email de confirmación** recibido
- [ ] **QR code** incluido en email
- [ ] **Código de verificación** visible
- [ ] **Detalles de orden** correctos
- [ ] **Información de restaurante** correcta

### **Template de Email**
El email debe incluir:
- ✅ Logo de TugoTugo
- ✅ Número de orden
- ✅ Detalles del pack
- ✅ QR code
- ✅ Código alfanumérico
- ✅ Información de recogida
- ✅ Botón "Ver mi orden"

## 🔔 **Test 5: Notificaciones Push (Si está configurado)**

### **Verificar Notificaciones**
- [ ] Notificación de orden confirmada
- [ ] Notificación de pack listo
- [ ] Recordatorio de recogida

## 📊 **Test 6: Monitoreo y Logs**

### **Verificar en Vercel**
1. **Functions** → Ver logs de API routes
2. **Analytics** → Verificar tráfico
3. **Speed Insights** → Performance

### **Verificar en Sentry (Si está configurado)**
1. **Errors** → No errores críticos
2. **Performance** → Tiempos de respuesta
3. **Releases** → Deployment tracking

## ✅ **Checklist de Validación Final**

### **Funcionalidad Básica**
- [ ] App carga sin errores
- [ ] Login/logout funciona
- [ ] Navegación fluida
- [ ] Mapas cargan correctamente

### **Proceso de Compra**
- [ ] Selección de packs funciona
- [ ] Checkout carga correctamente
- [ ] Pagos se procesan
- [ ] Confirmaciones llegan

### **Post-Compra**
- [ ] Emails se envían
- [ ] QR codes se generan
- [ ] Órdenes se guardan
- [ ] Estados se actualizan

### **Integración**
- [ ] Webhooks funcionan
- [ ] Base de datos actualiza
- [ ] Logs se generan
- [ ] Errores se capturan

## 🚨 **Casos de Error a Probar**

### **Pagos Fallidos**
- [ ] Tarjeta rechazada maneja correctamente
- [ ] Timeout de pago se maneja
- [ ] Error de red se recupera
- [ ] Usuario recibe feedback claro

### **Errores de Sistema**
- [ ] Base de datos no disponible
- [ ] Servicio de email caído
- [ ] Webhook no recibido
- [ ] QR code no genera

## 📈 **Métricas a Monitorear**

### **Durante Testing**
- Tiempo de respuesta de APIs
- Tasa de éxito de pagos
- Tiempo de generación de QR
- Entrega de emails

### **Post-Testing**
- Errores en logs
- Performance general
- Uso de recursos
- Satisfacción de usuario

---
**🎯 Objetivo: 100% de tests pasando = Pagos listos para usuarios reales**
