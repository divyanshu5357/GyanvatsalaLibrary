self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

// Placeholder for future push events
self.addEventListener('push', (event) => {
  const data = event.data?.json() || {}
  const title = data.title || 'Smart Study Room'
  const options = {
    body: data.body || 'You have a new notification.',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-96.png',
  }
  event.waitUntil(self.registration.showNotification(title, options))
})
