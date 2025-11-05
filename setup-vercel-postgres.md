# Configurar Vercel Postgres - Guía Rápida

## 1. Crear Base de Datos en Vercel
1. Ve a tu proyecto en Vercel Dashboard
2. Click en **Storage** tab
3. Click **Create Database**
4. Selecciona **Postgres**
5. Nombra la DB: `tugotugo-db`
6. Click **Create**

## 2. Configurar Variables de Entorno
Vercel automáticamente creará estas variables:
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL` 
- `POSTGRES_URL_NON_POOLING`

## 3. Actualizar Prisma Schema
En `prisma/schema.prisma`, cambiar:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("POSTGRES_PRISMA_URL") // Cambiar de DATABASE_URL
}
```

## 4. Deploy y Migrar
1. Push cambios a GitHub
2. Vercel auto-deploy
3. Las migraciones se ejecutarán automáticamente

## Ventajas de Vercel Postgres:
- ✅ Integración automática
- ✅ Variables de entorno auto-configuradas  
- ✅ Sin límites de conexión
- ✅ Backups automáticos
- ✅ Más estable que Railway gratuito
