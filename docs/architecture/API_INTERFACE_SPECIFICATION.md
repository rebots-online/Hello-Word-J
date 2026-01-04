# API Interface Specification
## SanctissiMissa Missale/Brevarium Romanum

### Core API Contracts

#### 1. LiturgicalEngine Interface
```typescript
interface ILiturgicalEngine {
  /**
   * Calculate Mass proper for a specific date
   * @param date - Target date for calculation
   * @returns Complete Mass proper with all texts
   */
  calculateMass(date: Date): Promise<MassProper>;
  
  /**
   * Calculate Divine Office for specific date and hour
   * @param date - Target date
   * @param hour - Canonical hour (Matins, Lauds, Prime, etc.)
   * @returns Complete Office proper with all texts
   */
  calculateOffice(date: Date, hour: CanonicalHour): Promise<OfficeProper>;
  
  /**
   * Generate liturgical calendar for date range
   * @param startDate - Start of range
   * @param endDate - End of range
   * @returns Array of liturgical days
   */
  calculateCalendar(startDate: Date, endDate: Date): Promise<LiturgicalDay[]>;
  
  /**
   * Validate calculated content against Divinum Officium
   * @param date - Date to validate
   * @returns Validation result with accuracy metrics
   */
  validateAgainstDivinumOfficium(date: Date): Promise<ValidationResult>;
  
  /**
   * Get current liturgical season
   * @param date - Date to check
   * @returns Current liturgical season
   */
  getCurrentSeason(date: Date): LiturgicalSeason;
  
  /**
   * Calculate Easter date for given year
   * @param year - Target year
   * @returns Easter date
   */
  calculateEaster(year: number): Date;
}
```

#### 2. ContentManager Interface
```typescript
interface IContentManager {
  /**
   * Get Mass texts for specific date
   * @param date - Target date
   * @param language - Language preference
   * @returns Bilingual Mass texts
   */
  getMassTexts(date: Date, language: Language): Promise<BilingualMassTexts>;
  
  /**
   * Get Office texts for specific date and hour
   * @param date - Target date
   * @param hour - Canonical hour
   * @returns Bilingual Office texts
   */
  getOfficeTexts(date: Date, hour: CanonicalHour): Promise<BilingualOfficeTexts>;
  
  /**
   * Get saint information for date
   * @param date - Target date
   * @returns Array of saints for the date
   */
  getSaintInfo(date: Date): Promise<SaintData[]>;
  
  /**
   * Get martyrology entry for date
   * @param date - Target date
   * @returns Martyrological entries
   */
  getMartyrology(date: Date): Promise<MartyrologicalEntry[]>;
  
  /**
   * Search liturgical texts
   * @param query - Search query
   * @param type - Content type to search
   * @returns Search results
   */
  searchContent(query: string, type: ContentType): Promise<SearchResult[]>;
  
  /**
   * Get proper prefaces for date
   * @param date - Target date
   * @returns Available prefaces
   */
  getPrefaces(date: Date): Promise<BilingualText[]>;
}
```

#### 3. StorageInterface
```typescript
interface IStorageInterface {
  /**
   * Cache liturgical content
   * @param key - Cache key
   * @param content - Content to cache
   * @param ttl - Time to live in seconds
   */
  cacheContent(key: string, content: any, ttl?: number): Promise<void>;
  
  /**
   * Retrieve cached content
   * @param key - Cache key
   * @returns Cached content or null
   */
  retrieveContent(key: string): Promise<any | null>;
  
  /**
   * Check if content exists in cache
   * @param key - Cache key
   * @returns True if cached
   */
  hasContent(key: string): Promise<boolean>;
  
  /**
   * Clear all cached content
   */
  clearCache(): Promise<void>;
  
  /**
   * Get cache statistics
   * @returns Cache usage statistics
   */
  getCacheStats(): Promise<CacheStatistics>;
  
  /**
   * Store voice recording
   * @param recording - Audio data
   * @param metadata - Recording metadata
   * @returns Storage ID
   */
  storeVoiceRecording(recording: AudioBlob, metadata: VoiceNoteMetadata): Promise<string>;
  
  /**
   * Retrieve voice recording
   * @param id - Recording ID
   * @returns Audio data and metadata
   */
  getVoiceRecording(id: string): Promise<VoiceRecording | null>;
}
```

