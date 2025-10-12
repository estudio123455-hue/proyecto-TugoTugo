import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Función para generar código de verificación
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Función para enviar SMS (simulada - en producción usar Twilio, etc.)
async function sendSMS(phone: string, code: string): Promise<boolean> {
  console.log(`📱 [SMS] Enviando código ${code} a ${phone}`)
  
  // TODO: Integrar con servicio real de SMS
  // En producción, usar Twilio, AWS SNS, etc.
  
  // Simulación: siempre exitoso
  return true
}

// POST: Solicitar código de verificación
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'No autorizado' },
        { status: 401 }
      )
    }

    const { phone } = await request.json()

    if (!phone) {
      return NextResponse.json(
        { message: 'Número de teléfono requerido' },
        { status: 400 }
      )
    }

    // Validar formato de teléfono (básico)
    const phoneRegex = /^\+?[1-9]\d{1,14}$/
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
      return NextResponse.json(
        { message: 'Formato de teléfono inválido' },
        { status: 400 }
      )
    }

    // Generar código de verificación
    const verificationCode = generateVerificationCode()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutos

    console.log(`📱 [Phone Verify] Generating code for user ${session.user.id}`)

    // Actualizar usuario con código de verificación
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        phone: phone,
        phoneVerificationCode: verificationCode,
        phoneVerificationExpires: expiresAt,
        phoneVerified: null, // Resetear verificación anterior
      }
    })

    // Enviar SMS
    const smsSent = await sendSMS(phone, verificationCode)

    if (!smsSent) {
      return NextResponse.json(
        { message: 'Error enviando SMS. Inténtalo de nuevo.' },
        { status: 500 }
      )
    }

    // Log de auditoría
    await prisma.auditLog.create({
      data: {
        action: 'PHONE_VERIFICATION_REQUESTED',
        entityType: 'USER',
        entityId: session.user.id,
        userId: session.user.id,
        userName: session.user.name || session.user.email,
        metadata: JSON.stringify({
          phone: phone,
          codeGenerated: true
        })
      }
    })

    return NextResponse.json({
      message: 'Código de verificación enviado por SMS',
      success: true,
      expiresIn: 600 // 10 minutos en segundos
    })
  } catch (error) {
    console.error('❌ Error requesting phone verification:', error)
    
    return NextResponse.json(
      {
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// PUT: Verificar código
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'No autorizado' },
        { status: 401 }
      )
    }

    const { code } = await request.json()

    if (!code) {
      return NextResponse.json(
        { message: 'Código de verificación requerido' },
        { status: 400 }
      )
    }

    console.log(`📱 [Phone Verify] Verifying code for user ${session.user.id}`)

    // Obtener usuario con datos de verificación
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        phone: true,
        phoneVerificationCode: true,
        phoneVerificationExpires: true,
        phoneVerified: true,
        verificationStatus: true,
        trustScore: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { message: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // Verificar si ya está verificado
    if (user.phoneVerified) {
      return NextResponse.json(
        { message: 'Teléfono ya verificado' },
        { status: 400 }
      )
    }

    // Verificar código
    if (user.phoneVerificationCode !== code) {
      return NextResponse.json(
        { message: 'Código de verificación incorrecto' },
        { status: 400 }
      )
    }

    // Verificar expiración
    if (!user.phoneVerificationExpires || new Date() > user.phoneVerificationExpires) {
      return NextResponse.json(
        { message: 'Código de verificación expirado' },
        { status: 400 }
      )
    }

    // Determinar nuevo estado de verificación
    let newVerificationStatus = user.verificationStatus
    let newTrustScore = user.trustScore

    if (user.verificationStatus === 'EMAIL_VERIFIED') {
      newVerificationStatus = 'PHONE_VERIFIED'
      newTrustScore = Math.min(user.trustScore + 0.3, 1.0) // Aumentar confianza
    } else if (user.verificationStatus === 'PENDING') {
      newVerificationStatus = 'PHONE_VERIFIED' // Saltar EMAIL_VERIFIED si no se hizo
      newTrustScore = Math.min(user.trustScore + 0.5, 1.0)
    }

    // Actualizar usuario
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        phoneVerified: new Date(),
        phoneVerificationCode: null,
        phoneVerificationExpires: null,
        verificationStatus: newVerificationStatus,
        trustScore: newTrustScore,
        lastActivity: new Date()
      }
    })

    // Log de auditoría
    await prisma.auditLog.create({
      data: {
        action: 'PHONE_VERIFIED',
        entityType: 'USER',
        entityId: session.user.id,
        userId: session.user.id,
        userName: session.user.name || session.user.email,
        changes: JSON.stringify({
          verificationStatus: newVerificationStatus,
          trustScore: newTrustScore,
          phoneVerified: true
        }),
        metadata: JSON.stringify({
          phone: user.phone,
          previousStatus: user.verificationStatus
        })
      }
    })

    console.log(`✅ [Phone Verify] Phone verified for user ${session.user.id}`)

    return NextResponse.json({
      message: 'Teléfono verificado exitosamente',
      success: true,
      verificationStatus: newVerificationStatus,
      trustScore: newTrustScore
    })
  } catch (error) {
    console.error('❌ Error verifying phone:', error)
    
    return NextResponse.json(
      {
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
