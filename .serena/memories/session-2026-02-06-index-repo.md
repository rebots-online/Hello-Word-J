# Session: 2026-02-06 - Repository Indexing

## What Was Done
- Created `PROJECT_INDEX.md` (human-readable) and `PROJECT_INDEX.json` (machine-readable)
- Full repository structure analysis completed

## Project Structure Summary
- **31 TypeScript/TSX source files** across web, iOS, Android, desktop targets
- **7 core services**: CalendarService, DirectoriumService, LiturgicalEngineService, TextFileParserService, TextParsingService, dataManager, textService
- **7 UI components**: LiturgicalApp, CalendarDashboard, LiturgicalCalendar, MassTexts, SaintsInfo, ParishDashboard, Journal
- **3 themes**: base, brutalist, skeuomorphic
- **Express API backend** (liturgical-api/) with SQLite
- **Tauri desktop** wrapper (src-tauri/)
- **PWA support** via Workbox

## Key Architecture Decisions
- Dynamic liturgical calculation engine (NOT mass-import approach)
- Platform abstraction via factory pattern (storageFactory.ts)
- Web uses IndexedDB/Dexie + sql.js WASM; Native uses SQLite
- Clean room implementation (no direct copy from reference sources)
- Calculate on-demand, cache only what's used

## Critical Notes from CLAUDE.md
- NO placeholder data anywhere
- Must match divinumofficium.com output exactly
- CLI report command needs fix (missing case in switch)
- liturgical.ts has unresolved merge conflicts

## Entry Points
- Web: index.html → HelloWord/src/platforms/web/main.tsx
- RN: HelloWord/index.js / index.web.js
- API: liturgical-api/server.js
- Desktop: src-tauri/src/main.rs
