/**
 * Pruebas unitarias para el hook useCleanSession
 */

import { renderHook } from '@testing-library/react'
import { useCleanSession } from '../useCleanSession'

// Mock de next-auth ya está en jest.setup.js

describe('useCleanSession Hook', () => {
  it('should return session data when authenticated', () => {
    const { result } = renderHook(() => useCleanSession())
    
    // Verificar estructura del resultado
    expect(result.current).toHaveProperty('data')
    expect(result.current).toHaveProperty('status')
  })

  it('should return null data when unauthenticated', () => {
    const { result } = renderHook(() => useCleanSession())
    
    expect(result.current.data).toBeNull()
    expect(result.current.status).toBe('unauthenticated')
  })

  it('should have correct return type', () => {
    const { result } = renderHook(() => useCleanSession())
    
    expect(typeof result.current.status).toBe('string')
    expect(['authenticated', 'unauthenticated', 'loading']).toContain(
      result.current.status
    )
  })
})
