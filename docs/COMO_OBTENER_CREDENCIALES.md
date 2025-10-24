# 🔑 Cómo Obtener Credenciales de MercadoPago

## 🚨 **Tu token actual no es válido**

El error `403 Prohibido` indica que el token que estás usando:
- ❌ No es válido
- ❌ Ha expirado  
- ❌ No tiene los permisos necesarios
- ❌ Está mal formateado

## 📋 **Pasos para obtener credenciales válidas:**

### **1. Crear Cuenta de Desarrollador**
1. Ve a [developers.mercadopago.com](https://developers.mercadopago.com)
2. Inicia sesión con tu cuenta de MercadoPago
3. Si no tienes cuenta, créala gratis

### **2. Crear una Aplicación**
1. En el panel, haz clic en **"Crear aplicación"**
2. Completa los datos:
   - **Nombre**: TugoTugo App
   - **Descripción**: Aplicación de delivery de comida
   - **Categoría**: Marketplace
   - **Modelo de integración**: Checkout Pro o API
3. Guarda la aplicación

### **3. Obtener Credenciales de PRUEBA**
1. Ve a **"Credenciales"** en tu aplicación
2. Selecciona **"Credenciales de prueba"**
3. Copia:
   - **Clave pública**: `TEST-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
   - **Access token**: `TEST-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-xxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-xxxxxxxx`

### **4. Formato Correcto**
Las credenciales válidas se ven así:

```
Clave Pública (Frontend):
TEST-12345678-1234-1234-1234-123456789012

Access Token (Backend):  
TEST-1234567890123456789012345678901234567890-123456-1234567890123456789012345678901234567890-12345678
```

## 🧪 **Probar Sin Credenciales (Demo)**

Mientras obtienes las credenciales, puedes probar con datos de ejemplo:

### **Ejecutar Demo Local**
```bash
# Iniciar el servidor
npm run dev

# Visitar en el navegador
http://localhost:3000/example-checkout
http://localhost:3000/payment-methods
```

### **Ver Métodos de Ejemplo**
Los componentes React mostrarán datos de ejemplo si no hay credenciales configuradas.

## 🔧 **Configurar Credenciales**

### **Opción 1: Archivo .env**
```env
# Agregar a tu archivo .env
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY="TEST-tu-clave-publica-aqui"
MERCADOPAGO_ACCESS_TOKEN="TEST-tu-access-token-aqui"
MERCADOPAGO_WEBHOOK_SECRET="tu-secreto-personalizado"
```

### **Opción 2: Variables de Entorno Temporales**
```bash
# En PowerShell
$env:MERCADOPAGO_ACCESS_TOKEN="TEST-tu-token-aqui"
npm run test:payment-methods

# En CMD
set MERCADOPAGO_ACCESS_TOKEN=TEST-tu-token-aqui
npm run test:payment-methods
```

### **Opción 3: Script Directo**
```powershell
# Usar el script con tu token real
.\scripts\test-payment-methods-simple.ps1 -AccessToken "TEST-tu-token-real-aqui"
```

## 🌍 **Credenciales por País**

### **Argentina** 🇦🇷
- Moneda: ARS (Pesos Argentinos)
- Métodos: Visa, Mastercard, Mercado Pago, Rapipago, Pago Fácil

### **México** 🇲🇽  
- Moneda: MXN (Pesos Mexicanos)
- Métodos: Visa, Mastercard, OXXO, SPEI

### **Colombia** 🇨🇴
- Moneda: COP (Pesos Colombianos)  
- Métodos: Visa, Mastercard, PSE, Efecty

### **Chile** 🇨🇱
- Moneda: CLP (Pesos Chilenos)
- Métodos: Visa, Mastercard, Redcompra

## ⚠️ **Importante**

### **Credenciales de Prueba vs Producción**
- ✅ **TEST**: Para desarrollo, no procesa dinero real
- ⚠️ **PROD**: Para producción, procesa dinero real

### **Seguridad**
- 🔒 Nunca hardcodees credenciales en el código
- 🔒 Usa variables de entorno
- 🔒 No subas credenciales a Git
- 🔒 Rota credenciales regularmente

## 🆘 **Si sigues teniendo problemas:**

### **1. Verificar Estado de la Cuenta**
- Confirma que tu cuenta de MercadoPago esté activa
- Verifica que no tengas restricciones

### **2. Contactar Soporte**
- Email: developers@mercadopago.com
- Documentación: [mercadopago.com/developers](https://mercadopago.com/developers)
- Comunidad: [github.com/mercadopago](https://github.com/mercadopago)

### **3. Alternativas Temporales**
- Usar la demo local sin credenciales
- Probar con datos mockeados
- Revisar la documentación oficial

---

## 🎯 **Próximo Paso**

1. **Obtén credenciales válidas** siguiendo los pasos de arriba
2. **Configúralas** en tu archivo `.env`
3. **Prueba** con `npm run test:payment-methods`
4. **Visita** `/example-checkout` para ver la demo completa

**¡Una vez que tengas credenciales válidas, toda la integración funcionará perfectamente!** 🚀
