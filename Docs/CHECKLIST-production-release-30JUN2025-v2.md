# HelloWord: Liturgical Companion - Implementation-Specific Production Checklist

**Document Version:** 2.1  
**Date:** 01 July 2025  
**Target:** Production Release  
**Timeline:** 01 July 2025 - 30 June 2025

## Architecture Lock-In Notice
This checklist enforces strict 1:1 mapping between architecture and implementation. Each task is explicitly tied to specific platforms, libraries, and implementation patterns to prevent divergence.

---

## Stream A: Core Architecture Implementation (Weeks 1-2)

### A.1: Platform-Specific Service Layer

**Web Implementation** (`/src/platforms/web/`):
- [ ] `StorageService.ts`: Implement using IndexedDB via `dexie`
  - [ ] Extend `IStorageService` interface
  - [ ] Implement schema versioning with Dexie migrations
  - [ ] Add transaction support with rollback capability
  - [ ] Implement full-text search using Dexie's query engine

**Mobile Implementation** (`/src/platforms/native/`):
- [ ] `StorageService.ts`: Implement using `react-native-sqlite-storage`
  - [ ] Extend `IStorageService` interface
  - [ ] Implement SQLite schema migrations
  - [ ] Add FTS5 virtual tables for full-text search
  - [ ] Implement backup/restore functionality

### A.2: Shared Core Services

- [ ] `LiturgicalEngineService.ts` (shared core):
  - [ ] Implement using exact method signatures from `liturgicalEngineInterface.ts`
  - [ ] No direct platform dependencies - all platform-specific code must go through interfaces
  - [ ] Strict TypeScript types for all inputs/outputs
  - [ ] Comprehensive JSDoc for all public methods

### A.3: Data Layer

- [ ] Database Schema (enforced via TypeScript types):
  ```typescript
  // Enforced in /src/core/types/database.ts
  interface DatabaseSchema {
    calendar_days: {
      date: string;  // YYYY-MM-DD
      season: LiturgicalSeason;
      // ... other fields
    };
    // ... other tables
  }
  ```
- [ ] Data Validation Layer:
  - [ ] Implement using `zod` for runtime validation
  - [ ] Generate TypeScript types from Zod schemas
  - [ ] Add validation middleware for all database operations

---

## Stream B: UI Implementation (Weeks 2-4)

### B.1: Component Architecture

**Shared Components** (`/src/components/shared/`):
- [ ] `BilingualText.tsx`:
  ```typescript
  // Must implement exactly this interface
  interface BilingualTextProps {
    latin: string;
    english: string;
    isRubric?: boolean;
    style?: StyleProp<TextStyle>;
    onPress?: () => void;
  }
  ```
  - [ ] Web: Implement using `react-native-web`'s Text component
  - [ ] Mobile: Implement using React Native's Text component
  - [ ] Shared styles using `StyleSheet.create`
  - [ ] Accessibility props (role, accessibilityLabel)

**Platform-Specific Components**:
- [ ] `AudioPlayer.tsx`:
  - Web: `HTMLAudioElement` with custom controls
  - Mobile: `react-native-track-player`
  - Shared interface:
    ```typescript
    interface AudioPlayerProps {
      source: string | { uri: string };
      onPlay?: () => void;
      onPause?: () => void;
      // ... other shared props
    }
    ```

### B.2: Navigation

- [ ] Web Navigation (`/src/navigation/WebNavigator.tsx`):
  - [ ] Implement using `react-router-dom` v6
  - [ ] Nested routes for liturgical sections
  - [ ] Scroll restoration
  - [ ] Route-based code splitting

- [ ] Mobile Navigation (`/src/navigation/MobileNavigator.tsx`):
  - [ ] Implement using `@react-navigation/native-stack`
  - [ ] Bottom tab navigation for main sections
  - [ ] Deep linking support
  - [ ] Screen transitions

---

## Stream C: Build & Deployment (Weeks 4-6)

### C.1: Build System

**Web Build** (`/vite.config.ts`):
```typescript
// Web-specific configuration
export default defineConfig({
  plugins: [
    react(),
    reactNativeWeb({
      // Explicitly list all native modules
      nativeModules: ['react-native-sqlite-storage']
    })
  ],
  // ... other config
});
```
- [ ] Configure Vite for PWA support
- [ ] Implement service worker for offline support
- [ ] Set up code splitting

**Mobile Build** (`/app.json`):
```json
{
  "expo": {
    "web": {
      "bundler": "metro"
    },
    "ios": {
      "bundleIdentifier": "com.helloword.app"
    },
    "android": {
      "package": "com.helloword.app"
    }
  }
}
```
- [ ] Set up EAS for builds
- [ ] Configure app signing
- [ ] Set up environment variables

### C.2: Testing Strategy

- [ ] Unit Tests (Jest):
  - [ ] Core services: 90% coverage
  - [ ] Business logic: 85% coverage
  - [ ] Utility functions: 100% coverage

- [ ] Integration Tests (Detox/Playwright):
  - [ ] Critical user flows
  - [ ] Cross-platform consistency checks
  - [ ] Performance benchmarks

- [ ] E2E Tests:
  - Web: Playwright
  - Mobile: Detox

---

## Implementation Rules (STRICT)

1. **No Direct Platform Imports**
   - ❌ BAD: `import { Platform } from 'react-native'`
   - ✅ GOOD: Use platform-specific implementations with shared interfaces

2. **Strict Type Checking**
   - Enable `strict: true` in `tsconfig.json`
   - No `any` types allowed
   - All API responses must be validated at runtime

3. **Dependency Management**
   - All dependencies must be explicitly listed in `package.json`
   - No direct npm installs without updating the checklist
   - Use exact versions for all dependencies

4. **Code Organization**
   - Platform-agnostic code in `/src/core`
   - Web-specific code in `/src/platforms/web`
   - Mobile-specific code in `/src/platforms/native`
   - Shared UI components in `/src/components/shared`

5. **Version Control**
   - Atomic commits that reference checklist items
   - No direct pushes to main branch
   - All changes must pass CI/CD pipeline

---

## Validation Checklist

Before merging any platform-specific implementation:

1. [ ] Verify interface compatibility with `IStorageService`
2. [ ] Run cross-platform tests
3. [ ] Update documentation with implementation details
4. [ ] Check for any direct platform dependencies
5. [ ] Verify all TypeScript types are strictly enforced
