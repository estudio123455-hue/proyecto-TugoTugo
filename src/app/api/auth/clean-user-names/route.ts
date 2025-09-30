import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 })
    }

    // Get current user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ message: 'Usuario no encontrado' }, { status: 404 })
    }

    // Check if name contains verification data
    if (user.name?.startsWith('VERIFY:')) {
      // More robust cleaning using regex
      const cleanName = user.name.replace(/^VERIFY:\d+:\d+:VERIFY:\d+:\d+:/, '')
      
      if (cleanName !== user.name) {
        // Update user with clean name
        const updatedUser = await prisma.user.update({
          where: { email: session.user.email },
          data: { name: cleanName },
        })

        return NextResponse.json({
          success: true,
          message: 'Nombre limpiado correctamente',
          oldName: user.name,
          newName: updatedUser.name,
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: 'El nombre ya está limpio',
      name: user.name,
    })
  } catch (error) {
    console.error('Error cleaning user name:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// Also allow GET for easy testing
export async function GET() {
  try {
    // Clean all users with verification data in names
    const usersWithVerifyData = await prisma.user.findMany({
      where: {
        name: {
          startsWith: 'VERIFY:',
        },
      },
    })

    let cleanedCount = 0
    const results = []

    for (const user of usersWithVerifyData) {
      if (user.name?.startsWith('VERIFY:')) {
        // More robust cleaning using regex
        const cleanName = user.name.replace(/^VERIFY:\d+:\d+:VERIFY:\d+:\d+:/, '')
        
        if (cleanName !== user.name) {
          await prisma.user.update({
            where: { id: user.id },
            data: { name: cleanName },
          })

          cleanedCount++
          results.push({
            email: user.email,
            oldName: user.name,
            newName: cleanName,
          })
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `${cleanedCount} nombres limpiados`,
      cleanedCount,
      results,
    })
  } catch (error) {
    console.error('Error cleaning all user names:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
