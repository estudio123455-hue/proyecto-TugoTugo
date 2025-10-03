import { prisma } from './prisma'

interface AuditLogData {
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'APPROVE' | 'REJECT'
  entityType: 'USER' | 'ESTABLISHMENT' | 'POST' | 'PACK' | 'ORDER'
  entityId: string
  userId: string
  userName?: string
  changes?: Record<string, any>
  metadata?: Record<string, any>
  ipAddress?: string
  userAgent?: string
}

export async function createAuditLog(data: AuditLogData) {
  try {
    await prisma.auditLog.create({
      data: {
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId,
        userId: data.userId,
        userName: data.userName || undefined,
        changes: data.changes ? JSON.stringify(data.changes) : undefined,
        metadata: data.metadata ? JSON.stringify(data.metadata) : undefined,
        ipAddress: data.ipAddress || undefined,
        userAgent: data.userAgent || undefined,
      },
    })
  } catch (error) {
    console.error('Error creating audit log:', error)
    // Don't throw - audit log failures shouldn't break the main operation
  }
}

export async function getAuditLogs(filters?: {
  entityType?: string
  entityId?: string
  userId?: string
  limit?: number
  offset?: number
}) {
  const where: any = {}
  
  if (filters?.entityType) {
    where.entityType = filters.entityType
  }
  
  if (filters?.entityId) {
    where.entityId = filters.entityId
  }
  
  if (filters?.userId) {
    where.userId = filters.userId
  }

  const logs = await prisma.auditLog.findMany({
    where,
    orderBy: {
      createdAt: 'desc',
    },
    take: filters?.limit || 100,
    skip: filters?.offset || 0,
  })

  return logs
}
