import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkPrice() {
  const pack = await prisma.pack.findFirst()
  
  if (pack) {
    console.log(`\n📦 Pack: ${pack.title}`)
    console.log(`   Precio original: $${pack.originalPrice}`)
    console.log(`   Precio con descuento: $${pack.discountedPrice}`)
    console.log(`   Monto para Stripe: ${Math.round(pack.discountedPrice)}`)
    console.log(`\n   Validación:`)
    console.log(`   ${Math.round(pack.discountedPrice) >= 3000 ? '✅' : '❌'} Mínimo Stripe COP: $3,000`)
    
    if (Math.round(pack.discountedPrice) < 3000) {
      console.log(`\n   ⚠️  PROBLEMA: El precio es menor al mínimo de Stripe`)
      console.log(`   💡 Solución: El precio debe ser al menos $3,000 COP\n`)
    }
  }
  
  await prisma.$disconnect()
}

checkPrice()
