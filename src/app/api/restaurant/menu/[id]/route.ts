import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createAuditLog } from '@/lib/auditLog'

// PUT - Actualizar item de menú
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ESTABLISHMENT') {
      return NextResponse.json(
        { success: false, message: 'No autorizado' },
        { status: 401 }
      )
    }

    const { id } = await params
    const data = await request.json()

    // Obtener establecimiento del usuario
    const establishment = await prisma.establishment.findUnique({
      where: { userId: session.user.id },
    })

    if (!establishment) {
      return NextResponse.json(
        { success: false, message: 'No se encontró establecimiento' },
        { status: 404 }
      )
    }

    // Verificar que el item pertenece al establecimiento
    const existingItem = await prisma.menuItem.findFirst({
      where: {
        id,
        establishmentId: establishment.id,
      },
    })

    if (!existingItem) {
      return NextResponse.json(
        { success: false, message: 'Item de menú no encontrado' },
        { status: 404 }
      )
    }

    // Actualizar item
    const menuItem = await prisma.menuItem.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        price: data.price !== undefined ? parseFloat(data.price) : undefined,
        category: data.category,
        image: data.image,
        isAvailable: data.isAvailable,
        preparationTime: data.preparationTime ? parseInt(data.preparationTime) : null,
        allergens: data.allergens,
        isVegetarian: data.isVegetarian,
        isVegan: data.isVegan,
        isGlutenFree: data.isGlutenFree,
      },
    })

    await createAuditLog({
      action: 'UPDATE',
      entityType: 'MENU_ITEM',
      entityId: menuItem.id,
      userId: session.user.id,
      userName: session.user.name || session.user.email || undefined,
      changes: data,
    })

    return NextResponse.json({
      success: true,
      data: menuItem,
      message: 'Item de menú actualizado exitosamente',
    })
  } catch (error: any) {
    console.error('Error updating menu item:', error)
    return NextResponse.json(
      { success: false, message: 'Error al actualizar item de menú' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar item de menú
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ESTABLISHMENT') {
      return NextResponse.json(
        { success: false, message: 'No autorizado' },
        { status: 401 }
      )
    }

    const { id } = await params

    // Obtener establecimiento del usuario
    const establishment = await prisma.establishment.findUnique({
      where: { userId: session.user.id },
    })

    if (!establishment) {
      return NextResponse.json(
        { success: false, message: 'No se encontró establecimiento' },
        { status: 404 }
      )
    }

    // Verificar que el item pertenece al establecimiento
    const existingItem = await prisma.menuItem.findFirst({
      where: {
        id,
        establishmentId: establishment.id,
      },
    })

    if (!existingItem) {
      return NextResponse.json(
        { success: false, message: 'Item de menú no encontrado' },
        { status: 404 }
      )
    }

    // Eliminar item
    await prisma.menuItem.delete({
      where: { id },
    })

    await createAuditLog({
      action: 'DELETE',
      entityType: 'MENU_ITEM',
      entityId: id,
      userId: session.user.id,
      userName: session.user.name || session.user.email || undefined,
      changes: { deleted: true, name: existingItem.name },
    })

    return NextResponse.json({
      success: true,
      message: 'Item de menú eliminado exitosamente',
    })
  } catch (error: any) {
    console.error('Error deleting menu item:', error)
    return NextResponse.json(
      { success: false, message: 'Error al eliminar item de menú' },
      { status: 500 }
    )
  }
}
