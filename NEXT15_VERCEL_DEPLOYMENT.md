# Despliegue de Next.js 15 en Vercel

## ✅ Cambios Realizados

### Actualización Completada
- **Next.js**: 13.5.4 → 15.5.4
- **React**: 18.3.1 (última versión estable)
- **Build**: ✅ Exitoso localmente
- **Git**: ✅ Push completado a GitHub

## 🚀 Despliegue Automático en Vercel

Vercel detectará automáticamente los cambios y comenzará un nuevo deployment. El proceso incluye:

1. **Detección automática**: Vercel detecta el push a `main`
2. **Build automático**: Ejecuta `npm run build` con Next.js 15
3. **Despliegue**: Si el build es exitoso, despliega automáticamente

## ⚠️ Consideraciones Importantes

### 1. Node.js Version
Next.js 15 requiere **Node.js 18.18.0 o superior**. Vercel usa Node.js 20 por defecto, así que está bien.

### 2. Variables de Entorno
Asegúrate de que todas las variables de entorno estén configuradas en Vercel:

```bash
# Database
DATABASE_URL=

# NextAuth
NEXTAUTH_URL=https://tu-dominio.vercel.app
NEXTAUTH_SECRET=

# Google OAuth (si lo usas)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Stripe
STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Email (SMTP)
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASSWORD=

# VAPID Keys
NEXT_PUBLIC_VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_SUBJECT=
```

### 3. Breaking Changes de Next.js 15

#### Parámetros de Ruta (Ya Migrados ✅)
Los parámetros dinámicos ahora son `Promise`:
```typescript
// Antes (Next.js 13)
export async function GET(req, { params }: { params: { id: string } }) {
  const id = params.id
}

// Ahora (Next.js 15) ✅
export async function GET(req, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
}
```

#### Headers API (Ya Migrado ✅)
```typescript
// Antes
import { headers } from 'next/headers'
const headersList = headers()
const sig = headersList.get('stripe-signature')

// Ahora ✅
const sig = request.headers.get('stripe-signature')
```

## 📊 Monitorear el Despliegue

### En Vercel Dashboard:
1. Ve a https://vercel.com/dashboard
2. Selecciona tu proyecto
3. Ve a la pestaña "Deployments"
4. Verifica que el build esté en progreso o completado

### Si el Build Falla:
1. Revisa los logs en Vercel
2. Verifica que todas las variables de entorno estén configuradas
3. Asegúrate de que `DATABASE_URL` sea accesible desde Vercel

## 🔍 Verificar Después del Despliegue

### 1. Funcionalidad Básica
- [ ] La página principal carga correctamente
- [ ] El login funciona (NextAuth)
- [ ] Las rutas API responden

### 2. Funcionalidad Específica
- [ ] Crear/editar packs (rutas dinámicas)
- [ ] Procesar órdenes
- [ ] Webhooks de Stripe funcionan
- [ ] Emails se envían correctamente

### 3. Verificar Logs
```bash
# Ver logs en tiempo real
vercel logs tu-proyecto --follow
```

## 🐛 Solución de Problemas Comunes

### Error: "Module not found"
- Ejecuta `npm install` en Vercel (automático)
- Verifica que todas las dependencias estén en `package.json`

### Error: "Database connection failed"
- Verifica `DATABASE_URL` en variables de entorno
- Asegúrate de que la base de datos permita conexiones desde Vercel

### Error: "NEXTAUTH_URL is not set"
- Configura `NEXTAUTH_URL=https://tu-dominio.vercel.app` en Vercel

### Error en Webhooks de Stripe
- Actualiza la URL del webhook en Stripe Dashboard:
  - `https://tu-dominio.vercel.app/api/webhooks/stripe`
- Verifica `STRIPE_WEBHOOK_SECRET`

## 📝 Notas Adicionales

### Performance
Next.js 15 incluye mejoras de rendimiento:
- Mejor tree-shaking
- Optimización de imágenes mejorada
- Caché más eficiente

### Compatibilidad
- ✅ Compatible con Vercel
- ✅ Compatible con Prisma
- ✅ Compatible con NextAuth
- ✅ Compatible con Stripe (usando React 18)

### React 19
**Nota**: No actualizamos a React 19 porque `@stripe/react-stripe-js` aún no es compatible. Cuando Stripe actualice su librería, podremos migrar a React 19.

## 🎯 Próximos Pasos

1. **Monitorear el despliegue** en Vercel Dashboard
2. **Probar la aplicación** en producción
3. **Verificar webhooks** de Stripe
4. **Revisar logs** para detectar errores
5. **Actualizar Google OAuth** redirect URIs si es necesario

## 📞 Soporte

Si encuentras problemas:
1. Revisa los logs de Vercel
2. Verifica las variables de entorno
3. Compara con el build local exitoso
4. Revisa la documentación de Next.js 15: https://nextjs.org/docs

---

**Fecha de actualización**: 2025-10-07
**Versión Next.js**: 15.5.4
**Estado**: ✅ Build local exitoso, push completado
