/**
 * Utilidades de búsqueda y filtrado
 */

export interface SearchFilters {
  query?: string
  category?: string
  minPrice?: number
  maxPrice?: number
  maxDistance?: number
  minRating?: number
  isActive?: boolean
}

export interface Establishment {
  id: string
  name: string
  category: string
  cuisineType?: string
  description?: string
  latitude: number
  longitude: number
  distance?: number
  averageRating?: number
  packs?: Pack[]
}

export interface Pack {
  id: string
  title: string
  description: string
  originalPrice: number
  discountedPrice: number
  quantity: number
  isActive: boolean
  establishment: {
    name: string
    category: string
  }
}

/**
 * Busca en texto (nombre, descripción, tipo de cocina)
 */
export function searchText(item: Establishment, query: string): boolean {
  if (!query) return true
  
  const searchQuery = query.toLowerCase().trim()
  const searchableText = [
    item.name,
    item.description,
    item.cuisineType,
    item.category,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  return searchableText.includes(searchQuery)
}

/**
 * Filtra por categoría
 */
export function filterByCategory(item: Establishment, category?: string): boolean {
  if (!category || category === 'all') return true
  return item.category === category
}

/**
 * Filtra por rango de precio (basado en packs)
 */
export function filterByPrice(
  item: Establishment,
  minPrice?: number,
  maxPrice?: number
): boolean {
  if (!item.packs || item.packs.length === 0) return true
  
  const prices = item.packs.map(p => p.discountedPrice)
  const minPackPrice = Math.min(...prices)
  const maxPackPrice = Math.max(...prices)

  if (minPrice !== undefined && maxPackPrice < minPrice) return false
  if (maxPrice !== undefined && minPackPrice > maxPrice) return false
  
  return true
}

/**
 * Filtra por distancia máxima
 */
export function filterByDistance(item: Establishment, maxDistance?: number): boolean {
  if (maxDistance === undefined) return true
  if (item.distance === undefined) return true
  return item.distance <= maxDistance
}

/**
 * Filtra por rating mínimo
 */
export function filterByRating(item: Establishment, minRating?: number): boolean {
  if (minRating === undefined) return true
  if (item.averageRating === undefined) return true
  return item.averageRating >= minRating
}

/**
 * Aplica todos los filtros
 */
export function applyFilters(
  establishments: Establishment[],
  filters: SearchFilters
): Establishment[] {
  return establishments.filter(item => {
    if (filters.query && !searchText(item, filters.query)) return false
    if (!filterByCategory(item, filters.category)) return false
    if (!filterByPrice(item, filters.minPrice, filters.maxPrice)) return false
    if (!filterByDistance(item, filters.maxDistance)) return false
    if (!filterByRating(item, filters.minRating)) return false
    if (filters.isActive !== undefined && item.packs) {
      const hasActivePacks = item.packs.some(p => p.isActive && p.quantity > 0)
      if (filters.isActive && !hasActivePacks) return false
    }
    return true
  })
}

/**
 * Ordena resultados
 */
export type SortOption = 'distance' | 'price-asc' | 'price-desc' | 'rating' | 'name'

export function sortResults(
  establishments: Establishment[],
  sortBy: SortOption
): Establishment[] {
  const sorted = [...establishments]

  switch (sortBy) {
    case 'distance':
      return sorted.sort((a, b) => (a.distance || 999) - (b.distance || 999))
    
    case 'price-asc':
      return sorted.sort((a, b) => {
        const aMin = a.packs?.length ? Math.min(...a.packs.map(p => p.discountedPrice)) : 999999
        const bMin = b.packs?.length ? Math.min(...b.packs.map(p => p.discountedPrice)) : 999999
        return aMin - bMin
      })
    
    case 'price-desc':
      return sorted.sort((a, b) => {
        const aMax = a.packs?.length ? Math.max(...a.packs.map(p => p.discountedPrice)) : 0
        const bMax = b.packs?.length ? Math.max(...b.packs.map(p => p.discountedPrice)) : 0
        return bMax - aMax
      })
    
    case 'rating':
      return sorted.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0))
    
    case 'name':
      return sorted.sort((a, b) => a.name.localeCompare(b.name))
    
    default:
      return sorted
  }
}

/**
 * Genera sugerencias de autocompletado
 */
export function getSearchSuggestions(
  establishments: Establishment[],
  query: string,
  limit: number = 5
): string[] {
  if (!query || query.length < 2) return []

  const searchQuery = query.toLowerCase()
  const suggestions = new Set<string>()

  establishments.forEach(est => {
    // Nombres de restaurantes
    if (est.name.toLowerCase().includes(searchQuery)) {
      suggestions.add(est.name)
    }
    
    // Tipos de cocina
    if (est.cuisineType?.toLowerCase().includes(searchQuery)) {
      suggestions.add(est.cuisineType)
    }
    
    // Categorías
    if (est.category.toLowerCase().includes(searchQuery)) {
      suggestions.add(est.category)
    }
  })

  return Array.from(suggestions).slice(0, limit)
}

/**
 * Categorías disponibles
 */
export const CATEGORIES = [
  { value: 'all', label: 'Todas las categorías' },
  { value: 'RESTAURANT', label: 'Restaurante' },
  { value: 'CAFE', label: 'Cafetería' },
  { value: 'BAKERY', label: 'Panadería' },
  { value: 'SUPERMARKET', label: 'Supermercado' },
  { value: 'GROCERY', label: 'Tienda' },
  { value: 'OTHER', label: 'Otro' },
]

/**
 * Opciones de ordenamiento
 */
export const SORT_OPTIONS = [
  { value: 'distance', label: 'Más cercano' },
  { value: 'price-asc', label: 'Menor precio' },
  { value: 'price-desc', label: 'Mayor precio' },
  { value: 'rating', label: 'Mejor valorado' },
  { value: 'name', label: 'Nombre A-Z' },
]

/**
 * Rangos de distancia
 */
export const DISTANCE_OPTIONS = [
  { value: undefined, label: 'Cualquier distancia' },
  { value: 1, label: 'Hasta 1 km' },
  { value: 3, label: 'Hasta 3 km' },
  { value: 5, label: 'Hasta 5 km' },
  { value: 10, label: 'Hasta 10 km' },
  { value: 20, label: 'Hasta 20 km' },
]

/**
 * Rangos de precio
 */
export const PRICE_RANGES = [
  { min: undefined, max: undefined, label: 'Cualquier precio' },
  { min: 0, max: 10000, label: 'Hasta $10,000' },
  { min: 10000, max: 20000, label: '$10,000 - $20,000' },
  { min: 20000, max: 30000, label: '$20,000 - $30,000' },
  { min: 30000, max: undefined, label: 'Más de $30,000' },
]
