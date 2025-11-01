import { prisma } from './prisma'

let isInitialized = false

export async function initializeDatabase() {
  if (isInitialized) {
    return true
  }

  try {
    console.log('🔄 Initializing database connection...')
    
    // Test database connection with timeout
    const connectionPromise = prisma.$connect()
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Database connection timeout')), 10000)
    )
    
    await Promise.race([connectionPromise, timeoutPromise])
    console.log('✅ Database connected successfully')

    // Try to run pending migrations (skip in production if not available)
    if (process.env.NODE_ENV !== 'production') {
      try {
        const { execSync } = require('child_process')
        execSync('npx prisma migrate deploy', { 
          stdio: 'pipe',
          timeout: 30000 // 30 seconds timeout
        })
        console.log('✅ Database migrations applied successfully')
      } catch (migrationError) {
        console.warn('⚠️  Could not apply migrations automatically:', migrationError instanceof Error ? migrationError.message : String(migrationError))
        console.log('📝 Please run "npx prisma migrate deploy" manually if needed')
      }
    }

    // Verify database schema by running a simple query
    try {
      await prisma.user.findFirst()
      console.log('✅ Database schema verified')
    } catch (schemaError) {
      console.warn('⚠️  Database schema verification failed:', schemaError instanceof Error ? schemaError.message : String(schemaError))
      console.log('📝 Database may need migrations')
    }

    isInitialized = true
    return true

  } catch (error) {
    console.error('❌ Database initialization failed:', error instanceof Error ? error.message : String(error))
    console.log('📝 The application will continue without database functionality')
    
    // Mark as initialized even if failed to prevent repeated attempts
    isInitialized = true
    return false
  }
}

export async function ensureDatabaseConnection() {
  try {
    await prisma.$connect()
    return true
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    return false
  }
}

// Graceful shutdown
export async function closeDatabaseConnection() {
  try {
    await prisma.$disconnect()
    console.log('✅ Database connection closed')
  } catch (error) {
    console.error('❌ Error closing database connection:', error)
  }
}

// Auto-initialize on import in production
if (process.env.NODE_ENV === 'production') {
  initializeDatabase().catch(console.error)
}
