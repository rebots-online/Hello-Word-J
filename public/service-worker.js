// This is a placeholder service worker file.
// It will be configured using Workbox to precache assets and provide offline capabilities.

// Import Workbox scripts (this path might need adjustment based on how Workbox is integrated,
// often Workbox generates these files or they are loaded from a CDN)
try {
    importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js');

    if (workbox) {
        console.log(`Yay! Workbox is loaded 🎉`);

        // Precaching: This list will be populated by the Workbox build process.
        // workbox.precaching.precacheAndRoute(self.__WB_MANIFEST);
        // For manual setup, you might define assets here, but it's better generated.
        workbox.precaching.precacheAndRoute([
            // Add URLs of assets to precache here if not using __WB_MANIFEST
            // e.g., { url: '/index.html', revision: '1' },
            //       { url: '/main.js', revision: '1' }, // Adjust based on your build output
            //       { url: '/style.css', revision: '1' },
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