#### 4. PlatformAdapter Interface
```typescript
interface IPlatformAdapter {
  /**
   * Initialize platform-specific services
   */
  initializePlatform(): Promise<void>;
  
  /**
   * Get platform-specific storage implementation
   * @returns Storage interface implementation
   */
  getStorageImplementation(): IStorageInterface;
  
  /**
   * Get audio recording service
   * @returns Audio recorder implementation
   */
  getAudioRecorder(): IAudioRecorder;
  
  /**
   * Get notification service
   * @returns Notification service implementation
   */
  getNotificationService(): INotificationService;
  
  /**
   * Get platform capabilities
   * @returns Platform-specific capabilities
   */
  getPlatformCapabilities(): PlatformCapabilities;
  
  /**
   * Schedule liturgical notifications
   * @param schedule - Notification schedule
   */
  scheduleNotifications(schedule: NotificationSchedule[]): Promise<void>;
}
```

### Data Type Definitions

#### Core Liturgical Types
```typescript
enum LiturgicalSeason {
  ADVENT = 'advent',
  CHRISTMASTIDE = 'christmastide',
  EPIPHANY = 'epiphany',
  SEPTUAGESIMA = 'septuagesima',
  LENT = 'lent',
  PASSIONTIDE = 'passiontide',
  EASTER = 'easter',
  ASCENSION = 'ascension',
  PENTECOST = 'pentecost',
  ORDINARY_TIME = 'ordinary_time'
}

enum LiturgicalRank {
  TOTUM_DUPLEX = 'totum_duplex',
  DUPLEX = 'duplex',
  SEMIDUPLEX = 'semiduplex',
  SIMPLEX = 'simplex',
  COMMEMORATIO = 'commemoratio',
  FERIA = 'feria'
}

enum CanonicalHour {
  MATINS = 'matins',
  LAUDS = 'lauds',
  PRIME = 'prime',
  TERCE = 'terce',
  SEXT = 'sext',
  NONE = 'none',
  VESPERS = 'vespers',
  COMPLINE = 'compline'
}

enum LiturgicalColor {
  WHITE = 'white',
  RED = 'red',
  GREEN = 'green',
  VIOLET = 'violet',
  BLACK = 'black',
  ROSE = 'rose'
}

interface BilingualText {
  latin: string;
  english: string;
  source: string;
  verified: boolean;
  rubrics?: string;
  notes?: string;
}

interface LiturgicalDay {
  date: Date;
  season: LiturgicalSeason;
  rank: LiturgicalRank;
  color: LiturgicalColor;
  commemorations: Commemoration[];
  massProper: MassProper;
  officeProper: OfficeProper[];
  specialNotes?: string;
  transferredFrom?: Date;
}

interface MassProper {
  introit: BilingualText;
  kyrie: BilingualText;
  gloria?: BilingualText;
  collect: BilingualText;
  epistle: BilingualText;
  gradual: BilingualText;
  alleluia?: BilingualText;
  tract?: BilingualText;
  sequence?: BilingualText;
  gospel: BilingualText;
  credo?: BilingualText;
  offertory: BilingualText;
  secret: BilingualText;
  preface: BilingualText;
  canon: BilingualText;
  communion: BilingualText;
  postcommunion: BilingualText;
  iteMessaEst: BilingualText;
}

interface OfficeProper {
  hour: CanonicalHour;
  antiphons: BilingualText[];
  psalms: BilingualText[];
  capitulum: BilingualText;
  hymn: BilingualText;
  versicle: BilingualText;
  antiphonBVM?: BilingualText;
  prayer: BilingualText;
  lessons?: BilingualText[];
  responsories?: BilingualText[];
  canticle?: BilingualText;
}

interface Commemoration {
  name: string;
  rank: LiturgicalRank;
  color: LiturgicalColor;
  collect: BilingualText;
  secret?: BilingualText;
  postcommunion?: BilingualText;
  antiphon?: BilingualText;
  prayer?: BilingualText;
}

interface SaintData {
  name: string;
  date: Date;
  rank: LiturgicalRank;
  biography: BilingualText;
  martyrologyEntry: string;
  patronage: string[];
  iconography: string[];
  sources: string[];
}

interface VoiceNote {
  id: string;
  date: Date;
  duration: number;
  transcription?: string;
  tags: string[];
  liturgicalContext: {
    season: LiturgicalSeason;
    rank: LiturgicalRank;
    commemoration?: string;
  };
}

interface ValidationResult {
  isValid: boolean;
  accuracy: number;
  discrepancies: Discrepancy[];
  lastValidated: Date;
  sourceUrl: string;
}

interface Discrepancy {
  field: string;
  expected: string;
  actual: string;
  severity: 'minor' | 'major' | 'critical';
}

interface CacheStatistics {
  totalEntries: number;
  totalSize: number;
  hitRate: number;
  lastCleared: Date;
  oldestEntry: Date;
  platformSpecific: Record<string, any>;
}
```

