# Variables de Entorno para Vercel

## Variables Obligatorias:

### 1. Base de Datos

```
Variable: DATABASE_URL
Valor: postgresql://usuario:password@host:puerto/nombre_db
Ejemplo: postgresql://postgres:mipassword@db.supabase.co:5432/postgres
```

### 2. Supabase (Autenticación)

```
Variable: NEXT_PUBLIC_SUPABASE_URL
Valor: https://tu-proyecto-id.supabase.co
Ejemplo: https://abcd1234.supabase.co

Variable: NEXT_PUBLIC_SUPABASE_ANON_KEY
Valor: tu-clave-anonima-de-supabase
Ejemplo: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. NextAuth (Autenticación)

```
Variable: NEXTAUTH_URL
Valor: https://app-io16zzvim-estudio123455-hues-projects.vercel.app

Variable: NEXTAUTH_SECRET
Valor: una-clave-secreta-muy-larga-y-segura
Ejemplo: mi-super-secreto-para-nextauth-2024-muy-seguro
```

## Variables Opcionales (si las usas):

### 4. Google OAuth (si tienes login con Google)

```
Variable: GOOGLE_CLIENT_ID
Valor: tu-google-client-id.apps.googleusercontent.com

Variable: GOOGLE_CLIENT_SECRET
Valor: tu-google-client-secret
```

### 5. Stripe (si tienes pagos)

```
Variable: STRIPE_PUBLISHABLE_KEY
Valor: pk_test_... (clave pública)

Variable: STRIPE_SECRET_KEY
Valor: sk_test_... (clave secreta)
```

## Cómo agregar cada variable:

1. Click en "Add New" en Vercel
2. Escribe el nombre de la variable (ej: DATABASE_URL)
3. Escribe el valor
4. Selecciona "Production, Preview, Development"
5. Click "Save"

## ⚠️ Importante:

- Después de agregar todas las variables, haz REDEPLOY del proyecto
- Ve a Deployments → Click en "..." del último deploy → "Redeploy"
