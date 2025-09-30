import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Find all users with verification codes in their names
    const usersWithDirtyNames = await prisma.user.findMany({
      where: {
        name: {
          startsWith: 'VERIFY:',
        },
      },
    })

    let cleanedCount = 0
    const results = []

    for (const user of usersWithDirtyNames) {
      if (user.name?.startsWith('VERIFY:')) {
        // Clean the name using regex
        const cleanName = user.name.replace(/^VERIFY:\d+:\d+:/, '')
        
        if (cleanName !== user.name && cleanName.trim() !== '') {
          // Update the user with clean name
          await prisma.user.update({
            where: { id: user.id },
            data: { name: cleanName },
          })

          cleanedCount++
          results.push({
            id: user.id,
            email: user.email,
            oldName: user.name,
            newName: cleanName,
          })
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `${cleanedCount} nombres limpiados automáticamente`,
      cleanedCount,
      results,
    })
  } catch (error) {
    console.error('Error auto-cleaning user names:', error)
    return NextResponse.json(
      { 
        success: false,
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Also allow POST for manual trigger
export async function POST() {
  return GET()
}
