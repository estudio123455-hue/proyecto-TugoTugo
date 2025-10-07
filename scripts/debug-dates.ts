import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function debugDates() {
  const now = new Date()
  console.log(`\n🕐 Fecha actual del sistema: ${now}`)
  console.log(`   Año: ${now.getFullYear()}`)
  console.log(`   Mes: ${now.getMonth() + 1}`)
  console.log(`   Día: ${now.getDate()}\n`)

  const pack = await prisma.pack.findFirst()
  
  if (pack) {
    const from = new Date(pack.availableFrom)
    const until = new Date(pack.availableUntil)
    
    console.log(`📦 Pack: ${pack.title}`)
    console.log(`   Desde: ${from}`)
    console.log(`   Hasta: ${until}`)
    console.log(`\n   Comparación:`)
    console.log(`   from > now: ${from > now} (${from > now ? 'FUTURO' : 'PASADO/PRESENTE'})`)
    console.log(`   until < now: ${until < now} (${until < now ? 'EXPIRADO' : 'VIGENTE'})`)
    console.log(`   from <= now <= until: ${from <= now && until >= now}`)
  }

  await prisma.$disconnect()
}

debugDates()
