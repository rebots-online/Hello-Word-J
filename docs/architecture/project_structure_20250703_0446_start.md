# Project Structure - 2025-07-03 04:46 UTC (Start)

This snapshot captures the repository layout at the start of the cleanup session.

## Root Directory

- `src/` - Cross-platform TypeScript code
- `public/` - Static web assets
- `HelloWord/` - React Native project
- `Docs/` - Original project documentation
- `docs/` - New documentation area
- `scripts/` - Utility scripts
- `test-output/` - Past test results
- Config files and package manifests

## Visual Representation (Mermaid)

```mermaid
flowchart TD
    root((Repo Root))
    root --> Docs
    Docs --> Architecture
    Docs --> Examples
    Docs --> InteractivePRD
    Docs --> Planning
    Docs --> checklists
    root --> docs
    docs --> architecture
    docs --> checklists
    root --> HelloWord
    root --> public
    root --> scripts
    root --> src
    root --> test-output
```
