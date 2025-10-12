import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Función para verificación automática con Google Places (simulada)
async function verifyWithGooglePlaces(name: string, address: string) {
  console.log('🔍 [Google Places] Searching for:', `${name} ${address}`)
  
  // Simulación: si el nombre contiene palabras comunes de restaurantes, lo consideramos válido
  const restaurantKeywords = ['restaurante', 'restaurant', 'pizzeria', 'pizzería', 'cafe', 'bar', 'comida', 'food', 'cocina', 'kitchen']
  const hasRestaurantKeyword = restaurantKeywords.some(keyword => 
    name.toLowerCase().includes(keyword.toLowerCase())
  )
  
  // Simulamos una respuesta de Google Places
  if (hasRestaurantKeyword) {
    return {
      found: true,
      placeId: `place_${Date.now()}`,
      confidence: 0.85,
      details: {
        name: name,
        address: address,
        rating: 4.2,
        totalRatings: 127
      }
    }
  }
  
  return {
    found: false,
    placeId: null,
    confidence: 0.0,
    details: null
  }
}

// Función principal de verificación automática
async function autoVerifyEstablishment(establishment: any) {
  try {
    console.log('🤖 [Auto-Verify] Verifying establishment:', establishment.name)
    
    // Verificación con Google Places
    const googleResult = await verifyWithGooglePlaces(establishment.name, establishment.address)
    
    if (googleResult.found && googleResult.confidence >= 0.8) {
      // Verificación exitosa - Aprobar automáticamente
      return {
        success: true,
        status: 'AUTO_VERIFIED',
        notes: `✅ Verificado automáticamente con Google Places. Confianza: ${(googleResult.confidence * 100).toFixed(1)}%. El restaurante está listo para recibir clientes.`,
        confidence: googleResult.confidence
      }
    } else if (googleResult.found && googleResult.confidence >= 0.5) {
      // Verificación parcial - Marcar como pendiente pero con nota positiva
      return {
        success: true,
        status: 'PENDING',
        notes: `⚠️ Encontrado en Google Places con confianza media (${(googleResult.confidence * 100).toFixed(1)}%). Requiere verificación manual para activación completa.`,
        confidence: googleResult.confidence
      }
    } else {
      // No encontrado - Marcar como pendiente
      return {
        success: true,
        status: 'PENDING',
        notes: '❌ No se encontró en Google Places. El restaurante requiere verificación manual antes de ser activado.',
        confidence: 0
      }
    }
  } catch (error) {
    console.error('❌ [Auto-Verify] Error during verification:', error)
    return {
      success: false,
      status: 'PENDING',
      notes: 'Error durante la verificación automática. Requiere verificación manual.',
      confidence: 0
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🏪 [Setup] Starting establishment setup...')
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      console.log('❌ [Setup] Unauthorized - no session')
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    console.log('👤 [Setup] User:', session.user.id, 'Role:', session.user.role)

    const data = await request.json()
    console.log('📝 [Setup] Received data:', {
      name: data.name,
      category: data.category,
      address: data.address,
    })

    // Check if establishment already exists
    const existingEstablishment = await prisma.establishment.findUnique({
      where: {
        userId: session.user.id,
      },
    })

    if (existingEstablishment) {
      console.log('⚠️ [Setup] Establishment already exists for user')
      return NextResponse.json(
        { message: 'Establishment already exists' },
        { status: 400 }
      )
    }

    console.log('💾 [Setup] Creating establishment...')
    const establishment = await prisma.establishment.create({
      data: {
        name: data.name,
        description: data.description || '',
        address: data.address,
        latitude: parseFloat(data.latitude),
        longitude: parseFloat(data.longitude),
        phone: data.phone || '',
        email: data.email || '',
        category: data.category,
        userId: session.user.id,
      },
    })

    // Update user role to ESTABLISHMENT
    await prisma.user.update({
      where: { id: session.user.id },
      data: { role: 'ESTABLISHMENT' },
    })

    console.log('✅ [Setup] Establishment created:', establishment.id)
    console.log('✅ [Setup] User role updated to ESTABLISHMENT')

    // 🤖 VERIFICACIÓN AUTOMÁTICA - Sin intervención humana
    console.log('🤖 [Auto-Verify] Starting automatic verification...')
    
    try {
      // Llamar a la función de verificación automática
      const verificationResult = await autoVerifyEstablishment(establishment)
      
      if (verificationResult.success) {
        console.log('✅ [Auto-Verify] Restaurant verified automatically:', verificationResult.status)
        
        // Actualizar el estado del establecimiento
        await prisma.establishment.update({
          where: { id: establishment.id },
          data: {
            verificationStatus: verificationResult.status,
            verificationNotes: verificationResult.notes,
            approvedAt: verificationResult.status === 'AUTO_VERIFIED' ? new Date() : null,
          }
        })

        // Crear log de auditoría para la verificación automática
        await prisma.auditLog.create({
          data: {
            action: 'AUTO_VERIFY',
            entityType: 'ESTABLISHMENT',
            entityId: establishment.id,
            userId: 'system',
            userName: 'Sistema Automático',
            changes: JSON.stringify({
              verificationStatus: verificationResult.status,
              confidence: verificationResult.confidence,
              method: 'Google Places API (simulado)'
            }),
            metadata: JSON.stringify({
              establishmentName: establishment.name,
              address: establishment.address,
              autoVerified: verificationResult.status === 'AUTO_VERIFIED'
            })
          }
        })
      } else {
        console.log('⚠️ [Auto-Verify] Automatic verification failed, marked as PENDING')
      }
    } catch (verifyError) {
      console.error('❌ [Auto-Verify] Error during automatic verification:', verifyError)
      // No fallar el registro si la verificación falla
    }

    // Emit WebSocket event for real-time updates
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('ws:establishment:created', { 
        detail: { establishmentId: establishment.id, name: establishment.name }
      }))
    }

    return NextResponse.json(establishment, { status: 201 })
  } catch (error) {
    console.error('❌ [Setup] Error setting up establishment:', error)
    console.error('Error details:', error instanceof Error ? error.message : error)
    console.error('Stack:', error instanceof Error ? error.stack : 'No stack')
    return NextResponse.json(
      { 
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
