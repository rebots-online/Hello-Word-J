// Copyright (C) 2025 Robin L. M. Cheung, MBA. All rights reserved.
// Workbox configuration for SanctissiMissa PWA

module.exports = {
  globDirectory: 'dist/',
  globPatterns: [
    '**/*.{html,js,css,png,jpg,svg,woff2,woff,eot,ttf,json}'
  ],
  swDest: 'dist/sw.js',
  swSrc: 'public/sw.js',
  modifyURLPrefix: {
    '': '/'
  },
  runtimeCaching: [
    // App is completely self-contained - no external API calls needed
    // All liturgical texts are embedded in local database
  ],
  skipWaiting: true,
  clientsClaim: true,
};