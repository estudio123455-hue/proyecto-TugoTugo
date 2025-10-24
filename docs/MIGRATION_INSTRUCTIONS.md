# Instrucciones para Migración de Base de Datos

## Problema Identificado
La columna `isApproved` no existe en la base de datos de producción, causando el error:
```
Invalid `prisma.establishment.findUnique()` invocation: 
The column `Establishment.isApproved` does not exist in the current database.
```

## Solución Temporal Aplicada
✅ Campo `isApproved` marcado como opcional (`Boolean?`) en el schema de Prisma
✅ Campo `isApproved` removido del código de creación de establecimientos
✅ La aplicación ahora funciona sin la columna

## Migración Requerida en Producción

### Opción 1: Ejecutar SQL Directamente en Vercel Postgres

1. **Accede a tu base de datos en Vercel:**
   - Ve a tu proyecto en Vercel Dashboard
   - Ve a la pestaña "Storage"
   - Selecciona tu base de datos Postgres
   - Haz clic en "Query" o "Data"

2. **Ejecuta este SQL:**
   ```sql
   -- Add the isApproved column
   ALTER TABLE "Establishment" 
   ADD COLUMN IF NOT EXISTS "isApproved" BOOLEAN NOT NULL DEFAULT false;
   
   -- Optional: Approve all existing establishments
   UPDATE "Establishment" SET "isApproved" = true;
   ```

3. **Verifica que se agregó:**
   ```sql
   SELECT column_name, data_type, column_default 
   FROM information_schema.columns 
   WHERE table_name = 'Establishment' AND column_name = 'isApproved';
   ```

### Opción 2: Usar Prisma Migrate (Recomendado para futuro)

1. **Configura DATABASE_URL localmente:**
   ```bash
   # En tu archivo .env local
   DATABASE_URL="postgresql://username:password@host:5432/database"
   ```

2. **Crea la migración:**
   ```bash
   npx prisma migrate dev --name add_is_approved_to_establishment
   ```

3. **Aplica en producción:**
   ```bash
   npx prisma migrate deploy
   ```

### Opción 3: Usar Vercel CLI

1. **Instala Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Ejecuta el comando de migración:**
   ```bash
   vercel env pull .env.production
   npx prisma migrate deploy
   ```

## Después de la Migración

Una vez que la columna `isApproved` exista en la base de datos:

1. **Actualiza el schema de Prisma:**
   ```prisma
   isApproved  Boolean  @default(false)  // Cambiar de Boolean? a Boolean
   ```

2. **Actualiza el código de setup:**
   ```typescript
   const establishment = await prisma.establishment.create({
     data: {
       // ... otros campos
       isApproved: true, // Agregar de nuevo
     },
   })
   ```

3. **Regenera el cliente:**
   ```bash
   npx prisma generate
   ```

4. **Haz commit y push:**
   ```bash
   git add .
   git commit -m "Re-enable isApproved field after migration"
   git push origin main
   ```

## Verificación

Después de ejecutar la migración, verifica que todo funciona:

1. **Intenta crear un nuevo restaurante**
2. **Verifica en la base de datos:**
   ```sql
   SELECT id, name, "isApproved", "isActive" FROM "Establishment";
   ```

## Notas Importantes

- ⚠️ La aplicación actualmente funciona SIN la columna `isApproved`
- ✅ Los restaurantes se crean sin necesidad de aprobación
- 🔄 Después de la migración, puedes re-habilitar el sistema de aprobación
- 📝 El archivo SQL de migración está en: `prisma/migrations/add_is_approved.sql`

## Estado Actual

- **Schema Prisma**: `isApproved Boolean?` (opcional)
- **Código**: No usa `isApproved` al crear establecimientos
- **Base de Datos**: Columna NO existe
- **Funcionalidad**: ✅ Funcionando sin aprobación

## Próximos Pasos

1. ✅ Deploy actual funcionará sin errores
2. ⏳ Ejecutar migración SQL cuando tengas acceso a la BD
3. ⏳ Re-habilitar campo después de la migración
