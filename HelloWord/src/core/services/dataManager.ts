import { IStorageService } from '../types/services';
import { LiturgicalDay } from '../types/liturgical';

const CREATE_CALENDAR_DAYS_TABLE = `
CREATE TABLE IF NOT EXISTS calendar_days (
  date TEXT PRIMARY KEY NOT NULL,
  season TEXT NOT NULL,
  celebration TEXT,
  rank INTEGER NOT NULL,
  color TEXT NOT NULL,
  commemorations TEXT
);`;
// Storing commemorations as a JSON string array

const CREATE_MASS_TEXTS_TABLE = `
CREATE TABLE IF NOT EXISTS mass_texts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  celebration_key TEXT NOT NULL, -- Foreign key to a celebrations table or a way to link to calendar_days
  part_type TEXT NOT NULL, -- e.g., Introit, Gradual, Gospel
  sequence INTEGER NOT NULL, -- Order of the text part
  latin TEXT NOT NULL,
  english TEXT NOT NULL,
  is_rubric BOOLEAN DEFAULT 0,
  FOREIGN KEY (celebration_key) REFERENCES calendar_days(date) -- Example, might need a dedicated celebrations table
);`;

const CREATE_OFFICE_TEXTS_TABLE = `
CREATE TABLE IF NOT EXISTS office_texts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  celebration_key TEXT NOT NULL,
  hour TEXT NOT NULL, -- e.g., Lauds, Vespers
  part_type TEXT NOT NULL, -- e.g., Antiphon, Psalm, Hymn
  sequence INTEGER NOT NULL,
  latin TEXT NOT NULL,
  english TEXT NOT NULL,
  is_rubric BOOLEAN DEFAULT 0,
  FOREIGN KEY (celebration_key) REFERENCES calendar_days(date) -- Example
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

export class DataManager {
  private storageService: IStorageService;

  constructor(storageService: IStorageService) {
    this.storageService = storageService;
  }

  async initialize(): Promise<void> {
    await this.storageService.initialize(); // Initialize the underlying storage (e.g., open DB connection)

    // Use a transaction to ensure all tables are created or none are.
    await this.storageService.transaction(async () => {
      await this.storageService.executeQuery(CREATE_CALENDAR_DAYS_TABLE);
      await this.storageService.executeQuery(CREATE_MASS_TEXTS_TABLE);
      await this.storageService.executeQuery(CREATE_OFFICE_TEXTS_TABLE);
      await this.storageService.executeQuery(CREATE_VOICE_NOTES_TABLE);
    });
    console.log('DataManager: Database tables created/verified.');
  }

  // Example method to add a calendar day (illustrative)
  async addCalendarDay(day: LiturgicalDay): Promise<void> {
    const sql = `
      INSERT INTO calendar_days (date, season, celebration, rank, color, commemorations)
      VALUES (?, ?, ?, ?, ?, ?);
    `;
    // Commemorations should be stringified if it's an array
    const commemorationsString = JSON.stringify(day.commemorations || []);
    const params = [day.date, day.season, day.celebration, day.rank, day.color, commemorationsString];
    await this.storageService.executeQuery(sql, params);
    console.log(`DataManager: Added calendar day for ${day.date}`);
  }
}
