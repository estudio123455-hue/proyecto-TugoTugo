# 🧪 Guía de Testing

Sistema completo de pruebas para tu aplicación Next.js.

---

## 📋 Tipos de Pruebas Implementadas

### 1. ✅ Pruebas Unitarias (Jest + React Testing Library)
Prueban funciones y componentes de forma aislada.

**Ubicación:** `src/**/__tests__/`

**Ejecutar:**
```bash
npm test                    # Ejecutar todas las pruebas
npm run test:watch          # Modo watch (se ejecutan al guardar)
npm run test:coverage       # Con reporte de cobertura
```

### 2. 🔗 Pruebas de Integración (Jest + React Testing Library)
Verifican cómo interactúan varios componentes.

**Ubicación:** `src/**/__tests__/`

**Ejecutar:** Mismo comando que las unitarias

### 3. 🌐 Pruebas E2E (Playwright)
Simulan la experiencia completa del usuario.

**Ubicación:** `tests/e2e/`

**Ejecutar:**
```bash
# Primero instala los navegadores (solo una vez)
npm run playwright:install

# Ejecutar pruebas E2E
npm run test:e2e            # Modo headless (sin ver el navegador)
npm run test:e2e:ui         # Modo UI (interfaz visual)
npm run test:e2e:debug      # Modo debug (paso a paso)
```

---

## 📂 Estructura de Carpetas

```
app/
├── src/
│   ├── components/
│   │   ├── Navigation.tsx
│   │   └── __tests__/
│   │       └── Navigation.test.tsx    # Pruebas del componente
│   │
│   └── utils/
│       └── __tests__/
│           └── helpers.test.ts        # Pruebas de funciones
│
├── tests/
│   └── e2e/
│       ├── homepage.spec.ts           # Pruebas E2E de la home
│       └── auth.spec.ts               # Pruebas E2E de autenticación
│
├── jest.config.js                     # Configuración de Jest
├── jest.setup.js                      # Setup de Jest
└── playwright.config.ts               # Configuración de Playwright
```

---

## 🚀 Comandos Disponibles

### Pruebas Unitarias e Integración

```bash
# Ejecutar todas las pruebas
npm test

# Modo watch (útil durante desarrollo)
npm run test:watch

# Con reporte de cobertura
npm run test:coverage

# Ejecutar un archivo específico
npm test -- Navigation.test.tsx
```

### Pruebas E2E

```bash
# Instalar navegadores (solo primera vez)
npm run playwright:install

# Ejecutar todas las pruebas E2E
npm run test:e2e

# Modo UI (recomendado para desarrollo)
npm run test:e2e:ui

# Modo debug (paso a paso)
npm run test:e2e:debug

# Ejecutar en un navegador específico
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

---

## 📝 Ejemplos de Pruebas

### Ejemplo 1: Prueba Unitaria de una Función

```typescript
// src/utils/__tests__/helpers.test.ts
describe('formatPrice', () => {
  it('should format price with 2 decimals', () => {
    expect(formatPrice(10)).toBe('$10.00')
    expect(formatPrice(10.5)).toBe('$10.50')
  })
})
```

### Ejemplo 2: Prueba de Componente

```typescript
// src/components/__tests__/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import Button from '../Button'

describe('Button Component', () => {
  it('should call onClick when clicked', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    
    const button = screen.getByText('Click me')
    fireEvent.click(button)
    
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

### Ejemplo 3: Prueba E2E

```typescript
// tests/e2e/login.spec.ts
import { test, expect } from '@playwright/test'

test('should login successfully', async ({ page }) => {
  await page.goto('/auth/signin')
  
  await page.fill('input[name="email"]', 'test@example.com')
  await page.fill('input[name="password"]', 'password123')
  await page.click('button[type="submit"]')
  
  await expect(page).toHaveURL('/dashboard')
})
```

---

## 🎯 Mejores Prácticas

### 1. Nombrar Tests Descriptivamente

```typescript
// ❌ Malo
it('test 1', () => { ... })

// ✅ Bueno
it('should display error message when email is invalid', () => { ... })
```

### 2. Usar Arrange-Act-Assert

```typescript
it('should calculate discount correctly', () => {
  // Arrange (Preparar)
  const price = 100
  const discount = 10
  
  // Act (Actuar)
  const result = calculateDiscount(price, discount)
  
  // Assert (Verificar)
  expect(result).toBe(90)
})
```

### 3. Aislar Tests

```typescript
// Cada test debe ser independiente
describe('User Service', () => {
  beforeEach(() => {
    // Limpiar estado antes de cada test
    jest.clearAllMocks()
  })
  
  it('test 1', () => { ... })
  it('test 2', () => { ... })
})
```

### 4. Usar Mocks Apropiadamente

```typescript
// Mock de API
jest.mock('@/lib/api', () => ({
  fetchUsers: jest.fn(() => Promise.resolve([{ id: 1, name: 'John' }]))
}))
```

---

## 📊 Cobertura de Código

Para ver qué porcentaje de tu código está cubierto por pruebas:

```bash
npm run test:coverage
```

Esto genera un reporte en `coverage/lcov-report/index.html`

**Meta recomendada:** 70-80% de cobertura

---

## 🐛 Debugging

### Jest

```bash
# Ejecutar un solo test
npm test -- -t "should render Home link"

# Modo watch para un archivo
npm test -- --watch Navigation.test.tsx

# Ver output detallado
npm test -- --verbose
```

### Playwright

```bash
# Modo debug (abre inspector)
npm run test:e2e:debug

# Ver trace de un test fallido
npx playwright show-trace trace.zip

# Generar código de test automáticamente
npx playwright codegen http://localhost:3000
```

---

## 🔄 CI/CD (GitHub Actions)

Ejemplo de workflow para ejecutar pruebas en cada push:

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - run: npm ci
      - run: npm test
      - run: npm run test:e2e
```

---

## 📚 Recursos

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

## ✅ Checklist de Testing

```
□ Pruebas unitarias para funciones críticas
□ Pruebas de componentes principales
□ Pruebas E2E para flujos importantes (login, checkout, etc.)
□ Cobertura mínima del 70%
□ Tests ejecutándose en CI/CD
□ Tests pasando antes de cada deploy
```

---

¡Feliz testing! 🎉
