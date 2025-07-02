# Project Structure - 2025-07-02 18:00 UTC (End)

Repository layout after adding coverage test and docs.

## Root Directory

- `src/` - Cross-platform TypeScript code
- `public/` - Static web assets
- `HelloWord/` - React Native project (now contains coverage test and fixtures)
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
    HelloWord --> __tests__
    __tests__ --> fixtures
    root --> public
    root --> scripts
    root --> src
    root --> test-output
```
