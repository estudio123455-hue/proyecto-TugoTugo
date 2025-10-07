import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixPackPrice() {
  const pack = await prisma.pack.findFirst()
  
  if (!pack) {
    console.log('❌ No pack found')
    return
  }

  console.log(`\n📦 Pack actual: ${pack.title}`)
  console.log(`   Precio original: ${pack.originalPrice}`)
  console.log(`   Precio descuento: ${pack.discountedPrice}`)
  console.log(`   Tipo: ${typeof pack.discountedPrice}`)
  
  // Si el precio es menor a 1000, probablemente está en formato incorrecto
  if (pack.discountedPrice < 1000) {
    console.log(`\n⚠️  El precio parece estar en formato incorrecto`)
    console.log(`   Multiplicando por 1000...`)
    
    const newPrice = pack.discountedPrice * 1000
    const newOriginalPrice = pack.originalPrice * 1000
    
    await prisma.pack.update({
      where: { id: pack.id },
      data: {
        discountedPrice: newPrice,
        originalPrice: newOriginalPrice,
      },
    })
    
    console.log(`\n✅ Precio actualizado:`)
    console.log(`   Precio original: $${newOriginalPrice}`)
    console.log(`   Precio descuento: $${newPrice}`)
  } else {
    console.log(`\n✅ El precio está correcto: $${pack.discountedPrice}`)
  }
  
  await prisma.$disconnect()
}

fixPackPrice()
