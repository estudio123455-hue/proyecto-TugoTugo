import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// GET - Obtener todos los usuarios
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
    const role = searchParams.get('role')

    const where = role ? { role } : {}

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        _count: {
          select: {
            orders: true,
          },
        },
        establishment: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({
      success: true,
      data: users,
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { success: false, message: 'Error al obtener usuarios' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar usuario
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
    const userId = searchParams.get('id')

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'ID de usuario requerido' },
        { status: 400 }
      )
    }

    // No permitir que el admin se elimine a sí mismo
    if (userId === session.user.id) {
      return NextResponse.json(
        { success: false, message: 'No puedes eliminarte a ti mismo' },
        { status: 400 }
      )
    }

    // Eliminar datos relacionados en orden correcto
    console.log('🗑️ Deleting user and related data:', userId)

    // 1. Eliminar órdenes del usuario
    await prisma.order.deleteMany({
      where: { userId }
    })

    // 2. Si es un establecimiento, eliminar todos sus datos
    const establishment = await prisma.establishment.findUnique({
      where: { userId }
    })

    if (establishment) {
      // Eliminar packs del establecimiento
      await prisma.pack.deleteMany({
        where: { establishmentId: establishment.id }
      })

      // Eliminar posts del establecimiento
      await prisma.post.deleteMany({
        where: { establishmentId: establishment.id }
      })

      // Eliminar reviews del establecimiento
      await prisma.review.deleteMany({
        where: { establishmentId: establishment.id }
      })

      // Eliminar favoritos del establecimiento
      await prisma.favorite.deleteMany({
        where: { establishmentId: establishment.id }
      })

      // Eliminar menu items del establecimiento
      await prisma.menuItem.deleteMany({
        where: { establishmentId: establishment.id }
      })

      // Eliminar el establecimiento
      await prisma.establishment.delete({
        where: { id: establishment.id }
      })
    }

    // 3. Eliminar reviews del usuario
    await prisma.review.deleteMany({
      where: { userId }
    })

    // 4. Eliminar favoritos del usuario
    await prisma.favorite.deleteMany({
      where: { userId }
    })

    // 5. Eliminar cuentas y sesiones del usuario
    await prisma.account.deleteMany({
      where: { userId }
    })

    await prisma.session.deleteMany({
      where: { userId }
    })

    // 6. Eliminar suscripciones push del usuario
    await prisma.pushSubscription.deleteMany({
      where: { userId }
    })

    // 7. Finalmente, eliminar el usuario
    await prisma.user.delete({
      where: { id: userId }
    })

    console.log('✅ User and all related data deleted successfully')

    return NextResponse.json({
      success: true,
      message: 'Usuario eliminado exitosamente',
    })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { success: false, message: 'Error al eliminar usuario' },
      { status: 500 }
    )
  }
}

// POST - Crear nuevo usuario
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
    const { email, name, password, role } = body

    if (!email || !password || !role) {
      return NextResponse.json(
        { success: false, message: 'Email, contraseña y rol son requeridos' },
        { status: 400 }
      )
    }

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'El email ya está registrado' },
        { status: 400 }
      )
    }

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(password, 10)

    // Crear usuario
    const user = await prisma.user.create({
      data: {
        email,
        name: name || email.split('@')[0],
        password: hashedPassword,
        role,
        emailVerified: new Date(), // Auto-verificar usuarios creados por admin
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        emailVerified: true,
        createdAt: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: user,
      message: 'Usuario creado exitosamente',
    })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { success: false, message: 'Error al crear usuario' },
      { status: 500 }
    )
  }
}

// PATCH - Actualizar rol de usuario
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
    const { userId, role } = body

    if (!userId || !role) {
      return NextResponse.json(
        { success: false, message: 'ID de usuario y rol requeridos' },
        { status: 400 }
      )
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: user,
      message: 'Rol actualizado exitosamente',
    })
  } catch (error) {
    console.error('Error updating user role:', error)
    return NextResponse.json(
      { success: false, message: 'Error al actualizar rol' },
      { status: 500 }
    )
  }
}
