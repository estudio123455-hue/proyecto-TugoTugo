import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createAuditLog } from '@/lib/auditLog'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// GET - Obtener menú del restaurante
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const establishmentId = searchParams.get('establishmentId')

    if (!establishmentId) {
      return NextResponse.json(
        { success: false, message: 'establishmentId requerido' },
        { status: 400 }
      )
    }

    const menuItems = await prisma.menuItem.findMany({
      where: { establishmentId },
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    })

    // Agrupar por categoría
    const groupedMenu = menuItems.reduce((acc: Record<string, any[]>, item: any) => {
      if (!acc[item.category]) {
        acc[item.category] = []
      }
      acc[item.category].push(item)
      return acc
    }, {})

    return NextResponse.json({
      success: true,
      data: {
        items: menuItems,
        grouped: groupedMenu,
        categories: Object.keys(groupedMenu),
      },
    })
  } catch (error: any) {
    console.error('Error fetching menu:', error)
    return NextResponse.json(
      { success: false, message: 'Error al obtener menú' },
      { status: 500 }
    )
  }
}

// POST - Crear item de menú
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ESTABLISHMENT') {
      return NextResponse.json(
        { success: false, message: 'No autorizado' },
        { status: 401 }
      )
    }

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

    const data = await request.json()

    // Validar datos requeridos
    if (!data.name || !data.price || !data.category) {
      return NextResponse.json(
        { success: false, message: 'Nombre, precio y categoría son requeridos' },
        { status: 400 }
      )
    }

    // Crear item de menú
    const menuItem = await prisma.menuItem.create({
      data: {
        name: data.name,
        description: data.description,
        price: parseFloat(data.price),
        category: data.category,
        image: data.image,
        isAvailable: data.isAvailable !== false,
        preparationTime: data.preparationTime ? parseInt(data.preparationTime) : null,
        allergens: data.allergens || [],
        isVegetarian: data.isVegetarian || false,
        isVegan: data.isVegan || false,
        isGlutenFree: data.isGlutenFree || false,
        establishmentId: establishment.id,
      },
    })

    await createAuditLog({
      action: 'CREATE',
      entityType: 'MENU_ITEM',
      entityId: menuItem.id,
      userId: session.user.id,
      userName: session.user.name || session.user.email || undefined,
      changes: { name: menuItem.name, price: menuItem.price, category: menuItem.category },
    })

    return NextResponse.json({
      success: true,
      data: menuItem,
      message: 'Item de menú creado exitosamente',
    })
  } catch (error: any) {
    console.error('Error creating menu item:', error)
    return NextResponse.json(
      { success: false, message: 'Error al crear item de menú' },
      { status: 500 }
    )
  }
}
