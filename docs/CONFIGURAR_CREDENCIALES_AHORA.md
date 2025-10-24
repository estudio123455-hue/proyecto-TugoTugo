# 🔑 Configurar Credenciales de MercadoPago - AHORA

## ✅ **Tus Credenciales (Ya las tienes!)**

```
Public Key: TEST-567494d9-fd53-4c37-8148-fc60f0940e78
Access Token: TEST-5959445917314837-101419-d8d9210d58a47d93f49513e4c318ee33-370982518
```

## 🚀 **Pasos para Configurar (2 minutos):**

### **1. Crear archivo .env**
En la raíz de tu proyecto (`c:\Users\PERSONAL\OneDrive\Documentos\app\`), crea un archivo llamado `.env` (sin extensión) y agrega:

```env
# Database (usa la que ya tienes)
DATABASE_URL="tu-database-url-actual"

# NextAuth (usa la que ya tienes)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="tu-secret-actual"

# Mercado Pago - NUEVAS CREDENCIALES
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY="TEST-567494d9-fd53-4c37-8148-fc60f0940e78"
MERCADOPAGO_ACCESS_TOKEN="TEST-5959445917314837-101419-d8d9210d58a47d93f49513e4c318ee33-370982518"
MERCADOPAGO_WEBHOOK_SECRET="tugotug-webhook-secret-2024"
```

### **2. Verificar que funciona**
```bash
# Reiniciar el servidor
npm run dev

# Probar la integración
npm run test:mercadopago
```

### **3. Probar en el navegador**
```
http://localhost:3000/example-checkout
http://localhost:3000/payment-methods
```

---

## 🧪 **Comandos de Prueba Rápida:**

### **Opción 1: Script TypeScript**
```bash
npm run test:mercadopago
```

### **Opción 2: Script PowerShell**
```powershell
.\scripts\test-payment-methods-simple.ps1 -AccessToken "TEST-5959445917314837-101419-d8d9210d58a47d93f49513e4c318ee33-370982518"
```

### **Opción 3: Curl directo**
```bash
curl -X GET "https://api.mercadopago.com/v1/payment_methods" \
  -H "Authorization: Bearer TEST-5959445917314837-101419-d8d9210d58a47d93f49513e4c318ee33-370982518"
```

---

## 🎯 **Lo que deberías ver:**

### **✅ Si funciona correctamente:**
- Lista de métodos de pago disponibles (Visa, Mastercard, etc.)
- Checkout demo funcionando
- Sin errores en la consola

### **❌ Si hay problemas:**
- Error "MERCADOPAGO_ACCESS_TOKEN no configurado"
- Error 403 Forbidden
- Página en blanco

---

## 🚨 **Solución de Problemas Rápidos:**

### **Error: "ACCESS_TOKEN no configurado"**
```bash
# Verificar que el archivo .env existe
ls -la .env

# Reiniciar servidor
npm run dev
```

### **Error: 403 Forbidden**
- Verificar que copiaste las credenciales correctamente
- Asegurar que no hay espacios extra
- Confirmar que son credenciales de TEST

### **Error: Módulo no encontrado**
```bash
# Instalar dependencias si falta algo
npm install
```

---

## 🎊 **¡Una vez configurado podrás:**

### **🛒 Crear pagos reales**
```tsx
<MercadoPagoButton
  items={[{
    id: 'pack_123',
    title: 'Pack Italiano',
    quantity: 1,
    unit_price: 2500.00
  }]}
  orderId="order_abc123"
>
  Pagar $2,500
</MercadoPagoButton>
```

### **💳 Ver métodos disponibles**
```
http://localhost:3000/payment-methods
```

### **🧪 Probar checkout completo**
```
http://localhost:3000/example-checkout
```

---

## 📞 **Si necesitas ayuda:**

1. **Copia y pega** el error exacto que ves
2. **Verifica** que el archivo `.env` está en la raíz del proyecto
3. **Reinicia** el servidor después de crear el `.env`
4. **Prueba** con los comandos de arriba

**¡En 2 minutos tendrás MercadoPago funcionando completamente!** 🚀
