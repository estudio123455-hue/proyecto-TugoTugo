/**
 * Cliente de Prisma para pruebas
 * Usa una base de datos separada para no afectar producción
 */

import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prismaTest: PrismaClient }

export const prismaTest =
  globalForPrisma.prismaTest ||
  new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_TEST_URL || process.env.DATABASE_URL,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prismaTest = prismaTest

// Helper para limpiar la base de datos entre pruebas
export async function cleanDatabase() {
  const tablenames = await prismaTest.$queryRaw<
    Array<{ tablename: string }>
  >`SELECT tablename FROM pg_tables WHERE schemaname='public'`

  const tables = tablenames
    .map(({ tablename }) => tablename)
    .filter((name) => name !== '_prisma_migrations')
    .map((name) => `"public"."${name}"`)
    .join(', ')

  try {
    await prismaTest.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`)
  } catch (error) {
    console.log({ error })
  }
}

// Helper para crear datos de prueba
export async function seedTestData() {
  // Crear usuario de prueba
  const testUser = await prismaTest.user.create({
    data: {
      email: 'test@example.com',
      name: 'Test User',
      password: 'hashedpassword',
      role: 'CUSTOMER',
    },
  })

  return { testUser }
}
