import { test, expect } from '@playwright/test'

/**
 * Pruebas E2E para autenticación
 */

test.describe('Authentication Flow', () => {
  test('should display login button when not authenticated', async ({ page }) => {
    await page.goto('/')
    
    // Verificar que el botón de "Iniciar Sesión" esté visible
    await expect(page.getByRole('link', { name: /Iniciar Sesión/i })).toBeVisible()
  })

  test('should navigate to login page', async ({ page }) => {
    await page.goto('/')
    
    // Hacer clic en "Iniciar Sesión"
    await page.getByRole('link', { name: /Iniciar Sesión/i }).click()
    
    // Verificar que navegó a la página de login
    await expect(page).toHaveURL(/\/auth\/signin/)
  })

  test.skip('should login with valid credentials', async ({ page }) => {
    // Este test está marcado como skip porque requiere credenciales reales
    // Descoméntalo cuando tengas un usuario de prueba
    
    await page.goto('/auth/signin')
    
    // Llenar el formulario
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', 'password123')
    
    // Hacer clic en el botón de login
    await page.click('button[type="submit"]')
    
    // Verificar que redirigió al dashboard o home
    await expect(page).toHaveURL(/\/(dashboard|home)/)
  })
})
