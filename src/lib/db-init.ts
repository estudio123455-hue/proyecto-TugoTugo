import { prisma } from './prisma'

let isInitialized = false

export async function initializeDatabase() {
  if (isInitialized) {
    return true
  }

  try {
    console.log('🔄 Initializing database connection...')
    
    // Test database connection
    await prisma.$connect()
    console.log('✅ Database connected successfully')

    // Try to run pending migrations
    try {
      // This will only work if we have the Prisma CLI available
      const { execSync } = require('child_process')
      execSync('npx prisma migrate deploy', { 
        stdio: 'pipe',
        timeout: 30000 // 30 seconds timeout
      })
      console.log('✅ Database migrations applied successfully')
    } catch (migrationError) {
      console.warn('⚠️  Could not apply migrations automatically:', migrationError.message)
      console.log('📝 Please run "npx prisma migrate deploy" manually if needed')
    }

    // Verify database schema by running a simple query
    try {
      await prisma.user.findFirst()
      console.log('✅ Database schema verified')
    } catch (schemaError) {
      console.warn('⚠️  Database schema verification failed:', schemaError.message)
      console.log('📝 Database may need migrations')
    }

    isInitialized = true
    return true

  } catch (error) {
    console.error('❌ Database initialization failed:', error)
    
    // Don't throw error - let the app start anyway
    // Some features may not work, but the app should be accessible
    console.log('🚀 App will start without database (some features may be limited)')
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
