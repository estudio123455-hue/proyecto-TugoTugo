import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from './auth'

// Roles disponibles en el sistema
export enum UserRole {
  ADMIN = 'ADMIN',
  ESTABLISHMENT = 'ESTABLISHMENT',
  CUSTOMER = 'CUSTOMER',
}

// Tipo para la sesión con rol
export interface AuthSession {
  user: {
    id: string
    email: string
    name?: string | null
    role: UserRole
  }
}

/**
 * Middleware de autorización para verificar roles
 * @param allowedRoles - Array de roles permitidos
 * @returns Sesión si está autorizado, o NextResponse con error
 */
export async function authorize(
  allowedRoles: UserRole[]
): Promise<AuthSession | NextResponse> {
  const session = await getServerSession(authOptions)

  // Verificar si hay sesión
  if (!session) {
    return NextResponse.json(
      { success: false, message: 'No autenticado. Inicia sesión.' },
      { status: 401 }
    )
  }

  // Verificar si el usuario tiene un rol válido
  if (!session.user?.role) {
    return NextResponse.json(
      { success: false, message: 'Usuario sin rol asignado.' },
      { status: 403 }
    )
  }

  // Verificar si el rol del usuario está en los roles permitidos
  if (!allowedRoles.includes(session.user.role as UserRole)) {
    return NextResponse.json(
      {
        success: false,
        message: `Acceso denegado. Se requiere rol: ${allowedRoles.join(' o ')}.`,
      },
      { status: 403 }
    )
  }

  return session as AuthSession
}

/**
 * Middleware específico para rutas de administrador
 */
export async function requireAdmin(): Promise<AuthSession | NextResponse> {
  return authorize([UserRole.ADMIN])
}

/**
 * Middleware para rutas de establecimiento
 */
export async function requireEstablishment(): Promise<AuthSession | NextResponse> {
  return authorize([UserRole.ESTABLISHMENT, UserRole.ADMIN])
}

/**
 * Middleware para rutas autenticadas (cualquier rol)
 */
export async function requireAuth(): Promise<AuthSession | NextResponse> {
  return authorize([UserRole.ADMIN, UserRole.ESTABLISHMENT, UserRole.CUSTOMER])
}

/**
 * Verifica si el usuario es dueño del recurso
 * @param session - Sesión del usuario
 * @param resourceOwnerId - ID del dueño del recurso
 * @returns true si es dueño o admin
 */
export function isOwnerOrAdmin(
  session: AuthSession,
  resourceOwnerId: string
): boolean {
  return (
    session.user.role === UserRole.ADMIN ||
    session.user.id === resourceOwnerId
  )
}

/**
 * Verifica si el usuario tiene permiso para modificar un recurso
 * @param session - Sesión del usuario
 * @param resourceOwnerId - ID del dueño del recurso
 * @returns NextResponse con error o null si tiene permiso
 */
export function checkOwnership(
  session: AuthSession,
  resourceOwnerId: string
): NextResponse | null {
  if (!isOwnerOrAdmin(session, resourceOwnerId)) {
    return NextResponse.json(
      {
        success: false,
        message: 'No tienes permiso para modificar este recurso.',
      },
      { status: 403 }
    )
  }
  return null
}

/**
 * Matriz de permisos por rol
 */
export const PERMISSIONS = {
  [UserRole.ADMIN]: {
    canManageUsers: true,
    canManageEstablishments: true,
    canManagePosts: true,
    canManagePacks: true,
    canManageOrders: true,
    canViewReports: true,
    canExportData: true,
    canViewAuditLogs: true,
    canSendNotifications: true,
  },
  [UserRole.ESTABLISHMENT]: {
    canManageUsers: false,
    canManageEstablishments: false, // Solo su propio establecimiento
    canManagePosts: true, // Solo sus propios posts
    canManagePacks: true, // Solo sus propios packs
    canManageOrders: true, // Solo sus propias órdenes
    canViewReports: false,
    canExportData: false,
    canViewAuditLogs: false,
    canSendNotifications: false,
  },
  [UserRole.CUSTOMER]: {
    canManageUsers: false,
    canManageEstablishments: false,
    canManagePosts: false,
    canManagePacks: false,
    canManageOrders: false, // Solo ver sus propias órdenes
    canViewReports: false,
    canExportData: false,
    canViewAuditLogs: false,
    canSendNotifications: false,
  },
}

/**
 * Verifica si un usuario tiene un permiso específico
 * @param role - Rol del usuario
 * @param permission - Permiso a verificar
 * @returns true si tiene el permiso
 */
export function hasPermission(
  role: UserRole,
  permission: keyof typeof PERMISSIONS.ADMIN
): boolean {
  return PERMISSIONS[role]?.[permission] || false
}
