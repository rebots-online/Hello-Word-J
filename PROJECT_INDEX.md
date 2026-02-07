# Project Index: SanctissiMissa (Hello, Word)

Generated: 2026-02-06

## Project Structure

```
Hello-Word-J/
├── HelloWord/                  # React Native app (mobile + web entry)
│   ├── App.tsx                 # RN app entry component
│   ├── index.js                # RN native entry
│   ├── index.web.js            # RN web entry
│   ├── index.html              # Web HTML shell
│   ├── vite.config.ts          # HelloWord-level Vite config
│   ├── src/platforms/web/      # Web-specific RN components
│   │   ├── main.tsx            # Web bootstrap
│   │   ├── FullWebApp.tsx      # Full web app wrapper
│   │   ├── WebLiturgicalApp.tsx
│   │   ├── ActualLiturgicalApp.tsx
│   │   └── RealDataApp.tsx
│   └── __tests__/              # Jest tests (2 files)
├── src/                        # Shared core source
│   ├── api/                    # API layer
│   │   ├── liturgical.ts       # Native API client
│   │   └── liturgical.web.ts   # Web API client
│   ├── components/             # UI components (7 files)
│   │   ├── LiturgicalApp.tsx   # Main app component
│   │   ├── CalendarDashboard.tsx
│   │   ├── LiturgicalCalendar.tsx
│   │   ├── MassTexts.tsx
│   │   ├── SaintsInfo.tsx
│   │   ├── ParishDashboard.tsx
│   │   └── Journal.tsx
│   ├── core/
│   │   ├── services/           # Business logic (7 files)
│   │   │   ├── CalendarService.ts
│   │   │   ├── DirectoriumService.ts
│   │   │   ├── LiturgicalEngineService.ts
│   │   │   ├── TextFileParserService.ts
│   │   │   ├── TextParsingService.ts
│   │   │   ├── dataManager.ts
│   │   │   └── textService.ts
│   │   ├── types/              # TypeScript types
│   │   │   ├── liturgical.ts   # Core domain types
│   │   │   └── services.ts     # Service interfaces
│   │   └── utils/
│   │       └── DateUtils.ts
│   ├── platforms/              # Platform abstraction
│   │   ├── storageFactory.ts   # Factory pattern
│   │   ├── web/
│   │   │   ├── StorageService.ts
│   │   │   └── webSqliteStorage.ts
│   │   └── native/
│   │       └── sqliteStorage.ts
│   └── shared/                 # Shared UI
│       ├── components/Button/
│       └── themes/             # Theme system (4 themes)
│           ├── ThemeProvider.tsx
│           ├── base.ts
│           ├── brutalist.ts
│           └── skeuomorphic.ts
├── liturgical-api/             # Express.js backend API
│   ├── server.js               # Express server entry
│   ├── liturgical-engine.js    # Core liturgical calculation engine
│   ├── setup-database.js       # DB initialization
│   └── test-api.js             # API tests
├── src-tauri/                  # Tauri desktop wrapper
│   ├── src/main.rs             # Rust entry
│   ├── Cargo.toml
│   └── tauri.conf.json
├── public/                     # Static web assets
│   ├── service-worker.js       # PWA service worker
│   ├── sw.js                   # Workbox SW
│   ├── manifest.json           # PWA manifest
│   └── sql-wasm.wasm           # SQL.js WASM binary
├── data/                       # Knowledge graph data
│   ├── hkg-foundations/        # Hybrid Knowledge Graph foundation
│   │   ├── neo4j-entities.json
│   │   ├── neo4j-relations.json
│   │   ├── qdrant-documents.json
│   │   ├── postgres-audit-logs.json
│   │   └── uuid-mapping.json
│   └── word-network/           # Word relationship network
├── scripts/
│   └── setup_environment.sh
├── Docs/                       # Project documentation
│   ├── Architecture/           # Architecture snapshots
│   ├── Planning/               # PRD, conventions, features
│   ├── checklists/             # Session checklists
│   └── Examples/               # Reference HTML examples
├── test-output/                # Generated test reports
├── index.html                  # Root web entry
├── vite.config.ts              # Root Vite config
├── tsconfig.json               # Root TypeScript config
├── tailwind.config.js          # TailwindCSS config
└── workbox-config.js           # PWA Workbox config
```

## Entry Points

- **Web (Vite)**: `index.html` → `HelloWord/src/platforms/web/main.tsx`
- **React Native**: `HelloWord/index.js` (native) / `HelloWord/index.web.js` (web)
- **Tauri Desktop**: `src-tauri/src/main.rs` wrapping web build
- **Liturgical API**: `liturgical-api/server.js` (Express on Node.js)
- **Tests**: `HelloWord/__tests__/App.test.tsx`, `HelloWord/__tests__/integration.test.ts`

