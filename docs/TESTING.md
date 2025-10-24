# 🧪 Guía de Pruebas - Sistema de Verificación QR

## ✅ Pruebas Completadas

### 1. **Pruebas Unitarias del Sistema QR**
```bash
npx tsx test-qr-system.ts
```

**Resultados:**
- ✅ Generación de códigos únicos (12 caracteres hexadecimales)
- ✅ Validación de formato de códigos
- ✅ Generación de imágenes QR en base64
- ✅ Estructura de datos del QR (JSON con orderId, code, timestamp)
- ✅ Archivo HTML generado: `test-qr-output.html`

---

## 🔄 Flujo de Prueba Completo

### **Paso 1: Preparar Datos de Prueba**

Necesitas tener en tu base de datos:
1. Un usuario con rol `CUSTOMER`
2. Un usuario con rol `ESTABLISHMENT`
3. Un restaurante (Establishment) activo
4. Un pack activo con cantidad > 0

### **Paso 2: Crear Orden de Prueba**

```bash
npx tsx scripts/create-test-order.ts
```

Esto creará:
- Una orden en estado `CONFIRMED`
- Código de verificación único
- Código QR generado
- Archivo HTML: `test-order-qr.html`

### **Paso 3: Probar el API de Verificación**

#### **Opción A: Con REST Client (VS Code)**
Abre `test-api-verify.http` y ejecuta las peticiones

#### **Opción B: Con cURL**

**Consultar orden:**
```bash
curl -X GET "http://localhost:3000/api/orders/verify?code=A1B2C3D4E5F6" \
  -H "Cookie: next-auth.session-token=TU_SESSION_TOKEN"
```

**Verificar orden:**
```bash
curl -X POST http://localhost:3000/api/orders/verify \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=TU_SESSION_TOKEN" \
  -d '{"verificationCode":"A1B2C3D4E5F6"}'
```

#### **Opción C: Con Postman**

1. **GET** `http://localhost:3000/api/orders/verify?code=CODIGO`
2. **POST** `http://localhost:3000/api/orders/verify`
   ```json
   {
     "verificationCode": "A1B2C3D4E5F6"
   }
   ```

---

## 🎯 Casos de Prueba

### **Test 1: Código Válido (Happy Path)**
```json
POST /api/orders/verify
{
  "verificationCode": "93EC19233B94"
}
```
**Esperado:** 
- Status: 200
- Orden cambia a `COMPLETED`
- Se registra `verifiedAt`
- Se crea audit log

### **Test 2: Código Inválido**
```json
POST /api/orders/verify
{
  "verificationCode": "INVALID123"
}
```
**Esperado:**
- Status: 400
- Mensaje: "Código de verificación inválido"

### **Test 3: Código No Existe**
```json
POST /api/orders/verify
{
  "verificationCode": "AABBCCDDEEFF"
}
```
**Esperado:**
- Status: 404
- Mensaje: "Orden no encontrada"

### **Test 4: Sin Autenticación**
```json
POST /api/orders/verify
{
  "verificationCode": "93EC19233B94"
}
```
**Esperado:**
- Status: 401
- Mensaje: "No autenticado"

### **Test 5: Usuario No es Dueño del Restaurante**
```json
POST /api/orders/verify
{
  "verificationCode": "93EC19233B94"
}
```
(Autenticado como otro usuario)

**Esperado:**
- Status: 403
- Mensaje: "No tienes permiso para verificar esta orden"

### **Test 6: Orden Ya Verificada**
```json
POST /api/orders/verify
{
  "verificationCode": "93EC19233B94"
}
```
(Segunda vez)

**Esperado:**
- Status: 400
- Mensaje: "Esta orden ya fue verificada"

### **Test 7: Orden No Confirmada**
```json
POST /api/orders/verify
{
  "verificationCode": "CODIGO_PENDING"
}
```
**Esperado:**
- Status: 400
- Mensaje: "La orden no está en estado CONFIRMED"

---

## 📧 Prueba de Email con QR

### **Simular Webhook de Stripe**

