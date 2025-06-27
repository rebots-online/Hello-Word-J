// Imports
import { IStorageService } from '../types/services';
import { CalendarService, KalendarDayInfo } from './CalendarService';
import { TextParsingService, LiturgicalTextPart, LiturgicalContext } from './TextParsingService';
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
  private textParserService: TextParsingService;
  private directoriumService: DirectoriumService;
  private liturgicalEngineService: LiturgicalEngineService;
  private currentLiturgicalVersionId: string = "Rubrics 1960 - 1960";

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
    await this.storageService.initialize();

    await this.storageService.transaction(async () => {
      await this.storageService.executeQuery(CREATE_CALENDAR_DAYS_TABLE);
      await this.storageService.executeQuery(CREATE_MASS_TEXTS_TABLE);
      await this.storageService.executeQuery(CREATE_OFFICE_TEXTS_TABLE);
      await this.storageService.executeQuery(CREATE_VOICE_NOTES_TABLE);
    });

    const existingCalendar = await this.storageService.executeQuery("SELECT COUNT(*) as count FROM calendar_days");
    if (existingCalendar[0]?.count > 0) {
      console.log('Calendar already exists. Skipping calendar import.');
    } else {
      const year = 2024;
      const days = this.calendarService.getDaysForYear(year);
      await this.storageService.transaction(async () => {
        for (const day of days) {
          const commemorations = day.allEntries?.slice(1).map(e => `${e.name || e.path}${e.rank ? ` (${e.rank})` : ''}`) || [];
          const params = [
            day.date, day.primaryCelebrationName || null, null,
            day.primaryCelebrationPath ? 1 : 0, null,
            JSON.stringify(commemorations), day.rawCalendarLine || null,
          ];
          const sql = `INSERT INTO calendar_days (date, celebration, season, rank, color, commemorations, raw_kalendar_line) VALUES (?, ?, ?, ?, ?, ?, ?);`;
          await this.storageService.executeQuery(sql, params);
        }
      });
      console.log(`Imported ${days.length} fixed calendar day entries.`);
    }

    const massTexts = await this.storageService.executeQuery("SELECT COUNT(*) as count FROM mass_texts");
    if (massTexts[0]?.count > 0) {
      console.log('Texts already exist. Skipping import.');
    } else {
      const days = await this.storageService.executeQuery("SELECT date, celebration, raw_kalendar_line FROM calendar_days");

      for (const day of days as KalendarDayInfo[]) {
        const [year, month, dayNum] = day.date.split('-').map(Number);
        const dateObj = new Date(year, month - 1, dayNum);

        try {
          const { context, components } = await this.liturgicalEngineService.determineOfficeForDay(dateObj, this.currentLiturgicalVersionId);
          let filePath = components.winnerPath || '';
          if (!filePath.endsWith('.txt')) filePath += '.txt';

          const latin = await this.textParserService.getResolvedTexts('Latin', filePath, context);
          const english = await this.textParserService.getResolvedTexts('English', filePath, context);

          const mass = this.mergeTexts(latin.filter(p => this.isMassPartHeuristic(p.part_type)), english.filter(p => this.isMassPartHeuristic(p.part_type)));
          const office = this.mergeTexts(latin.filter(p => !this.isMassPartHeuristic(p.part_type)), english.filter(p => !this.isMassPartHeuristic(p.part_type)));

          await this.storageService.transaction(async () => {
            for (const part of mass) {
              await this.storageService.executeQuery(`INSERT INTO mass_texts (celebration_key, part_type, sequence, latin, english, is_rubric) VALUES (?, ?, ?, ?, ?, ?);`, [day.date, part.part_type, part.sequence, part.latin, part.english, part.is_rubric]);
            }
            for (const part of office) {
              await this.storageService.executeQuery(`INSERT INTO office_texts (celebration_key, hour, part_type, sequence, latin, english, is_rubric) VALUES (?, ?, ?, ?, ?, ?, ?);`, [day.date, this.getHourFromPartType(part.part_type), part.part_type, part.sequence, part.latin, part.english, part.is_rubric]);
            }
          });

          console.log(`Inserted texts for ${day.date} (Mass: ${mass.length}, Office: ${office.length})`);
        } catch (err) {
          console.error(`Failed to process ${day.date}`, err);
        }
      }
    }
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