## Core Modules

### CalendarService (`src/core/services/CalendarService.ts`)
- Liturgical calendar calculations (Easter, seasons, moveable feasts)

### DirectoriumService (`src/core/services/DirectoriumService.ts`)
- Transfer rules and temporal assignments for liturgical days

### LiturgicalEngineService (`src/core/services/LiturgicalEngineService.ts`)
- Precedence and rank logic for feast/feria resolution

### TextFileParserService / TextParsingService (`src/core/services/`)
- Parse Divinum Officium-format text files into structured data

### dataManager (`src/core/services/dataManager.ts`)
- Data access layer, coordinates storage and text retrieval

### textService (`src/core/services/textService.ts`)
- Liturgical text management and lookup

### liturgical-engine (`liturgical-api/liturgical-engine.js`)
- Server-side calculation engine for the HTTP API

## Type System (`src/core/types/liturgical.ts`)

Key types: `LiturgicalSeason`, `BilingualText`, `LiturgicalDay`, `VoiceNote`, `LiturgicalRank`

## Platform Abstraction

- **Factory**: `src/platforms/storageFactory.ts`
- **Web**: IndexedDB via Dexie + sql.js WASM
- **Native**: react-native-sqlite-storage

## Theme System (`src/shared/themes/`)

Three themes: base, brutalist, skeuomorphic. `ThemeProvider.tsx` manages theme context.

## Configuration

| File | Purpose |
|------|---------|
| `vite.config.ts` | Root Vite build (web) |
| `HelloWord/vite.config.ts` | HelloWord Vite config |
| `tsconfig.json` | TypeScript compiler options |
| `tailwind.config.js` | TailwindCSS/NativeWind |
| `workbox-config.js` | PWA service worker generation |
| `src-tauri/tauri.conf.json` | Tauri desktop config |
| `HelloWord/app.json` | React Native app config |
| `.github/workflows/` | CI: claude-code-review, claude |

## Key Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| react | ^19.1.0 | UI framework |
| react-native | ^0.80.1 | Mobile framework |
| react-native-web | ^0.20.0 | Web compatibility |
| vite | ^5/^6 | Web bundler |
| dexie | ^4.0.11 | IndexedDB wrapper |
| sql.js | ^1.13.0 | Browser SQLite |
| sqlite3 | ^5.1.7 | Native SQLite |
| nativewind | ^4.1.23 | TailwindCSS for RN |
| express | ^4.18.2 | API server |
| @tauri-apps/cli | ^1.5.0 | Desktop builds |

## Quick Start

```bash
# Web development (from root)
npm run dev           # Vite dev server

# React Native
cd HelloWord && npm start     # Metro bundler
cd HelloWord && npm run ios   # iOS simulator
cd HelloWord && npm run android # Android

# Liturgical API
cd liturgical-api && npm run dev  # Express API with nodemon

# Build
npm run build         # Vite production build
npm run tauri:build   # Desktop build
npm run pwa:build     # PWA build

# Test
cd HelloWord && npm test   # Jest tests
```

## Documentation Map

| Document | Topic |
|----------|-------|
| `ARCHITECTURE.md` | System architecture overview |
| `ARCHITECTURE-DYNAMIC-LITURGICAL-CALENDAR.md` | Dynamic calendar engine design |
| `ARCHITECTURE-YEAR-AGNOSTIC-LITURGICAL-ENGINE.md` | Year-agnostic engine approach |
| `ROADMAP.md` | Feature roadmap |
| `BREVIARIUM_MISSALE_COMPLETION_PLAN.md` | Breviary/Missal completion plan |
| `COMPREHENSIVE_SCHEMA_DOCUMENTATION.md` | Database schema docs |
| `COMPLETE_SYSTEM_IMPLEMENTATION.md` | Full system implementation guide |
| `RESUME_NOTES_27JUN2025.md` | Session resume notes |
| `Docs/Planning/SanctissiMissa_Project_Overview.md` | Project overview PRD |
| `liturgical-api/LITURGICAL_API_DOCUMENTATION.md` | API documentation |
| `liturgical-api/HYBRID_KNOWLEDGE_GRAPH_DOCUMENTATION.md` | HKG architecture |

## File Counts

- Source (TypeScript/TSX): 31 files
- Services: 7 files
- Components: 7 files
- Tests: 2 files
- Documentation (MD): ~70 files (excluding node_modules)
- Data (JSON): 10 files
