# Storage Layer and Offline Support - 2025-06-21 16:00:00

This document details the implementation of the storage layer (SQLite for native, IndexedDB for web) and initial setup for web offline support using a service worker.

## 1. IStorageService Interface (`core/types/services.ts`)

This interface defines the contract for storage operations:
- `initialize(): Promise<void>`
- `executeQuery(sql: string, params?: any[]): Promise<any[]>`
- `transaction(callback: () => Promise<void>): Promise<void>` (Note: callback signature might evolve for better transactional control)

## 2. Native SQLite Storage Adapter (`platforms/native/sqliteStorage.ts`)

- **Library:** `react-native-sqlite-storage`
- **Class:** `NativeStorageService`
- **Details:**
    - `initialize()`: Opens the SQLite database (`HelloWord.db`).
    - `executeQuery(sql, params)`: Executes arbitrary SQL statements and returns results.
    - `transaction(callback)`: Implements transactions.
        - **Nuance:** To make this work with `DataManager`'s current transaction callback (which calls `this.storageService.executeQuery`), this method temporarily overrides the instance's `executeQuery` method to ensure it uses the SQLite transaction object (`tx`). This is a workaround given the current `IStorageService.transaction` signature and may be refined.
- **Dependencies:** `react-native-sqlite-storage`, `@types/react-native-sqlite-storage`.

## 3. Web IndexedDB Storage Adapter (`platforms/web/indexedDbStorage.ts`)

- **Library:** `Dexie.js` (a wrapper for IndexedDB)
- **Class:** `WebStorageService`
- **Details:**
    - **Schema:** Defines object stores (`calendar_days`, `mass_texts`, `office_texts`, `voice_notes`) mirroring the SQL schema. Dexie handles schema versioning and creation in its constructor/`version().stores()` methods.
        - `CalendarDayRecord`, `MassTextRecord`, etc., interfaces are defined for Dexie's object stores.
    - `initialize()`: Ensures the Dexie database is opened.
    - `executeQuery(sql, params)`:
        - **Currently throws `NotImplementedError`.** Dexie is a NoSQL-style object database and does not directly execute SQL.
        - **Impact:** `DataManager.initialize()` (which tries to run `CREATE TABLE` SQL) and other services relying on raw SQL via `executeQuery` will **fail on the web platform**. This requires `DataManager` to be adapted for the web, or a SQL-to-Dexie translation layer (complex).
    - `transaction(callback)`: Uses Dexie's transaction mechanism.
        - **Impact:** Similar to `executeQuery`, if the callback attempts to use `this.storageService.executeQuery`, it will fail. The `DataManager.initialize()` transaction block will not function as intended on the web.
- **Dependencies:** `dexie`.

## 4. Storage Service Factory (`platforms/storageFactory.ts`)

- **Function:** `createStorageService(): IStorageService` (also `getStorageService()` for singleton access)
- **Logic:**
    - Detects the platform using `Platform.OS`.
    - Returns an instance of `NativeStorageService` for 'android' or 'ios'.
    - Returns an instance of `WebStorageService` for 'web'.
    - Throws an error for unsupported platforms.
    - Implements a simple singleton pattern to ensure only one storage service instance is created.

## 5. Web Service Worker (`public/service-worker.js`)

- **Library:** `Workbox` (via `workbox-cli` for eventual build integration)
- **Purpose:** Enable Progressive Web App (PWA) features, primarily offline caching.
- **Current State:**
    - A placeholder `service-worker.js` file has been created in the `public/` directory.
    - It includes basic Workbox setup to load Workbox scripts.
    - It defines placeholder precaching (`workbox.precaching.precacheAndRoute([])`). This will need to be populated by `workbox-cli` during the web build process (e.g., `workbox generateSW` or `workbox injectManifest` integration with Vite build).
    - Includes runtime caching strategies for fonts (StaleWhileRevalidate) and images (CacheFirst).
- **Next Steps (Not part of this immediate implementation):**
    - Integrate `workbox-cli` into the web build process (`package.json` scripts for `build:web`).
    - Register the service worker in the web application's entry point (e.g., `src/index.web.js`).
