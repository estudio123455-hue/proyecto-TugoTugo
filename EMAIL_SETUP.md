# 📧 Sistema de Emails de FoodSave

## ✅ Estado Actual: IMPLEMENTADO

El sistema de emails de FoodSave está **completamente implementado** y funcional. Aquí te explico cómo funciona y cómo configurarlo:

## 🎯 Funcionalidades Implementadas

### 1. **Email de Confirmación de Pedido** ✅
- **Cuándo se envía:** Automáticamente cuando se confirma el pago via Stripe webhook
- **Contenido:** 
  - Detalles completos del pedido
  - Información de recogida (lugar, fecha, horario)
  - Recordatorios importantes
  - Diseño responsive y profesional en español

### 2. **Email de Recordatorio de Recogida** ✅
- **Cuándo se envía:** 
  - Automáticamente 24 horas antes del pickup
  - También 2 horas antes (recordatorio urgente)
  - Manualmente desde el dashboard del restaurante
- **Contenido:**
  - Recordatorio amigable
  - Detalles de ubicación y horario
  - Lista de qué llevar
  - Información de contacto del restaurante

### 3. **Sistema de Recordatorios Automáticos** ✅
- **Endpoint:** `/api/cron/pickup-reminders`
- **Funcionalidad:** Envía recordatorios automáticos basados en horarios

## 🔧 Configuración Requerida

### Variables de Entorno (.env)
```bash
# SMTP Configuration (ya configurado)
SMTP_HOST=tu_smtp_host
SMTP_PORT=587
SMTP_USER=tu_email@dominio.com
SMTP_PASSWORD=tu_contraseña_smtp

# Para cron jobs (opcional, para seguridad)
CRON_SECRET=tu_secreto_para_cron_jobs
```

## 🚀 Cómo Configurar Recordatorios Automáticos

### Opción 1: Vercel Cron Jobs (Recomendado)

1. **Crear archivo `vercel.json` en la raíz del proyecto:**
```json
{
  "crons": [
    {
      "path": "/api/cron/pickup-reminders",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

2. **El cron se ejecutará automáticamente cada 6 horas**

### Opción 2: Servicio Externo (EasyCron, cron-job.org)

**URL a llamar:** `https://tu-dominio.vercel.app/api/cron/pickup-reminders`
**Frecuencia recomendada:** Cada 6 horas
**Método:** GET
**Headers (opcional):** 
```
Authorization: Bearer TU_CRON_SECRET
```

### Opción 3: GitHub Actions

```yaml
name: Send Pickup Reminders
on:
  schedule:
    - cron: '0 */6 * * *'
jobs:
  send-reminders:
    runs-on: ubuntu-latest
    steps:
      - name: Call reminder endpoint
        run: |
          curl -X GET "https://tu-dominio.vercel.app/api/cron/pickup-reminders" \
               -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

## 📱 Cómo Funciona el Flujo Actual

### 1. **Usuario Hace Pedido**
```
Usuario completa compra → Stripe procesa pago → Webhook confirma pedido → Email automático de confirmación
```

### 2. **Sistema de Recordatorios**
```
Cron job ejecuta → Busca pedidos para mañana → Envía recordatorios → Actualiza estado a READY_FOR_PICKUP
```

### 3. **Recordatorio Manual**
```
Restaurante en dashboard → Botón "Enviar Recordatorio" → API call → Email inmediato
```

## 🎨 Diseño de Emails

Los emails incluyen:
- ✅ **Diseño responsive** para móvil y desktop
- ✅ **Gradientes y colores** de la marca FoodSave
- ✅ **Íconos y emojis** para mejor UX
- ✅ **Información clara** y bien organizada
- ✅ **Llamadas a la acción** evidentes
- ✅ **Formato en español** adaptado a Colombia

## 🧪 Cómo Probar

### 1. **Probar Email de Confirmación**
- Hacer un pedido real en la app
- Completar el pago con Stripe
- Verificar que llega el email de confirmación

### 2. **Probar Recordatorio Manual**
```bash
curl -X POST "https://tu-dominio.vercel.app/api/orders/ID_DEL_PEDIDO/remind" \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer TOKEN_DE_SESION"
```

### 3. **Probar Cron Job**
```bash
curl -X GET "https://tu-dominio.vercel.app/api/cron/pickup-reminders" \
     -H "Authorization: Bearer TU_CRON_SECRET"
```

## 📊 Monitoreo

El sistema incluye logging completo:
- ✅ Confirmación de emails enviados
- ✅ Errores detallados si algo falla
- ✅ Estadísticas del cron job (cuántos recordatorios se enviaron)

## 🔍 Archivos Clave

- `src/lib/email.ts` - Funciones de envío de emails
- `src/app/api/webhooks/stripe/route.ts` - Webhook que envía confirmaciones
- `src/app/api/orders/[id]/remind/route.ts` - Recordatorio manual
- `src/app/api/cron/pickup-reminders/route.ts` - Recordatorios automáticos

## 🎯 Próximos Pasos Recomendados

1. **Configurar el cron job** usando una de las opciones arriba
2. **Probar con pedidos reales** para verificar funcionamiento
3. **Monitorear logs** para asegurar que todo funciona
4. **Opcional:** Agregar más tipos de emails (bienvenida, cancelación, etc.)

¡El sistema está listo para producción! 🚀
