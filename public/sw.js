const CACHE_NAME = 'playday-v2'
const STATIC_ASSETS = [
  '/',
  '/squaddle',
  '/outliers',
  '/simon',
  '/stats',
  '/manifest.json',
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS)
    })
  )
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      )
    })
  )
  self.clients.claim()
})

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return

  // Skip API requests - always fetch fresh
  if (event.request.url.includes('/api/')) {
    return
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Return cached response if available
      if (cachedResponse) {
        // Fetch and update cache in background
        fetch(event.request).then((response) => {
          if (response.ok) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, response)
            })
          }
        }).catch(() => {})
        return cachedResponse
      }

      // Otherwise fetch from network
      return fetch(event.request).then((response) => {
        // Cache successful responses
        if (response.ok) {
          const responseClone = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone)
          })
        }
        return response
      }).catch(() => {
        // Return offline fallback for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('/')
        }
        return new Response('Offline', { status: 503 })
      })
    })
  )
})

// Push notification event
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {}
  const title = data.title || 'PlayDay'
  const options = {
    body: data.body || 'Time to play your daily games!',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    tag: 'daily-reminder',
    renotify: true,
    data: {
      url: data.url || '/'
    }
  }

  event.waitUntil(
    self.registration.showNotification(title, options)
  )
})

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const url = event.notification.data?.url || '/'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Focus existing window if open
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus()
        }
      }
      // Otherwise open new window
      if (clients.openWindow) {
        return clients.openWindow(url)
      }
    })
  )
})
