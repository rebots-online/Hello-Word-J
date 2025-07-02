# Project Structure - 2025-07-02 03:28 UTC (Start)

This document captures the repository layout at the start of the session.

## Root Directory

- `src/` - Cross-platform TypeScript code
- `public/` - Static web assets
- `HelloWord/` - React Native project
- `Docs/` - Project documentation
- `scripts/` (new or absent)
- Config files and package manifests

## Visual Representation (Mermaid)

```mermaid
flowchart TD
    root((Repo Root))
    root --> src
    root --> public
    root --> Docs
    root --> HelloWord
    root --> scripts
    Docs --> Architecture
    Docs --> checklists
```
