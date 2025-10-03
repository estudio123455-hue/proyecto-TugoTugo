import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Limpiar datos existentes
  await prisma.order.deleteMany()
  await prisma.post.deleteMany()
  await prisma.pack.deleteMany()
  await prisma.establishment.deleteMany()
  await prisma.emailVerification.deleteMany()
  await prisma.session.deleteMany()
  await prisma.account.deleteMany()
  await prisma.user.deleteMany()

  console.log('🗑️  Cleared existing data')

  // Crear usuario admin
  const hashedPassword = await bcrypt.hash('password123', 10)
  
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@test.com',
      name: 'Admin',
      password: hashedPassword,
      role: 'ADMIN',
      emailVerified: new Date(),
    },
  })

  console.log('✅ Created admin user')

  // Crear usuario establecimiento
  const restaurantUser = await prisma.user.create({
    data: {
      email: 'restaurant@test.com',
      name: 'La Pizzería del Centro',
      password: hashedPassword,
      role: 'ESTABLISHMENT',
      emailVerified: new Date(),
    },
  })

  console.log('✅ Created restaurant user')

  // Crear establecimiento
  const establishment = await prisma.establishment.create({
    data: {
      name: 'La Pizzería del Centro',
      description: 'Pizzería artesanal con ingredientes frescos. Rescatamos comida deliciosa del desperdicio.',
      address: 'Calle 72 #10-34, Bogotá',
      latitude: 4.6533,
      longitude: -74.0836,
      phone: '+57 310 123 4567',
      email: 'restaurant@test.com',
      category: 'RESTAURANT',
      image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800',
      isActive: true,
      userId: restaurantUser.id,
      openingHours: JSON.stringify({
        monday: { open: '11:00', close: '22:00' },
        tuesday: { open: '11:00', close: '22:00' },
        wednesday: { open: '11:00', close: '22:00' },
        thursday: { open: '11:00', close: '22:00' },
        friday: { open: '11:00', close: '23:00' },
        saturday: { open: '12:00', close: '23:00' },
        sunday: { open: '12:00', close: '21:00' },
      }),
      images: [
        'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800',
        'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800',
      ],
      businessType: 'Restaurante',
      taxId: '900123456-7',
      verificationStatus: 'APPROVED',
      approvedAt: new Date(),
    },
  })

  console.log('✅ Created establishment')

  // Crear posts
  const posts = await Promise.all([
    prisma.post.create({
      data: {
        title: '🍕 Pizza Margherita Fresca',
        content: 'Pizza artesanal con tomate, mozzarella fresca y albahaca. ¡Hecha esta mañana!',
        images: [
          'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800',
        ],
        price: 15000,
        establishmentId: establishment.id,
        isActive: true,
        likes: 12,
        views: 45,
      },
    }),
    prisma.post.create({
      data: {
        title: '🥗 Ensalada Caprese',
        content: 'Ensalada fresca con tomate, mozzarella y albahaca. Perfecta para acompañar.',
        images: [
          'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800',
        ],
        price: 8000,
        establishmentId: establishment.id,
        isActive: true,
        likes: 8,
        views: 23,
      },
    }),
    prisma.post.create({
      data: {
        title: '🍰 Tiramisú Casero',
        content: 'Delicioso tiramisú preparado con receta tradicional italiana.',
        images: [
          'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=800',
        ],
        price: 10000,
        establishmentId: establishment.id,
        isActive: true,
        likes: 15,
        views: 67,
      },
    }),
  ])

  console.log('✅ Created posts')

  // Crear packs
  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const packs = await Promise.all([
    prisma.pack.create({
      data: {
        title: 'Pack Pizza + Bebida',
        description: 'Pizza mediana de pepperoni + Bebida 400ml. ¡Perfecta para el almuerzo!',
        originalPrice: 25000,
        discountedPrice: 12000,
        quantity: 5,
        availableFrom: now,
        availableUntil: tomorrow,
        pickupTimeStart: '18:00',
        pickupTimeEnd: '20:00',
        isActive: true,
        establishmentId: establishment.id,
      },
    }),
    prisma.pack.create({
      data: {
        title: 'Pack Familiar',
        description: 'Pizza grande + Ensalada + 2 Bebidas. Ideal para compartir.',
        originalPrice: 45000,
        discountedPrice: 22000,
        quantity: 3,
        availableFrom: now,
        availableUntil: tomorrow,
        pickupTimeStart: '19:00',
        pickupTimeEnd: '21:00',
        isActive: true,
        establishmentId: establishment.id,
      },
    }),
    prisma.pack.create({
      data: {
        title: 'Pack Postre',
        description: 'Tiramisú + Café. El final perfecto para tu comida.',
        originalPrice: 15000,
        discountedPrice: 8000,
        quantity: 8,
        availableFrom: now,
        availableUntil: tomorrow,
        pickupTimeStart: '17:00',
        pickupTimeEnd: '21:00',
        isActive: true,
        establishmentId: establishment.id,
      },
    }),
  ])

  console.log('✅ Created packs')

  // Crear usuario cliente
  const customerUser = await prisma.user.create({
    data: {
      email: 'customer@test.com',
      name: 'Juan Pérez',
      password: hashedPassword,
      role: 'CUSTOMER',
      emailVerified: new Date(),
    },
  })

  console.log('✅ Created customer user')

  console.log('\n🎉 Database seeded successfully!')
  console.log('\n📝 Test credentials:')
  console.log('   Admin: admin@test.com / password123')
  console.log('   Restaurant: restaurant@test.com / password123')
  console.log('   Customer: customer@test.com / password123')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
