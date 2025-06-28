/**
 * TypeScript Liturgical Engine - Database Version
 * 
 * Clean room implementation based on Neo4j analysis of Perl logic:
 * - Implements occurrence() -> precedence() -> winner pattern
 * - Uses pre-populated SQLite database instead of file fetching
 * - Follows Perl_DataFlow pattern from Neo4j representation
 * - Fast offline-first architecture
 */

import { Database } from 'sqlite3';
import * as path from 'path';

// Database interface matching import schema
interface SanctiFile {
  file_path: string;
  date_key: string;
  suffix?: string;
  officium?: string;
  rank_text?: string;
  rank_number: number;
  rank_class?: string;
  rule_text?: string;
  file_content: string;
}

interface TemporaFile {
  file_path: string;
  season_key: string;
  dayofweek?: number;
  officium?: string;
  rank_text?: string;
  rank_number: number;
  rank_class?: string;
  rule_text?: string;
  file_content: string;
}

interface LiturgicalSection {
  section_name: string;
  section_content: string;
  language: string;
}

interface KalendarEntry {
  version: string;
  date_key: string;
  file_name?: string;
  celebration_name?: string;
  rank_number?: number;
}

export interface LiturgicalCalculationResult {
  date: string;
  season: string;
  celebration: string;
  rank: number;
  color: string;
  commemorations: string[];
  winner_file?: string;
  commemoratio_file?: string;
  mass_texts: Record<string, {
    latin: string;
    english: string;
    is_rubric: boolean;
  }>;
  office_texts: Record<string, any>;
}

export class LiturgicalEngineFromDB {
  private dbPath: string;
  private db: Database | null = null;

  constructor(dbPath?: string) {
    this.dbPath = dbPath || path.join(__dirname, '../../../assets/liturgical-database.db');
  }

