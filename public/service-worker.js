// This is a placeholder service worker file.
// It will be configured using Workbox to precache assets and provide offline capabilities.

// Import Workbox scripts (this path might need adjustment based on how Workbox is integrated,
// often Workbox generates these files or they are loaded from a CDN)
try {
    importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js');

    if (workbox) {
        console.log(`Yay! Workbox is loaded 🎉`);

        // Precaching core assets for offline use
        workbox.precaching.precacheAndRoute([
            { url: '/index.html', revision: null },
            { url: '/HelloWord/index.web.js', revision: null },
            { url: '/sql-wasm.wasm', revision: null }
        ]);

        // Runtime Caching for fonts
        workbox.routing.registerRoute(
            ({request}) => request.destination === 'font',
            new workbox.strategies.StaleWhileRevalidate({
                cacheName: 'google-fonts-webfonts',
                plugins: [
                    new workbox.cacheable_response.CacheableResponsePlugin({
                        statuses: [0, 200],
                    }),
                    new workbox.expiration.ExpirationPlugin({
                        maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
                        maxEntries: 30,
                    }),
                ],
            })
        );

        // Runtime Caching for images
        workbox.routing.registerRoute(
            ({request}) => request.destination === 'image',
            new workbox.strategies.CacheFirst({ // Or StaleWhileRevalidate
                cacheName: 'image-cache',
                plugins: [
                    new workbox.cacheable_response.CacheableResponsePlugin({
                        statuses: [0, 200],
                    }),
                    new workbox.expiration.ExpirationPlugin({
                        maxEntries: 60,
                        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
                    }),
                ],
            })
        );

        // Example: Caching API calls (if applicable)
        // workbox.routing.registerRoute(
        //   ({url}) => url.pathname.startsWith('/api/'),
        //   new workbox.strategies.NetworkFirst({
        //     cacheName: 'api-cache',
        //     plugins: [
        //       new workbox.expiration.ExpirationPlugin({
        //         maxEntries: 50,
        //         maxAgeSeconds: 5 * 60, // 5 minutes
        //       }),
        //     ],
        //   })
        // );

        // Basic navigation fallback (optional, for SPAs)
        // workbox.routing.registerNavigationRoute(
        //     workbox.precaching.createHandlerBoundToURL('/index.html')
        // );

        self.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'SKIP_WAITING') {
                self.skipWaiting();
            }
        });

    } else {
        console.log(`Boo! Workbox didn't load 😬`);
    }
} catch (e) {
    console.error('Error importing or configuring Workbox in service-worker.js', e);
}
