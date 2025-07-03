# Project Structure - 2025-07-03 04:24 UTC (Start)

This document captures the repository layout before cleaning up branches. The `docs/` directory is only used for documentation and did not exist prior to this session.

## Root Directory

- `src/` - Cross-platform TypeScript code
- `public/` - Static web assets
- `HelloWord/` - React Native project
- `Docs/` - Project documentation
- `scripts/` - Utility scripts
- `test-output/` - Past test results
- Config files and package manifests

## Visual Representation (Mermaid)

```mermaid
flowchart TD
    root((Repo Root))
    root --> Docs
    Docs --> Architecture
    Docs --> checklists
    root --> HelloWord
    root --> public
    root --> scripts
    root --> src
    root --> test-output
```
