import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    // Verificar token de seguridad
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    
    const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'admin-cleanup-token-123'
    
    if (token !== ADMIN_TOKEN) {
      return NextResponse.json(
        { message: 'Unauthorized. Invalid admin token.' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { email, password, name } = body

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      )
    }

    console.log('👨‍💼 Creating admin user...')

    // Verificar si ya existe un usuario con ese email
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      // Si existe, actualizar su rol a ADMIN
      console.log('📝 Updating existing user to admin...')
      const updatedUser = await prisma.user.update({
        where: { email },
        data: {
          role: 'ADMIN',
          emailVerified: new Date()
        }
      })

      return NextResponse.json({
        message: 'User updated to admin successfully! 👨‍💼',
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role
        }
      })
    }

    // Si no existe, crear nuevo usuario admin
    console.log('🆕 Creating new admin user...')
    const hashedPassword = await bcrypt.hash(password, 10)

    const adminUser = await prisma.user.create({
      data: {
        name: name || 'Admin User',
        email,
        password: hashedPassword,
        role: 'ADMIN',
        emailVerified: new Date()
      }
    })

    return NextResponse.json({
      message: 'Admin user created successfully! 👨‍💼',
      user: {
        id: adminUser.id,
        name: adminUser.name,
        email: adminUser.email,
        role: adminUser.role
      }
    })
  } catch (error) {
    console.error('❌ Error creating admin user:', error)
    
    return NextResponse.json(
      {
        message: 'Error creating admin user',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// Endpoint para listar usuarios admin existentes
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    
    const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'admin-cleanup-token-123'
    
    if (token !== ADMIN_TOKEN) {
      return NextResponse.json(
        { message: 'Unauthorized. Invalid admin token.' },
        { status: 401 }
      )
    }

    const adminUsers = await prisma.user.findMany({
      where: {
        role: 'ADMIN'
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        emailVerified: true
      }
    })

    return NextResponse.json({
      message: 'Admin users retrieved successfully',
      count: adminUsers.length,
      users: adminUsers
    })
  } catch (error) {
    console.error('❌ Error fetching admin users:', error)
    
    return NextResponse.json(
      {
        message: 'Error fetching admin users',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
