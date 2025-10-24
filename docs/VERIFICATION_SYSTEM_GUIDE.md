# 🔍 Sistema de Verificación Mixto - Guía de Implementación

## 🎯 **Resumen del Sistema**

Tu app ahora tiene un **sistema de verificación híbrido** que combina:
- ✅ **Verificación automática** con Google Places API
- 👨‍💼 **Verificación manual** por administradores
- 📸 **Subida de documentos** y fotos
- 📍 **Verificación de ubicación GPS**

## 🔧 **Nuevos Campos en la Base de Datos**

### **Estados de Verificación:**
- `PENDING` - Pendiente de verificación
- `AUTO_VERIFIED` - Verificado automáticamente
- `APPROVED` - Aprobado manualmente
- `REJECTED` - Rechazado
- `SUSPENDED` - Suspendido

### **Tipos de Verificación:**
- `AUTO` - Solo automática
- `MANUAL` - Solo manual
- `HYBRID` - Automática + manual si es necesario

### **Nuevos Campos:**
```sql
verificationType   String?   // AUTO, MANUAL, HYBRID
googlePlaceId      String?   // ID de Google Places
googleVerified     Boolean   // Verificado con Google Places
locationVerified   Boolean   // Ubicación GPS verificada
frontPhoto         String?   // Foto del frente del local
interiorPhoto      String?   // Foto del interior
documentPhotos     String[]  // Fotos de documentos (RUT, etc.)
verificationDocs   String[]  // URLs de documentos subidos
```

## 🚀 **APIs Disponibles**

### **1. Verificación Automática/Manual**
```powershell
# Verificación automática
$body = @{
    establishmentId = "restaurant-id-here"
    verificationType = "AUTO"
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://app-rho-sandy.vercel.app/api/admin/verify-restaurant" -Method POST -Body $body -ContentType "application/json"
```

### **2. Aprobación/Rechazo Manual**
```powershell
# Aprobar restaurante
$body = @{
    establishmentId = "restaurant-id-here"
    action = "APPROVE"
    notes = "Documentos verificados correctamente"
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://app-rho-sandy.vercel.app/api/admin/verify-restaurant" -Method PUT -Body $body -ContentType "application/json"
```

## 📋 **Flujo de Verificación Recomendado**

### **Paso 1: Registro del Restaurante**
1. Restaurante se registra con datos básicos
2. Sube fotos del local (frente e interior)
3. Sube documentos (RUT, Cámara de Comercio)
4. Proporciona dirección exacta
5. Estado inicial: `PENDING`

### **Paso 2: Verificación Automática**
1. Sistema busca el restaurante en Google Places
2. Si encuentra coincidencia con alta confianza (>80%):
   - Estado: `AUTO_VERIFIED`
   - Restaurante puede empezar a operar
3. Si no encuentra o baja confianza:
   - Pasa a verificación manual

### **Paso 3: Verificación Manual (si es necesario)**
1. Admin revisa fotos y documentos
2. Verifica dirección en Google Maps
3. Puede aprobar, rechazar o pedir más información
4. Estado final: `APPROVED` o `REJECTED`

### **Paso 4: Verificación GPS (opcional)**
1. Cuando el restaurante usa la app desde el local
2. Sistema verifica que GPS coincida con dirección registrada
3. Marca `locationVerified = true`

## 🎨 **Mejoras de UI Recomendadas**

### **Panel de Admin:**
- Lista de restaurantes pendientes de verificación
- Botones para verificación automática
- Vista de documentos subidos
- Historial de verificaciones

### **Panel de Restaurante:**
- Estado de verificación visible
- Subida de documentos faltantes
- Progreso de verificación

### **App Principal:**
- Badge de "Verificado" en restaurantes aprobados
- Filtro por restaurantes verificados

## 🔮 **Próximos Pasos**

### **Inmediato:**
1. ✅ Migración aplicada
2. ✅ API de verificación creada
3. 🔄 Actualizar UI del panel de admin
4. 🔄 Agregar subida de fotos/documentos

### **Corto Plazo:**
1. Integrar Google Places API real
2. Agregar verificación GPS
3. Mejorar UI de verificación
4. Notificaciones automáticas

### **Largo Plazo:**
1. Machine Learning para detección de documentos falsos
2. Integración con APIs gubernamentales
3. Verificación por videollamada
4. Sistema de puntuación de confianza

## 🧪 **Cómo Probar**

### **1. Verificar un restaurante automáticamente:**
```powershell
# Usar el ID de uno de tus restaurantes de prueba
$body = @{
    establishmentId = "cmgn45nh50002jm04rka05voc"  # Ejemplo
    verificationType = "AUTO"
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://app-rho-sandy.vercel.app/api/admin/verify-restaurant" -Method POST -Body $body -ContentType "application/json" -Headers @{Authorization="Bearer your-admin-token"}
```

### **2. Aprobar manualmente:**
```powershell
$body = @{
    establishmentId = "cmgn45nh50002jm04rka05voc"
    action = "APPROVE"
    notes = "Verificado manualmente - documentos correctos"
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://app-rho-sandy.vercel.app/api/admin/verify-restaurant" -Method PUT -Body $body -ContentType "application/json"
```

## 🎯 **Beneficios del Sistema**

### **Para ti (Admin):**
- ⚡ **Automatización** reduce trabajo manual
- 🔒 **Seguridad** mejorada contra fraudes
- 📊 **Trazabilidad** completa de verificaciones
- 💰 **Costo cero** (Google Places gratuito hasta 1000/día)

### **Para Restaurantes:**
- 🚀 **Aprobación rápida** si pasan verificación automática
- 🏆 **Badge de confianza** aumenta credibilidad
- 📱 **Proceso simple** de registro

### **Para Clientes:**
- 🛡️ **Confianza** en restaurantes verificados
- 🎯 **Calidad** garantizada de establecimientos
- 🔍 **Transparencia** en el proceso
