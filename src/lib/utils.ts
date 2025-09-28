// Utility functions for Colombian formatting

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export const formatCurrencyInput = (amount: number): string => {
  return amount.toLocaleString('es-CO')
}

export const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString('es-CO', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export const formatTime = (time: string): string => {
  return time.slice(0, 5) // Convert "18:00:00" to "18:00"
}

export const formatPhone = (phone: string): string => {
  // Format Colombian phone numbers
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 10) {
    return `+57 ${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`
  }
  return phone
}
