'use client'

import { useEffect, useState } from 'react'
import UltraFastNavigation from '@/components/UltraFastNavigation'
import { useCleanSession } from '@/hooks/useCleanSession'

export default function CleanProfilePage() {
  const { data: session, status } = useCleanSession()
  const [activeTab, setActiveTab] = useState('overview')

  // Mock data
  const stats = {
    totalOrders: 12,
    totalSaved: 156.50,
    packsCollected: 8,
    foodSaved: 4.2
  }

  const orders = [
    {
      id: '1',
      title: 'Pack Sorpresa Almuerzo',
      restaurant: 'Restaurante Demo',
      status: 'completed',
      date: '2024-11-01',
      amount: 15000
    },
    {
      id: '2', 
      title: 'Pack Café + Postre',
      restaurant: 'Café Central',
      status: 'pending',
      date: '2024-11-02',
      amount: 12000
    }
  ]

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50">
        <UltraFastNavigation />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-500"></div>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-gray-50">
        <UltraFastNavigation />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Acceso Requerido</h2>
            <p className="text-gray-600">Debes iniciar sesión para ver esta página.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UltraFastNavigation />
      
      <div className="max-w-4xl mx-auto pt-20 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            ¡Hola, {session?.user?.name}!
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your orders and track your impact
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center">
              <span className="text-2xl mr-3">📦</span>
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-xl font-bold text-gray-900">{stats.totalOrders}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center">
              <span className="text-2xl mr-3">💰</span>
              <div>
                <p className="text-sm text-gray-600">Money Saved</p>
                <p className="text-xl font-bold text-emerald-600">${stats.totalSaved}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center">
              <span className="text-2xl mr-3">📊</span>
              <div>
                <p className="text-sm text-gray-600">Packs Collected</p>
                <p className="text-xl font-bold text-gray-900">{stats.packsCollected}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center">
              <span className="text-2xl mr-3">🍽️</span>
              <div>
                <p className="text-sm text-gray-600">Food Saved</p>
                <p className="text-xl font-bold text-emerald-600">{stats.foodSaved}kg</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                📊 Overview
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'orders'
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                🛒 My Orders
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Account Overview</h3>
                <div className="bg-emerald-50 p-4 rounded-lg">
                  <h4 className="font-medium text-emerald-800 mb-2">¡Bienvenido, {session?.user?.name}! 👋</h4>
                  <p className="text-emerald-700">
                    Aquí tienes un resumen de tu impacto ambiental y actividad reciente
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">My Orders</h3>
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-900">{order.title}</h4>
                          <p className="text-sm text-gray-600">{order.restaurant}</p>
                          <p className="text-sm text-gray-500">{order.date}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">${order.amount}</p>
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            order.status === 'completed' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
