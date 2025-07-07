// Imports
import { IStorageService } from '../types/services';
import { CalendarService, KalendarDayInfo } from './CalendarService';
import { TextParsingService, LiturgicalTextPart, LiturgicalContext } from './TextParsingService';
import { DirectoriumService } from './DirectoriumService';
import { LiturgicalEngineService, OfficeComponentPaths } from './LiturgicalEngineService';
import { 
  CachedLiturgicalData, 
  JournalEntry, 
  SaintInfo, 
  MartyrologicalEntry,
  ParishInfo,
  ParishEvent,
  Newsletter,
  BilingualText,
  LiturgicalDay
} from '../types/liturgical';

const CREATE_CALENDAR_DAYS_TABLE = `
CREATE TABLE IF NOT EXISTS calendar_days (
  date TEXT PRIMARY KEY NOT NULL,
  season TEXT,
  celebration TEXT,
  rank INTEGER,
  color TEXT,
  commemorations TEXT,
  raw_kalendar_line TEXT
);`;

const CREATE_MASS_TEXTS_TABLE = `
CREATE TABLE IF NOT EXISTS mass_texts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  celebration_key TEXT NOT NULL,
  part_type TEXT NOT NULL,
  sequence INTEGER NOT NULL,
  latin TEXT NOT NULL,
  english TEXT NOT NULL,
  is_rubric BOOLEAN DEFAULT 0,
  FOREIGN KEY (celebration_key) REFERENCES calendar_days(date)
);`;

const CREATE_OFFICE_TEXTS_TABLE = `
CREATE TABLE IF NOT EXISTS office_texts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  celebration_key TEXT NOT NULL,
  hour TEXT NOT NULL,
  part_type TEXT NOT NULL,
  sequence INTEGER NOT NULL,
  latin TEXT NOT NULL,
  english TEXT NOT NULL,
  is_rubric BOOLEAN DEFAULT 0,
  FOREIGN KEY (celebration_key) REFERENCES calendar_days(date)
);`;

const CREATE_VOICE_NOTES_TABLE = `
CREATE TABLE IF NOT EXISTS voice_notes (
  id TEXT PRIMARY KEY NOT NULL,
  date TEXT NOT NULL,
  title TEXT NOT NULL,
  file_path TEXT NOT NULL,
  duration INTEGER NOT NULL,
  transcription TEXT
);`;

const CREATE_CACHED_LITURGICAL_DATA_TABLE = `
CREATE TABLE IF NOT EXISTS cached_liturgical_data (
  date TEXT PRIMARY KEY NOT NULL,
  liturgical_data TEXT NOT NULL,
  cached_at TEXT NOT NULL,
  expires_at TEXT NOT NULL
);`;

const CREATE_JOURNAL_ENTRIES_TABLE = `
CREATE TABLE IF NOT EXISTS journal_entries (
  id TEXT PRIMARY KEY NOT NULL,
  date TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  liturgical_context TEXT,
  tags TEXT,
  created TEXT NOT NULL,
  modified TEXT NOT NULL
);`;

const CREATE_SAINTS_INFO_TABLE = `
CREATE TABLE IF NOT EXISTS saints_info (
  name TEXT PRIMARY KEY NOT NULL,
  feast_day TEXT NOT NULL,
  biography TEXT NOT NULL,
  patronage TEXT,
  sources TEXT
);`;

const CREATE_MARTYROLOGY_TABLE = `
CREATE TABLE IF NOT EXISTS martyrology (
  date TEXT PRIMARY KEY NOT NULL,
  entries TEXT NOT NULL
);`;

const CREATE_PARISH_INFO_TABLE = `
CREATE TABLE IF NOT EXISTS parish_info (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  website TEXT,
  pastor TEXT NOT NULL,
  mass_schedule TEXT NOT NULL
);`;

const CREATE_PARISH_EVENTS_TABLE = `
CREATE TABLE IF NOT EXISTS parish_events (
  id TEXT PRIMARY KEY NOT NULL,
  parish_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT,
  location TEXT,
  category TEXT NOT NULL,
  FOREIGN KEY (parish_id) REFERENCES parish_info(id)
);`;

const CREATE_NEWSLETTERS_TABLE = `
CREATE TABLE IF NOT EXISTS newsletters (
  id TEXT PRIMARY KEY NOT NULL,
  parish_id TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  publish_date TEXT NOT NULL,
  author TEXT NOT NULL,
  FOREIGN KEY (parish_id) REFERENCES parish_info(id)
);`;

