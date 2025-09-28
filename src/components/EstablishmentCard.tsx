'use client'

import Link from 'next/link'

interface Establishment {
  id: string
  name: string
  description: string | null
  address: string
  phone: string | null
  email: string | null
  image: string | null
  category: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface EstablishmentCardProps {
  establishment: Establishment
  showActions?: boolean
  activePacks?: number
}

export default function EstablishmentCard({ 
  establishment, 
  showActions = true,
  activePacks = 0 
}: EstablishmentCardProps) {
  
  const getCategoryEmoji = (category: string) => {
    const categoryMap: { [key: string]: string } = {
      'RESTAURANT': '🍽️',
      'CAFE': '☕',
      'BAKERY': '🥖',
      'SUPERMARKET': '🛒',
      'GROCERY': '🏪',
      'OTHER': '🏢'
    }
    return categoryMap[category] || '🏢'
  }


  return (
    <div className="bg-white rounded-2xl shadow-soft hover:shadow-lg transition-all overflow-hidden border border-gray-100">
      {/* Establishment Image */}
      <div className="h-48 bg-gradient-to-br from-fresh-100 to-warm-100 flex items-center justify-center overflow-hidden">
        {establishment.image ? (
          <img 
            src={establishment.image} 
            alt={establishment.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-6xl">
            {getCategoryEmoji(establishment.category)}
          </span>
        )}
      </div>
      
      {/* Content */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 mb-1">
              {establishment.name}
            </h3>
            <div className="flex items-center text-gray-600 mb-2">
              <span className="mr-2">{getCategoryEmoji(establishment.category)}</span>
              <span className="text-sm capitalize">{establishment.category.toLowerCase()}</span>
            </div>
          </div>
          
          {/* Status Badge */}
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            establishment.isActive 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {establishment.isActive ? 'Activo' : 'Inactivo'}
          </div>
        </div>
        
        {establishment.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {establishment.description}
          </p>
        )}
        
        {/* Address */}
        <div className="flex items-center text-gray-600 mb-4">
          <span className="mr-2 text-sm">📍</span>
          <span className="text-sm truncate">{establishment.address}</span>
        </div>
        
        {/* Stats */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <span className="mr-2">📦</span>
            <span>{activePacks} packs disponibles</span>
          </div>
          
          {establishment.phone && (
            <div className="flex items-center text-sm text-gray-600">
              <span className="mr-1">📞</span>
              <a 
                href={`tel:${establishment.phone}`}
                className="hover:text-fresh-600 transition-colors"
              >
                Llamar
              </a>
            </div>
          )}
        </div>
        
        {/* Actions */}
        {showActions && (
          <div className="flex space-x-2">
            <Link
              href={`/establecimiento/${establishment.id}`}
              className="flex-1 bg-fresh-600 hover:bg-fresh-700 text-white text-center py-3 px-4 rounded-xl font-semibold transition-all shadow-md"
            >
              Ver perfil
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
