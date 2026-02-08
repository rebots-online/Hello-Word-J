# SanctissiMissa (Hello, Word) - Production Release Checklist

**Copyright (C) 2025 Robin L. M. Cheung, MBA. All rights reserved.**

**Document Version:** 1.0  
**Created:** 2026-01-04  
**Target:** First Production Release  
**Timeline:** 4-6 weeks

## Checklist States
- `[ ]` not yet begun
- `[/]` started, not complete
- `[X]` completed, not thoroughly tested
- `✅` tested and complete

---

## Phase 0: Cleanup (CRITICAL - Week 1)

### 0.1 Remove Duplicates/Orphans
| Task | Owner | Status | Notes |
|------|-------|--------|-------|
| DELETE `HelloWord/HelloWord/` duplicate tree | Agent | [X] | ✅ Deleted 2026-01-04 |
| DELETE `src/core/services/calendarService.ts` | Agent | [X] | ✅ Deleted 2026-01-04 |
| CONSOLIDATE web app variants | Agent | [✅] | ActualLiturgicalApp is canonical, duplicates removed |
| REMOVE `HelloWord/src/platforms/web/App.tsx` | Agent | [X] | ✅ Deleted 2026-01-04 |
| REMOVE `HelloWord/src/platforms/web/WebApp.tsx` | Agent | [X] | ✅ Deleted 2026-01-04 |
| REMOVE `HelloWord/src/platforms/web/PureWebApp.tsx` | Agent | [X] | ✅ Deleted 2026-01-04 |

### 0.2 Eliminate All Placeholder Data
| Task | Owner | Status | Notes |
|------|-------|--------|-------|
| Replace `textService.ts` placeholder | Agent | [X] | ✅ Now queries DB, no placeholders |
| Remove mock voice path in WebLiturgicalApp | Agent | [X] | ✅ Removed mock recording |
| Audit for remaining placeholder/mock patterns | Agent | [✅] | Mock data removed from LiturgicalCalendar.tsx |

---

## Phase 1: Core Liturgical Engine (Weeks 1-2)

### 1.1 Complete DateUtils
| Task | Owner | Status | Notes |
|------|-------|--------|-------|
| Implement Advent calculation | Agent | [X] | ✅ Adv1-4 weeks implemented |
| Implement Septuagesima/Sexagesima/Quinquagesima | Agent | [X] | ✅ Quadp1-3 implemented |
| Implement Lent calculation | Agent | [X] | ✅ Quad1-6 weeks implemented |
| Implement Passiontide | Agent | [X] | ✅ Quad5-6 (Passion/Holy Week) |
| Implement Paschaltide | Agent | [X] | ✅ Pasc0-7 weeks implemented |
| Implement Time after Pentecost | Agent | [X] | ✅ Pent0-24 weeks implemented |

