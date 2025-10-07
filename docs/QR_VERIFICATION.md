# Sistema de Verificación QR para Órdenes

## 📋 Descripción

Sistema de códigos QR únicos para verificar órdenes de clientes en restaurantes. Cada orden confirmada genera un código QR que el cliente presenta al restaurante para completar la recogida.

## 🔄 Flujo del Sistema

### 1. **Compra del Cliente**
- Cliente realiza pedido y paga con Stripe
- Sistema genera código de verificación único (12 caracteres hexadecimales)
- Se crea código QR con información de la orden
- Email de confirmación incluye:
  - Código QR (imagen)
  - Código alfanumérico (backup)

### 2. **Recogida en Restaurante**
- Cliente muestra el código QR o código alfanumérico
- Restaurante escanea el QR o ingresa el código manualmente
- Sistema verifica y marca la orden como completada

### 3. **Verificación**
- Solo el restaurante dueño del pack puede verificar
- Orden debe estar en estado `CONFIRMED`
- No se puede verificar dos veces
- Se registra timestamp de verificación

## 🔧 Componentes Técnicos

### Base de Datos (Prisma Schema)

```prisma
model Order {
  verificationCode String?   @unique  // Código único para verificación
  verifiedAt       DateTime?          // Timestamp de verificación
  // ... otros campos
}
```

### Servicios

#### `/src/lib/qrcode.ts`
- `generateVerificationCode()` - Genera código único
- `generateOrderQRCode()` - Crea imagen QR en base64
- `isValidVerificationCode()` - Valida formato del código

### API Endpoints

#### `POST /api/orders/verify`
Verifica y completa una orden.

**Request:**
```json
{
  "verificationCode": "A1B2C3D4E5F6"
}
```

**Response (éxito):**
```json
{
  "success": true,
  "message": "Orden verificada exitosamente",
  "data": {
    "orderId": "...",
    "customerName": "Juan Pérez",
    "customerEmail": "juan@example.com",
    "packTitle": "Pack Sorpresa",
    "quantity": 2,
    "totalAmount": 20000,
    "verifiedAt": "2025-10-07T20:30:00Z"
  }
}
```

**Errores posibles:**
- `401` - No autenticado
- `400` - Código inválido o faltante
- `404` - Orden no encontrada
- `403` - No tienes permiso (no eres el dueño del restaurante)
- `400` - Orden ya verificada o en estado incorrecto

#### `GET /api/orders/verify?code=A1B2C3D4E5F6`
Consulta información de una orden sin marcarla como completada.

**Response:**
```json
{
  "success": true,
  "data": {
    "orderId": "...",
    "status": "CONFIRMED",
    "verifiedAt": null,
    "customer": {
      "name": "Juan Pérez",
      "email": "juan@example.com"
    },
    "pack": {
      "title": "Pack Sorpresa",
      "description": "..."
    },
    "quantity": 2,
    "totalAmount": 20000,
    "pickupDate": "2025-10-08T18:00:00Z",
    "pickupTimeStart": "18:00",
    "pickupTimeEnd": "20:00"
  }
}
```

## 📧 Email de Confirmación

El email incluye:
- **Código QR visual** (imagen de 250x250px)
- **Código alfanumérico** (backup si no puede escanear)
- Información de la orden
- Detalles de recogida
- Instrucciones

## 🔐 Seguridad

### Generación de Códigos
- Usa `crypto.randomBytes(6)` para generar códigos únicos
- Formato: 12 caracteres hexadecimales (A-F, 0-9)
- Ejemplo: `A1B2C3D4E5F6`

### Validaciones
1. ✅ Código debe existir en la base de datos
2. ✅ Usuario debe ser dueño del restaurante
3. ✅ Orden debe estar en estado `CONFIRMED`
4. ✅ Orden no debe haber sido verificada previamente
5. ✅ Formato del código debe ser válido

### Auditoría
Cada verificación se registra en `AuditLog` con:
- Acción: `UPDATE`
- Tipo: `ORDER`
- Usuario que verificó
- Metadata del restaurante

## 🚀 Uso en Desarrollo

### 1. Aplicar Migración de Base de Datos

```bash
npx prisma db push
```

o crear migración:

```bash
npx prisma migrate dev --name add_order_verification
```

### 2. Regenerar Prisma Client

```bash
npx prisma generate
```

### 3. Configurar Variables de Entorno

Asegúrate de tener configurado:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASSWORD=tu-app-password
```

### 4. Probar el Sistema

1. Crear una orden de prueba
2. Simular pago exitoso (webhook de Stripe)
3. Verificar que llegue el email con QR
4. Usar el endpoint de verificación

## 📱 Integración Frontend (Próximos Pasos)

### Para Restaurantes

Crear componente de escaneo QR:

```typescript
// Opción 1: Escanear con cámara
import QrScanner from 'qr-scanner'

// Opción 2: Input manual
<input 
  type="text" 
  placeholder="Código de verificación"
  pattern="[A-F0-9]{12}"
/>

// Llamar al API
const verifyOrder = async (code: string) => {
  const response = await fetch('/api/orders/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ verificationCode: code })
  })
  return response.json()
}
```

### Librerías Recomendadas
- `qr-scanner` - Escanear QR con cámara
- `react-qr-reader` - Componente React para escaneo
- `html5-qrcode` - Alternativa ligera

## 🧪 Testing

### Caso de Prueba 1: Verificación Exitosa
```bash
# 1. Crear orden
# 2. Confirmar pago
# 3. Obtener código del email o DB
# 4. Verificar
curl -X POST http://localhost:3000/api/orders/verify \
  -H "Content-Type: application/json" \
  -d '{"verificationCode":"A1B2C3D4E5F6"}'
```

### Caso de Prueba 2: Código Inválido
```bash
curl -X POST http://localhost:3000/api/orders/verify \
  -H "Content-Type: application/json" \
  -d '{"verificationCode":"INVALID"}'
# Esperado: 400 Bad Request
```

### Caso de Prueba 3: Doble Verificación
```bash
# Verificar la misma orden dos veces
# Esperado: 400 "Esta orden ya fue verificada"
```

## 📊 Estados de Orden

```
PENDING → CONFIRMED → COMPLETED
   ↓
CANCELLED
```

- **PENDING**: Orden creada, esperando pago
- **CONFIRMED**: Pago confirmado, código QR generado
- **COMPLETED**: Cliente recogió el pedido (verificado)
- **CANCELLED**: Orden cancelada

## 🔍 Troubleshooting

### Email no llega con QR
- Verificar configuración SMTP
- Revisar logs del servidor
- Verificar que `qrCodeDataURL` se generó correctamente

### Código QR no escanea
- Aumentar tamaño de la imagen (actualmente 300x300)
- Verificar nivel de corrección de errores (actualmente 'H')
- Probar con diferentes apps de escaneo

### Error de permisos
- Verificar que el usuario autenticado sea dueño del restaurante
- Revisar relación `establishment.userId === session.user.id`

## 📝 Notas

- Los códigos QR contienen JSON con `orderId`, `code` y `timestamp`
- El código alfanumérico es suficiente para verificar (no requiere escaneo)
- Sistema diseñado para ser offline-friendly (código manual)
- Audit log completo de todas las verificaciones
