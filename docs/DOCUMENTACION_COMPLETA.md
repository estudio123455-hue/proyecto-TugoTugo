# 📱 Zavo - Documentación Completa del Proyecto

## 🎯 ¿Qué es Zavo?

**Zavo** es una plataforma web que conecta a usuarios con restaurantes para reducir el desperdicio de comida. Los restaurantes pueden vender "packs sorpresa" con comida excedente a precios reducidos (hasta 70% de descuento), ayudando al planeta y ahorrando dinero a los clientes.

---

## 🏗️ Arquitectura Técnica

### Stack Tecnológico

**Frontend:**
- **Next.js 14** - Framework React con App Router
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Estilos utility-first
- **Lucide React** - Iconos modernos

**Backend:**
- **Next.js API Routes** - Endpoints serverless
- **Prisma ORM** - Manejo de base de datos
- **PostgreSQL (Neon)** - Base de datos en la nube

**Autenticación:**
- **NextAuth.js** - Sistema de autenticación
- **Google OAuth** - Login con Google
- **Credentials Provider** - Login con email/password
- **Email Verification** - Códigos de 6 dígitos

**Pagos:**
- **Stripe** - Procesamiento de pagos
- **Webhooks** - Confirmación de pagos

**Emails:**
- **Nodemailer** - Envío de emails
- **SMTP Gmail** - Servidor de correo

**Mapas:**
- **Leaflet** - Mapas interactivos
- **OpenStreetMap** - Datos de mapas

**Notificaciones:**
- **Web Push API** - Notificaciones push
- **VAPID Keys** - Autenticación de notificaciones

---

## 👥 Tipos de Usuarios

### 1. **CUSTOMER (Cliente)**
- Busca y compra packs sorpresa
- Ve restaurantes en el mapa
- Gestiona sus órdenes
- Recibe notificaciones

### 2. **ESTABLISHMENT (Restaurante)**
- Crea y gestiona packs
- Publica en el feed
- Ve estadísticas de ventas
- Gestiona órdenes

### 3. **ADMIN (Administrador)**
- Gestiona usuarios
- Aprueba restaurantes
- Ve reportes y auditoría
- Gestiona toda la plataforma

---

## 📂 Estructura del Proyecto

```
app/
├── src/
│   ├── app/                    # App Router de Next.js
│   │   ├── admin/             # Panel de administración
│   │   ├── api/               # API Routes
│   │   │   ├── auth/          # Autenticación
│   │   │   ├── orders/        # Órdenes
│   │   │   ├── packs/         # Packs
│   │   │   ├── posts/         # Posts
│   │   │   └── webhooks/      # Stripe webhooks
│   │   ├── auth/              # Páginas de autenticación
│   │   ├── dashboard/         # Dashboard de restaurantes
│   │   ├── feed/              # Feed social
│   │   ├── landing/           # Página de inicio
│   │   ├── map/               # Mapa interactivo
│   │   ├── packs/             # Explorar packs
│   │   ├── profile/           # Perfil de usuario
│   │   └── restaurants/       # Lista de restaurantes
│   ├── components/            # Componentes React
│   │   ├── admin/             # Componentes de admin
│   │   ├── dashboard/         # Componentes de dashboard
│   │   ├── mobile/            # Navegación móvil
│   │   └── ...                # Componentes globales
│   ├── contexts/              # React Contexts
│   │   └── ThemeContext.tsx   # Tema claro/oscuro
│   ├── hooks/                 # Custom Hooks
│   │   ├── useCleanSession.ts # Sesión limpia
│   │   └── useNotifications.ts# Notificaciones push
│   ├── lib/                   # Utilidades
│   │   ├── auth.ts            # Configuración NextAuth
│   │   ├── email.ts           # Envío de emails
│   │   ├── prisma.ts          # Cliente Prisma
│   │   └── verification.ts    # Verificación de email
│   └── types/                 # Tipos TypeScript
├── prisma/
│   └── schema.prisma          # Esquema de base de datos
├── public/                    # Archivos estáticos
└── package.json               # Dependencias
```

