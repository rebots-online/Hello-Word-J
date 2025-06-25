import { IStorageService } from '../types/services';
// import { LiturgicalDay } from '../types/liturgical'; // This might become obsolete or change
import { CalendarService, KalendarDayInfo } from './CalendarService';
import { TextFileParserService, LiturgicalTextPart } from './TextFileParserService';

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
    is_rubric: boolean; // Assume consistent between languages or prefer Latin's
    hour?: string; // For office texts
}


export class DataManager {
  private storageService: IStorageService;
  private calendarService: CalendarService;
  private textParserService: TextFileParserService;

  constructor(storageService: IStorageService) {
    this.storageService = storageService;
    this.calendarService = new CalendarService();
    this.textParserService = new TextFileParserService();
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
            celebration_key: '', // Will be set by caller
            part_type: lp.part_type,
            sequence: lp.sequence,
            latin: lp.text_content,
            english: ep ? ep.text_content : '',
            is_rubric: lp.is_rubric, // Prefer Latin's rubric status
        });
        if (ep) {
            englishMap.delete(key); // Remove matched part
        }
    });

    // Add any English parts that didn't have a Latin counterpart
    englishMap.forEach(ep => {
        merged.push({
            celebration_key: '', // Will be set by caller
            part_type: ep.part_type,
            sequence: ep.sequence,
            latin: '',
            english: ep.text_content,
            is_rubric: ep.is_rubric,
        });
    });

    // Sort by original sequence as merging might mess order if English only parts are added
    merged.sort((a,b) => a.sequence - b.sequence);
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
    console.log('DataManager: Database tables created/verified.');

    const existingCalendarDaysQuery = await this.storageService.executeQuery("SELECT COUNT(*) as count FROM calendar_days");
    const countResult = existingCalendarDaysQuery[0] as { count: number };

    if (countResult && countResult.count > 0) {
        console.log('DataManager: Calendar data already exists. Skipping calendar import.');
    } else {
        console.log('DataManager: Importing calendar data (fixed feasts only)...');
        try {
            await this.calendarService.initialize();
            const yearToImport = 2024;
            const daysInfo = this.calendarService.getDaysForYear(yearToImport);

            await this.storageService.transaction(async () => {
            for (const dayInfo of daysInfo) {
                const commemorationsArray = dayInfo.allEntries
                ? dayInfo.allEntries.slice(1).map(e => `${e.name || e.path}${e.rank ? ` (${e.rank})` : ''}`)
                : [];
                const params = [
                    dayInfo.date, dayInfo.primaryCelebrationName || null, null,
                    dayInfo.primaryCelebrationPath ? 1 : 0, null,
                    JSON.stringify(commemorationsArray), dayInfo.rawCalendarLine || null,
                ];
                const sql = `
                    INSERT INTO calendar_days (date, celebration, season, rank, color, commemorations, raw_kalendar_line)
                    VALUES (?, ?, ?, ?, ?, ?, ?);
                `;
                await this.storageService.executeQuery(sql, params);
            }
            });
            console.log(`DataManager: Imported ${daysInfo.length} fixed calendar day entries for ${yearToImport}.`);
        } catch (error) {
            console.error('DataManager: Error during calendar data import:', error);
        }
    }

    // Text Import Logic
    const existingMassTextsQuery = await this.storageService.executeQuery("SELECT COUNT(*) as count FROM mass_texts");
    const massTextsCountResult = existingMassTextsQuery[0] as { count: number };
    if (massTextsCountResult && massTextsCountResult.count > 0) {
        console.log('DataManager: Mass/Office text data seems to exist. Skipping text import.');
    } else {
        console.log('DataManager: Importing liturgical texts... This may take a while.');
        // const calendarDaysForTextImport = await this.storageService.executeQuery("SELECT date, primaryCelebrationPath, celebration FROM calendar_days WHERE primaryCelebrationPath IS NOT NULL LIMIT 10"); // LIMIT for testing
        const calendarDaysForTextImport = await this.storageService.executeQuery("SELECT date, primaryCelebrationPath, celebration, raw_kalendar_line FROM calendar_days WHERE primaryCelebrationPath IS NOT NULL");


        console.log(`DataManager: Found ${calendarDaysForTextImport.length} calendar days for text import.`);

        for (const day of calendarDaysForTextImport as KalendarDayInfo[]) {
            if (!day.primaryCelebrationPath) continue;

            let filePathFragment = day.primaryCelebrationPath;
            if (!filePathFragment.endsWith('.txt')) {
                filePathFragment += '.txt';
            }

            console.log(`DataManager: Processing texts for ${day.date} - ${day.celebration || filePathFragment} (Path: ${filePathFragment})`);

            try {
                const latinTexts = await this.textParserService.getResolvedTexts('Latin', filePathFragment);
                const englishTexts = await this.textParserService.getResolvedTexts('English', filePathFragment);

                const mergedOfficeTexts = this.mergeTexts(
                    latinTexts.filter(p => !this.isMassPartHeuristic(p.part_type)),
                    englishTexts.filter(p => !this.isMassPartHeuristic(p.part_type))
                );

                const mergedMassTexts = this.mergeTexts(
                    latinTexts.filter(p => this.isMassPartHeuristic(p.part_type)),
                    englishTexts.filter(p => this.isMassPartHeuristic(p.part_type))
                );

                await this.storageService.transaction(async () => {
                    for (const part of mergedMassTexts) {
                        const sql = `INSERT INTO mass_texts (celebration_key, part_type, sequence, latin, english, is_rubric)
                                     VALUES (?, ?, ?, ?, ?, ?);`;
                        await this.storageService.executeQuery(sql, [day.date, part.part_type, part.sequence, part.latin, part.english, part.is_rubric]);
                    }
                    for (const part of mergedOfficeTexts) {
                        const sql = `INSERT INTO office_texts (celebration_key, hour, part_type, sequence, latin, english, is_rubric)
                                     VALUES (?, ?, ?, ?, ?, ?, ?);`;
                        await this.storageService.executeQuery(sql, [day.date, this.getHourFromPartType(part.part_type), part.part_type, part.sequence, part.latin, part.english, part.is_rubric]);
                    }
                });
                console.log(`DataManager: Inserted texts for ${day.date} (Mass: ${mergedMassTexts.length}, Office: ${mergedOfficeTexts.length} parts)`);

            } catch (error) {
                console.error(`DataManager: Failed to process texts for ${day.date} - ${filePathFragment}`, error);
            }
        }
        console.log('DataManager: Liturgical text import process finished.');
    }
  }

  private isMassPartHeuristic(partType: string): boolean {
    const massParts = ['Introitus', 'Graduale', 'Alleluia', 'Tractus', 'Sequentia', 'Evangelium', 'Credo',
                       'Offertorium', 'Secreta', 'Praefatio', 'Pater Noster', 'Communio', 'Postcommunio',
                       'Oratio super populum', 'Lectio Epistolae', 'Kyrie', 'Gloria', 'Sanctus', 'Agnus Dei', 'Ite missa est', 'Benedicamus Domino'];
    // 'Oratio' is ambiguous. If it's a common Mass oration (Collect, Secret, Postcommunion), it will be named so.
    // If it's just 'Oratio', it's more likely Office, but could be a generic prayer in Mass.
    // For simplicity, if it's ONLY 'Oratio', assume Office unless it's one of the explicitly named Mass orations.
    if (partType === 'Oratio' && !massParts.some(mp => mp.startsWith(partType) && mp !== 'Oratio')) { // e.g. Oratio super populum
        return false; // Assume office if just "Oratio"
    }
    return massParts.includes(partType) || massParts.some(mp => partType.startsWith(mp) && mp !== partType); // Catches "Lectio Epistolae S. Pauli ad Corinthios"
  }

  private getHourFromPartType(partType: string): string {
    // This is a very rough heuristic. Proper hour association needs more context.
    if (partType.toLowerCase().includes('matutinum')) return 'Matutinum';
    if (partType.toLowerCase().includes('laudes')) return 'Laudes';
    if (partType.toLowerCase().includes('prima')) return 'Prima';
    if (partType.toLowerCase().includes('tertia')) return 'Tertia';
    if (partType.toLowerCase().includes('sexta')) return 'Sexta';
    if (partType.toLowerCase().includes('nona')) return 'Nona';
    if (partType.toLowerCase().includes('vespera')) return 'Vespera';
    if (partType.toLowerCase().includes('completorium')) return 'Completorium';
    return 'Unknown'; // Default
  }
}
