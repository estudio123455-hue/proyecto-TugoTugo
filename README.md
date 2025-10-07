# 🌱 TugoTugo - Plataforma de Reducción de Desperdicio Alimentario

Una aplicación web que conecta clientes con restaurantes locales para comprar "packs sorpresa" con descuento de comida que de otro modo se desperdiciaría.

## ✨ Características Principales

### 👥 Para Clientes

- 🗺️ **Mapa Interactivo Mejorado**: 
  - Geolocalización automática
  - Cálculo de distancias en tiempo real
  - Marcadores de colores (verde=disponible, rojo=agotado, azul=tu ubicación)
  - Popups informativos con rating, distancia y precios

- 🔍 **Búsqueda Avanzada**:
  - Autocompletado inteligente
  - Búsqueda por nombre, tipo de cocina, categoría
  - Filtros por distancia, precio, rating
  - Resultados en tiempo real

- 📱 **Sistema de Verificación QR**:
  - Código QR único por orden
  - Email con QR y código alfanumérico
  - Verificación en restaurante sin contacto
  - Audit log completo

- 🛒 **Compras Fáciles**: 
  - Reserva y pago online con Stripe
  - Pagos en pesos colombianos (COP)
  - Confirmación por email
  - Recordatorios de recogida

- 👤 **Perfil de Usuario**: 
  - Historial de órdenes
  - Restaurantes favoritos
  - Reseñas y ratings
  - Gestión de datos personales

- ⭐ **Sistema de Reseñas**:
  - Calificación de 1-5 estrellas
  - Comentarios detallados
  - Ver reseñas de otros usuarios

### 🏪 Para Restaurantes

- 📊 **Dashboard Completo**: 
  - Gestión de inventario
  - Publicar packs sorpresa
  - Ver órdenes en tiempo real
  - Estadísticas de ventas

- 📱 **Verificación de Órdenes**:
  - Escanear código QR del cliente
  - Verificación manual con código
  - Marcar orden como completada
  - Ver detalles del cliente

- ⏰ **Programación Flexible**: 
  - Configurar horarios de recogida
  - Establecer disponibilidad
  - Packs recurrentes

- 💰 **Recuperación de Ingresos**: 
  - Convertir desperdicio en revenue
  - Precios con descuento atractivos
  - Sistema de pagos automático

- 📈 **Analytics y Reportes**: 
  - Tracking de ventas
  - Métricas de reducción de desperdicio
  - Reportes exportables
  - Audit log de acciones

- 📝 **Gestión de Contenido**:
  - Crear posts con fotos
  - Menú digital completo
  - Categorización de items
  - Información de alergenos

### 👨‍💼 Para Administradores

- 🏢 **Gestión de Restaurantes**:
  - Aprobar/rechazar solicitudes
  - Verificación de documentos
  - Suspender establecimientos
  - Asignar admins

- 👥 **Gestión de Usuarios**:
  - Ver todos los usuarios
  - Cambiar roles
  - Monitorear actividad

- 📦 **Gestión de Packs**:
  - Ver todos los packs
  - Activar/desactivar
  - Estadísticas globales

- 📊 **Auditoría Completa**:
  - Audit log de todas las acciones
  - Filtros avanzados
  - Exportación de datos
  - Reportes detallados

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 13 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Maps**: React Leaflet + OpenStreetMap
- **Rich Text**: TipTap Editor
- **Data Fetching**: SWR
- **QR Codes**: qrcode library

### Backend
- **API**: Next.js API Routes
- **Database**: PostgreSQL (Neon)
- **ORM**: Prisma
- **Authentication**: NextAuth.js
- **Payments**: Stripe (COP currency)
- **Email**: Nodemailer (SMTP)
- **Geolocation**: Haversine formula

### Security & Validation
- **Rate Limiting**: Custom implementation
- **XSS Protection**: DOMPurify
- **SQL Injection**: Prisma ORM
- **Audit Logging**: Complete action tracking
- **Email Verification**: 6-digit codes

### Deployment
- **Hosting**: Vercel
- **Database**: Neon PostgreSQL
- **CDN**: Vercel Edge Network
- **Environment**: Production-ready

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Stripe account
- Google/Facebook OAuth apps (optional)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd food-waste-marketplace
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp env.example .env.local
   ```

   Fill in your environment variables:

   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/foodwaste_db"

   # NextAuth
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key"

   # OAuth Providers (optional)
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   FACEBOOK_CLIENT_ID="your-facebook-app-id"
   FACEBOOK_CLIENT_SECRET="your-facebook-app-secret"

   # Stripe
   STRIPE_PUBLISHABLE_KEY="pk_test_..."
   STRIPE_SECRET_KEY="sk_test_..."
   STRIPE_WEBHOOK_SECRET="whsec_..."

   # Email
   SMTP_HOST="smtp.gmail.com"
   SMTP_PORT=587
   SMTP_USER="your-email@gmail.com"
   SMTP_PASSWORD="your-app-password"
   ```

4. **Set up the database**

   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the development server**

   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Database Setup

### Using Supabase (Recommended for development)

1. Create a new project at [supabase.com](https://supabase.com)
2. Get your database URL from the project settings
3. Add it to your `.env.local` file

### Using Local PostgreSQL

1. Install PostgreSQL
2. Create a new database:
   ```sql
   CREATE DATABASE foodwaste_db;
   ```
3. Update the `DATABASE_URL` in your `.env.local` file

## Stripe Setup

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Get your API keys from the dashboard
3. Add them to your `.env.local` file
4. Set up webhooks for handling payment confirmations

## OAuth Setup (Optional)

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`

### Facebook OAuth

1. Go to [Facebook Developers](https://developers.facebook.com)
2. Create a new app
3. Add Facebook Login product
4. Get your App ID and App Secret
5. Add redirect URI: `http://localhost:3000/api/auth/callback/facebook`

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Other Platforms

The app can be deployed to any platform that supports Next.js:

- Railway
- Render
- Heroku
- DigitalOcean App Platform

## Project Structure

```
src/
├── app/                  # Next.js 13 app directory
│   ├── api/             # API routes
│   ├── auth/            # Authentication pages
│   ├── dashboard/       # Restaurant dashboard
│   ├── map/             # Interactive map page
│   └── profile/         # User profile
├── components/          # Reusable components
├── lib/                 # Utility functions
└── types/               # TypeScript type definitions

prisma/
└── schema.prisma        # Database schema
```

## API Endpoints

- `GET /api/establishments` - Get all establishments with packs
- `POST /api/establishments` - Create new establishment
- `GET /api/orders` - Get user orders
- `POST /api/orders` - Create new order
- `POST /api/auth/register` - Register new user

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, email hello@foodsave.com or create an issue on GitHub.