interface MergedTextPart {
  celebration_key: string;
  part_type: string;
  sequence: number;
  latin: string;
  english: string;
  is_rubric: boolean;
  hour?: string;
}

export class DataManager {
  private storageService: IStorageService;
  private calendarService: CalendarService;
  private textParserService: TextParsingService;
  private directoriumService: DirectoriumService;
  private liturgicalEngineService: LiturgicalEngineService;
  private currentLiturgicalVersionId: string = "Rubrics 1960 - 1960";
  private _isInitialized: boolean = false;

  constructor(storageService: IStorageService) {
    this.storageService = storageService;
    this.calendarService = new CalendarService();
    this.textParserService = new TextParsingService();
    this.directoriumService = new DirectoriumService();
    this.liturgicalEngineService = new LiturgicalEngineService(this.directoriumService);
  }

  private mergeTexts(latinParts: LiturgicalTextPart[], englishParts: LiturgicalTextPart[]): MergedTextPart[] {
    const merged: MergedTextPart[] = [];
    const englishMap = new Map<string, LiturgicalTextPart>();

    englishParts.forEach(ep => {
      const key = `${ep.part_type}_${ep.sequence}`;
      englishMap.set(key, ep);
    });

    latinParts.forEach(lp => {
      const key = `${lp.part_type}_${lp.sequence}`;
      const ep = englishMap.get(key);
      merged.push({
        celebration_key: '',
        part_type: lp.part_type,
        sequence: lp.sequence,
        latin: lp.text_content,
        english: ep ? ep.text_content : '',
        is_rubric: lp.is_rubric,
      });
      if (ep) englishMap.delete(key);
    });

    englishMap.forEach(ep => {
      merged.push({
        celebration_key: '',
        part_type: ep.part_type,
        sequence: ep.sequence,
        latin: '',
        english: ep.text_content,
        is_rubric: ep.is_rubric,
      });
    });

    merged.sort((a, b) => a.sequence - b.sequence);
    return merged;
  }

  async initialize(): Promise<void> {
    if (this._isInitialized) {
      console.log('DataManager: Already initialized. Skipping.');
      return;
    }

    console.log('DataManager: Initializing self-contained liturgical database...');
    await this.storageService.initialize();

    await this.storageService.transaction(async () => {
      await this.storageService.executeQuery(CREATE_CALENDAR_DAYS_TABLE);
      await this.storageService.executeQuery(CREATE_MASS_TEXTS_TABLE);
      await this.storageService.executeQuery(CREATE_OFFICE_TEXTS_TABLE);
      await this.storageService.executeQuery(CREATE_VOICE_NOTES_TABLE);
      await this.storageService.executeQuery(CREATE_CACHED_LITURGICAL_DATA_TABLE);
      await this.storageService.executeQuery(CREATE_JOURNAL_ENTRIES_TABLE);
      await this.storageService.executeQuery(CREATE_SAINTS_INFO_TABLE);
      await this.storageService.executeQuery(CREATE_MARTYROLOGY_TABLE);
      await this.storageService.executeQuery(CREATE_PARISH_INFO_TABLE);
      await this.storageService.executeQuery(CREATE_PARISH_EVENTS_TABLE);
      await this.storageService.executeQuery(CREATE_NEWSLETTERS_TABLE);
    });

    console.log('DataManager: Ready with self-contained liturgical database.');
    this._isInitialized = true;
  }

  // Query methods for accessing pre-populated SQLite database

  async getMassTextsForDate(date: string): Promise<Array<{
    part_type: string;
    sequence: number;
    latin: string;
    english: string;
    is_rubric: boolean;
  }>> {
    const results = await this.storageService.executeQuery(
      `SELECT part_type, sequence, latin, english, is_rubric 
       FROM mass_texts 
       WHERE celebration_key = ? 
       ORDER BY sequence ASC`,
      [date]
    );
    return results;
  }

  async getOfficeTextsForDate(date: string, hour?: string): Promise<Array<{
    hour: string;
    part_type: string;
    sequence: number;
    latin: string;
    english: string;
    is_rubric: boolean;
  }>> {
    let sql = `SELECT hour, part_type, sequence, latin, english, is_rubric 
               FROM office_texts 
               WHERE celebration_key = ?`;
    const params: any[] = [date];

    if (hour) {
      sql += ` AND hour = ?`;
      params.push(hour);
    }

    sql += ` ORDER BY hour, sequence ASC`;

    const results = await this.storageService.executeQuery(sql, params);
    return results;
  }

