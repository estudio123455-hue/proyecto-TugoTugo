import { z } from 'zod'

// Schema para crear/actualizar usuario
export const userSchema = z.object({
  name: z.string().min(1, 'Nombre requerido').max(100, 'Nombre muy largo'),
  email: z.string().email('Email inválido'),
  password: z
    .string()
    .min(8, 'Contraseña debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
    .regex(/[a-z]/, 'Debe contener al menos una minúscula')
    .regex(/[0-9]/, 'Debe contener al menos un número')
    .optional(),
  role: z.enum(['ADMIN', 'ESTABLISHMENT', 'CUSTOMER']).optional(),
})

// Schema para crear establecimiento
export const establishmentSchema = z.object({
  name: z.string().min(1, 'Nombre requerido').max(100, 'Nombre muy largo'),
  address: z.string().min(1, 'Dirección requerida').max(200, 'Dirección muy larga'),
  category: z.string().min(1, 'Categoría requerida'),
  latitude: z.number().min(-90).max(90, 'Latitud inválida'),
  longitude: z.number().min(-180).max(180, 'Longitud inválida'),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Teléfono inválido. Formato: +573001234567')
    .optional()
    .or(z.literal('')),
  email: z
    .string()
    .email('Email inválido')
    .toLowerCase()
    .optional()
    .or(z.literal('')),
  nit: z
    .string()
    .regex(/^\d{9,10}-?\d?$/, 'NIT inválido. Formato: 900123456-7')
    .optional(),
  description: z.string().max(1000, 'Descripción muy larga').optional(),
  image: z.string().url('URL de imagen inválida').optional(),
})

// Schema para crear post
export const postSchema = z.object({
  title: z.string().min(1, 'Título requerido').max(100, 'Título muy largo'),
  content: z.string().min(1, 'Contenido requerido').max(5000, 'Contenido muy largo'),
  establishmentId: z.string().uuid('ID de establecimiento inválido'),
  image: z.string().url('URL de imagen inválida').optional(),
  price: z.string().max(50, 'Precio muy largo').optional(),
  isActive: z.boolean().optional(),
})

// Schema para crear pack
export const packSchema = z.object({
  title: z.string().min(1, 'Título requerido').max(100, 'Título muy largo'),
  description: z.string().min(1, 'Descripción requerida').max(1000, 'Descripción muy larga'),
  establishmentId: z.string().uuid('ID de establecimiento inválido'),
  originalPrice: z.number().positive('Precio original debe ser positivo'),
  discountedPrice: z.number().positive('Precio con descuento debe ser positivo'),
  quantity: z.number().int().min(1, 'Cantidad mínima: 1').max(1000, 'Cantidad máxima: 1000'),
  availableFrom: z.string().datetime('Fecha de inicio inválida'),
  availableUntil: z.string().datetime('Fecha de fin inválida'),
  pickupTimeStart: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Hora de inicio inválida'),
  pickupTimeEnd: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Hora de fin inválida'),
  image: z.string().url('URL de imagen inválida').optional(),
  isActive: z.boolean().optional(),
}).refine(
  (data) => data.discountedPrice < data.originalPrice,
  {
    message: 'Precio con descuento debe ser menor al precio original',
    path: ['discountedPrice'],
  }
).refine(
  (data) => new Date(data.availableUntil) > new Date(data.availableFrom),
  {
    message: 'Fecha de fin debe ser posterior a fecha de inicio',
    path: ['availableUntil'],
  }
).refine(
  (data) => data.pickupTimeEnd > data.pickupTimeStart,
  {
    message: 'Hora de fin debe ser posterior a hora de inicio',
    path: ['pickupTimeEnd'],
  }
)

// Schema para crear orden
export const orderSchema = z.object({
  packId: z.string().uuid('ID de pack inválido'),
  quantity: z.number().int().min(1, 'Cantidad mínima: 1'),
  pickupDate: z.string().datetime('Fecha de recogida inválida'),
  notes: z.string().max(500, 'Notas muy largas').optional(),
})

// Schema para login
export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Contraseña requerida'),
})

// Schema para registro
export const registerSchema = z.object({
  name: z.string().min(1, 'Nombre requerido').max(100, 'Nombre muy largo'),
  email: z.string().email('Email inválido'),
  password: z
    .string()
    .min(8, 'Contraseña debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
    .regex(/[a-z]/, 'Debe contener al menos una minúscula')
    .regex(/[0-9]/, 'Debe contener al menos un número'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
})

// Schema para actualizar perfil
export const updateProfileSchema = z.object({
  name: z.string().min(1, 'Nombre requerido').max(100, 'Nombre muy largo').optional(),
  email: z.string().email('Email inválido').optional(),
  phone: z
    .string()
    .regex(/^[+]?[1-9][\d\s\-()]{0,20}$/, 'Teléfono inválido')
    .optional()
    .or(z.literal('')),
  image: z.string().url('URL de imagen inválida').optional(),
})

// Schema para cambiar contraseña
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Contraseña actual requerida'),
  newPassword: z
    .string()
    .min(8, 'Contraseña debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
    .regex(/[a-z]/, 'Debe contener al menos una minúscula')
    .regex(/[0-9]/, 'Debe contener al menos un número'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
})

// Schema para notificaciones
export const notificationSchema = z.object({
  type: z.enum([
    'establishment-approved',
    'establishment-rejected',
    'welcome-user',
    'custom',
  ]),
  recipientId: z.string().uuid('ID de destinatario inválido'),
  data: z.record(z.any()).optional(),
})

// Schema para filtros de auditoría
export const auditLogFiltersSchema = z.object({
  entityType: z.string().optional(),
  action: z.string().optional(),
  entityId: z.string().optional(),
  userId: z.string().optional(),
  limit: z.number().int().min(1).max(1000).optional(),
  offset: z.number().int().min(0).optional(),
})

/**
 * Helper para validar datos con Zod
 * @param schema - Schema de Zod
 * @param data - Datos a validar
 * @returns Objeto con éxito y datos validados o errores
 */
export function validateWithSchema<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: string[] } {
  try {
    const validatedData = schema.parse(data)
    return { success: true, data: validatedData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map((err) => {
        const path = err.path.join('.')
        return path ? `${path}: ${err.message}` : err.message
      })
      return { success: false, errors }
    }
    return { success: false, errors: ['Error de validación desconocido'] }
  }
}

/**
 * Middleware para validar request body con Zod
 */
export async function validateRequestBody<T>(
  request: Request,
  schema: z.ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; errors: string[] }> {
  try {
    const body = await request.json()
    return validateWithSchema(schema, body)
  } catch (error) {
    return { success: false, errors: ['Body de request inválido'] }
  }
}