### Platform-Specific Implementations

#### Web Platform Extensions
```typescript
interface IWebAdapter extends IPlatformAdapter {
  /**
   * Register service worker for offline functionality
   */
  registerServiceWorker(): Promise<void>;
  
  /**
   * Enable push notifications
   */
  enablePushNotifications(): Promise<void>;
  
  /**
   * Export liturgical data
   * @param format - Export format
   * @param dateRange - Date range to export
   */
  exportData(format: ExportFormat, dateRange: DateRange): Promise<Blob>;
}
```

#### Native Platform Extensions
```typescript
interface INativeAdapter extends IPlatformAdapter {
  /**
   * Access device calendar
   */
  getDeviceCalendar(): Promise<CalendarEvent[]>;
  
  /**
   * Set up background sync
   */
  setupBackgroundSync(): Promise<void>;
  
  /**
   * Handle deep links
   * @param url - Deep link URL
   */
  handleDeepLink(url: string): Promise<void>;
}
```

#### Desktop Platform Extensions
```typescript
interface ITauriAdapter extends IPlatformAdapter {
  /**
   * Manage application window
   */
  getWindowManager(): IWindowManager;
  
  /**
   * Access system tray
   */
  setupSystemTray(): Promise<void>;
  
  /**
   * Handle global shortcuts
   */
  registerGlobalShortcuts(): Promise<void>;
}
```

### Error Handling

#### API Error Types
```typescript
class LiturgicalEngineError extends Error {
  constructor(message: string, public code: string, public details?: any) {
    super(message);
    this.name = 'LiturgicalEngineError';
  }
}

class ValidationError extends LiturgicalEngineError {
  constructor(message: string, public discrepancies: Discrepancy[]) {
    super(message, 'VALIDATION_ERROR', { discrepancies });
  }
}

class CacheError extends LiturgicalEngineError {
  constructor(message: string, public operation: string) {
    super(message, 'CACHE_ERROR', { operation });
  }
}

class NetworkError extends LiturgicalEngineError {
  constructor(message: string, public url: string) {
    super(message, 'NETWORK_ERROR', { url });
  }
}
```

### Authentication & Security

#### Optional Authentication Interface
```typescript
interface IAuthService {
  /**
   * Authenticate user for cloud sync
   * @param credentials - User credentials
   */
  authenticate(credentials: UserCredentials): Promise<AuthResult>;
  
  /**
   * Sync user data across devices
   */
  syncData(): Promise<SyncResult>;
  
  /**
   * Get user preferences
   */
  getUserPreferences(): Promise<UserPreferences>;
  
  /**
   * Update user preferences
   */
  updateUserPreferences(preferences: Partial<UserPreferences>): Promise<void>;
}
```

This comprehensive API specification provides the foundation for implementing a robust, multi-platform liturgical application that maintains accuracy with traditional Catholic liturgical sources while providing modern functionality across all target platforms.