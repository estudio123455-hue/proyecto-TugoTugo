# 💳 Guía Completa de Testing de Pagos

## 🎯 **Objetivo**
Verificar que tanto MercadoPago como Stripe funcionen correctamente en desarrollo y producción.

## 🧪 **Tests de MercadoPago**

### **1. Configuración de Test**
```bash
# Variables de entorno para testing
MERCADOPAGO_ACCESS_TOKEN=TEST-5959445917314837-101419-d8d9210d58a47d93f49513e4c318ee33-370982518
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=TEST-567494d9-fd53-4c37-8148-fc60f0940e78
MERCADOPAGO_WEBHOOK_SECRET=tugotug-webhook-secret-2024
```

### **2. Tarjetas de Prueba MercadoPago**
```javascript
// Tarjetas para testing
const testCards = {
  // Visa - Aprobada
  approved: {
    number: '4509 9535 6623 3704',
    cvv: '123',
    expiry: '11/25',
    name: 'APRO'
  },
  
  // Mastercard - Rechazada
  rejected: {
    number: '5031 7557 3453 0604',
    cvv: '123', 
    expiry: '11/25',
    name: 'OTHE'
  },
  
  // Visa - Pendiente
  pending: {
    number: '4235 6477 2802 5682',
    cvv: '123',
    expiry: '11/25', 
    name: 'CONT'
  }
}
```

### **3. Flujo de Testing MercadoPago**
1. **Crear Preferencia**
   ```bash
   curl -X POST https://tu-app.vercel.app/api/mercadopago/create-preference \
     -H "Content-Type: application/json" \
     -d '{
       "packId": "test-pack-123",
       "amount": 15000,
       "title": "Pack Sorpresa Test"
     }'
   ```

2. **Simular Pago**
   - Usar tarjeta de prueba APRO
   - Completar checkout en sandbox
   - Verificar webhook recibido

3. **Verificar Estados**
   ```bash
   curl https://tu-app.vercel.app/api/mercadopago/payment-status/PAYMENT_ID
   ```

## 🧪 **Tests de Stripe**

### **1. Configuración de Test**
```bash
# Variables de entorno para testing
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### **2. Tarjetas de Prueba Stripe**
```javascript
const stripeTestCards = {
  // Visa - Aprobada
  success: '4242424242424242',
  
  // Visa - Rechazada (fondos insuficientes)
  declined: '4000000000000002',
  
  // Visa - Requiere autenticación 3D Secure
  auth3d: '4000002500003155',
  
  // Mastercard - Aprobada
  mastercard: '5555555555554444'
}
```

### **3. Flujo de Testing Stripe**
1. **Crear Payment Intent**
   ```bash
   curl -X POST https://tu-app.vercel.app/api/stripe/create-payment-intent \
     -H "Content-Type: application/json" \
     -d '{
       "amount": 15000,
       "currency": "cop",
       "packId": "test-pack-123"
     }'
   ```

2. **Confirmar Pago**
   - Usar Stripe Elements en frontend
   - Tarjeta 4242424242424242
   - Verificar confirmación

## 🔄 **Tests de Webhooks**

### **1. Webhook MercadoPago**
```javascript
// Endpoint: /api/mercadopago/webhook
// Eventos a testear:
const events = [
  'payment.created',
  'payment.updated', 
  'payment.approved',
  'payment.rejected'
]
```

### **2. Webhook Stripe**
```javascript
// Endpoint: /api/webhooks/stripe
// Eventos a testear:
const events = [
  'payment_intent.succeeded',
  'payment_intent.payment_failed',
  'payment_intent.requires_action'
]
```

### **3. Testing con ngrok (Local)**
```bash
# Instalar ngrok
npm install -g ngrok

# Exponer puerto local
ngrok http 3000

# Configurar webhook URL
# MercadoPago: https://abc123.ngrok.io/api/mercadopago/webhook
# Stripe: https://abc123.ngrok.io/api/webhooks/stripe
```

## ✅ **Checklist de Testing**

### **MercadoPago**
- [ ] Crear preferencia exitosamente
- [ ] Pago aprobado con tarjeta APRO
- [ ] Pago rechazado con tarjeta OTHE  
- [ ] Pago pendiente con tarjeta CONT
- [ ] Webhook recibido y procesado
- [ ] Estado de orden actualizado en DB
- [ ] Email de confirmación enviado

### **Stripe**
- [ ] Payment Intent creado
- [ ] Pago exitoso con 4242...
- [ ] Pago rechazado con 4000...0002
- [ ] 3D Secure con 4000...3155
- [ ] Webhook procesado correctamente
- [ ] Orden marcada como pagada
- [ ] QR code generado y enviado

### **Integración General**
- [ ] Ambos sistemas funcionan en paralelo
- [ ] Fallback entre sistemas
- [ ] Logs de errores capturados
- [ ] Timeouts manejados correctamente
- [ ] Monedas y conversiones correctas

## 🚨 **Casos de Error**

### **1. Errores de Red**
```javascript
// Simular timeout
setTimeout(() => {
  throw new Error('Payment timeout')
}, 30000)
```

### **2. Errores de Validación**
```javascript
// Datos inválidos
const invalidData = {
  amount: -100, // Negativo
  currency: 'XXX', // Moneda inválida
  email: 'invalid-email' // Email malformado
}
```

### **3. Errores de Webhook**
```javascript
// Signature inválida
// Payload malformado
// Evento duplicado
```

## 📊 **Métricas a Monitorear**

### **Tasas de Éxito**
- Pagos aprobados vs totales
- Tiempo promedio de procesamiento
- Errores por tipo de tarjeta
- Abandono en checkout

### **Logs Importantes**
```javascript
console.log('Payment attempt:', {
  provider: 'mercadopago|stripe',
  amount,
  currency,
  status: 'pending|success|failed',
  error: errorMessage,
  timestamp: new Date().toISOString()
})
```

## 🔧 **Scripts de Testing**

### **Test Automático**
```bash
# Ejecutar todos los tests
npm run test:payments

# Test específico de MercadoPago
npm run test:mercadopago

# Test específico de Stripe  
npm run test:stripe
```

### **Test Manual**
1. Ir a `/packs` en tu app
2. Seleccionar un pack
3. Proceder al checkout
4. Probar con diferentes tarjetas
5. Verificar emails y estados

---
*Guía actualizada: Octubre 2025*
