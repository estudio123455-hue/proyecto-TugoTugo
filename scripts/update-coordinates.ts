import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Coordenadas de ejemplo en diferentes zonas de Bogotá
const bogotaCoordinates = [
  { lat: 4.7110, lng: -74.0721, zone: 'Centro' },
  { lat: 4.6533, lng: -74.0836, zone: 'Sur' },
  { lat: 4.6764, lng: -74.0480, zone: 'Chapinero' },
  { lat: 4.6951, lng: -74.0366, zone: 'Usaquén' },
  { lat: 4.6097, lng: -74.0817, zone: 'Kennedy' },
  { lat: 4.7395, lng: -74.0628, zone: 'Suba' },
  { lat: 4.6486, lng: -74.1030, zone: 'Fontibón' },
  { lat: 4.5981, lng: -74.0758, zone: 'Bosa' },
  { lat: 4.7200, lng: -74.0500, zone: 'Chicó' },
  { lat: 4.6800, lng: -74.0600, zone: 'Teusaquillo' },
]

async function updateCoordinates() {
  try {
    console.log('🔄 Actualizando coordenadas de establecimientos...')

    // Obtener todos los establecimientos
    const establishments = await prisma.establishment.findMany({
      select: {
        id: true,
        name: true,
        latitude: true,
        longitude: true,
      },
    })

    console.log(`📍 Encontrados ${establishments.length} establecimientos`)

    let updated = 0
    
    for (let i = 0; i < establishments.length; i++) {
      const establishment = establishments[i]
      
      // Solo actualizar si las coordenadas son 0 o están muy cerca de 0
      if (
        Math.abs(establishment.latitude) < 0.001 ||
        Math.abs(establishment.longitude) < 0.001
      ) {
        // Asignar coordenadas de forma circular
        const coords = bogotaCoordinates[i % bogotaCoordinates.length]
        
        // Agregar pequeña variación para que no estén exactamente en el mismo punto
        const latVariation = (Math.random() - 0.5) * 0.01 // ±0.005 grados (~500m)
        const lngVariation = (Math.random() - 0.5) * 0.01
        
        await prisma.establishment.update({
          where: { id: establishment.id },
          data: {
            latitude: coords.lat + latVariation,
            longitude: coords.lng + lngVariation,
          },
        })
        
        console.log(`✅ ${establishment.name} → ${coords.zone} (${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)})`)
        updated++
      } else {
        console.log(`⏭️  ${establishment.name} ya tiene coordenadas`)
      }
    }

    console.log(`\n✨ Actualización completada: ${updated} establecimientos actualizados`)
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateCoordinates()
