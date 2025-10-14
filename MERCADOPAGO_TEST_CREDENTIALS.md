# 🧪 Credenciales de Prueba - Mercado Pago

## 🔑 Cómo Obtener las Credenciales

### 1. Crear Cuenta de Desarrollador
1. Ve a [developers.mercadopago.com](https://developers.mercadopago.com)
2. Inicia sesión con tu cuenta de Mercado Pago
3. Si no tienes cuenta, créala gratis

### 2. Obtener Credenciales de Prueba
1. En el panel de desarrollador, ve a **"Tus integraciones"**
2. Crea una nueva aplicación o selecciona una existente
3. Ve a la sección **"Credenciales"**
4. Copia las credenciales de **PRUEBA** (no las de producción)

### 3. Configurar Variables de Entorno

Reemplaza en tu archivo `.env`:

```env
# Mercado Pago - CREDENCIALES DE PRUEBA
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY="TEST-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
MERCADOPAGO_ACCESS_TOKEN="TEST-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-xxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-xxxxxxxx"
MERCADOPAGO_WEBHOOK_SECRET="tu-secreto-personalizado"
```

## 👥 Usuarios de Prueba

### Crear Usuarios de Prueba
En el panel de MercadoPago:
1. Ve a **"Cuentas de prueba"**
2. Crea un **Vendedor** y un **Comprador**

### Ejemplo de Usuarios
```
Vendedor (tu aplicación):
- Email: vendedor_test_123@testuser.com
- Password: qatest123

Comprador (para probar pagos):
- Email: comprador_test_456@testuser.com  
- Password: qatest123
```

## 💳 Tarjetas de Prueba

### Argentina (ARS)
```
Visa Aprobada:
Número: 4509 9535 6623 3704
CVV: 123
Vencimiento: 11/25
Nombre: APRO

Mastercard Aprobada:
Número: 5031 7557 3453 0604
CVV: 123
Vencimiento: 11/25
Nombre: APRO

Visa Rechazada:
Número: 4013 5406 8274 6260
CVV: 123
Vencimiento: 11/25
Nombre: OTHE
```

### Otros Países

#### México (MXN)
```
Visa: 4075 5957 1648 3764
Mastercard: 5474 9254 3267 0366
```

#### Colombia (COP)
```
Visa: 4013 5406 8274 6260
Mastercard: 5031 7557 3453 0604
```

#### Chile (CLP)
```
Visa: 4168 8188 4444 7115
Mastercard: 5031 7557 3453 0604
```

## 🧪 Escenarios de Prueba

### Estados de Pago para Probar

1. **Pago Aprobado**
   - Usar tarjeta con nombre "APRO"
   - Estado final: `approved`

2. **Pago Rechazado**
   - Usar tarjeta con nombre "OTHE"
   - Estado final: `rejected`

3. **Pago Pendiente**
   - Usar tarjeta con nombre "PEND"
   - Estado final: `pending`

4. **Pago en Proceso**
   - Usar tarjeta con nombre "PROC"
   - Estado final: `in_process`

### Montos Especiales

```
$1 - $1000: Pago aprobado
$1001 - $1010: Pago pendiente
$1011 - $1020: Pago rechazado
$1021+: Pago en proceso
```

## 🔧 Configuración del Webhook

### URL de Desarrollo (ngrok)
Si estás desarrollando localmente:

1. Instala ngrok: `npm install -g ngrok`
2. Ejecuta: `ngrok http 3000`
3. Usa la URL HTTPS generada: `https://abc123.ngrok.io/api/mercadopago/webhook`

### URL de Producción
```
https://tu-dominio.com/api/mercadopago/webhook
```

## ✅ Lista de Verificación

- [ ] Credenciales de prueba configuradas
- [ ] Usuarios de prueba creados
- [ ] Webhook configurado y funcionando
- [ ] Tarjetas de prueba probadas
- [ ] Estados de pago verificados
- [ ] Notificaciones funcionando
- [ ] Base de datos actualizándose correctamente

## 🚨 Importante

### ⚠️ NUNCA en Producción
- No uses credenciales de prueba en producción
- No hardcodees credenciales en el código
- Siempre usa variables de entorno

### 🔒 Seguridad
- Las credenciales de prueba son públicas
- Solo funcionan en entorno sandbox
- No procesan dinero real

## 🔄 Cambiar a Producción

Cuando estés listo para producción:

1. **Obtén credenciales reales**:
   - Ve a "Credenciales" > "Producción"
   - Copia la clave pública y el access token

2. **Actualiza variables de entorno**:
   ```env
   NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY="APP_USR-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
   MERCADOPAGO_ACCESS_TOKEN="APP_USR-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-xxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-xxxxxxxx"
   ```

3. **Configura webhook de producción**:
   - URL: `https://tu-dominio.com/api/mercadopago/webhook`
   - Eventos: `payment`

4. **Prueba con dinero real** (pequeñas cantidades primero)

---

## 📞 Soporte

- [Documentación oficial](https://www.mercadopago.com.ar/developers)
- [Centro de ayuda](https://www.mercadopago.com.ar/ayuda)
- [Comunidad de desarrolladores](https://www.mercadopago.com.ar/developers/community)
