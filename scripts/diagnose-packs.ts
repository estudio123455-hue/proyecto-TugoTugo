/**
 * Script para diagnosticar problemas con packs
 * Ejecutar: npx tsx scripts/diagnose-packs.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function diagnosePacks() {
  try {
    console.log('🔍 Diagnosticando sistema de packs...\n')

    // 1. Verificar establecimientos
    const establishments = await prisma.establishment.findMany({
      select: {
        id: true,
        name: true,
        userId: true,
        isActive: true,
        verificationStatus: true,
        _count: {
          select: {
            packs: true,
          },
        },
      },
    })

    console.log(`📊 Establecimientos encontrados: ${establishments.length}`)
    establishments.forEach((est, index) => {
      console.log(`\n${index + 1}. ${est.name}`)
      console.log(`   ID: ${est.id}`)
      console.log(`   User ID: ${est.userId}`)
      console.log(`   Activo: ${est.isActive ? '✅' : '❌'}`)
      console.log(`   Estado: ${est.verificationStatus}`)
      console.log(`   Packs: ${est._count.packs}`)
    })

    // 2. Verificar todos los packs
    const allPacks = await prisma.pack.findMany({
      include: {
        establishment: {
          select: {
            name: true,
            isActive: true,
            verificationStatus: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    console.log(`\n\n📦 Total de packs en DB: ${allPacks.length}`)
    
    if (allPacks.length === 0) {
      console.log('\n⚠️  NO HAY PACKS EN LA BASE DE DATOS')
      console.log('\nPosibles causas:')
      console.log('   1. No se han creado packs desde el dashboard')
      console.log('   2. Error en la validación al crear packs')
      console.log('   3. Problema con el establecimiento')
    } else {
      console.log('\n📋 Detalles de los packs:')
      allPacks.forEach((pack, index) => {
        const now = new Date()
        const isExpired = new Date(pack.availableUntil) < now
        const isAvailable = new Date(pack.availableFrom) <= now
        const hasStock = pack.quantity > 0

        console.log(`\n${index + 1}. ${pack.title}`)
        console.log(`   ID: ${pack.id}`)
        console.log(`   Restaurante: ${pack.establishment.name}`)
        console.log(`   Activo: ${pack.isActive ? '✅' : '❌'}`)
        console.log(`   Cantidad: ${pack.quantity}`)
        console.log(`   Precio: $${pack.discountedPrice} (antes: $${pack.originalPrice})`)
        console.log(`   Disponible desde: ${pack.availableFrom.toLocaleString('es-CO')}`)
        console.log(`   Disponible hasta: ${pack.availableUntil.toLocaleString('es-CO')}`)
        console.log(`   Horario recogida: ${pack.pickupTimeStart} - ${pack.pickupTimeEnd}`)
        console.log(`   Estado restaurante: ${pack.establishment.verificationStatus}`)
        console.log(`   Restaurante activo: ${pack.establishment.isActive ? '✅' : '❌'}`)
        console.log(`\n   Diagnóstico:`)
        console.log(`      ${isExpired ? '❌' : '✅'} ${isExpired ? 'EXPIRADO' : 'No expirado'}`)
        console.log(`      ${isAvailable ? '✅' : '⏳'} ${isAvailable ? 'Disponible ahora' : 'Aún no disponible'}`)
        console.log(`      ${hasStock ? '✅' : '❌'} ${hasStock ? 'Con stock' : 'Sin stock'}`)
        console.log(`      ${pack.establishment.verificationStatus === 'APPROVED' ? '✅' : '❌'} Restaurante ${pack.establishment.verificationStatus}`)
      })
    }

    // 3. Verificar packs activos y disponibles
    const activePacks = await prisma.pack.findMany({
      where: {
        isActive: true,
        quantity: { gt: 0 },
        availableFrom: { lte: new Date() },
        availableUntil: { gte: new Date() },
        establishment: {
          isActive: true,
          verificationStatus: 'APPROVED',
        },
      },
    })

    console.log(`\n\n✅ Packs activos y disponibles AHORA: ${activePacks.length}`)
    
    if (activePacks.length === 0 && allPacks.length > 0) {
      console.log('\n⚠️  HAY PACKS PERO NINGUNO ESTÁ DISPONIBLE')
      console.log('\nPosibles razones:')
      console.log('   • Packs expirados (availableUntil < ahora)')
      console.log('   • Packs futuros (availableFrom > ahora)')
      console.log('   • Sin stock (quantity = 0)')
      console.log('   • Restaurante no aprobado')
      console.log('   • Pack o restaurante inactivo')
    }

    // 4. Verificar usuarios con rol ESTABLISHMENT
    const estUsers = await prisma.user.findMany({
      where: { role: 'ESTABLISHMENT' },
      select: {
        id: true,
        email: true,
        name: true,
        establishment: {
          select: {
            id: true,
            name: true,
            verificationStatus: true,
          },
        },
      },
    })

    console.log(`\n\n👥 Usuarios con rol ESTABLISHMENT: ${estUsers.length}`)
    estUsers.forEach((user, index) => {
      console.log(`\n${index + 1}. ${user.email}`)
      console.log(`   Nombre: ${user.name || 'Sin nombre'}`)
      console.log(`   Tiene establecimiento: ${user.establishment ? '✅' : '❌'}`)
      if (user.establishment) {
        console.log(`   Establecimiento: ${user.establishment.name}`)
        console.log(`   Estado: ${user.establishment.verificationStatus}`)
      }
    })

    // Resumen
    console.log('\n' + '='.repeat(60))
    console.log('📊 RESUMEN DEL DIAGNÓSTICO')
    console.log('='.repeat(60))
    console.log(`Total establecimientos: ${establishments.length}`)
    console.log(`Total packs: ${allPacks.length}`)
    console.log(`Packs disponibles ahora: ${activePacks.length}`)
    console.log(`Usuarios ESTABLISHMENT: ${estUsers.length}`)

    if (allPacks.length === 0) {
      console.log('\n🔴 PROBLEMA: No hay packs en la base de datos')
      console.log('\n💡 Solución:')
      console.log('   1. Inicia sesión como restaurante')
      console.log('   2. Ve al dashboard')
      console.log('   3. Crea un pack nuevo')
      console.log('   4. Asegúrate de que:')
      console.log('      - La fecha "Disponible desde" sea HOY o en el futuro')
      console.log('      - La fecha "Disponible hasta" sea después de "Disponible desde"')
      console.log('      - El precio con descuento sea menor que el precio original')
      console.log('      - La cantidad sea mayor a 0')
    } else if (activePacks.length === 0) {
      console.log('\n🟡 PROBLEMA: Hay packs pero ninguno está disponible')
      console.log('\n💡 Revisa los diagnósticos individuales arriba')
    } else {
      console.log('\n🟢 TODO BIEN: Hay packs disponibles')
    }

    console.log()

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

diagnosePacks()
