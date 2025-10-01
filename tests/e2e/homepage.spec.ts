import { test, expect } from '@playwright/test'

/**
 * Pruebas E2E para la página principal
 */

test.describe('Homepage', () => {
  test('should load homepage successfully', async ({ page }) => {
    await page.goto('/')
    
    // Verificar que el título de la página esté presente
    await expect(page).toHaveTitle(/Food Waste/i)
  })

  test('should display navigation menu', async ({ page }) => {
    await page.goto('/')
    
    // Verificar que los links de navegación estén presentes
    await expect(page.getByRole('link', { name: 'Home' })).toBeVisible()
    await expect(page.getByRole('link', { name: /How it Works/i })).toBeVisible()
  })

  test('should navigate to How it Works page', async ({ page }) => {
    await page.goto('/')
    
    // Hacer clic en "How it Works"
    await page.getByRole('link', { name: /How it Works/i }).click()
    
    // Verificar que la URL cambió
    await expect(page).toHaveURL(/\/how-it-works/)
  })

  test('should toggle theme', async ({ page }) => {
    await page.goto('/')
    
    // Buscar el botón de tema
    const themeButton = page.getByRole('button', { name: /toggle theme/i })
    
    // Hacer clic para cambiar el tema
    await themeButton.click()
    
    // Verificar que el tema cambió (la clase 'dark' debería estar en el html)
    const html = page.locator('html')
    await expect(html).toHaveClass(/dark/)
  })
})
