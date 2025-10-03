import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getAuditLogs } from '@/lib/auditLog'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// GET - Obtener logs de auditoría
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
    const entityType = searchParams.get('entityType') || undefined
    const entityId = searchParams.get('entityId') || undefined
    const userId = searchParams.get('userId') || undefined
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    const logs = await getAuditLogs({
      entityType,
      entityId,
      userId,
      limit,
      offset,
    })

    return NextResponse.json({
      success: true,
      data: logs,
    })
  } catch (error) {
    console.error('Error fetching audit logs:', error)
    return NextResponse.json(
      { success: false, message: 'Error al obtener logs de auditoría' },
      { status: 500 }
    )
  }
}
