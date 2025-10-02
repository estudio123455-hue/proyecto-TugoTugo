/**
 * Script para probar la conexión a la base de datos
 * Ejecutar con: npx ts-node scripts/test-db-connection.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})

async function testConnection() {
  try {
    console.log('🔌 Testing database connection...')
    
    // Test 1: Connection
    await prisma.$connect()
    console.log('✅ Database connected successfully')
    
    // Test 2: Count users
    const userCount = await prisma.user.count()
    console.log(`👥 Total users: ${userCount}`)
    
    // Test 3: Count establishments
    const establishmentCount = await prisma.establishment.count()
    console.log(`🏪 Total establishments: ${establishmentCount}`)
    
    // Test 4: Find users with ESTABLISHMENT role
    const establishmentUsers = await prisma.user.findMany({
      where: {
        role: 'ESTABLISHMENT',
      },
      select: {
        id: true,
        email: true,
        name: true,
        establishment: {
          select: {
            id: true,
            name: true,
            isApproved: true,
          },
        },
      },
    })
    
    console.log(`\n🍽️ Users with ESTABLISHMENT role: ${establishmentUsers.length}`)
    establishmentUsers.forEach((user) => {
      console.log(`  - ${user.email} (${user.name})`)
      if (user.establishment) {
        console.log(`    ✅ Has establishment: ${user.establishment.name} (Approved: ${user.establishment.isApproved})`)
      } else {
        console.log(`    ⚠️ No establishment created yet`)
      }
    })
    
    // Test 5: Check schema
    console.log('\n📋 Testing Establishment schema...')
    const sampleEstablishment = await prisma.establishment.findFirst()
    if (sampleEstablishment) {
      console.log('✅ Sample establishment found:')
      console.log(JSON.stringify(sampleEstablishment, null, 2))
    } else {
      console.log('⚠️ No establishments in database')
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
    if (error instanceof Error) {
      console.error('Message:', error.message)
      console.error('Stack:', error.stack)
    }
  } finally {
    await prisma.$disconnect()
    console.log('\n🔌 Database disconnected')
  }
}

testConnection()