  /**
   * Open database connection
   */
  private async openDatabase(): Promise<Database> {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      this.db = new Database(this.dbPath, (err) => {
        if (err) reject(new Error(`Failed to open database: ${err.message}`));
        else resolve(this.db!);
      });
    });
  }

  /**
   * Close database connection
   */
  async close(): Promise<void> {
    if (this.db) {
      await new Promise<void>((resolve, reject) => {
        this.db!.close((err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      this.db = null;
    }
  }

  /**
   * Main liturgical calculation function
   * Implements Perl precedence() logic using database
   */
  async calculateLiturgicalData(date: string, version: string = '1960'): Promise<LiturgicalCalculationResult> {
    console.log(`🧮 Calculating liturgical data for ${date} (version: ${version})`);
    
    const [year, month, day] = date.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    
    // Step 1: Calculate liturgical season (implements getweek() logic)
    const season = this.determineLiturgicalSeason(dateObj);
    const dayOfWeek = dateObj.getDay(); // 0=Sunday, 1=Monday, etc.
    
    // Step 2: Calculate occurrence (implements occurrence() logic)
    const { winner, commemoratio } = await this.calculateOccurrence(month, day, year, version, season, dayOfWeek);
    
    // Step 3: Determine liturgical color
    const color = this.determineLiturgicalColor(winner?.officium || '', winner?.rank_number || 1, season);
    
    // Step 4: Extract Mass texts from winner file
    const massTexts = await this.extractMassTexts(winner?.file_path || '');
    
    // Step 5: Extract Office texts (simplified for now)
    const officeTexts = {};
    
    return {
      date,
      season,
      celebration: winner?.officium || 'Feria',
      rank: winner?.rank_number || 1,
      color,
      commemorations: commemoratio ? [commemoratio.officium || ''] : [],
      winner_file: winner?.file_path,
      commemoratio_file: commemoratio?.file_path,
      mass_texts: massTexts,
      office_texts: officeTexts
    };
  }

  /**
   * Calculate occurrence - core precedence logic from Perl analysis
   * Implements occurrence() function logic using database queries
   */
  private async calculateOccurrence(
    month: number, 
    day: number, 
    year: number, 
    version: string,
    season: string,
    dayOfWeek: number
  ): Promise<{ winner: SanctiFile | TemporaFile | null, commemoratio: SanctiFile | TemporaFile | null }> {
    
    const db = await this.openDatabase();
    
    // Step 1: Get Sanctoral candidates (implements get_sday() logic)
    const dateKey = `${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    const sanctiCandidates = await this.getSanctiCandidates(db, dateKey);
    
    // Step 2: Get Temporal candidates (implements getweek() logic)  
    const temporaCandidates = await this.getTemporaCandidates(db, season, dayOfWeek);
    
    // Step 3: Check kalendar for transfers and special assignments
    const kalendarEntries = await this.getKalendarEntries(db, version, dateKey);
    
    // Step 4: Apply precedence rules (implements Perl ranking logic)
    let winner: SanctiFile | TemporaFile | null = null;
    let commemoratio: SanctiFile | TemporaFile | null = null;
    
    // Combine all candidates
    const allCandidates = [...sanctiCandidates, ...temporaCandidates];
    
    if (allCandidates.length > 0) {
      // Sort by rank (highest first)
      allCandidates.sort((a, b) => (b.rank_number || 1) - (a.rank_number || 1));
      
      winner = allCandidates[0];
      
      // If there's a second candidate with reasonable rank, it becomes commemoratio
      if (allCandidates.length > 1 && (allCandidates[1].rank_number || 0) >= 2) {
        commemoratio = allCandidates[1];
      }
    }
    
    // If no winner found, default to temporal feria
    if (!winner) {
      winner = {
        file_path: `Tempora/${season}-${dayOfWeek}.txt`,
        season_key: season,
        dayofweek: dayOfWeek,
        officium: 'Feria',
        rank_number: 1,
        rank_class: 'Feria',
        file_content: ''
      } as TemporaFile;
    }
    
    console.log(`📊 Winner: ${winner.officium} (rank ${winner.rank_number})`);
    if (commemoratio) {
      console.log(`📝 Commemoratio: ${commemoratio.officium} (rank ${commemoratio.rank_number})`);
    }
    
    return { winner, commemoratio };
  }

  /**
   * Get Sanctoral candidates for a date
   */
  private async getSanctiCandidates(db: Database, dateKey: string): Promise<SanctiFile[]> {
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT * FROM sancti_files 
        WHERE date_key = ? 
        ORDER BY rank_number DESC, 
                 CASE suffix 
                   WHEN 'r' THEN 1  -- vigils 
                   WHEN 't' THEN 2  -- transferred
                   WHEN 'o' THEN 3  -- octaves
                   ELSE 4           -- main feast
                 END
      `, [dateKey], (err, rows: any[]) => {
        if (err) reject(err);
        else resolve(rows as SanctiFile[]);
      });
    });
  }

  /**
   * Get Temporal candidates for a season and day
   */
  private async getTemporaCandidates(db: Database, season: string, dayOfWeek: number): Promise<TemporaFile[]> {
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT * FROM tempora_files 
        WHERE season_key LIKE ? AND (dayofweek = ? OR dayofweek IS NULL)
        ORDER BY rank_number DESC
        LIMIT 1
      `, [`${season}%`, dayOfWeek], (err, rows: any[]) => {
        if (err) reject(err);
        else resolve(rows as TemporaFile[]);
      });
    });
  }

  /**
   * Get Kalendar entries for transfers and special assignments
   */
  private async getKalendarEntries(db: Database, version: string, dateKey: string): Promise<KalendarEntry[]> {
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT * FROM kalendar_entries 
        WHERE version = ? AND date_key = ?
      `, [version, dateKey], (err, rows: any[]) => {
        if (err) reject(err);
        else resolve(rows as KalendarEntry[]);
      });
    });
  }

  /**
   * Extract Mass texts from file content
   */
  private async extractMassTexts(filePath: string): Promise<Record<string, { latin: string; english: string; is_rubric: boolean; }>> {
    if (!filePath) return {};
    
    const db = await this.openDatabase();
    
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT section_name, section_content, language 
        FROM liturgical_sections 
        WHERE file_path = ? AND section_name IN (
          'Introitus', 'Kyrie', 'Gloria', 'Oratio', 'Lectio', 'Graduale', 
          'Evangelium', 'Credo', 'Offertorium', 'Secreta', 'Praefatio',
          'Sanctus', 'Agnus', 'Communio', 'Postcommunio'
        )
      `, [filePath], (err, rows: any[]) => {
        if (err) {
          reject(err);
          return;
        }
        
        const massTexts: Record<string, { latin: string; english: string; is_rubric: boolean; }> = {};
        
        for (const row of rows as LiturgicalSection[]) {
          if (!massTexts[row.section_name]) {
            massTexts[row.section_name] = {
              latin: '',
              english: '',
              is_rubric: false
            };
          }
          
          if (row.language === 'Latin') {
            massTexts[row.section_name].latin = row.section_content;
          } else if (row.language === 'English') {
            massTexts[row.section_name].english = row.section_content;
          }
        }
        
        resolve(massTexts);
      });
    });
  }

  /**
   * Determine liturgical season
   * Simplified version of getweek() logic
   */
  private determineLiturgicalSeason(dateObj: Date): string {
    const year = dateObj.getFullYear();
    const month = dateObj.getMonth() + 1;
    const day = dateObj.getDate();
    
    // Calculate Easter (simplified algorithm)
    const easter = this.calculateEaster(year);
    const dayOfYear = Math.floor((dateObj.getTime() - new Date(year, 0, 0).getTime()) / 86400000);
    const easterDayOfYear = Math.floor((easter.getTime() - new Date(year, 0, 0).getTime()) / 86400000);
    
    // Determine season based on Easter calculation
    if (dayOfYear >= easterDayOfYear && dayOfYear < easterDayOfYear + 50) {
      return 'Pasc';  // Paschaltide
    } else if (dayOfYear >= easterDayOfYear - 70 && dayOfYear < easterDayOfYear) {
      return 'Quad';  // Lent
    } else if (month === 12 && day >= 1) {
      return 'Adv';   // Advent
    } else if (month === 1 && day <= 13) {
      return 'Nat';   // Christmas
    } else if (month === 1 && day > 13) {
      return 'Epi';   // Epiphany
    } else {
      return 'Pent';  // Time after Pentecost
    }
  }

  /**
   * Calculate Easter date (simplified algorithm)
   */
  private calculateEaster(year: number): Date {
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31);
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    
    return new Date(year, month - 1, day);
  }

  /**
   * Determine liturgical color
   * Based on Perl liturgical_color() function
   */
  private determineLiturgicalColor(celebrationName: string, rank: number, season: string): string {
    // Red for martyrs, apostles, Pentecost
    if (/(?:Martyr|Apostol|Pentecost)/i.test(celebrationName)) {
      return 'red';
    }
    
    // Purple for vigils, Advent, Lent
    if (/(?:Vigil|Adv|Quad)/i.test(celebrationName + season)) {
      return 'purple';
    }
    
    // White for high feasts
    if (rank >= 6) {
      return 'white';
    }
    
    // Green for ordinary time
    if (season === 'Pent') {
      return 'green';
    }
    
    // Default white
    return 'white';
  }
}