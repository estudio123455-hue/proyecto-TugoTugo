# 🧹 Guía para Limpiar la Base de Datos

## 🚀 Métodos Disponibles

### **Método 1: API Endpoints (Recomendado)**

#### **Eliminar TODO:**
```powershell
Invoke-RestMethod -Uri "https://app-rho-sandy.vercel.app/api/admin/cleanup?token=admin-cleanup-token-123" -Method DELETE
```

#### **Eliminar solo PACKS:**
```powershell
Invoke-RestMethod -Uri "https://app-rho-sandy.vercel.app/api/admin/cleanup?token=admin-cleanup-token-123&action=packs-only" -Method POST
```

#### **Eliminar solo RESTAURANTES:**
```powershell
Invoke-RestMethod -Uri "https://app-rho-sandy.vercel.app/api/admin/cleanup?token=admin-cleanup-token-123&action=establishments-only" -Method POST
```

### **Método 2: Script Local**

#### **Eliminar TODO:**
```powershell
npx tsx scripts/cleanup-database.ts all
```

#### **Eliminar solo PACKS:**
```powershell
npx tsx scripts/cleanup-database.ts packs
```

#### **Eliminar solo RESTAURANTES:**
```powershell
npx tsx scripts/cleanup-database.ts establishments
```

## 📋 Orden de Eliminación

El sistema elimina los datos en el orden correcto para respetar las foreign keys:

1. **Órdenes** (orders)
2. **Packs** (packs) 
3. **Posts** (posts)
4. **Reviews** (reviews)
5. **Favoritos** (favorites)
6. **Menu Items** (menuItems)
7. **Establecimientos** (establishments)
8. **Cuentas** (accounts)
9. **Sesiones** (sessions)
10. **Usuarios** (users)
11. **Datos auxiliares** (emailVerification, auditLog, etc.)

## ⚠️ Importante

- **Backup:** Siempre haz backup antes de limpiar
- **Producción:** NUNCA uses estos endpoints en producción
- **Token:** Cambia el token en producción por uno seguro
- **Confirmación:** Los comandos NO piden confirmación

## 🔧 Configuración del Token

Para cambiar el token de administración, agrega en tus variables de entorno:

```env
ADMIN_TOKEN=tu-token-super-seguro-aqui
```

## 📊 Respuesta del API

El endpoint devuelve información detallada:

```json
{
  "message": "Database cleaned successfully! 🧹",
  "before": {
    "orders": 15,
    "packs": 6,
    "establishments": 2,
    "users": 3
  },
  "after": {
    "orders": 0,
    "packs": 0,
    "establishments": 0,
    "users": 0
  },
  "deleted": {
    "orders": 15,
    "packs": 6,
    "establishments": 2,
    "users": 3
  }
}
```

## 🎯 Casos de Uso

### **Durante Desarrollo:**
- Limpiar datos de prueba
- Resetear para nuevas pruebas
- Eliminar datos corruptos

### **Antes de Producción:**
- Limpiar todos los datos de desarrollo
- Preparar base de datos limpia

### **Testing:**
- Limpiar entre tests
- Crear estados conocidos
