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

## 🚨 RESUME NOTES - June 27, 2025 Development Session

### CRITICAL STATUS AT PAUSE
**MAJOR ARCHITECTURE CORRECTION COMPLETED**: Switched from wrong mass-import approach to correct dynamic calculation engine.

### CURRENT STATE ✅
1. **Dynamic Engine**: `scripts/setup-dynamic-liturgical-engine.js` - Creates cache-only database
2. **CLI Tool**: `scripts/liturgical-cli.js` - Testing tool with Markdown report generation  
3. **Cache Database**: `/assets/liturgical-cache.db` (48KB cache-only, NOT full import)
4. **Package Scripts**: `npm run liturgical-cli`, `npm run setup-liturgical-engine`

### 🔴 IMMEDIATE URGENT FIX NEEDED
CLI missing 'report' command in main() switch statement. Add this case:
```javascript
case 'report':
    if (args.length < 2) {
        console.error('❌ Error: Date required for report command');
        process.exit(1);
    }
    const reportDate = validateDate(args[1]);
    const reportPath = await generateMarkdownReport(reportDate);
    console.log(`✅ Markdown report generated: ${reportPath}`);
    break;
```

### CRITICAL USER REQUIREMENTS
- **NO placeholder data anywhere** (user repeatedly emphasized)
- **Calculate on-demand, cache only what's used**
- **Match divinumofficium.com output exactly - mismatches = blockers**
- **Do NOT store years worth of Mass + Office data**

### NEXT STEPS ON RESUME
1. Fix CLI report command
2. Implement real liturgical calculation (replace mock data)
3. Add real-time Divinum Officium file fetching with caching
4. Create verification against divinumofficium.com URLs
5. Update DataManager to use dynamic calculation
6. integrate learnings and education component tightly with the generated content--

```
CREATE TABLE MARTYROLOGY (
  id          INTEGER PRIMARY KEY,
  date        TEXT          NOT NULL REFERENCES CALENDAR_DAYS(date),
  saint_name  TEXT          NOT NULL,
  entry_text  TEXT NOT NULL,            -- full narrative or short bio
  source      TEXT,                     -- e.g. “Butler’s Lives of the Saints”
  UNIQUE(date, saint_name)
);
```
 - Perhaps alongside the voice journal info since they should all be easily visible as 'flags' associated with a specific date/time/place

### TESTING COMMANDS
```bash
npm run liturgical-cli help
npm run liturgical-cli mass 2025-06-27
npm run liturgical-cli report 2025-06-27  # NEEDS FIX
npm run liturgical-cli verify 2025-06-27
npm run liturgical-cli cache-stats
```
### About Development Process
      196 1. **Index is invaluable** - PROJECT_INDEX.md saves significant time (94% token reduction)
      197 2. **Code analysis tools work well** - /sc:analyze provides comprehensive assessment
      198 3. **Serena MCP integration** - Cross-session memory management is critical
      199 4. **Documentation matters** - Detailed reports help track progress
      200
      201 ---
      202
      203 ## 🔗 Related Documentation
      204
      205 - `PROJECT_INDEX.md` - Repository structure and entry points
      206 - `PROJECT_INDEX.json` - Machine-readable index
      207 - `docs/analysis/CODE_ANALYSIS_REPORT_2026-02-07.md` - Full analysis details
      208 - `CLAUDE.md` - Project instructions and known issues
      209 - `MEMORY.md` - Cross-session project memory
      210
      211 ---
      212
      213 ## ⏭️ Next Session Roadmap
      214
      215 ### Session Start Tasks
      216 1. Load project context from PROJECT_INDEX.md
      217 2. Review critical issues from analysis report
      218 3. Check git status for untracked changes
      219 4. Begin Phase 1 fixes (merge conflicts, SQL injection)
      220
      221 ### Continuation Point
      222 - **Current Focus**: Code quality and security improvements
      223 - **Next Command**: `/sc:improve` or manual fixes based on analysis
      224 - **Tracking**: Use task list to monitor Phase 1 progress
      225
      226 ---
      227
      228 **Session Status**: ✅ Complete
      229 **Next Review**: After critical fixes are implemented
      230 **Recovery Point**: Session context fully preserved in Serena MCP and documentation
      231
      232 ---
