import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔧 Verificando usuario admin...')

  const admin = await prisma.user.update({
    where: { email: 'admin@test.com' },
    data: {
      emailVerified: new Date(),
    },
  })

  console.log('✅ Usuario admin verificado:', admin.email)
  console.log('   Email verificado:', admin.emailVerified)
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
