// TugoTugo Service Worker
const CACHE_NAME = 'tugotugo-v1'
const STATIC_CACHE = 'tugotugo-static-v1'
const DYNAMIC_CACHE = 'tugotugo-dynamic-v1'

// Files to cache immediately
const STATIC_FILES = [
  '/',
  '/packs',
  '/restaurants',
  '/profile',
  '/offline',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
]

// API routes to cache
const API_CACHE_PATTERNS = [
  '/api/packs',
  '/api/restaurants',
  '/api/user/profile'
]

// Install event - cache static files
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...')
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching static files')
        return cache.addAll(STATIC_FILES)
      })
      .then(() => {
        console.log('Service Worker: Static files cached')
        return self.skipWaiting()
      })
  )
})

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...')
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Service Worker: Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => {
        console.log('Service Worker: Activated')
        return self.clients.claim()
      })
  )
})

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }
  
  // Skip external requests
  if (!url.origin.includes(self.location.origin)) {
    return
  }
  
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        // Return cached version if available
        if (cachedResponse) {
          console.log('Service Worker: Serving from cache:', request.url)
          return cachedResponse
        }
        
        // Otherwise fetch from network
        return fetch(request)
          .then((response) => {
            // Don't cache if not a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response
            }
            
            // Clone the response
            const responseToCache = response.clone()
            
            // Determine which cache to use
            const cacheToUse = shouldCacheInDynamic(request.url) ? DYNAMIC_CACHE : STATIC_CACHE
            
            // Cache the response
            caches.open(cacheToUse)
              .then((cache) => {
                console.log('Service Worker: Caching new resource:', request.url)
                cache.put(request, responseToCache)
              })
            
            return response
          })
          .catch(() => {
            // Fallback for offline
            if (request.destination === 'document') {
              return caches.match('/offline')
            }
            
            // Fallback for images
            if (request.destination === 'image') {
              return new Response(
                '<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="200" fill="#f0f0f0"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#999">Sin imagen</text></svg>',
                { headers: { 'Content-Type': 'image/svg+xml' } }
              )
            }
          })
      })
  )
})

// Push notification event
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push received')
  
  const options = {
    body: 'Tienes nuevas ofertas disponibles cerca de ti!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Ver ofertas',
        icon: '/icons/action-explore.png'
      },
      {
        action: 'close',
        title: 'Cerrar',
        icon: '/icons/action-close.png'
      }
    ]
  }
  
  if (event.data) {
    const data = event.data.json()
    options.body = data.body || options.body
    options.data = { ...options.data, ...data }
  }
  
  event.waitUntil(
    self.registration.showNotification('TugoTugo', options)
  )
})

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked')
  
  event.notification.close()
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/packs')
    )
  } else if (event.action === 'close') {
    // Just close the notification
    return
  } else {
    // Default action - open app
    event.waitUntil(
      clients.openWindow('/')
    )
  }
})

// Background sync event
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync triggered')
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync())
  }
})

// Helper functions
function shouldCacheInDynamic(url) {
  return API_CACHE_PATTERNS.some(pattern => url.includes(pattern)) ||
         url.includes('/api/') ||
         url.includes('/_next/image')
}

async function doBackgroundSync() {
  try {
    // Sync offline actions when back online
    console.log('Service Worker: Performing background sync')
    
    // Example: sync pending orders, favorites, etc.
    const pendingActions = await getStoredActions()
    
    for (const action of pendingActions) {
      try {
        await fetch(action.url, action.options)
        await removeStoredAction(action.id)
      } catch (error) {
        console.log('Service Worker: Failed to sync action:', error)
      }
    }
  } catch (error) {
    console.log('Service Worker: Background sync failed:', error)
  }
}

async function getStoredActions() {
  // Implementation to get stored offline actions
  return []
}

async function removeStoredAction(id) {
  // Implementation to remove synced action
  console.log('Service Worker: Removed synced action:', id)
}