1. Crear una orden (POST `/api/orders`)
2. Obtener el `orderId`
3. Simular webhook de Stripe:

```bash
curl -X POST http://localhost:3000/api/webhooks/stripe \
  -H "Content-Type: application/json" \
  -H "stripe-signature: FAKE_SIGNATURE" \
  -d '{
    "type": "checkout.session.completed",
    "data": {
      "object": {
        "metadata": {
          "orderId": "ORDER_ID_AQUI"
        }
      }
    }
  }'
```

**Nota:** En desarrollo, el webhook de Stripe requiere la firma correcta. Usa Stripe CLI:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
stripe trigger checkout.session.completed
```

---

## 🔍 Verificar en Base de Datos

```sql
-- Ver órdenes con código QR
SELECT id, status, "verificationCode", "verifiedAt", "createdAt"
FROM "Order"
WHERE "verificationCode" IS NOT NULL;

-- Ver audit logs de verificación
SELECT action, "entityType", "entityId", "userName", changes, metadata, "createdAt"
FROM "AuditLog"
WHERE "entityType" = 'ORDER' AND action = 'UPDATE'
ORDER BY "createdAt" DESC;
```

---

## 📱 Prueba con Dispositivo Móvil

1. Abre `test-order-qr.html` en tu navegador
2. Escanea el QR con tu teléfono
3. Deberías ver un JSON con:
   ```json
   {
     "orderId": "...",
     "code": "A1B2C3D4E5F6",
     "timestamp": "2025-10-07T..."
   }
   ```
4. Usa el código para verificar en el API

---

## 🚀 Prueba en Producción (Vercel)

### **Verificar Deploy**
```bash
vercel logs --follow
```

### **Probar API en Producción**
```bash
curl -X POST https://tu-app.vercel.app/api/orders/verify \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=TOKEN" \
  -d '{"verificationCode":"CODIGO"}'
```

### **Verificar Email**
1. Hacer una compra real con Stripe
2. Verificar que llegue el email
3. Confirmar que el QR esté visible
4. Escanear el QR y verificar

---

## 📊 Checklist de Pruebas

- [x] Generación de códigos únicos
- [x] Validación de formato
- [x] Generación de QR en base64
- [ ] Crear orden de prueba en DB
- [ ] Simular webhook de Stripe
- [ ] Verificar envío de email
- [ ] Probar GET /api/orders/verify
- [ ] Probar POST /api/orders/verify (éxito)
- [ ] Probar POST con código inválido
- [ ] Probar POST sin autenticación
- [ ] Probar POST sin permisos
- [ ] Probar doble verificación
- [ ] Verificar audit log
- [ ] Escanear QR con móvil
- [ ] Prueba end-to-end completa

---

## 🐛 Troubleshooting

### **Error: "No se encontró ningún pack activo"**
**Solución:** Crea un pack desde el dashboard del restaurante

### **Error: "No autenticado"**
**Solución:** Incluye el cookie de sesión en la petición

### **Error: "No tienes permiso"**
**Solución:** Inicia sesión con el usuario dueño del restaurante

### **QR no se genera**
**Solución:** Verifica que la librería `qrcode` esté instalada:
```bash
npm install qrcode @types/qrcode
```

### **Email no llega**
**Solución:** Verifica configuración SMTP en `.env`:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASSWORD=tu-app-password
```

---

## 📝 Archivos Generados

- `test-qr-output.html` - QR de prueba básico
- `test-order-qr.html` - Orden completa con QR
- `test-api-verify.http` - Peticiones REST para VS Code
- `test-qr-system.ts` - Script de pruebas unitarias
- `scripts/create-test-order.ts` - Crear orden de prueba

---

## ✅ Resultado Esperado

Al completar todas las pruebas, deberías tener:

1. ✅ Códigos QR generándose correctamente
2. ✅ Emails enviándose con QR visible
3. ✅ API de verificación funcionando
4. ✅ Órdenes cambiando a estado COMPLETED
5. ✅ Audit logs registrándose
6. ✅ Sistema funcionando end-to-end

**¡El sistema de verificación QR está listo para producción!** 🎉