  async getLiturgicalDayInfo(date: string): Promise<{
    date: string;
    celebration: string | null;
    season: string | null;
    rank: number;
    color: string | null;
    commemorations: string[];
    raw_kalendar_line: string | null;
  } | null> {
    const results = await this.storageService.executeQuery(
      `SELECT date, celebration, season, rank, color, commemorations, raw_kalendar_line
       FROM calendar_days 
       WHERE date = ?`,
      [date]
    );

    if (results.length === 0) return null;

    const row = results[0];
    return {
      ...row,
      commemorations: row.commemorations ? JSON.parse(row.commemorations) : []
    };
  }

  private isMassPartHeuristic(partType: string): boolean {
    const massParts = ['Introitus', 'Graduale', 'Alleluia', 'Tractus', 'Sequentia', 'Evangelium', 'Credo', 'Offertorium', 'Secreta', 'Praefatio', 'Pater Noster', 'Communio', 'Postcommunio', 'Oratio super populum', 'Lectio Epistolae', 'Kyrie', 'Gloria', 'Sanctus', 'Agnus Dei', 'Ite missa est', 'Benedicamus Domino'];
    if (partType === 'Oratio') return false;
    return massParts.includes(partType) || massParts.some(mp => partType.startsWith(mp) && mp !== partType);
  }

  private getHourFromPartType(partType: string): string {
    const p = partType.toLowerCase();
    if (p.includes('matutinum')) return 'Matutinum';
    if (p.includes('laudes')) return 'Laudes';
    if (p.includes('prima')) return 'Prima';
    if (p.includes('tertia')) return 'Tertia';
    if (p.includes('sexta')) return 'Sexta';
    if (p.includes('nona')) return 'Nona';
    if (p.includes('vespera')) return 'Vespera';
    if (p.includes('completorium')) return 'Completorium';
    return 'Unknown';
  }

  // Dynamic liturgical data with caching
  async getLiturgicalDataForDate(date: string): Promise<CachedLiturgicalData> {
    // Check cache first
    const cached = await this.getCachedLiturgicalData(date);
    if (cached && new Date(cached.expiresAt) > new Date()) {
      console.log(`DataManager: Using cached liturgical data for ${date}`);
      return cached;
    }

    console.log(`DataManager: Calculating fresh liturgical data for ${date}`);
    
    // Calculate using liturgical engine
    const liturgicalDay = await this.liturgicalEngineService.calculateLiturgicalDay(date);
    const massTexts = await this.liturgicalEngineService.getMassTexts(date);
    const officeTexts = await this.liturgicalEngineService.getOfficeTexts(date);
    const martyrology = await this.getMartyrologicalEntry(date);
    const saintInfo = await this.getSaintInfoForDate(date);

    const cachedData: CachedLiturgicalData = {
      date,
      liturgicalDay,
      massTexts,
      officeTexts,
      martyrology,
      saintInfo,
      cachedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
    };

    // Cache the result
    await this.cacheLiturgicalData(cachedData);
    return cachedData;
  }

  private async getCachedLiturgicalData(date: string): Promise<CachedLiturgicalData | null> {
    const results = await this.storageService.executeQuery(
      'SELECT liturgical_data FROM cached_liturgical_data WHERE date = ? AND expires_at > ?',
      [date, new Date().toISOString()]
    );
    
    if (results.length > 0) {
      return JSON.parse(results[0].liturgical_data);
    }
    return null;
  }

  private async cacheLiturgicalData(data: CachedLiturgicalData): Promise<void> {
    await this.storageService.executeQuery(
      `INSERT OR REPLACE INTO cached_liturgical_data 
       (date, liturgical_data, cached_at, expires_at) 
       VALUES (?, ?, ?, ?)`,
      [data.date, JSON.stringify(data), data.cachedAt, data.expiresAt]
    );
  }

