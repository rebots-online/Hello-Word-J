# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SanctissiMissa (codenamed "Hello, Word") is a liturgical application for traditional Latin Catholic texts and prayers. It's a React Native app with web support using Vite, featuring:

- Traditional Latin Mass (1962 Missal) and Breviary texts
- Liturgical calendar calculations
- Multi-platform support (web, iOS, Android)
- Voice journaling functionality
- Offline-first architecture with SQLite/IndexedDB storage

## Development Commands

### Core Commands
```bash
# Development
cd HelloWord
npm start                 # Start React Native Metro bundler
npm run android          # Run on Android emulator/device
npm run ios              # Run on iOS simulator/device

# Testing & Quality
npm test                 # Run Jest tests
npm run lint             # Run ESLint

# Web Development (Vite)
# Run from project root, not HelloWord directory
vite                     # Start web development server
vite build               # Build for production
```

## Architecture

### Multi-Platform Structure
- **React Native Core**: Primary app in `/HelloWord/` directory
- **Web Support**: Vite config in project root with `react-native-web`
- **Storage Layer**: Platform-specific implementations
  - Web: IndexedDB via Dexie (`src/platforms/web/indexedDbStorage.ts`)
  - Native: SQLite (`src/platforms/native/sqliteStorage.ts`)
  - Factory pattern: `src/platforms/storageFactory.ts`

### Core Services
- **Calendar Service**: `src/core/services/calendarService.ts` - Liturgical calendar calculations
- **Data Manager**: `src/core/services/dataManager.ts` - Data access layer
- **Text Service**: `src/core/services/textService.ts` - Liturgical text management

### Type System
- **Liturgical Types**: `src/core/types/liturgical.ts` - Core domain types
  - `LiturgicalSeason` enum
  - `BilingualText` interface for Latin/English texts
  - `LiturgicalDay` interface for calendar data
  - `VoiceNote` interface for audio recordings

## Key Technologies

- **React Native 0.80** with React 19
- **TypeScript 5.0**
- **Vite 6** for web bundling
- **TailwindCSS/NativeWind** for styling
- **SQLite** (react-native-sqlite-storage) for native storage
- **Dexie** for web IndexedDB storage
- **Workbox** for service worker/PWA functionality

## Development Patterns

### Code Conventions
- **PascalCase**: Classes, interfaces, types, enums
- **camelCase**: Variables, functions, methods
- **UPPER_SNAKE_CASE**: Constants
- Functional components with TypeScript interfaces
- Platform-specific file extensions: `.web.tsx`, `.native.tsx`

### File Organization
```
src/
├── core/
│   ├── services/     # Business logic services
│   └── types/        # TypeScript type definitions
└── platforms/        # Platform-specific implementations
    ├── web/          # Web-specific code
    ├── native/       # React Native-specific code
    └── storageFactory.ts
```

## Important Notes

- The project has merge conflicts in `liturgical.ts` that need resolution
- Git status shows staged changes in package files and pending patches
- Service worker is configured for PWA functionality
- Project follows clean room implementation approach (no direct copying from reference)
- Focus on Extraordinary Form (1962) liturgical calendar and texts