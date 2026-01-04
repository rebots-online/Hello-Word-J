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
| CONSOLIDATE web app variants | Agent | [/] | Keep ActualLiturgicalApp.tsx |
| REMOVE `HelloWord/src/platforms/web/App.tsx` | Agent | [X] | ✅ Deleted 2026-01-04 |
| REMOVE `HelloWord/src/platforms/web/WebApp.tsx` | Agent | [X] | ✅ Deleted 2026-01-04 |
| REMOVE `HelloWord/src/platforms/web/PureWebApp.tsx` | Agent | [X] | ✅ Deleted 2026-01-04 |

### 0.2 Eliminate All Placeholder Data
| Task | Owner | Status | Notes |
|------|-------|--------|-------|
| Replace `textService.ts` placeholder | Agent | [X] | ✅ Now queries DB, no placeholders |
| Remove mock voice path in WebLiturgicalApp | Agent | [X] | ✅ Removed mock recording |
| Audit for remaining placeholder/mock patterns | Agent | [/] | In progress |

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
| Implement real rank fetching | Agent | [ ] | From file Rank: lines |
| Implement real precedence logic | Agent | [ ] | occurrence → winner |
| Add commemorations logic | Agent | [ ] | Per rubrics |

### 1.4 CLI Tool Fixes
| Task | Owner | Status | Notes |
|------|-------|--------|-------|
| Create liturgical-cli.js | Agent | [X] | ✅ Created with all commands |
| Add `report` case to main() | Agent | [X] | ✅ Implemented |
| Verify `mass` command | Agent | [X] | ✅ Tested - outputs JSON |
| Verify `verify` command | Agent | [X] | ✅ Implemented (stub for DO fetch) |

---

## Phase 2: UI/UX - Dopaminergic Principles (Weeks 2-3)

### 2.1 Global Rules Compliance
| Task | Owner | Status | Notes |
|------|-------|--------|-------|
| Copyright splash on load | Agent | [X] | ✅ Shows on app load |
| Version + 5-digit epoch build | Agent | [X] | ✅ In footer + About |
| File/Edit/View/Help menu | Agent | [ ] | Standard structure |
| Version in executable filename | Agent | [ ] | Build script |

### 2.2 Multi-Theme Support
| Task | Owner | Status | Notes |
|------|-------|--------|-------|
| Kinetic theme | Agent | [/] | UI selector added |
| Brutalist theme | Agent | [/] | UI selector added |
| Retro theme | Agent | [/] | UI selector added |
| Neumorphism theme | Agent | [/] | UI selector added |
| Glassmorphism theme | Agent | [/] | UI selector added |
| Y2K theme | Agent | [/] | UI selector added |
| Cyberpunk theme | Agent | [/] | UI selector added |
| Minimal theme | Agent | [/] | UI selector added |
| Light/Dark/System toggle | Agent | [X] | ✅ In Settings view |

### 2.3 PWA Requirements
| Task | Owner | Status | Notes |
|------|-------|--------|-------|
| Service worker | Agent | [ ] | Offline support |
| App manifest | Agent | [ ] | Install capability |
| Background sync | Agent | [ ] | Cache updates |

---

## Phase 3: Data & Storage (Weeks 3-4)

### 3.1 Database
| Task | Owner | Status | Notes |
|------|-------|--------|-------|
| MARTYROLOGY table | Agent | [ ] | Per CLAUDE.md schema |
| Voice journal integration | Agent | [ ] | Date flags |

### 3.2 Cache Management
| Task | Owner | Status | Notes |
|------|-------|--------|-------|
| Intelligent cleanup | Agent | [ ] | Delete old data |
| Preserve major feasts | Agent | [ ] | Christmas, Easter etc |
| Cache size monitoring | Agent | [ ] | In UI |

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
| CI/CD pipeline | Agent | [ ] | GitHub Actions |
| Production build | Agent | [ ] | Version in filename |

---

## Progress Log

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
- 🔄 Continuing with remaining tasks

---

*Last Updated: 2026-01-04 09:55 EST*
