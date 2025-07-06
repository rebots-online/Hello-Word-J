// Imports
import { IStorageService } from '../types/services';
import { CalendarService, KalendarDayInfo } from './CalendarService';
import { LiturgicalTextPart } from './TextParsingService';
import { DirectoriumService } from './DirectoriumService';
import { LiturgicalEngineService, OfficeComponentPaths } from './LiturgicalEngineService';

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
  private directoriumService: DirectoriumService;
  private liturgicalEngineService: LiturgicalEngineService;
  private currentLiturgicalVersionId: string = "Rubrics 1960 - 1960";

  constructor(storageService: IStorageService) {
    this.storageService = storageService;
    this.calendarService = new CalendarService();
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
    console.log('DataManager: Initializing pre-populated SQLite database...');
    await this.storageService.initialize();

    await this.storageService.transaction(async () => {
      await this.storageService.executeQuery(CREATE_CALENDAR_DAYS_TABLE);
      await this.storageService.executeQuery(CREATE_MASS_TEXTS_TABLE);
      await this.storageService.executeQuery(CREATE_OFFICE_TEXTS_TABLE);
      await this.storageService.executeQuery(CREATE_VOICE_NOTES_TABLE);
    });

    // The SQLite database comes pre-populated with Divinum Officium content
    // Import was done ONCE during build/development, not during app runtime
    const dataCount = await this.storageService.executeQuery("SELECT COUNT(*) as count FROM calendar_days");
    console.log(`DataManager: Ready with ${dataCount[0]?.count || 0} liturgical days in database.`);
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
}