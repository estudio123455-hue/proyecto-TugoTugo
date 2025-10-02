/**
 * Pruebas de base de datos con Prisma
 * Verifica que las operaciones CRUD funcionen correctamente
 */

import { prismaTest, cleanDatabase } from '../../../prisma/test-client'

describe('Database Operations', () => {
  // Limpiar base de datos antes de cada prueba
  beforeEach(async () => {
    await cleanDatabase()
  })

  // Cerrar conexión después de todas las pruebas
  afterAll(async () => {
    await prismaTest.$disconnect()
  })

  describe('User CRUD Operations', () => {
    it('should create a new user', async () => {
      const user = await prismaTest.user.create({
        data: {
          email: 'newuser@example.com',
          name: 'New User',
          password: 'hashedpassword',
          role: 'CUSTOMER',
        },
      })

      expect(user).toBeDefined()
      expect(user.email).toBe('newuser@example.com')
      expect(user.name).toBe('New User')
      expect(user.role).toBe('CUSTOMER')
    })

    it('should find user by email', async () => {
      // Crear usuario
      await prismaTest.user.create({
        data: {
          email: 'findme@example.com',
          name: 'Find Me',
          password: 'hashedpassword',
          role: 'CUSTOMER',
        },
      })

      // Buscar usuario
      const user = await prismaTest.user.findUnique({
        where: { email: 'findme@example.com' },
      })

      expect(user).toBeDefined()
      expect(user?.email).toBe('findme@example.com')
    })

    it('should not create duplicate email', async () => {
      const email = 'duplicate@example.com'

      // Crear primer usuario
      await prismaTest.user.create({
        data: {
          email,
          name: 'User 1',
          password: 'hashedpassword',
          role: 'CUSTOMER',
        },
      })

      // Intentar crear segundo usuario con mismo email
      await expect(
        prismaTest.user.create({
          data: {
            email,
            name: 'User 2',
            password: 'hashedpassword',
            role: 'CUSTOMER',
          },
        })
      ).rejects.toThrow()
    })

    it('should update user data', async () => {
      // Crear usuario
      const user = await prismaTest.user.create({
        data: {
          email: 'update@example.com',
          name: 'Original Name',
          password: 'hashedpassword',
          role: 'CUSTOMER',
        },
      })

      // Actualizar usuario
      const updated = await prismaTest.user.update({
        where: { id: user.id },
        data: { name: 'Updated Name' },
      })

      expect(updated.name).toBe('Updated Name')
      expect(updated.email).toBe('update@example.com')
    })

    it('should delete user', async () => {
      // Crear usuario
      const user = await prismaTest.user.create({
        data: {
          email: 'delete@example.com',
          name: 'Delete Me',
          password: 'hashedpassword',
          role: 'CUSTOMER',
        },
      })

      // Eliminar usuario
      await prismaTest.user.delete({
        where: { id: user.id },
      })

      // Verificar que no existe
      const deleted = await prismaTest.user.findUnique({
        where: { id: user.id },
      })

      expect(deleted).toBeNull()
    })
  })

  describe('Establishment Operations', () => {
    it('should create establishment with user relation', async () => {
      // Crear usuario primero
      const user = await prismaTest.user.create({
        data: {
          email: 'owner@example.com',
          name: 'Owner',
          password: 'hashedpassword',
          role: 'ESTABLISHMENT',
        },
      })

      // Crear establecimiento
      const establishment = await prismaTest.establishment.create({
        data: {
          userId: user.id,
          name: 'Test Restaurant',
          address: '123 Test St',
          category: 'Restaurant',
          latitude: 40.7128,
          longitude: -74.0060,
        },
      })

      expect(establishment).toBeDefined()
      expect(establishment.name).toBe('Test Restaurant')
      expect(establishment.userId).toBe(user.id)
    })

    it('should find establishment with user data', async () => {
      // Crear usuario y establecimiento
      const user = await prismaTest.user.create({
        data: {
          email: 'owner2@example.com',
          name: 'Owner 2',
          password: 'hashedpassword',
          role: 'ESTABLISHMENT',
        },
      })

      await prismaTest.establishment.create({
        data: {
          userId: user.id,
          name: 'Test Restaurant 2',
          address: '456 Test Ave',
          category: 'Cafe',
          latitude: 40.7128,
          longitude: -74.0060,
        },
      })

      // Buscar con relación
      const establishment = await prismaTest.establishment.findFirst({
        where: { userId: user.id },
        include: { user: true },
      })

      expect(establishment).toBeDefined()
      expect(establishment?.user.email).toBe('owner2@example.com')
    })
  })
})
