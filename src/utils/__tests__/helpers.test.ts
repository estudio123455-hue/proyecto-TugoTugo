/**
 * Ejemplo de pruebas unitarias para funciones auxiliares
 */

// Función de ejemplo para probar
function formatPrice(price: number): string {
  return `$${price.toFixed(2)}`
}

function calculateDiscount(price: number, discountPercentage: number): number {
  return price - (price * discountPercentage) / 100
}

describe('Helper Functions', () => {
  describe('formatPrice', () => {
    it('should format price with 2 decimals', () => {
      expect(formatPrice(10)).toBe('$10.00')
      expect(formatPrice(10.5)).toBe('$10.50')
      expect(formatPrice(10.99)).toBe('$10.99')
    })

    it('should handle zero', () => {
      expect(formatPrice(0)).toBe('$0.00')
    })

    it('should handle large numbers', () => {
      expect(formatPrice(1000)).toBe('$1000.00')
    })
  })

  describe('calculateDiscount', () => {
    it('should calculate 10% discount correctly', () => {
      expect(calculateDiscount(100, 10)).toBe(90)
    })

    it('should calculate 50% discount correctly', () => {
      expect(calculateDiscount(100, 50)).toBe(50)
    })

    it('should handle 0% discount', () => {
      expect(calculateDiscount(100, 0)).toBe(100)
    })

    it('should handle 100% discount', () => {
      expect(calculateDiscount(100, 100)).toBe(0)
    })
  })
})
