# SanctissiMissa Build System Recovery & Learnings

## Overview
This document captures critical learnings from resolving build system crashes and configuration issues in the SanctissiMissa (Hello-Word-J) liturgical application on 2025-06-27.

## Critical Issues Resolved

### 1. TextParsingService.ts Syntax Errors
**Problem**: Multiple syntax and type errors preventing compilation
**Fixes Applied**:
- **Line 206**: Removed invalid `export default NativeStorageService;` syntax causing ESBuild errors
- **Line 258**: Fixed undefined variable `inclSubstitutions` by properly extracting from regex match groups
- **Lines 1-9**: Removed duplicate `LiturgicalTextPart` interface declaration
- **Added**: Missing `LiturgicalContext` interface export to satisfy DataManager imports
- **Regex Fixes**: Corrected escaped backslashes in `parseSections()` and `processLineConditionals()` methods

### 2. Metro Bundler Configuration
**Problem**: Metro bundler failing due to Expo dependencies in no-Expo architecture
**Fixes Applied**:
- Removed `@expo/metro-config` dependency from `metro.config.js`
- Corrected watch folder path from `../../src` to `../src` 
- Maintained React Native core configuration without Expo extensions
- Successfully eliminated babel errors and dependency conflicts

### 3. Multi-Platform Build Architecture
**Problem**: React Native Web compatibility issues with Flow type syntax
**Challenges Identified**:
- Vite cannot parse Flow type syntax from React Native core (`import typeof * as ReactNativePublicAPI`)
- Direct imports of `react-native` in web builds cause build failures
- Platform-specific entry points required for clean separation

**Solutions Implemented**:
- Created separate `WebApp.tsx` component for web-specific builds
- Updated web entry point (`main.tsx`) to use WebApp instead of App
- Added React Native modules to Vite build externals
- Maintained shared core services with platform-specific implementations

## Build System Status

### ✅ Working Components
- **Metro Bundler**: Successfully starts without babel/Expo errors
- **Native Storage**: SQLite service functional with transaction support
- **Core Services**: TextParsingService, DataManager, CalendarService operational
- **TypeScript**: Clean compilation with proper interface exports

### ⚠️ Partial Solutions
- **Vite Web Build**: Still encounters React Native Flow type parsing issues
- **Web Platform**: Requires further isolation of React Native dependencies
- **Multi-platform**: Build-time separation needed between native and web targets

## Architecture Learnings

### Multi-Platform Considerations
1. **Strict Separation**: Web builds must avoid importing React Native core modules
2. **Platform-Specific Components**: Create separate entry points for web vs native
3. **Shared Services**: Core business logic can be shared via platform-agnostic interfaces
4. **Build Configuration**: Different bundlers (Metro vs Vite) require different handling

### Code Quality Improvements
1. **Interface Management**: Avoid duplicate interface declarations across files
2. **Regex Patterns**: Proper escaping critical for JavaScript context
3. **Export Consistency**: Use named exports consistently, avoid mixing with default exports
4. **Type Safety**: Missing interface exports cause downstream compilation failures

## Recommended Next Steps

### Immediate Priorities
1. **Web Build Resolution**: Complete isolation of React Native imports from web builds
2. **Platform Testing**: Verify both Metro and Vite builds work end-to-end
3. **Storage Layer**: Test cross-platform storage services with real data

### Long-term Improvements
1. **Build Pipeline**: Implement automated testing for both platforms
2. **Documentation**: Update CLAUDE.md with build system requirements
3. **CI/CD**: Add platform-specific build validation
4. **Performance**: Optimize bundle sizes for both platforms

## Technical Debt Addressed
- Removed invalid export syntax causing build failures
- Eliminated undefined variable references
- Corrected malformed regex patterns
- Resolved circular dependency issues
- Fixed import path inconsistencies

## Lessons for Future Development
1. **Multi-platform projects require strict build-time separation**
2. **Flow type syntax incompatible with modern bundlers like Vite**
3. **No-Expo architecture achievable but requires careful dependency management**
4. **Platform-specific components necessary for React Native Web compatibility**
5. **Shared core services work well with proper interface definitions**

---
*Generated: 2025-06-27*
*System: SanctissiMissa (Hello-Word-J) Liturgical Application*
*Architecture: React Native + React Native Web + Vite*