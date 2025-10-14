import { PrismaClient } from '@prisma/client'

// Configuración optimizada para production con connection pooling
const createPrismaClient = () => {
  return new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    },
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Usar una sola instancia global para evitar múltiples conexiones
export const db = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db
}

// Función para cerrar conexiones de manera segura
export const disconnectDb = async () => {
  try {
    await db.$disconnect()
  } catch (error) {
    console.error('Error disconnecting from database:', error)
  }
}

// Manejar cierre de conexiones en diferentes eventos
const gracefulShutdown = async (signal: string) => {
  console.log(`Received ${signal}, closing database connections...`)
  await disconnectDb()
  process.exit(0)
}

// Solo configurar listeners en production
if (process.env.NODE_ENV === 'production') {
  process.on('SIGINT', () => gracefulShutdown('SIGINT'))
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
  process.on('beforeExit', disconnectDb)
}
