'use client'

import { useState, useEffect } from 'react'
import { useWebSocket } from '@/lib/websocket'
import { useSession } from 'next-auth/react'

interface Notification {
  id: string
  type: 'success' | 'info' | 'warning' | 'error'
  title: string
  message: string
  timestamp: Date
  read: boolean
  actionUrl?: string
}

export default function NotificationSystem() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isVisible, setIsVisible] = useState(false)
  const { data: session } = useSession()
  const { connect, subscribe, unsubscribe } = useWebSocket()

  useEffect(() => {
    if (!session) return

    connect()

    const handleNewPack = (data: any) => {
      const notification: Notification = {
        id: `pack-${data.id}-${Date.now()}`,
        type: 'info',
        title: 'Nuevo Pack Disponible! 🎉',
        message: `${data.establishmentName} ha publicado: ${data.title}`,
        timestamp: new Date(),
        read: false,
        actionUrl: `/establecimiento/${data.establishmentId}`,
      }
      
      addNotification(notification)
    }

    const handlePackUpdate = (data: any) => {
      const notification: Notification = {
        id: `update-${data.id}-${Date.now()}`,
        type: 'success',
        title: 'Pack Actualizado ✨',
        message: `${data.establishmentName} actualizó: ${data.title}`,
        timestamp: new Date(),
        read: false,
        actionUrl: `/establecimiento/${data.establishmentId}`,
      }
      
      addNotification(notification)
    }

    const handlePackLowStock = (data: any) => {
      const notification: Notification = {
        id: `stock-${data.id}-${Date.now()}`,
        type: 'warning',
        title: '¡Últimas Unidades! ⚡',
        message: `Solo quedan ${data.quantity} unidades de ${data.title}`,
        timestamp: new Date(),
        read: false,
        actionUrl: `/establecimiento/${data.establishmentId}`,
      }
      
      addNotification(notification)
    }

    subscribe('pack:created', handleNewPack)
    subscribe('pack:updated', handlePackUpdate)
    subscribe('pack:low-stock', handlePackLowStock)

    return () => {
      unsubscribe('pack:created', handleNewPack)
      unsubscribe('pack:updated', handlePackUpdate)
      unsubscribe('pack:low-stock', handlePackLowStock)
    }
  }, [session, connect, subscribe, unsubscribe])

  const addNotification = (notification: Notification) => {
    setNotifications(prev => [notification, ...prev.slice(0, 9)]) // Keep only last 10
    setIsVisible(true)
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      setIsVisible(false)
    }, 5000)
  }

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    )
  }

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id))
  }

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success': return '✅'
      case 'info': return 'ℹ️'
      case 'warning': return '⚠️'
      case 'error': return '❌'
      default: return '📢'
    }
  }

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'success': return 'bg-green-50 border-green-200 text-green-800'
      case 'info': return 'bg-blue-50 border-blue-200 text-blue-800'
      case 'warning': return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      case 'error': return 'bg-red-50 border-red-200 text-red-800'
      default: return 'bg-gray-50 border-gray-200 text-gray-800'
    }
  }

  if (!session || notifications.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.slice(0, 3).map(notification => (
        <div
          key={notification.id}
          className={`p-4 rounded-lg border shadow-lg transition-all duration-300 ${
            isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
          } ${getNotificationColor(notification.type)} ${
            !notification.read ? 'ring-2 ring-blue-400' : ''
          }`}
        >
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <span className="text-lg">
                {getNotificationIcon(notification.type)}
              </span>
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold">
                {notification.title}
              </h4>
              <p className="text-sm mt-1">
                {notification.message}
              </p>
              <p className="text-xs mt-1 opacity-75">
                {notification.timestamp.toLocaleTimeString()}
              </p>
            </div>
            
            <div className="flex-shrink-0 flex space-x-1">
              {notification.actionUrl && (
                <a
                  href={notification.actionUrl}
                  className="text-xs bg-white/50 hover:bg-white/75 px-2 py-1 rounded transition-colors"
                  onClick={() => markAsRead(notification.id)}
                >
                  Ver
                </a>
              )}
              <button
                onClick={() => removeNotification(notification.id)}
                className="text-xs hover:bg-white/25 p-1 rounded transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      ))}
      
      {notifications.length > 3 && (
        <div className="text-center">
          <button
            onClick={() => setNotifications([])}
            className="text-xs bg-white/50 hover:bg-white/75 px-3 py-1 rounded-full transition-colors"
          >
            Limpiar todas ({notifications.length})
          </button>
        </div>
      )}
    </div>
  )
}
