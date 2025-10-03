import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createAuditLog } from '@/lib/auditLog'
import bcrypt from 'bcryptjs'

// GET - Obtener todos los establecimientos
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, message: 'No autorizado' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const where = status ? { verificationStatus: status } : {}

    const establishments = await prisma.establishment.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            packs: true,
            posts: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({
      success: true,
      data: establishments,
    })
  } catch (error) {
    console.error('Error fetching establishments:', error)
    return NextResponse.json(
      { success: false, message: 'Error al obtener establecimientos' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar establecimiento
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, message: 'No autorizado' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const establishmentId = searchParams.get('id')

    if (!establishmentId) {
      return NextResponse.json(
        { success: false, message: 'ID de establecimiento requerido' },
        { status: 400 }
      )
    }

    const establishment = await prisma.establishment.findUnique({
      where: { id: establishmentId },
    })

    await prisma.establishment.delete({
      where: { id: establishmentId },
    })

    // Audit log
    await createAuditLog({
      action: 'DELETE',
      entityType: 'ESTABLISHMENT',
      entityId: establishmentId,
      userId: session.user.id,
      userName: session.user.name || session.user.email,
      metadata: { name: establishment?.name },
    })

    return NextResponse.json({
      success: true,
      message: 'Establecimiento eliminado exitosamente',
    })
  } catch (error) {
    console.error('Error deleting establishment:', error)
    return NextResponse.json(
      { success: false, message: 'Error al eliminar establecimiento' },
      { status: 500 }
    )
  }
}

// POST - Crear nuevo establecimiento
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, message: 'No autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      name,
      description,
      address,
      latitude,
      longitude,
      phone,
      email,
      image,
      category,
      userId,
      openingHours,
      businessType,
      taxId,
    } = body

    if (!name || !address || !latitude || !longitude || !category) {
      return NextResponse.json(
        { success: false, message: 'Campos requeridos: nombre, dirección, ubicación y categoría' },
        { status: 400 }
      )
    }

    // Si se proporciona userId, verificar que exista
    let targetUserId = userId
    if (!targetUserId) {
      // Crear un nuevo usuario para el establecimiento
      if (!email) {
        return NextResponse.json(
          { success: false, message: 'Email requerido para crear usuario' },
          { status: 400 }
        )
      }

      const existingUser = await prisma.user.findUnique({
        where: { email },
      })

      if (existingUser) {
        targetUserId = existingUser.id
      } else {
        const hashedPassword = await bcrypt.hash('changeme123', 10)
        const newUser = await prisma.user.create({
          data: {
            email,
            name: name,
            password: hashedPassword,
            role: 'ESTABLISHMENT',
            emailVerified: new Date(),
          },
        })
        targetUserId = newUser.id
      }
    }

    const establishment = await prisma.establishment.create({
      data: {
        name,
        description,
        address,
        latitude,
        longitude,
        phone,
        email,
        image,
        category,
        userId: targetUserId,
        openingHours,
        businessType,
        taxId,
        verificationStatus: 'APPROVED',
        approvedAt: new Date(),
        approvedBy: session.user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    // Audit log
    await createAuditLog({
      action: 'CREATE',
      entityType: 'ESTABLISHMENT',
      entityId: establishment.id,
      userId: session.user.id,
      userName: session.user.name || session.user.email,
      metadata: { name: establishment.name },
    })

    return NextResponse.json({
      success: true,
      data: establishment,
      message: 'Establecimiento creado exitosamente',
    })
  } catch (error) {
    console.error('Error creating establishment:', error)
    return NextResponse.json(
      { success: false, message: 'Error al crear establecimiento' },
      { status: 500 }
    )
  }
}

// PATCH - Actualizar estado de verificación
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, message: 'No autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { establishmentId, verificationStatus, verificationNotes, isActive } = body

    if (!establishmentId) {
      return NextResponse.json(
        { success: false, message: 'ID de establecimiento requerido' },
        { status: 400 }
      )
    }

    const updateData: any = {}
    
    if (verificationStatus) {
      updateData.verificationStatus = verificationStatus
      if (verificationStatus === 'APPROVED') {
        updateData.approvedAt = new Date()
        updateData.approvedBy = session.user.id
      }
    }
    
    if (verificationNotes !== undefined) {
      updateData.verificationNotes = verificationNotes
    }
    
    if (isActive !== undefined) {
      updateData.isActive = isActive
    }

    const establishment = await prisma.establishment.update({
      where: { id: establishmentId },
      data: updateData,
    })

    // Audit log
    await createAuditLog({
      action: verificationStatus === 'APPROVED' ? 'APPROVE' : verificationStatus === 'REJECTED' ? 'REJECT' : 'UPDATE',
      entityType: 'ESTABLISHMENT',
      entityId: establishmentId,
      userId: session.user.id,
      userName: session.user.name || session.user.email,
      changes: updateData,
    })

    return NextResponse.json({
      success: true,
      data: establishment,
      message: 'Establecimiento actualizado exitosamente',
    })
  } catch (error) {
    console.error('Error updating establishment:', error)
    return NextResponse.json(
      { success: false, message: 'Error al actualizar establecimiento' },
      { status: 500 }
    )
  }
}
