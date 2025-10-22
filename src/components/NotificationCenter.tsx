'use client'

import { useState, useEffect } from 'react'
import { useNotifications } from '@/hooks/useNotifications'
import { Bell, BellOff, Settings, TestTube, MapPin, Clock } from 'lucide-react'
// TODO: Install framer-motion package and uncomment
// import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

const NotificationCenter = () => {
  const {
    permission,
    isSupported,
    requestPermission,
    sendTestNotification,
    isEnabled
  } = useNotifications()

  const [isOpen, setIsOpen] = useState(false)
  const [preferences, setPreferences] = useState({
    newPacks: true,
    priceDrops: true,
    nearbyOffers: true,
    achievements: true,
    reminders: true,
  })

  const handleToggleNotifications = async () => {
    if (permission === 'granted') {
      // Disable notifications
      toast.info('Para desactivar completamente las notificaciones, hazlo desde la configuración de tu navegador')
    } else {
      const success = await requestPermission()
      if (success) {
        toast.success('¡Notificaciones activadas! Te mantendremos informado de las mejores ofertas.')
      }
    }
  }

  const handlePreferenceChange = async (key: string, value: boolean) => {
    setPreferences(prev => ({ ...prev, [key]: value }))
    
    // Save preferences to backend
    try {
      await fetch('/api/user/notification-preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: value }),
      })
    } catch (error) {
      console.error('Error saving notification preferences:', error)
    }
  }

  const notificationTypes = [
    {
      key: 'newPacks',
      title: 'Nuevos packs cerca de ti',
      description: 'Te avisamos cuando hay packs disponibles en tu zona',
      icon: <MapPin className="w-4 h-4" />,
      color: 'text-tugo-600'
    },
    {
      key: 'priceDrops',
      title: 'Bajadas de precio',
      description: 'Notificaciones cuando bajan los precios de tus favoritos',
      icon: <span className="text-sm">💰</span>,
      color: 'text-terracota-600'
    },
    {
      key: 'nearbyOffers',
      title: 'Ofertas cercanas',
      description: 'Packs con grandes descuentos en restaurantes cerca',
      icon: <span className="text-sm">🎯</span>,
      color: 'text-orange-600'
    },
    {
      key: 'achievements',
      title: 'Logros y insignias',
      description: 'Celebra tus hitos de impacto ambiental',
      icon: <span className="text-sm">🏆</span>,
      color: 'text-yellow-600'
    },
    {
      key: 'reminders',
      title: 'Recordatorios',
      description: 'Para recoger tus packs antes de que expiren',
      icon: <Clock className="w-4 h-4" />,
      color: 'text-purple-600'
    },
  ]

  if (!isSupported) {
    return (
      <div className="bg-gray-50 rounded-2xl p-6 text-center">
        <BellOff className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Notificaciones no soportadas
        </h3>
        <p className="text-gray-600">
          Tu navegador no soporta notificaciones push. Considera actualizar a una versión más reciente.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Main Toggle */}
      <div className="bg-white rounded-3xl p-6 shadow-soft">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
              isEnabled 
                ? 'bg-gradient-to-br from-tugo-500 to-tugo-600 text-white' 
                : 'bg-gray-100 text-gray-400'
            }`}>
              {isEnabled ? <Bell className="w-6 h-6" /> : <BellOff className="w-6 h-6" />}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Notificaciones Push</h2>
              <p className="text-gray-600">
                {isEnabled 
                  ? 'Recibirás notificaciones sobre nuevos packs y ofertas'
                  : 'Activa las notificaciones para no perderte ninguna oferta'
                }
              </p>
            </div>
          </div>
          
          <button
            onClick={handleToggleNotifications}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              isEnabled
                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                : 'bg-tugo-500 text-white hover:bg-tugo-600'
            }`}
          >
            {isEnabled ? 'Configurar' : 'Activar'}
          </button>
        </div>

        {/* Status Indicator */}
        <div className="mt-4 flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            permission === 'granted' ? 'bg-green-500' : 
            permission === 'denied' ? 'bg-red-500' : 'bg-yellow-500'
          }`} />
          <span className="text-sm text-gray-600">
            {permission === 'granted' && 'Notificaciones activadas'}
            {permission === 'denied' && 'Notificaciones bloqueadas'}
            {permission === 'default' && 'Permisos pendientes'}
          </span>
        </div>
      </div>

      {/* Notification Preferences */}
      {/* TODO: Restore AnimatePresence when framer-motion is installed */}
      {isEnabled && (
        <div
          // TODO: Restore motion animations when framer-motion is installed
          // initial={{ opacity: 0, height: 0 }}
          // animate={{ opacity: 1, height: 'auto' }}
          // exit={{ opacity: 0, height: 0 }}
          className="bg-white rounded-3xl p-6 shadow-soft"
        >
            <div className="flex items-center gap-3 mb-6">
              <Settings className="w-5 h-5 text-tugo-600" />
              <h3 className="text-lg font-semibold text-gray-900">Preferencias de Notificación</h3>
            </div>

            <div className="space-y-4">
              {notificationTypes.map((type) => (
                <div key={type.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg bg-white flex items-center justify-center ${type.color}`}>
                      {type.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{type.title}</h4>
                      <p className="text-sm text-gray-600">{type.description}</p>
                    </div>
                  </div>
                  
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences[type.key as keyof typeof preferences]}
                      onChange={(e) => handlePreferenceChange(type.key, e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-tugo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-tugo-500"></div>
                  </label>
                </div>
              ))}
            </div>

            {/* Test Notification */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={sendTestNotification}
                className="flex items-center gap-2 text-tugo-600 hover:text-tugo-700 font-medium transition-colors"
              >
                <TestTube className="w-4 h-4" />
                <span>Enviar notificación de prueba</span>
              </button>
            </div>
        </div>
      )}

      {/* Tips */}
      <div className="bg-gradient-to-r from-tugo-50 to-terracota-50 rounded-2xl p-6">
        <h3 className="font-semibold text-gray-900 mb-3">💡 Consejos para aprovechar las notificaciones</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-tugo-500 mt-1">•</span>
            <span>Las notificaciones se envían solo cuando hay packs disponibles cerca de tu ubicación</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-tugo-500 mt-1">•</span>
            <span>Recibirás máximo 3 notificaciones por día para no molestarte</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-tugo-500 mt-1">•</span>
            <span>Las notificaciones de logros te ayudan a seguir tu impacto ambiental</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-tugo-500 mt-1">•</span>
            <span>Puedes desactivar las notificaciones en cualquier momento desde tu navegador</span>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default NotificationCenter
