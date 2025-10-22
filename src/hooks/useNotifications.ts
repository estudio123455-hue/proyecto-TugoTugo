'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { requestNotificationPermission, onMessageListener, saveFCMToken } from '@/lib/firebase'
import { toast } from 'sonner'

interface NotificationPayload {
  notification?: {
    title?: string
    body?: string
    icon?: string
  }
  data?: {
    [key: string]: string
  }
}

export const useNotifications = () => {
  const { data: session } = useSession()
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [token, setToken] = useState<string | null>(null)
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    // Check if notifications are supported
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setIsSupported(true)
      setPermission(Notification.permission)
    }
  }, [])

  useEffect(() => {
    if (session?.user?.id && permission === 'granted') {
      initializeNotifications()
    }
  }, [session, permission])

  const initializeNotifications = async () => {
    try {
      const fcmToken = await requestNotificationPermission()
      
      if (fcmToken && session?.user?.id) {
        setToken(fcmToken)
        await saveFCMToken(session.user.id, fcmToken)
        
        // Show success message
        toast.success('¡Notificaciones activadas! Te avisaremos de nuevos packs cerca de ti.', {
          duration: 4000,
          icon: '🔔'
        })
      }
    } catch (error) {
      console.error('Error initializing notifications:', error)
      toast.error('Error al configurar notificaciones')
    }
  }

  const requestPermission = async () => {
    if (!isSupported) {
      toast.error('Las notificaciones no están soportadas en este navegador')
      return false
    }

    try {
      const permission = await Notification.requestPermission()
      setPermission(permission)
      
      if (permission === 'granted') {
        await initializeNotifications()
        return true
      } else {
        toast.error('Permisos de notificación denegados')
        return false
      }
    } catch (error) {
      console.error('Error requesting permission:', error)
      toast.error('Error al solicitar permisos de notificación')
      return false
    }
  }

  // Listen for foreground messages
  useEffect(() => {
    if (permission === 'granted') {
      const unsubscribe = onMessageListener()
        .then((payload: unknown) => {
          const typedPayload = payload as NotificationPayload
          console.log('Foreground message received:', typedPayload)
          
          // Show in-app notification
          toast.info(typedPayload.notification?.body || 'Nueva notificación', {
            duration: 6000,
            icon: '🔔',
            action: typedPayload.data?.url ? {
              label: 'Ver',
              onClick: () => window.open(typedPayload.data?.url, '_blank')
            } : undefined
          })
        })
        .catch((error) => console.error('Error listening for messages:', error))

      return () => {
        // Cleanup if needed
      }
    }
  }, [permission])

  const sendTestNotification = async () => {
    if (!session?.user?.id) return

    try {
      const response = await fetch('/api/notifications/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: session.user.id,
          title: '🌱 TugoTugo Test',
          body: 'Esta es una notificación de prueba. ¡Todo funciona correctamente!',
          data: {
            url: '/packs',
            type: 'test'
          }
        }),
      })

      if (response.ok) {
        toast.success('Notificación de prueba enviada')
      } else {
        toast.error('Error enviando notificación de prueba')
      }
    } catch (error) {
      console.error('Error sending test notification:', error)
      toast.error('Error enviando notificación de prueba')
    }
  }

  return {
    permission,
    token,
    isSupported,
    requestPermission,
    sendTestNotification,
    isEnabled: permission === 'granted' && !!token
  }
}
