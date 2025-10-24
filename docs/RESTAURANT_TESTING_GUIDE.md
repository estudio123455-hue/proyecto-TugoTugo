# 🏪 Guía para Probar el Sistema de Restaurantes

## 🔑 Credenciales de Prueba

### Restaurante 1: El Buen Sabor
- **Email:** `demo.restaurant@foodsave.com`
- **Contraseña:** `123456`
- **Rol:** ESTABLISHMENT

### Restaurante 2: Pizzería Italiana  
- **Email:** `pizzeria@demo.com`
- **Contraseña:** `123456`
- **Rol:** ESTABLISHMENT

## 📋 Cómo Probar el Sistema

### 1. **Iniciar Sesión como Restaurante**
```
1. Ve a: https://app-rho-sandy.vercel.app/auth
2. Usa las credenciales de arriba
3. Serás redirigido al dashboard del restaurante
```

### 2. **Acceder al Dashboard**
```
URL: https://app-rho-sandy.vercel.app/restaurant/dashboard
```

### 3. **Crear un Nuevo Pack**
En el dashboard podrás:
- ✅ Ver estadísticas de tu restaurante
- ✅ Gestionar packs existentes
- ✅ Crear nuevos packs
- ✅ Editar/eliminar packs
- ✅ Activar/desactivar packs

### 4. **Estructura de un Pack**
```json
{
  "title": "Pack Almuerzo Especial",
  "description": "Bandeja paisa completa con bebida",
  "originalPrice": 35000,
  "discountedPrice": 18000,
  "quantity": 10,
  "availableFrom": "2025-10-12T12:00:00Z",
  "availableUntil": "2025-10-12T14:00:00Z",
  "pickupTimeStart": "12:00",
  "pickupTimeEnd": "14:00"
}
```

## 🔄 Flujo de Trabajo Real

### **Para Restaurantes:**
1. Registrarse en la plataforma
2. Completar verificación (admin aprueba)
3. Acceder al dashboard
4. Crear packs diariamente
5. Gestionar pedidos
6. Ver estadísticas

### **Para Clientes:**
1. Buscar restaurantes cercanos
2. Ver packs disponibles
3. Hacer pedidos
4. Pagar online
5. Recoger comida con código QR

## 🎯 APIs Disponibles

### **Para Restaurantes:**
- `GET /api/restaurant/packs` - Ver mis packs
- `POST /api/packs` - Crear nuevo pack
- `PUT /api/packs/[id]` - Editar pack
- `DELETE /api/packs/[id]` - Eliminar pack
- `GET /api/restaurant/stats` - Estadísticas
- `GET /api/restaurant/my-establishment` - Mi restaurante

### **Para Clientes:**
- `GET /api/packs/public` - Ver packs disponibles
- `POST /api/orders` - Crear pedido
- `GET /api/orders` - Mis pedidos

## 🚀 Próximos Pasos

1. **Probar el sistema** con las credenciales de prueba
2. **Crear packs reales** desde el dashboard
3. **Verificar** que aparezcan en la app principal
4. **Simular pedidos** como cliente
5. **Iterar** y mejorar la UX
