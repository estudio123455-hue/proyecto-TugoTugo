// Import Firebase scripts
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js')

// Firebase configuration
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-auth-domain",
  projectId: "your-project-id",
  storageBucket: "your-storage-bucket",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id"
}

// Initialize Firebase
firebase.initializeApp(firebaseConfig)

// Retrieve Firebase Messaging object
const messaging = firebase.messaging()

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Received background message:', payload)

  const notificationTitle = payload.notification?.title || 'TugoTugo'
  const notificationOptions = {
    body: payload.notification?.body || 'Nuevos packs disponibles cerca de ti!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: 'tugo-notification',
    data: {
      url: payload.data?.url || '/',
      ...payload.data
    },
    actions: [
      {
        action: 'view',
        title: 'Ver Packs',
        icon: '/icons/view-icon.png'
      },
      {
        action: 'dismiss',
        title: 'Cerrar',
        icon: '/icons/close-icon.png'
      }
    ],
    requireInteraction: true,
    silent: false
  }

  self.registration.showNotification(notificationTitle, notificationOptions)
})

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event)
  
  event.notification.close()

  if (event.action === 'view') {
    // Open the app to view packs
    event.waitUntil(
      clients.openWindow(event.notification.data?.url || '/packs')
    )
  } else if (event.action === 'dismiss') {
    // Just close the notification
    return
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.openWindow(event.notification.data?.url || '/')
    )
  }
})

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event)
  
  // Track notification dismissal
  fetch('/api/analytics/notification-dismissed', {
    method: 'POST',
    body: JSON.stringify({
      notificationId: event.notification.tag,
      timestamp: Date.now()
    })
  }).catch(console.error)
})
