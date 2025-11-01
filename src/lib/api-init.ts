import { initializeDatabase } from './db-init'

let isInitialized = false

export async function ensureApiInit() {
  if (isInitialized) {
    return true
  }

  try {
    await initializeDatabase()
    isInitialized = true
    return true
  } catch (error) {
    console.warn('API initialization failed:', error)
    return false
  }
}

// Reset for testing
export function resetApiInit() {
  isInitialized = false
}
