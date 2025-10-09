import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// GET - Exportar datos a CSV
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
    const type = searchParams.get('type') // users, establishments, posts, packs, orders

    let csvData = ''
    let filename = 'export.csv'

    switch (type) {
      case 'users': {
        const users = await prisma.user.findMany({
          select: {
            name: true,
            email: true,
            role: true,
          },
          orderBy: { createdAt: 'desc' },
        })
        
        csvData = 'Nombre,Email,Tipo\n'
        users.forEach((user) => {
          const tipo = user.role === 'ESTABLISHMENT' ? 'Restaurante' : user.role === 'CUSTOMER' ? 'Cliente' : user.role
          csvData += `"${user.name || ''}","${user.email}","${tipo}"\n`
        })
        filename = 'usuarios.csv'
        break
      }

      case 'establishments': {
        const establishments = await prisma.establishment.findMany({
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        })
        
        csvData = 'ID,Nombre,Categoría,Dirección,Email,Teléfono,Estado Verificación,Activo,Usuario,Email Usuario,Fecha Creación\n'
        establishments.forEach((est) => {
          csvData += `"${est.id}","${est.name}","${est.category}","${est.address}","${est.email || ''}","${est.phone || ''}","${est.verificationStatus}","${est.isActive ? 'Sí' : 'No'}","${est.user.name || ''}","${est.user.email}","${est.createdAt.toISOString()}"\n`
        })
        filename = 'restaurantes.csv'
        break
      }

      case 'posts': {
        const posts = await prisma.post.findMany({
          include: {
            establishment: {
              select: {
                name: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        })
        
        csvData = 'ID,Título,Restaurante,Precio,Activo,Likes,Vistas,Fecha Creación\n'
        posts.forEach((post) => {
          csvData += `"${post.id}","${post.title}","${post.establishment.name}","${post.price || 'N/A'}","${post.isActive ? 'Sí' : 'No'}","${post.likes}","${post.views}","${post.createdAt.toISOString()}"\n`
        })
        filename = 'posts.csv'
        break
      }

      case 'packs': {
        const packs = await prisma.pack.findMany({
          include: {
            establishment: {
              select: {
                name: true,
              },
            },
            _count: {
              select: {
                orders: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        })
        
        csvData = 'ID,Título,Restaurante,Precio Original,Precio Descuento,Cantidad,Órdenes,Activo,Disponible Desde,Disponible Hasta,Fecha Creación\n'
        packs.forEach((pack) => {
          csvData += `"${pack.id}","${pack.title}","${pack.establishment.name}","${pack.originalPrice}","${pack.discountedPrice}","${pack.quantity}","${pack._count.orders}","${pack.isActive ? 'Sí' : 'No'}","${pack.availableFrom.toISOString()}","${pack.availableUntil.toISOString()}","${pack.createdAt.toISOString()}"\n`
        })
        filename = 'packs.csv'
        break
      }

      case 'orders': {
        const orders = await prisma.order.findMany({
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
            pack: {
              select: {
                title: true,
                establishment: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        })
        
        csvData = 'ID,Pack,Restaurante,Usuario,Email Usuario,Cantidad,Total,Estado,Fecha Recogida,Fecha Creación\n'
        orders.forEach((order) => {
          csvData += `"${order.id}","${order.pack.title}","${order.pack.establishment.name}","${order.user.name || ''}","${order.user.email}","${order.quantity}","${order.totalAmount}","${order.status}","${order.pickupDate.toISOString()}","${order.createdAt.toISOString()}"\n`
        })
        filename = 'ordenes.csv'
        break
      }

      default:
        return NextResponse.json(
          { success: false, message: 'Tipo de exportación no válido' },
          { status: 400 }
        )
    }

    // Return CSV file
    return new NextResponse(csvData, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('Error exporting data:', error)
    return NextResponse.json(
      { success: false, message: 'Error al exportar datos' },
      { status: 500 }
    )
  }
}
