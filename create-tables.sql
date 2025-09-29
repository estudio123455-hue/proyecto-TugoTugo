-- Create User table
CREATE TABLE IF NOT EXISTS "User" (
    id TEXT PRIMARY KEY,
    name TEXT,
    email TEXT UNIQUE NOT NULL,
    "emailVerified" TIMESTAMP,
    image TEXT,
    password TEXT,
    role TEXT DEFAULT 'CUSTOMER',
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Create Account table
CREATE TABLE IF NOT EXISTS "Account" (
    id TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL,
    type TEXT NOT NULL,
    provider TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    refresh_token TEXT,
    access_token TEXT,
    expires_at INTEGER,
    token_type TEXT,
    scope TEXT,
    id_token TEXT,
    session_state TEXT,
    FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE,
    UNIQUE(provider, "providerAccountId")
);

-- Create Session table
CREATE TABLE IF NOT EXISTS "Session" (
    id TEXT PRIMARY KEY,
    "sessionToken" TEXT UNIQUE NOT NULL,
    "userId" TEXT NOT NULL,
    expires TIMESTAMP NOT NULL,
    FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE
);

-- Create VerificationToken table
CREATE TABLE IF NOT EXISTS "VerificationToken" (
    identifier TEXT NOT NULL,
    token TEXT UNIQUE NOT NULL,
    expires TIMESTAMP NOT NULL,
    UNIQUE(identifier, token)
);

-- Create Establishment table
CREATE TABLE IF NOT EXISTS "Establishment" (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    address TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    phone TEXT,
    email TEXT,
    image TEXT,
    category TEXT NOT NULL,
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW(),
    "userId" TEXT UNIQUE NOT NULL,
    FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE
);

-- Create Pack table
CREATE TABLE IF NOT EXISTS "Pack" (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    "originalPrice" DOUBLE PRECISION NOT NULL,
    "discountedPrice" DOUBLE PRECISION NOT NULL,
    quantity INTEGER NOT NULL,
    "availableFrom" TIMESTAMP NOT NULL,
    "availableUntil" TIMESTAMP NOT NULL,
    "pickupTimeStart" TEXT NOT NULL,
    "pickupTimeEnd" TEXT NOT NULL,
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW(),
    "establishmentId" TEXT NOT NULL,
    FOREIGN KEY ("establishmentId") REFERENCES "Establishment"(id) ON DELETE CASCADE
);

-- Create Order table
CREATE TABLE IF NOT EXISTS "Order" (
    id TEXT PRIMARY KEY,
    quantity INTEGER NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    status TEXT DEFAULT 'PENDING',
    "pickupDate" TIMESTAMP NOT NULL,
    "stripePaymentId" TEXT,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW(),
    "userId" TEXT NOT NULL,
    "packId" TEXT NOT NULL,
    FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE,
    FOREIGN KEY ("packId") REFERENCES "Pack"(id) ON DELETE CASCADE
);
