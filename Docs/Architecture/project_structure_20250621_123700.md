# Project Structure - 2025-06-21 12:37:00

This document outlines the initial project structure for HelloWord.

## Root Directory

- `HelloWord/`: The main React Native project directory.
  - `android/`: Android specific files.
  - `ios/`: iOS specific files.
  - `node_modules/`: Project dependencies.
  - `src/`: Application source code.
    - `assets/`: Static assets like images, fonts.
    - `components/`: Reusable UI components.
    - `core/`: Core application logic.
      - `services/`: Business logic services (e.g., CalendarService, TextService).
      - `types/`: TypeScript type definitions.
        - `liturgical.ts`: Defines types related to liturgical data (LiturgicalSeason, BilingualText, LiturgicalDay, VoiceNote).
        - `services.ts`: Defines interfaces for platform-specific services (IStorageService, IAudioRecorder, IDeviceInfo).
    - `hooks/`: Custom React hooks.
    - `navigation/`: Navigation configuration.
    - `platforms/`: Platform-specific implementations (e.g., native SQLite, web IndexedDB).
    - `screens/`: Screen components.
    - `store/`: State management (e.g., Redux).
    - `utils/`: Utility functions.
  - `babel.config.js`: Babel configuration.
  - `index.js`: React Native entry point.
  - `package.json`: Project metadata and dependencies.
  - `tailwind.config.js`: Tailwind CSS configuration.
- `vite.config.ts`: Vite configuration for web support.
- `index.html`: HTML entry point for the web application.
- `Docs/`: Project documentation.
  - `Architecture/`: Architectural diagrams and descriptions.
  - `CHECKLIST-HelloWordByGemini-17jun2025-09h30.md`: Development checklist.

## Changes from Stipulated Structure

- The `HelloWord` directory itself is the root of the React Native project, not a subdirectory within a larger repository structure for this phase.
- `tailwind.config.js` is at the root of the `HelloWord` project directory as per standard Tailwind CSS setup.
- `vite.config.ts` and `index.html` are at the repository root, outside the `HelloWord` directory, to serve the web application.

## Visual Representation (Mermaid Diagram)

```mermaid
graph TD
    A[Repo Root] --> B(HelloWord/);
    A --> F(vite.config.ts);
    A --> G(index.html);
    A --> H(Docs/);

    B --> B_android(android/);
    B --> B_ios(ios/);
    B --> B_node_modules(node_modules/);
    B --> B_src(src/);
    B --> B_babel(babel.config.js);
    B --> B_indexjs(index.js);
    B --> B_packagejson(package.json);
    B --> B_tailwind(tailwind.config.js);

    B_src --> src_assets(assets/);
    B_src --> src_components(components/);
    B_src --> src_core(core/);
    B_src --> src_hooks(hooks/);
    B_src --> src_navigation(navigation/);
    B_src --> src_platforms(platforms/);
    B_src --> src_screens(screens/);
    B_src --> src_store(store/);
    B_src --> src_utils(utils/);

    src_core --> core_services(services/);
    src_core --> core_types(types/);

    core_types --> types_liturgical(liturgical.ts);
    core_types --> types_services(services.ts);

    H --> Arch(Architecture/);
    H --> Checklist(CHECKLIST-HelloWordByGemini-17jun2025-09h30.md);
    Arch --> Arch_ProjectStruct(project_structure_20250621_123700.md);
```