- **Dependencies:** `workbox-cli` (dev dependency).
- **Vulnerabilities:** `npm install workbox-cli` reported 5 moderate severity vulnerabilities. These should be reviewed via `npm audit`.

## Architectural Diagram (Mermaid)

```mermaid
graph TD
    subgraph ApplicationCore
        DataManager[DataManager]
        TextService[TextService]
        IStorageService[IStorageService Interface]
    end

    subgraph PlatformAdapters
        StorageFactory[StorageFactory]
        NativeStorage[NativeStorageService (SQLite)]
        WebStorage[WebStorageService (Dexie/IndexedDB)]
    end

    subgraph WebInfra
        ServiceWorker[public/service-worker.js (Workbox)]
        ViteBuildConfig[Vite Build Process]
    end

    subgraph NativeInfra
        SQLiteLib[react-native-sqlite-storage]
    end

    subgraph WebBrowser
        IndexedDB_API[Browser IndexedDB API]
        ServiceWorker_API[Browser Service Worker API]
    end

    DataManager --> IStorageService;
    TextService --> IStorageService;

    StorageFactory -.-> IStorageService;
    StorageFactory -- creates --> NativeStorage;
    StorageFactory -- creates --> WebStorage;

    NativeStorage -- implements --> IStorageService;
    NativeStorage -- uses --> SQLiteLib;

    WebStorage -- implements --> IStorageService;
    WebStorage -- uses --> DexieLib[Dexie.js];
    DexieLib -- wraps --> IndexedDB_API;

    ServiceWorker -- configured by --> WorkboxCLILib[workbox-cli];
    ViteBuildConfig -- invokes --> WorkboxCLILib;
    ViteBuildConfig -- produces --> WebAssets[Built Web Assets];
    ServiceWorker -- caches --> WebAssets;
    ServiceWorker -- managed by --> ServiceWorker_API;

    %% Data Flow / Issues
    DataManager_Init[DataManager.initialize] -- uses SQL --> NativeStorage_Exec[NativeStorage.executeQuery];
    DataManager_Init -- "uses SQL (FAILS)" --> WebStorage_Exec[WebStorage.executeQuery throws Error];

    classDef service fill:#f9f,stroke:#333,stroke-width:2px;
    classDef interface fill:#ccf,stroke:#333,stroke-width:2px;
    classDef adapter fill:#lightgrey,stroke:#333,stroke-width:2px;
    classDef webstuff fill:#lightblue,stroke:#333,stroke-width:2px;
    classDef nativestuff fill:#e0e0e0,stroke:#333,stroke-width:2px;

    class DataManager,TextService service;
    class IStorageService interface;
    class StorageFactory,NativeStorage,WebStorage adapter;
    class ServiceWorker,ViteBuildConfig,WebAssets,WorkboxCLILib,DexieLib webstuff;
    class SQLiteLib nativestuff;
```

## Key Considerations and Next Steps

- **`DataManager` on Web:** The most significant issue is that `DataManager`'s reliance on `executeQuery` with SQL will not work with the current `WebStorageService` (Dexie). This needs to be addressed by:
    1.  Modifying `DataManager` to use Dexie-specific methods when on the web (requiring conditional logic or a different DataManager implementation for web).
    2.  Or, creating a SQL-to-Dexie translation layer within `WebStorageService.executeQuery` (highly complex).
    3.  For schema creation, `DataManager.initialize` should not attempt to run `CREATE TABLE` SQL on the web, as Dexie manages this.
- **Service Worker Integration:** The `service-worker.js` needs to be properly integrated into the web build process and registered by the client application.
- **Transaction Signature:** The `IStorageService.transaction` callback signature might be improved for clarity and type safety, especially for the Dexie implementation.
- **Error Handling:** Robust error handling needs to be ensured across all storage operations.
- **Data Import/Synchronization:** The current services only set up the structure; actual data import (e.g., from Divinum Officium) and synchronization logic are future tasks.
- **Vulnerabilities:** Address the vulnerabilities reported by `npm install workbox-cli`.
