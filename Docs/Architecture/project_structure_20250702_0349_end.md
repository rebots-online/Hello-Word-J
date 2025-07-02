# Project Structure - 2025-07-02 03:49 UTC (End)

This document captures the repository layout after implementing service worker registration.

## Root Directory

- `src/` - Cross-platform TypeScript code
- `public/` - Static web assets (includes service worker)
- `HelloWord/` - React Native project
- `Docs/` - Project documentation
- `scripts/` - Development helpers
- Config files and package manifests

## Visual Representation (Mermaid)

```mermaid
flowchart TD
    root((Repo Root))
    root --> src
    root --> public
    root --> Docs
    Docs --> Architecture
    Docs --> checklists
    root --> HelloWord
    root --> scripts
```
