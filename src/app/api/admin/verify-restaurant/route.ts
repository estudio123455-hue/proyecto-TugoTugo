import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Función para verificar con Google Places API (simulada por ahora)
async function verifyWithGooglePlaces(name: string, address: string) {
  // TODO: Implementar Google Places API
  // Por ahora, simulamos la verificación
  
  const searchQuery = `${name} ${address}`
  console.log('🔍 Searching Google Places for:', searchQuery)
  
  // Simulación: si el nombre contiene palabras comunes de restaurantes, lo consideramos válido
  const restaurantKeywords = ['restaurante', 'restaurant', 'pizzeria', 'pizzería', 'cafe', 'bar', 'comida', 'food']
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

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, message: 'No autorizado' },
        { status: 401 }
      )
    }

    const { establishmentId, verificationType = 'AUTO' } = await request.json()

    if (!establishmentId) {
      return NextResponse.json(
        { success: false, message: 'ID de establecimiento requerido' },
        { status: 400 }
      )
    }

    console.log('🔍 Starting verification for establishment:', establishmentId)

    // Obtener el establecimiento
    const establishment = await prisma.establishment.findUnique({
      where: { id: establishmentId },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    if (!establishment) {
      return NextResponse.json(
        { success: false, message: 'Establecimiento no encontrado' },
        { status: 404 }
      )
    }

    let verificationStatus = 'PENDING'
    let verificationNotes = ''
    let googleVerified = false
    const locationVerified = false
    let confidence = 0

    // Verificación automática con Google Places
    if (verificationType === 'AUTO' || verificationType === 'HYBRID') {
      console.log('🤖 Running automatic verification...')
      
      const googleResult = await verifyWithGooglePlaces(
        establishment.name,
        establishment.address
      )

      if (googleResult.found) {
        googleVerified = true
        confidence = googleResult.confidence
        verificationNotes = `Verificado automáticamente con Google Places. Confianza: ${(googleResult.confidence * 100).toFixed(1)}%`
        
        // Si la confianza es alta, aprobar automáticamente
        if (googleResult.confidence >= 0.8) {
          verificationStatus = 'AUTO_VERIFIED'
        }

        // Actualizar el establecimiento con los datos de Google
        await prisma.establishment.update({
          where: { id: establishmentId },
          data: {
            verificationStatus: verificationStatus,
            verificationNotes: verificationNotes,
            approvedAt: verificationStatus === 'AUTO_VERIFIED' ? new Date() : null,
            approvedBy: verificationStatus === 'AUTO_VERIFIED' ? session.user.id : null,
          }
        })

        console.log('✅ Automatic verification completed:', verificationStatus)
      } else {
        verificationNotes = 'No se encontró en Google Places. Requiere verificación manual.'
        
        await prisma.establishment.update({
          where: { id: establishmentId },
          data: {
            verificationStatus: 'PENDING',
            verificationNotes: verificationNotes,
          }
        })

        console.log('⚠️ Automatic verification failed, requires manual review')
      }
    }

    // Verificación manual
    if (verificationType === 'MANUAL') {
      console.log('👨‍💼 Manual verification required')
      verificationNotes = 'Pendiente de verificación manual por administrador.'
    }

    // Crear log de auditoría
    await prisma.auditLog.create({
      data: {
        action: 'VERIFY',
        entityType: 'ESTABLISHMENT',
        entityId: establishmentId,
        userId: session.user.id,
        userName: session.user.name || session.user.email,
        changes: JSON.stringify({
          verificationType: verificationType,
          status: verificationStatus,
          googleVerified: googleVerified,
          confidence: confidence
        }),
        metadata: JSON.stringify({
          establishmentName: establishment.name,
          address: establishment.address
        })
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Verificación completada',
      data: {
        establishmentId,
        verificationStatus: verificationStatus,
        verificationType: verificationType,
        googleVerified: googleVerified,
        locationVerified: locationVerified,
        confidence: confidence,
        notes: verificationNotes,
        requiresManualReview: verificationStatus === 'PENDING'
      }
    })
  } catch (error) {
    console.error('❌ Error during verification:', error)
    
    return NextResponse.json(
      {
        success: false,
        message: 'Error durante la verificación',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// Endpoint para aprobar/rechazar manualmente
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, message: 'No autorizado' },
        { status: 401 }
      )
    }

    const { establishmentId, action, notes } = await request.json()

    if (!establishmentId || !action) {
      return NextResponse.json(
        { success: false, message: 'Datos requeridos: establishmentId, action' },
        { status: 400 }
      )
    }

    const validActions = ['APPROVE', 'REJECT', 'SUSPEND']
    if (!validActions.includes(action)) {
      return NextResponse.json(
        { success: false, message: 'Acción inválida' },
        { status: 400 }
      )
    }

    const statusMap = {
      'APPROVE': 'APPROVED',
      'REJECT': 'REJECTED',
      'SUSPEND': 'SUSPENDED'
    }

    const updateData: any = {
      verificationStatus: statusMap[action as keyof typeof statusMap],
      verificationType: 'MANUAL',
      verificationNotes: notes || `${action} por administrador`,
      lastModifiedBy: session.user.id,
    }

    if (action === 'APPROVE') {
      updateData.approvedAt = new Date()
      updateData.approvedBy = session.user.id
    } else if (action === 'SUSPEND') {
      updateData.suspendedAt = new Date()
      updateData.suspendedReason = notes || 'Suspendido por administrador'
    }

    await prisma.establishment.update({
      where: { id: establishmentId },
      data: updateData
    })

    // Crear log de auditoría
    await prisma.auditLog.create({
      data: {
        action: action,
        entityType: 'ESTABLISHMENT',
        entityId: establishmentId,
        userId: session.user.id,
        userName: session.user.name || session.user.email,
        changes: JSON.stringify(updateData),
        metadata: JSON.stringify({ notes })
      }
    })

    return NextResponse.json({
      success: true,
      message: `Establecimiento ${action.toLowerCase()} exitosamente`,
      data: {
        establishmentId,
        status: updateData.verificationStatus,
        action
      }
    })
  } catch (error) {
    console.error('❌ Error during manual verification:', error)
    
    return NextResponse.json(
      {
        success: false,
        message: 'Error durante la verificación manual',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