---

## 🗄️ Base de Datos (Prisma Schema)

### Modelos Principales:

**User**
- id, name, email, password
- role: CUSTOMER | ESTABLISHMENT | ADMIN
- emailVerified, image
- Relaciones: accounts, sessions, orders, posts

**Establishment**
- id, name, description, address
- latitude, longitude
- phone, email, image
- category, rating, status
- Relaciones: user, packs, posts, orders

**Pack**
- id, title, description
- originalPrice, discountedPrice
- quantity, availableFrom, availableTo
- pickupTimeStart, pickupTimeEnd
- Relaciones: establishment, orders

**Order**
- id, quantity, totalAmount
- status: PENDING | CONFIRMED | READY | COMPLETED | CANCELLED
- pickupDate, verificationCode
- Relaciones: user, pack, establishment

**Post**
- id, content, imageUrl
- likes, comments
- Relaciones: user, establishment

**EmailVerification**
- email, code, type
- expires, verified, attempts

**PushSubscription**
- endpoint, keys (p256dh, auth)
- Relaciones: user

---

## 🔐 Autenticación

### Flujo de Registro:
1. Usuario ingresa datos (nombre, email, password, rol)
2. Se envía código de 6 dígitos al email
3. Usuario verifica el código
4. Cuenta creada y verificada

### Flujo de Login:
1. Usuario ingresa email y password
2. Se valida en la base de datos
3. Se crea sesión JWT
4. Redirección según rol:
   - CUSTOMER → `/packs`
   - ESTABLISHMENT → `/dashboard`
   - ADMIN → `/admin`

### Google OAuth:
1. Usuario hace clic en "Continuar con Google"
2. Autoriza en Google
3. Se crea/actualiza usuario automáticamente
4. Sesión iniciada

---

## 💳 Sistema de Pagos (Stripe)

### Flujo de Compra:
1. Usuario selecciona un pack
2. Se crea Checkout Session en Stripe
3. Usuario paga con tarjeta
4. Stripe envía webhook de confirmación
5. Se crea la orden en la base de datos
6. Se envía email de confirmación con código QR

### Webhooks:
- `checkout.session.completed` - Pago exitoso
- Se valida firma de Stripe
- Se actualiza estado de la orden

---

## 📧 Sistema de Emails

### Tipos de Emails:

**1. Verificación de Cuenta**
- Código de 6 dígitos
- Expira en 15 minutos
- Template HTML profesional

**2. Confirmación de Orden**
- Detalles del pack
- Código de verificación
- Código QR
- Horario de recogida

**3. Recordatorio de Recogida**
- Se envía 2 horas antes
- Información del restaurante
- Mapa de ubicación

**4. Verificación de Restaurante**
- Confirmación de solicitud
- Aprobación/Rechazo
- Instrucciones de uso

---

## 🔔 Notificaciones Push

### Configuración:
- VAPID Keys para autenticación
- Service Worker para recibir notificaciones
- Almacenamiento en base de datos

### Tipos de Notificaciones:
- Nueva orden para restaurante
- Recordatorio de recogida
- Pack disponible cerca
- Promociones especiales

---

## 🎨 Diseño UI/UX

