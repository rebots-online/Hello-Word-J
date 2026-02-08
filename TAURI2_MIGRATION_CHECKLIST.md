# Tauri 2 Unified Migration Checklist

**Copyright (C) 2025 Robin L. M. Cheung, MBA. All rights reserved.**

**Objective:** Migrate from Tauri v1 + React Native to Tauri 2 for unified desktop and mobile builds from a single codebase.

**Timeline:** 2-3 weeks  
**Target:** One codebase supporting iOS, Android, Windows, macOS, Linux

---

## Phase 0: Pre-Migration Preparation

### 0.1 Backup Current State
- [ ] Tag current git commit as `pre-tauri2-migration`
- [ ] Document current working builds (web: ✅, mobile: RN, desktop: Tauri v1)
- [ ] Archive HelloWord/ React Native directory for reference

### 0.2 Verify Prerequisites
- [ ] Install Rust 1.70+ (required for Tauri 2)
- [ ] Install Xcode 15+ (for iOS builds)
- [ ] Install Android Studio + SDK (for Android builds)
- [ ] Install Tauri CLI v2: `cargo install tauri-cli --version "^2.0"`
- [ ] Verify Node.js 18+ and npm/yarn

---

## Phase 1: Tauri v1 → v2 Core Migration

### 1.1 Update Cargo.toml
- [ ] Change `tauri-build` to version `2.0`
- [ ] Change `tauri` dependency to `2.0`
- [ ] Update `tauri-build` features if needed
- [ ] Run `cargo update` in src-tauri/

### 1.2 Migrate tauri.conf.json → tauri.conf.json (v2 format)
- [ ] Update `$schema` to v2 schema URL
- [ ] Rename `tauri` key to `app`
- [ ] Migrate `allowlist` → `capabilities` (new permissions system)
- [ ] Update `bundle` configuration for v2
- [ ] Add mobile-specific settings

### 1.3 Update main.rs for Tauri 2
- [ ] Update imports from `tauri::` to new v2 modules
- [ ] Migrate command handlers if needed
- [ ] Update window creation logic
- [ ] Add mobile plugin initialization

### 1.4 Test Desktop Build
- [ ] Run `cargo tauri dev` (desktop dev mode)
- [ ] Verify web assets load correctly
- [ ] Test all existing features (calendar, texts, settings)
- [ ] Build release: `cargo tauri build`

---

## Phase 2: Add Mobile Support

### 2.1 Initialize Mobile Projects
- [ ] Run `cargo tauri android init`
  - Creates src-tauri/gen/android/
  - Sets up Gradle project
- [ ] Run `cargo tauri ios init`
  - Creates src-tauri/gen/ios/
  - Sets up Xcode project

### 2.2 Configure Android
- [ ] Update android/app/build.gradle
  - Set applicationId: `com.sanctissimissa.app`
  - Configure signing for release
- [ ] Update AndroidManifest.xml
  - Add required permissions
  - Configure orientation, theme
- [ ] Test Android dev: `cargo tauri android dev`

### 2.3 Configure iOS
- [ ] Update ios/ project settings
  - Bundle identifier: `com.sanctissimissa.app`
  - Configure signing team
- [ ] Update Info.plist
  - App name, version, permissions
- [ ] Test iOS dev: `cargo tauri ios dev`

### 2.4 Mobile-Specific Optimizations
- [ ] Add mobile viewport meta tag
- [ ] Implement touch-friendly UI adjustments
- [ ] Test responsive design on mobile screens
- [ ] Add mobile-specific gestures if needed

---

## Phase 3: Unified Build System

### 3.1 Update Root package.json Scripts
- [ ] Replace old scripts:
  ```json
  "android:dev": "cargo tauri android dev",
  "android:build": "cargo tauri android build",
  "ios:dev": "cargo tauri ios dev",
  "ios:build": "cargo tauri ios build",
  "desktop:dev": "cargo tauri dev",
  "desktop:build": "cargo tauri build",
  "build:all": "npm run desktop:build && npm run android:build && npm run ios:build"
  ```

### 3.2 Consolidate Build Configuration
- [ ] Create unified build script (scripts/build-all.sh)
- [ ] Configure CI/CD for all platforms
- [ ] Set up artifact naming/versioning

### 3.3 Remove React Native
- [ ] Delete HelloWord/ directory
- [ ] Remove React Native dependencies from root
- [ ] Clean up duplicate platform code
- [ ] Update documentation

---

## Phase 4: Testing & Verification

### 4.1 Desktop Testing
- [ ] Linux: Test .deb and AppImage
- [ ] Windows: Test .msi and .exe
- [ ] macOS: Test .dmg and .app
- [ ] Verify liturgical data loads correctly
- [ ] Test offline functionality

### 4.2 Mobile Testing
- [ ] Android: Test APK and Play Store bundle
- [ ] iOS: Test on device and simulator
- [ ] Test touch interactions
- [ ] Verify database persistence
- [ ] Test app lifecycle (background/foreground)

### 4.3 Feature Parity
- [ ] Calendar view works on all platforms
- [ ] Mass texts display correctly
- [ ] Office texts display correctly
- [ ] Journal entries persist
- [ ] Settings save correctly
- [ ] Rubrics toggle works

---

## Phase 5: Release Preparation

### 5.1 Documentation
- [ ] Update README.md with new build instructions
- [ ] Document mobile-specific setup requirements
- [ ] Update ROADMAP.md
- [ ] Create release notes

### 5.2 Store Preparation
- [ ] Prepare Google Play Store listing
- [ ] Prepare Apple App Store listing
- [ ] Generate screenshots for all platforms
- [ ] Write store descriptions

### 5.3 Final Builds
- [ ] Build signed Android release
- [ ] Build signed iOS release
- [ ] Build all desktop releases
- [ ] Verify all artifacts

---

## Migration Benefits

| Aspect | Before | After |
|--------|--------|-------|
| Codebases | 2 (Tauri + React Native) | 1 (Tauri 2) |
| Languages | Rust, JS/TS, Java, Swift, Obj-C | Rust, JS/TS |
| Build complexity | High | Medium |
| Performance | Good | Better (native webview) |
| Maintenance | Double effort | Single effort |

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Mobile plugin gaps | Research Tauri 2 plugin ecosystem first |
| Build failures | Keep RN project archived as fallback |
| Performance issues | Profile on low-end devices early |
| Store rejection | Follow platform guidelines strictly |

---

## Checklist Legend
- `[ ]` Not started
- `[/]` In progress
- `[X]` Completed (needs verification)
- `[✅]` Fully tested and verified

---

**Next Action:** Review this checklist, then proceed to Phase 0.1 (backup current state).
