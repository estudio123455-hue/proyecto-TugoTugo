'use client'

import { useState, useEffect } from 'react'
import { isPushNotificationSupported, requestNotificationPermission, getVapidPublicKey, urlBase64ToUint8Array } from '@/lib/notifications'

export function useNotifications() {
  const [isSupported, setIsSupported] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setIsSupported(isPushNotificationSupported())
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission)
    }
  }, [])

  const subscribe = async () => {
    if (!isSupported) {
      throw new Error('Push notifications are not supported')
    }

    setIsLoading(true)

    try {
      // Solicitar permiso
      const perm = await requestNotificationPermission()
      setPermission(perm)

      if (perm !== 'granted') {
        throw new Error('Permission not granted')
      }

      // Registrar Service Worker
      const registration = await navigator.serviceWorker.register('/sw.js')
      await navigator.serviceWorker.ready

      // Suscribirse a push
      const vapidPublicKey = getVapidPublicKey()
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      })

      // Guardar suscripción en el servidor
      const response = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription.toJSON()),
      })

      if (!response.ok) {
        throw new Error('Failed to save subscription')
      }

      setIsSubscribed(true)
      console.log('✅ Successfully subscribed to push notifications')
    } catch (error) {
      console.error('Error subscribing to push notifications:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const unsubscribe = async () => {
    setIsLoading(true)

    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()

      if (subscription) {
        // Desuscribirse
        await subscription.unsubscribe()

        // Eliminar del servidor
        await fetch('/api/notifications/subscribe', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        })

        setIsSubscribed(false)
        console.log('✅ Successfully unsubscribed from push notifications')
      }
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const checkSubscription = async () => {
    if (!isSupported) return

    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      setIsSubscribed(!!subscription)
    } catch (error) {
      console.error('Error checking subscription:', error)
    }
  }

  useEffect(() => {
    checkSubscription()
  }, [isSupported])

  return {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    subscribe,
    unsubscribe,
  }
}
