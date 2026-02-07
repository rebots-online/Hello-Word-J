# SanctissiMissa (Hello, Word) - Project Overview

## What It Is
Traditional Latin Catholic liturgical application (1962 Missal) with:
- Mass texts and Breviary
- Liturgical calendar calculations
- Voice journaling
- Multi-platform: Web (Vite/PWA), iOS, Android (React Native), Desktop (Tauri)

## Tech Stack
- React 19 + React Native 0.80 + react-native-web
- TypeScript 5.0
- Vite 5/6 for web bundling
- TailwindCSS/NativeWind for styling
- SQLite (native) / IndexedDB+Dexie (web) / sql.js WASM
- Express.js backend API
- Tauri for desktop
- Workbox for PWA

## Key Commands
```
npm run dev          # Vite dev server (root)
cd HelloWord && npm test  # Jest tests
cd liturgical-api && npm run dev  # API server
npm run tauri:dev    # Desktop dev
```

## Author
Robin L. M. Cheung, MBA
