'use client'

import React from 'react'
import MapboxMap from '@/components/MapboxMap'
import PacksMapView from '@/components/PacksMapView'

// Datos de ejemplo - en producción vendrían de la API
const sampleLocations = [
  {
    id: '1',
    latitude: 4.7110,
    longitude: -74.0721,
    title: 'Restaurante El Gourmet',
    description: 'Pack Sorpresa de Cena',
    price: 12.50,
  },
  {
    id: '2',
    latitude: 4.6533,
    longitude: -74.0836,
    title: 'Panadería La Delicia',
    description: 'Pack de Pan del Día',
    price: 5.00,
  },
  {
    id: '3',
    latitude: 4.6764,
    longitude: -74.0480,
    title: 'Café Aroma',
    description: 'Pack de Desayuno',
    price: 8.00,
  },
  {
    id: '4',
    latitude: 4.6951,
    longitude: -74.0366,
    title: 'Pizzería Napolitana',
    description: 'Pack de Pizza del Día',
    price: 15.00,
  },
  {
    id: '5',
    latitude: 4.6097,
    longitude: -74.0817,
    title: 'Sushi Express',
    description: 'Pack Sorpresa Sushi',
    price: 18.50,
  },
]

export default function MapDemoPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            🗺️ Demo de Mapbox
          </h1>
          <p className="text-gray-600 mt-2">
            Ejemplos de integración de Mapbox en TugoTugo
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">
        {/* Sección 1: Mapa Básico */}
        <section>
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              1. Mapa Básico con Marcadores
            </h2>
            <p className="text-gray-600">
              Vista simple de ubicaciones con marcadores personalizados
            </p>
          </div>
          <MapboxMap
            locations={sampleLocations}
            style="streets"
            height="500px"
            onLocationClick={(location) => {
              console.log('Clicked:', location)
              alert(`Seleccionaste: ${location.title}`)
            }}
          />
        </section>

        {/* Sección 2: Modo Oscuro */}
        <section>
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              2. Modo Oscuro (Dark Mode)
            </h2>
            <p className="text-gray-600">
              Perfecto para apps con tema oscuro o uso nocturno
            </p>
          </div>
          <MapboxMap
            locations={sampleLocations}
            style="dark"
            height="500px"
          />
        </section>

        {/* Sección 3: Vista Satelital */}
        <section>
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              3. Vista Satelital
            </h2>
            <p className="text-gray-600">
              Combina imágenes satelitales con nombres de calles
            </p>
          </div>
          <MapboxMap
            locations={sampleLocations}
            style="satellite"
            height="500px"
          />
        </section>

        {/* Sección 4: Modo Minimalista */}
        <section>
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              4. Modo Minimalista (Light)
            </h2>
            <p className="text-gray-600">
              Diseño limpio y moderno para interfaces elegantes
            </p>
          </div>
          <MapboxMap
            locations={sampleLocations}
            style="light"
            height="500px"
          />
        </section>

        {/* Sección 5: Vista Completa con PacksMapView */}
        <section>
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              5. Vista Completa de Packs (Mapa + Lista)
            </h2>
            <p className="text-gray-600">
              Componente completo con toggle entre vista de mapa y lista
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <PacksMapView />
          </div>
        </section>

        {/* Instrucciones */}
        <section className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
          <h3 className="text-xl font-bold text-blue-900 mb-3">
            📋 Instrucciones de Configuración
          </h3>
          <ol className="space-y-2 text-blue-800">
            <li className="flex items-start">
              <span className="font-bold mr-2">1.</span>
              <span>
                Obtén tu token gratis en{' '}
                <a
                  href="https://account.mapbox.com/access-tokens/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-blue-600"
                >
                  mapbox.com/access-tokens
                </a>
              </span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2">2.</span>
              <span>
                Agrega el token a tu archivo <code className="bg-blue-100 px-2 py-1 rounded">.env.local</code>:
                <br />
                <code className="block bg-blue-100 px-3 py-2 rounded mt-2 text-sm">
                  NEXT_PUBLIC_MAPBOX_TOKEN="tu_token_aqui"
                </code>
              </span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2">3.</span>
              <span>Reinicia el servidor de desarrollo</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2">4.</span>
              <span>
                Lee la documentación completa en{' '}
                <code className="bg-blue-100 px-2 py-1 rounded">MAPBOX_SETUP.md</code>
              </span>
            </li>
          </ol>
        </section>

        {/* Features */}
        <section className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-4xl mb-3">🎨</div>
            <h3 className="font-bold text-lg mb-2">Personalizable</h3>
            <p className="text-gray-600 text-sm">
              5 estilos de mapa diferentes: streets, dark, light, satellite, outdoors
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-4xl mb-3">🚀</div>
            <h3 className="font-bold text-lg mb-2">Alto Rendimiento</h3>
            <p className="text-gray-600 text-sm">
              Renderizado con WebGL para experiencias súper fluidas
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-4xl mb-3">💰</div>
            <h3 className="font-bold text-lg mb-2">Gratis para Empezar</h3>
            <p className="text-gray-600 text-sm">
              50,000 cargas de mapa gratis al mes
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
