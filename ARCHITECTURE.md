# SanctissiMissa API Architecture
## Comprehensive Missale/Brevarium Romanum Interface

### Executive Summary
This document outlines the complete API architecture for SanctissiMissa, a liturgical application providing traditional Latin Catholic Mass and Office texts across multiple platforms. The architecture employs a dynamic calculation engine that generates liturgical content on-demand, caching only what's used, and maintains exact compatibility with divinumofficium.com standards.

## Core Architecture Principles

### 1. Dynamic Calculation Engine
- **On-demand generation**: Calculate liturgical content dynamically rather than pre-storing
- **Selective caching**: Cache only accessed content for performance
- **Real-time validation**: Verify against divinumofficium.com for accuracy
- **No placeholder data**: All content must be authentic or calculated

### 2. Platform-Agnostic Core
- **Universal API**: Single interface serving all platforms
- **Platform adapters**: Specific implementations for each target platform
- **Consistent data models**: Shared types and interfaces across platforms
- **Storage abstraction**: Platform-specific storage with common interface

### 3. Liturgical Accuracy
- **Extraordinary Form (1962)**: Focus on traditional Latin Mass
- **Divinum Officium compatibility**: Match reference implementation exactly
- **Canonical sources**: Butler's Lives, Roman Martyrology, approved texts
- **Verification pipeline**: Automated comparison with authoritative sources

## API Interface Architecture

### Core API Layers

#### 1. Liturgical Calculation Engine
```
LiturgicalEngine {
  + calculateMass(date: Date): MassProper
  + calculateOffice(date: Date, hour: CanonicalHour): OfficeProper
  + calculateCalendar(startDate: Date, endDate: Date): LiturgicalCalendar
  + validateAgainstDivinumOfficium(date: Date): ValidationResult
}
```

#### 2. Content Management API
```
ContentManager {
  + getMassTexts(date: Date, language: Language): BilingualMassTexts
  + getOfficeTexts(date: Date, hour: CanonicalHour): BilingualOfficeTexts
  + getSaintInfo(date: Date): SaintData[]
  + getMartyrology(date: Date): MartyrologicalEntry[]
}
```

#### 3. Storage Abstraction Layer
```
StorageInterface {
  + cacheContent(key: string, content: any): Promise<void>
  + retrieveContent(key: string): Promise<any>
  + clearCache(): Promise<void>
  + getCacheStats(): Promise<CacheStatistics>
}
```

#### 4. Platform Integration Layer
```
PlatformAdapter {
  + initializePlatform(): Promise<void>
  + getStorageImplementation(): StorageInterface
  + getAudioRecorder(): AudioRecorder
  + getNotificationService(): NotificationService
}
```

### Data Models

#### Core Liturgical Types
```typescript
interface LiturgicalDay {
  date: Date;
  season: LiturgicalSeason;
  rank: LiturgicalRank;
  commemorations: Commemoration[];
  color: LiturgicalColor;
  massProper: MassProper;
  officeProper: OfficeProper;
}

interface MassProper {
  introit: BilingualText;
  kyrie: BilingualText;
  gloria: BilingualText;
  collect: BilingualText;
  epistle: BilingualText;
  gradual: BilingualText;
  gospel: BilingualText;
  offertory: BilingualText;
  secret: BilingualText;
  preface: BilingualText;
  canon: BilingualText;
  communion: BilingualText;
  postcommunion: BilingualText;
}

interface OfficeProper {
  hour: CanonicalHour;
  antiphons: BilingualText[];
  psalms: BilingualText[];
  lessons: BilingualText[];
  responsories: BilingualText[];
  hymns: BilingualText[];
  versicles: BilingualText[];
  prayers: BilingualText[];
}

interface BilingualText {
  latin: string;
  english: string;
  source: string;
  verified: boolean;
}
```

## Platform-Specific Implementations

### Web Platform (React + Vite)
```
WebAdapter {
  - Storage: IndexedDB via Dexie
  - Audio: Web Audio API
  - Notifications: Web Push API
  - PWA: Service Worker + Workbox
  - Styling: TailwindCSS
}
```

### React Native (iOS/Android)
```
NativeAdapter {
  - Storage: SQLite via react-native-sqlite-storage
  - Audio: react-native-audio-recorder-player
  - Notifications: react-native-push-notification
  - Styling: NativeWind
}
```

### Desktop (Tauri)
```
TauriAdapter {
  - Storage: SQLite via Tauri SQL plugin
  - Audio: Tauri audio plugin
  - Notifications: Tauri notification plugin
  - Window: Tauri window management
}
```

### React Component Integration
```
ComponentLibrary {
  - LiturgicalCalendar: Calendar display component
  - MassTexts: Mass proper display
  - OfficeTexts: Divine Office display
  - SaintsInfo: Saint information display
  - VoiceJournal: Audio recording interface
  - ParishDashboard: Parish-specific content
}
```

## Service Architecture

### External Service Integration
```
ExternalServices {
  + DivinumOfficiumService: Real-time content fetching
  + VerificationService: Content accuracy validation
  + CacheService: Intelligent content caching
  + SyncService: Multi-device synchronization
}
```

### Internal Services
```
InternalServices {
  + CalculationService: Liturgical date calculations
  + TextService: Text processing and formatting
  + AudioService: Voice recording and playback
  + NotificationService: Daily office reminders
}
```

## Data Flow Architecture

### Request Flow
1. **API Request**: Platform makes request to Core API
2. **Cache Check**: Check if content exists in cache
3. **Dynamic Generation**: Calculate liturgical content if not cached
4. **External Validation**: Verify against divinumofficium.com
5. **Cache Storage**: Store validated content in platform-specific cache
6. **Response**: Return formatted content to platform

### Caching Strategy
- **Selective Caching**: Only cache accessed content
- **Temporal Locality**: Cache recent and upcoming dates
- **Verification Caching**: Cache validation results
- **Platform-Specific**: Adapt cache strategy to platform capabilities

## Security & Privacy
- **Offline-First**: Core functionality without network dependency
- **Local Storage**: All user data stored locally
- **Optional Sync**: User-controlled cloud synchronization
- **Privacy-Focused**: No tracking or analytics

## Performance Considerations
- **Lazy Loading**: Load content on-demand
- **Efficient Caching**: Minimize storage usage
- **Background Processing**: Pre-calculate upcoming dates
- **Platform Optimization**: Leverage platform-specific optimizations

## Error Handling & Resilience
- **Graceful Degradation**: Fallback to cached content
- **Retry Logic**: Automatic retry for external services
- **Offline Mode**: Full functionality without network
- **Validation Errors**: Clear error messages for content mismatches

## Monitoring & Observability
- **Cache Statistics**: Monitor cache hit rates
- **Performance Metrics**: Track calculation times
- **Error Tracking**: Log and analyze errors
- **Usage Analytics**: Optional usage statistics

## Future Extensibility
- **Plugin Architecture**: Support for additional liturgical traditions
- **Localization**: Multi-language support beyond Latin/English
- **Custom Calendars**: Support for diocese-specific calendars
- **Third-Party Integration**: API for external applications