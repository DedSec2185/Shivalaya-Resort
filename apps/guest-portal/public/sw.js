// Shivalaya Guest Portal — Service Worker Cleanup
// Immediately purge all caches and unregister to serve fresh dev/production updates

self.addEventListener('install', (event) => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((key) => caches.delete(key)))
    ).then(() => {
      return self.registration.unregister()
    }).then(() => {
      return self.clients.claim()
    })
  )
})

// Always bypass cache and fetch directly from network
self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request))
})