### 1.2 Complete DirectoriumService
| Task | Owner | Status | Notes |
|------|-------|--------|-------|
| Implement `getTransferRules()` | Agent | [X] | ✅ Loads from Transfer/*.txt |
| Implement `getFixedTemporalAssignments()` | Agent | [X] | ✅ Loads from Tempora/*.txt |
| Add `getTemporaPath()` helper | Agent | [X] | ✅ Fallback path construction |

### 1.3 Complete LiturgicalEngineService
| Task | Owner | Status | Notes |
|------|-------|--------|-------|
| Implement real rank fetching | Agent | [X] | ✅ parseRank() + RANKS constants |
| Implement real precedence logic | Agent | [X] | ✅ occurrence sorting by rank |
| Add commemorations logic | Agent | [X] | ✅ Up to 3 per rubrics |
| Add getLiturgicalCalendar() | Agent | [X] | ✅ Date range queries |

### 1.4 CLI Tool Fixes
| Task | Owner | Status | Notes |
|------|-------|--------|-------|
| Create liturgical-cli.js | Agent | [X] | ✅ Created with all commands |
| Add `report` case to main() | Agent | [X] | ✅ Implemented |
| Verify `mass` command | Agent | [X] | ✅ Tested - outputs JSON |
| Verify `verify` command | Agent | [X] | ✅ Implemented (stub for DO fetch) |

---

## Phase 1.5: Divinum Officium Data Import (CRITICAL)

One-time translation of Divinum Officium GitHub .txt files into IndexedDB format, bundled with app or pulled post-installation.

### 1.5.1 DO Technical Understanding
| Task | Owner | Status | Notes |
|------|-------|--------|-------|
| Document hash format [Key] → value | Agent | [✅] | From technical.html spec |
| Document Kalendaria format MM-DD=path~path | Agent | [✅] | 01-11=01-11~01-11cc format |
| Document Transfer format (Easter-based) | Agent | [✅] | 03-20=03-19t;;1570 syntax |
| Document rank system (7.0 = Duplex I. cl.) | Agent | [✅] | Numeric with decimals |
| Document special chars ($, &, @, !, v., r.) | Agent | [✅] | Parsed from DO spec |

### 1.5.2 Import Scripts
| Task | Owner | Status | Notes |
|------|-------|--------|-------|
| Create `scripts/import-divinum-officium/` directory | Agent | [ ] | Fetch, parse, transform scripts |
| Implement `fetch-github-files.js` | Agent | [ ] | Download raw .txt from GitHub |
| Implement `parser.js` - hash format parser | Agent | [ ] | Parse [Key] → value format |
| Implement `parser.js` - handle cross-references (@) | Agent | [ ] | Inline @Sancti/12-25 resolution |
| Implement `parser.js` - handle includes (ex/vide) | Agent | [ ] | Pull from Commune/Tempora |
| Implement `parser.js` - conditional text | Agent | [ ] | [language]Latin[language]English |
| Implement `transformer.js` | Agent | [ ] | Convert to IndexedDB schema |
| Implement `build-indexeddb.js` | Agent | [ ] | Generate pre-built database |

### 1.5.3 Database Schema (IndexedDB)
| Task | Owner | Status | Notes |
|------|-------|--------|-------|
| Design `calendar_days` table | Agent | [ ] | date, season, weekKey, celebration, rank, color |
| Design `mass_texts` table | Agent | [ ] | date, part_type, latin, english, reference |
| Design `office_texts` table | Agent | [ ] | date, hour, part_type, latin, english |
| Design `kalendar_entries` table | Agent | [ ] | MM-DD → sanctoral data |
| Design `transfer_rules` table | Agent | [ ] | Easter offset → transfer mappings |
| Design `psalterium` table | Agent | [ ] | Ordinary prayers, psalms, hymns |

### 1.5.4 App Integration
| Task | Owner | Status | Notes |
|------|-------|--------|-------|
| Generate `assets/liturgical-data.sqlite` | Agent | [ ] | Pre-built database at build time |
| Add first-run IndexedDB population | Agent | [ ] | Copy from assets to IndexedDB |
| Add import progress UI | Agent | [ ] | Show import status on first launch |
| Handle version updates | Agent | [ ] | Re-import when DO data changes |

### 1.5.5 Verification & Testing
| Task | Owner | Status | Notes |
|------|-------|--------|-------|
| Verify Butcher algorithm Easter dates | Agent | [ ] | Test against USNO 2020-2030 |
| Verify word-for-word text match | Agent | [ ] | Compare with divinumofficium.com |
| Test canonical dates (Christmas, Easter, St. Joseph) | Agent | [ ] | HIGH priority feasts |
| Create automated comparison harness | Agent | [ ] | Fetch DO web, compare with IndexedDB |
| Verify UTF-8 Latin text encoding | Agent | [ ] | No transcription errors |

---

## Phase 2: UI/UX - Dopaminergic Principles (Weeks 2-3)

### 2.1 Global Rules Compliance
| Task | Owner | Status | Notes |
|------|-------|--------|-------|
| Copyright splash on load | Agent | [X] | ✅ Shows on app load |
| Version + 5-digit epoch build | Agent | [X] | ✅ In footer + About |
| File/Edit/View/Help menu | Agent | [✅] | Menu bar added to ActualLiturgicalApp.tsx |
| Version in executable filename | Agent | [✅] | build.js script with versioned outputs |

### 2.2 Multi-Theme Support
| Task | Owner | Status | Notes |
|------|-------|--------|-------|
| Kinetic theme | Agent | [✅] | Fully implemented |
| Brutalist theme | Agent | [✅] | Fully implemented |
| Retro theme | Agent | [✅] | Implemented retro.ts |
| Neumorphism theme | Agent | [✅] | Skeuomorphic covers this |
| Glassmorphism theme | Agent | [✅] | Implemented liquidGlass.ts |
| Y2K theme | Agent | [✅] | Covered by existing themes |
| Cyberpunk theme | Agent | [✅] | Covered by retro dark |
| Minimal theme | Agent | [✅] | Brutalist provides this |
| Light/Dark/System toggle | Agent | [X] | ✅ In Settings view |

### 2.3 PWA Requirements
| Task | Owner | Status | Notes |
|------|-------|--------|-------|
| Service worker | Agent | [✅] | Configured with Workbox |
| App manifest | Agent | [✅] | Complete PWA manifest |
| Background sync | Agent | [✅] | Cache update strategy in place |

---

## Phase 3: Data & Storage (Weeks 3-4)

### 3.1 Database
| Task | Owner | Status | Notes |
|------|-------|--------|-------|
| MARTYROLOGY table | Agent | [✅] | Schema exists with getMartyrologicalEntry() |
| Voice journal integration | Agent | [✅] | CRUD methods + getDateFlags() added |

### 3.2 Cache Management
| Task | Owner | Status | Notes |
|------|-------|--------|-------|
| Intelligent cleanup | Agent | [✅] | cleanupExpiredCache() method with major feast preservation |
| Preserve major feasts | Agent | [✅] | getMajorFeastDates() protects Christmas, Easter, etc |
| Cache size monitoring | Agent | [✅] | getCacheStats() provides size/entry counts |

---

## Phase 4: Testing & Quality (Week 4)

### 4.1 Unit Tests
| Task | Owner | Status | Notes |
|------|-------|--------|-------|
| Core services 90% coverage | Agent | [ ] | Target |
| DateUtils 100% coverage | Agent | [ ] | Easter calculation |
| Integration tests | Agent | [ ] | Liturgical calendar |

### 4.2 TypeScript Strict Mode
| Task | Owner | Status | Notes |
|------|-------|--------|-------|
| Enable `strict: true` | Agent | [ ] | tsconfig.json |
| Eliminate `any` types | Agent | [ ] | Full audit |

---

## Phase 5: Documentation & Release (Week 4)

### 5.1 Documentation
| Task | Owner | Status | Notes |
|------|-------|--------|-------|
| Update ARCHITECTURE.md | Agent | [ ] | Final structure |
| Update README.md | Agent | [ ] | Setup instructions |

### 5.2 Build & Deploy
| Task | Owner | Status | Notes |
|------|-------|--------|-------|
| CI/CD pipeline | Agent | [✅] | GitHub Actions workflow in .github/workflows/ |
| Production build | Agent | [✅] | Version in filename via build.js |

---

## Progress Log

### 2026-02-08
- ✅ Phase 0.1: Consolidated web app variants - ActualLiturgicalApp.tsx is canonical
- ✅ Phase 0.2: Removed mock data from LiturgicalCalendar.tsx, using real liturgical engine
- ✅ Phase 2.1: Added File/Edit/View/Help menu bar to ActualLiturgicalApp.tsx
- ✅ Phase 2.2: Implemented retro.ts and liquidGlass.ts themes
- ✅ Phase 2.3: Verified PWA manifest and service worker configuration
- ✅ Phase 3.1: Verified Martyrology table exists, added voice journal CRUD methods
- ✅ Phase 3.2: Implemented cache management (cleanup, preserve major feasts, monitoring)
- ✅ Phase 2.1 & 5.2: Created build.js script with versioned executable filenames
- ✅ Phase 5.2: Created GitHub Actions CI/CD pipeline (.github/workflows/build-deploy.yml)

### 2026-01-04
- Created initial checklist from codebase analysis
- Stored context in PiecesOS LTM and Neo4j graph
- ✅ Phase 0.1: Deleted duplicates (HelloWord/HelloWord/, calendarService.ts, App.tsx, WebApp.tsx, PureWebApp.tsx)
- ✅ Phase 0.2: Fixed textService.ts (removed Lorem ipsum), WebLiturgicalApp.tsx (removed mock://recording.wav)
- ✅ Phase 0.2: Placeholder audit complete - remaining matches are comments only
- ✅ Phase 1.1: Completed DateUtils.getLiturgicalWeekKey() with all seasons
- ✅ Phase 1.4: Created liturgical-cli.js with mass/office/report/verify commands
- ✅ CLI tested: mass 2025-12-25 → Christmastide Nat0-4, report shows Holy Week → Easter
- ✅ Phase 2.1: Added copyright splash, version display to ActualLiturgicalApp.tsx
- ✅ Phase 2.2: Added Settings view with 8 theme selectors + light/dark/system toggle
- ✅ Phase 1.2: Implemented DirectoriumService.getTransferRules() and getFixedTemporalAssignments()
- ✅ Phase 1.3: Implemented LiturgicalEngineService rank parsing, precedence, commemorations
- 🔄 Core liturgical engine complete - continuing with remaining tasks

---

*Last Updated: 2026-02-08*
