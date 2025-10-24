# ⚠️ MIGRACIÓN DE BASE DE DATOS REQUERIDA

## Problema
La tabla `Post` no existe en la base de datos de producción.

**Error:**
```
Invalid `prisma.post.create()` invocation: 
The table `public.Post` does not exist in the current database.
```

## Solución

### Opción 1: Ejecutar SQL en Vercel Postgres (RECOMENDADO)

1. Ve a tu proyecto en Vercel Dashboard
2. Ve a Storage → Tu base de datos Postgres
3. Haz clic en "Query" o "Data"
4. Ejecuta el siguiente SQL:

```sql
CREATE TABLE IF NOT EXISTS "Post" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "title" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "price" DOUBLE PRECISION,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "likes" INTEGER NOT NULL DEFAULT 0,
  "views" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "establishmentId" TEXT NOT NULL,
  CONSTRAINT "Post_establishmentId_fkey" FOREIGN KEY ("establishmentId") 
    REFERENCES "Establishment"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "Post_establishmentId_idx" ON "Post"("establishmentId");
CREATE INDEX IF NOT EXISTS "Post_createdAt_idx" ON "Post"("createdAt");
```

5. Verifica que se creó:
```sql
SELECT table_name FROM information_schema.tables WHERE table_name = 'Post';
```

### Opción 2: Usar archivo SQL preparado

El archivo `prisma/migrations/create_post_table.sql` contiene el SQL completo listo para ejecutar.

## Después de la Migración

Una vez ejecutado el SQL:

1. ✅ La tabla Post existirá
2. ✅ Podrás crear publicaciones
3. ✅ Las publicaciones aparecerán en el feed
4. ✅ Todo funcionará correctamente

## Verificación

Después de ejecutar la migración, prueba:
1. Crear una publicación desde el dashboard del restaurante
2. Verificar que se crea sin errores
3. Ver la publicación en el feed de clientes

## Estado Actual

- ❌ Tabla Post NO existe
- ✅ Schema Prisma definido correctamente
- ✅ Código de la aplicación listo
- ⏳ Solo falta ejecutar la migración SQL

**Una vez ejecutes el SQL, todo funcionará perfectamente! 🚀**