### Tema:
- **Colores principales:**
  - Verde esmeralda (#10b981, #059669)
  - Gris neutro (#6b7280, #374151)
  - Blanco/Negro para contraste

### Navegación:
- **Desktop:** Barra superior con glassmorphism
- **Mobile:** Barra inferior con 5 iconos
- **Dropdown:** Hover automático para menú de usuario

### Componentes:
- Botones con transiciones suaves
- Cards con sombras sutiles
- Formularios con validación visual
- Modales con backdrop blur

---

## 📱 Funcionalidades Principales

### Para Clientes:
✅ Buscar packs en mapa interactivo
✅ Filtrar por categoría, precio, distancia
✅ Comprar con Stripe
✅ Ver historial de órdenes
✅ Recibir notificaciones
✅ Ver feed de restaurantes

### Para Restaurantes:
✅ Crear y gestionar packs
✅ Publicar en el feed
✅ Ver estadísticas de ventas
✅ Gestionar órdenes
✅ Verificar códigos QR
✅ Actualizar perfil

### Para Administradores:
✅ Gestionar usuarios
✅ Aprobar restaurantes
✅ Ver reportes globales
✅ Auditoría de acciones
✅ Gestionar contenido

---

## 🔧 Variables de Entorno

### Archivo `.env.local`:

```env
# Database
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_URL="https://app-rho-sandy.vercel.app"
NEXTAUTH_SECRET="tu-secret-key"

# Google OAuth (opcional)
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Email (SMTP)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="estudio.123455@gmail.com"
SMTP_PASSWORD="eqkk uxlz yfzl qfbx"

# VAPID Keys (Push Notifications)
NEXT_PUBLIC_VAPID_PUBLIC_KEY="..."
VAPID_PRIVATE_KEY="..."
VAPID_SUBJECT="mailto:hello@zavo.com"
```

---

## 🚀 Comandos de Desarrollo

```bash
# Instalar dependencias
npm install

# Desarrollo local
npm run dev

# Build para producción
npm run build

# Iniciar producción
npm start

# Prisma
npx prisma generate      # Generar cliente
npx prisma db push       # Sincronizar schema
npx prisma studio        # Ver base de datos
```

---

## 📊 Estadísticas y Métricas

### Dashboard de Restaurante:
- Ventas totales
- Packs vendidos
- Comida salvada (kg)
- CO₂ evitado
- Rating promedio
- Gráficas de ventas

### Panel de Admin:
- Total usuarios
- Total restaurantes
- Total órdenes
- Usuarios por rol
- Órdenes por estado
- Logs de auditoría

---

## 🔒 Seguridad

### Implementado:
✅ Autenticación JWT con NextAuth
✅ Verificación de email obligatoria
✅ Códigos de verificación con expiración
✅ Límite de intentos (5 máximo)
✅ Prevención de spam (1 código cada 2 min)
✅ Validación de webhooks de Stripe
✅ Sanitización de inputs
✅ HTTPS en producción
✅ Cookies seguras (httpOnly, sameSite)

---

## 🌍 Despliegue

### Plataforma: **Vercel**
- URL: https://app-rho-sandy.vercel.app
- Auto-deploy desde GitHub
- Variables de entorno configuradas
- Edge Functions para API Routes

### Base de Datos: **Neon PostgreSQL**
- Serverless PostgreSQL
- Auto-scaling
- Backups automáticos

---

## 📝 Próximas Mejoras

### En desarrollo:
- [ ] Chat en tiempo real
- [ ] Sistema de reviews
- [ ] Programa de fidelidad
- [ ] App móvil nativa
- [ ] Integración con más pasarelas de pago
- [ ] Multi-idioma (i18n)
- [ ] Dark mode completo
- [ ] Analytics avanzados

---

## 🐛 Debugging

### Logs importantes:
```bash
# Ver logs de Prisma
DEBUG=prisma:* npm run dev

# Ver logs de NextAuth
NEXTAUTH_DEBUG=1 npm run dev

# Ver logs de Stripe
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

---

## 📞 Soporte

- **Email:** estudio.123455@gmail.com
- **WhatsApp:** +57 321 459 6837
- **GitHub:** https://github.com/estudio123455-hue/proyecto-TugoTugo

---

## 📄 Licencia

Proyecto privado - Todos los derechos reservados © 2025 Zavo

---

**Última actualización:** 9 de Octubre, 2025
**Versión:** 1.0.0
**Estado:** En producción ✅
