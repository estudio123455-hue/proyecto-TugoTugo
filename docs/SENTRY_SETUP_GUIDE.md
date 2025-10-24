# 📊 Configuración de Sentry para Monitoreo

## 🎯 **¿Por qué Sentry?**
- ✅ **Error tracking** en tiempo real
- ✅ **Performance monitoring** 
- ✅ **Release tracking** automático
- ✅ **User context** para debugging
- ✅ **Alertas** por email/Slack

## 🚀 **Setup Rápido (5 minutos)**

### **Paso 1: Crear Cuenta en Sentry**
1. Ve a [sentry.io](https://sentry.io)
2. Crea cuenta gratuita (50k errores/mes)
3. Crea nuevo proyecto → **Next.js**
4. Copia tu **DSN**

### **Paso 2: Configurar en Vercel**
```bash
# En Vercel Environment Variables
SENTRY_DSN=https://abc123@o123456.ingest.sentry.io/123456
SENTRY_ORG=tu-organizacion
SENTRY_PROJECT=tugotugo
```

### **Paso 3: Verificar Configuración**
Ya tienes Sentry configurado en tu app. Verifica en:
```bash
https://tu-app.vercel.app/api/health
```

Debe mostrar:
```json
{
  "services": {
    "monitoring": "configured"
  }
}
```

## 🔧 **Configuración Avanzada**

### **Variables de Entorno Completas**
```bash
# Básicas (requeridas)
SENTRY_DSN=https://abc123@o123456.ingest.sentry.io/123456
SENTRY_ORG=tu-organizacion
SENTRY_PROJECT=tugotugo

# Avanzadas (opcionales)
SENTRY_AUTH_TOKEN=tu-auth-token
SENTRY_RELEASE=auto
SENTRY_ENVIRONMENT=production
```

### **Configuración de Alertas**
1. **Sentry Dashboard** → **Alerts**
2. **Create Alert Rule**
3. **Conditions**:
   - Errors > 10 in 5 minutes
   - Performance issues > 5 in 10 minutes
4. **Actions**: Email, Slack, Discord

## 📊 **Dashboards Recomendados**

### **Dashboard 1: Errores Críticos**
- Errores por endpoint
- Errores por usuario
- Tendencia de errores
- Top errores sin resolver

### **Dashboard 2: Performance**
- Tiempo de respuesta APIs
- Tiempo de carga páginas
- Core Web Vitals
- Database query time

### **Dashboard 3: Business Metrics**
- Órdenes creadas vs errores
- Pagos exitosos vs fallidos
- Emails enviados vs bounced
- Usuarios activos vs errores

## 🚨 **Alertas Críticas**

### **Nivel 1: Crítico (Inmediato)**
```yaml
Payment API Errors:
  condition: errors > 5 in 2 minutes
  endpoints: /api/mercadopago/*, /api/stripe/*
  action: SMS + Email + Slack

Database Connection:
  condition: errors > 3 in 1 minute  
  message: "Database connection failed"
  action: SMS + Email

Auth System Down:
  condition: errors > 10 in 5 minutes
  endpoints: /api/auth/*
  action: Email + Slack
```

### **Nivel 2: Importante (15 minutos)**
```yaml
Email System:
  condition: errors > 20 in 15 minutes
  message: "Email delivery failing"
  action: Email + Slack

High Error Rate:
  condition: error_rate > 5% in 10 minutes
  action: Email

Performance Degradation:
  condition: p95_response_time > 2000ms in 15 minutes
  action: Slack
```

### **Nivel 3: Monitoreo (1 hora)**
```yaml
General Errors:
  condition: errors > 50 in 1 hour
  action: Email

User Experience:
  condition: core_web_vitals > threshold
  action: Weekly report
```

## 📈 **Métricas Clave a Monitorear**

### **Técnicas**
- **Error Rate**: < 1%
- **Response Time**: < 500ms p95
- **Uptime**: > 99.9%
- **Database Queries**: < 100ms avg

### **Negocio**
- **Conversion Rate**: Checkout → Payment
- **Payment Success**: > 95%
- **Email Delivery**: > 98%
- **User Satisfaction**: Errores por usuario

## 🔍 **Debugging con Sentry**

### **Información que Captura**
```javascript
// Contexto automático
{
  user: { id, email, name },
  request: { url, method, headers },
  environment: "production",
  release: "commit-sha",
  tags: { component, feature },
  extra: { custom_data }
}
```

### **Breadcrumbs Útiles**
- User actions (click, navigation)
- API calls (request/response)
- Database queries
- Payment attempts
- Email sends

### **Custom Context**
```javascript
// En tus APIs
Sentry.setContext('payment', {
  provider: 'mercadopago',
  amount: 15000,
  orderId: 'order-123'
})
```

## 🛠️ **Integración con Desarrollo**

### **GitHub Integration**
1. **Sentry** → **Settings** → **Integrations**
2. **GitHub** → **Install**
3. **Link Repository**: tu-repo
4. **Auto-resolve** issues on deploy

### **Slack Integration**
1. **Sentry** → **Settings** → **Integrations**
2. **Slack** → **Install**
3. **Configure Channel**: #alerts
4. **Set Notification Rules**

### **Release Tracking**
```bash
# Automático con Vercel
SENTRY_RELEASE=$VERCEL_GIT_COMMIT_SHA
```

## 📊 **Reports y Analytics**

### **Weekly Report**
- Errores nuevos vs resueltos
- Performance trends
- Top problematic endpoints
- User impact metrics

### **Monthly Report**
- Overall health score
- Improvement recommendations
- Cost analysis
- User experience metrics

## ✅ **Checklist de Configuración**

### **Setup Básico**
- [ ] Cuenta Sentry creada
- [ ] Proyecto configurado
- [ ] DSN en variables de entorno
- [ ] Health check muestra "configured"

### **Alertas**
- [ ] Alertas críticas configuradas
- [ ] Canales de notificación (email/Slack)
- [ ] Umbrales apropiados definidos
- [ ] Testing de alertas realizado

### **Dashboards**
- [ ] Dashboard de errores
- [ ] Dashboard de performance
- [ ] Dashboard de business metrics
- [ ] Acceso compartido con equipo

### **Integración**
- [ ] GitHub conectado
- [ ] Slack configurado
- [ ] Release tracking activo
- [ ] Custom context implementado

## 🚨 **Troubleshooting**

### **Sentry no recibe errores**
- Verificar DSN en variables de entorno
- Confirmar que app está en producción
- Revisar network tab por requests a Sentry

### **Demasiadas alertas**
- Ajustar umbrales de alertas
- Filtrar errores conocidos
- Configurar rate limiting

### **Performance lenta**
- Reducir sample rate
- Filtrar transacciones innecesarias
- Optimizar before_send hooks

---
**🎯 Resultado: Monitoreo completo con alertas inteligentes y debugging eficiente**