  // Journal entries
  async createJournalEntry(entry: Omit<JournalEntry, 'id' | 'created' | 'modified'>): Promise<JournalEntry> {
    const id = `journal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();
    const fullEntry: JournalEntry = {
      ...entry,
      id,
      created: now,
      modified: now
    };

    await this.storageService.executeQuery(
      `INSERT INTO journal_entries 
       (id, date, title, content, liturgical_context, tags, created, modified)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        fullEntry.id,
        fullEntry.date,
        fullEntry.title,
        fullEntry.content,
        fullEntry.liturgicalContext || null,
        JSON.stringify(fullEntry.tags),
        fullEntry.created,
        fullEntry.modified
      ]
    );

    return fullEntry;
  }

  async getJournalEntries(date?: string): Promise<JournalEntry[]> {
    let sql = 'SELECT * FROM journal_entries';
    const params: any[] = [];
    
    if (date) {
      sql += ' WHERE date = ?';
      params.push(date);
    }
    
    sql += ' ORDER BY created DESC';

    const results = await this.storageService.executeQuery(sql, params);
    return results.map(row => ({
      ...row,
      tags: JSON.parse(row.tags || '[]')
    }));
  }

  // Saints information
  async getSaintInfo(saintName: string): Promise<SaintInfo | null> {
    const results = await this.storageService.executeQuery(
      'SELECT * FROM saints_info WHERE name = ?',
      [saintName]
    );
    
    if (results.length > 0) {
      const row = results[0];
      return {
        name: row.name,
        feastDay: row.feast_day,
        biography: row.biography,
        patronage: JSON.parse(row.patronage || '[]'),
        sources: JSON.parse(row.sources || '[]')
      };
    }
    return null;
  }

  async getSaintInfoForDate(date: string): Promise<SaintInfo[]> {
    // Get saints for this date from martyrology
    const martyrology = await this.getMartyrologicalEntry(date);
    if (!martyrology) return [];

    const saints: SaintInfo[] = [];
    for (const entry of martyrology.entries) {
      const saintInfo = await this.getSaintInfo(entry.saint);
      if (saintInfo) {
        saints.push(saintInfo);
      }
    }
    return saints;
  }

  // Martyrology
  async getMartyrologicalEntry(date: string): Promise<MartyrologicalEntry | null> {
    const results = await this.storageService.executeQuery(
      'SELECT entries FROM martyrology WHERE date = ?',
      [date]
    );
    
    if (results.length > 0) {
      return {
        date,
        entries: JSON.parse(results[0].entries)
      };
    }
    return null;
  }

  // Parish features
  async getParishInfo(parishId: string): Promise<ParishInfo | null> {
    const results = await this.storageService.executeQuery(
      'SELECT * FROM parish_info WHERE id = ?',
      [parishId]
    );
    
    if (results.length > 0) {
      const row = results[0];
      return {
        id: row.id,
        name: row.name,
        address: row.address,
        phone: row.phone,
        email: row.email,
        website: row.website,
        pastor: row.pastor,
        massSchedule: JSON.parse(row.mass_schedule)
      };
    }
    return null;
  }

  async getParishEvents(parishId: string, date?: string): Promise<ParishEvent[]> {
    let sql = 'SELECT * FROM parish_events WHERE parish_id = ?';
    const params: any[] = [parishId];
    
    if (date) {
      sql += ' AND date = ?';
      params.push(date);
    }
    
    sql += ' ORDER BY date ASC, time ASC';

    const results = await this.storageService.executeQuery(sql, params);
    return results;
  }

  async getNewsletters(parishId: string): Promise<Newsletter[]> {
    const results = await this.storageService.executeQuery(
      'SELECT * FROM newsletters WHERE parish_id = ? ORDER BY publish_date DESC',
      [parishId]
    );
    return results;
  }

  async createParishEvent(event: Omit<ParishEvent, 'id'>): Promise<ParishEvent> {
    const id = `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const fullEvent: ParishEvent = { ...event, id };

    await this.storageService.executeQuery(
      `INSERT INTO parish_events 
       (id, parish_id, title, description, date, time, location, category)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        fullEvent.id,
        fullEvent.parishId,
        fullEvent.title,
        fullEvent.description,
        fullEvent.date,
        fullEvent.time || null,
        fullEvent.location || null,
        fullEvent.category
      ]
    );

    return fullEvent;
  }

  async createNewsletter(newsletter: Omit<Newsletter, 'id'>): Promise<Newsletter> {
    const id = `newsletter_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const fullNewsletter: Newsletter = { ...newsletter, id };

    await this.storageService.executeQuery(
      `INSERT INTO newsletters 
       (id, parish_id, title, content, publish_date, author)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        fullNewsletter.id,
        fullNewsletter.parishId,
        fullNewsletter.title,
        fullNewsletter.content,
        fullNewsletter.publishDate,
        fullNewsletter.author
      ]
    );

    return fullNewsletter;
  }
}