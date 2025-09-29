# FoodSave - Food Waste Reduction Marketplace

A web application that connects customers with local restaurants and stores to purchase discounted "surprise packs" of food that would otherwise go to waste.

## Features

### For Customers

- 🗺️ **Interactive Map**: Browse nearby establishments with available food packs
- 🛒 **Easy Booking**: Reserve and pay for surprise packs online
- 👤 **User Profile**: Track purchase history and manage personal data
- 🔔 **Notifications**: Get reminders for pickup times
- 💳 **Secure Payments**: Integrated with Stripe for safe transactions

### For Establishments

- 📊 **Dashboard**: Manage inventory and publish available packs
- ⏰ **Flexible Scheduling**: Set pickup windows and availability
- 💰 **Revenue Recovery**: Convert waste into revenue
- 📈 **Analytics**: Track sales and reduce waste metrics

## Tech Stack

- **Frontend**: Next.js 13 with TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js (Google, Facebook, Email)
- **Maps**: React Leaflet with OpenStreetMap
- **Payments**: Stripe
- **Email**: Nodemailer

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
