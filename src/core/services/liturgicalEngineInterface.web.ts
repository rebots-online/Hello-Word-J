/**
 * Web interface to Liturgical Engine (Browser-Compatible)
 * Pure browser implementation using fetch() and in-memory liturgical calculations.
 * No Node.js dependencies (fs, path, require).
 * 
 * Copyright (C) 2025 Robin L. M. Cheung, MBA
 * All Rights Reserved. Proprietary and Confidential.
 */

// ── Types ──────────────────────────────────────────────────────────────────

export interface LiturgicalData {
  date: string;
  calendar: {
    date: string;
    celebration: string;
    rank: number;
    season: string;
    color: string;
  };
  mass?: {
    texts: Record<string, { latin: string; english?: string }>;
  };
  office?: {
    texts: {
      invitatory?: string;
      hymn?: string;
      psalms?: string[];
      readings?: string[];
      responsories?: string[];
      collect?: string;
    };
  };
  // Extended fields used by ActualLiturgicalApp
  primaryCelebrationName?: string;
  primaryCelebrationPath?: string;
  massTexts?: Record<string, { latin: string; english?: string }>;
  allEntries?: Array<{ name?: string; path?: string; rank?: number }>;
  rawCalendarLine?: string;
}

interface KalendarEntry {
  id: string;
  monthDay: string;
  entries: Array<{
    path: string;
    name: string;
    rank: number;
    isCommemoration: boolean;
  }>;
}

interface MassTextRecord {
  filePath: string;
  part_type: string;
  latin: string;
  english?: string;
  sequence: number;
  is_rubric: boolean;
}

interface LiturgicalDataFile {
  meta: {
    generatedAt: string;
    source: string;
    version: string;
  };
  tables: {
    kalendar_entries: KalendarEntry[];
    mass_texts: MassTextRecord[];
    office_texts: any[];
    transfer_rules?: any[];
    psalterium?: any[];
  };
}

// ── Liturgical Calculator (pure math, no Node.js) ──────────────────────────

class LiturgicalCalculator {
  static getEaster(year: number): [number, number] {
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
    return [month, day];
  }

  static getDayOfWeek(year: number, month: number, day: number): number {
    return new Date(year, month - 1, day).getDay();
  }

  static daysBetween(y1: number, m1: number, d1: number, y2: number, m2: number, d2: number): number {
    const date1 = new Date(y1, m1 - 1, d1);
    const date2 = new Date(y2, m2 - 1, d2);
    return Math.round((date2.getTime() - date1.getTime()) / (1000 * 60 * 60 * 24));
  }

  static getLiturgicalWeekKey(year: number, month: number, day: number): string {
    const dayOfWeek = this.getDayOfWeek(year, month, day);
    const currentDate = new Date(year, month - 1, day);

    const [easterMonth, easterDay] = this.getEaster(year);
    const easterDate = new Date(year, easterMonth - 1, easterDay);
    const daysFromEaster = this.daysBetween(year, easterMonth, easterDay, year, month, day);

    const septuagesimaDate = new Date(easterDate);
    septuagesimaDate.setDate(easterDate.getDate() - 63);

    // Christmas
    if (month === 12 && day === 25) return `Nat0-${dayOfWeek}`;
    if ((month === 12 && day > 25) || (month === 1 && day === 1)) return `Nat1-${dayOfWeek}`;
    if (month === 1 && day >= 2 && day <= 5) return `Nat2-${dayOfWeek}`;

    // Epiphany
    if (month === 1 && day === 6) return `Epi0-${dayOfWeek}`;
    if (month === 1 && day >= 7 && day <= 13) return `Epi1-${dayOfWeek}`;

    // Time after Epiphany
    if (currentDate >= new Date(year, 0, 14) && currentDate < septuagesimaDate) {
      const jan14 = new Date(year, 0, 14);
      const weeksAfterEpiphany = Math.floor((currentDate.getTime() - jan14.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 2;
      return `Epi${weeksAfterEpiphany}-${dayOfWeek}`;
    }

    // Pre-Lent
    if (daysFromEaster >= -69 && daysFromEaster < -63) return `Quadp1-${dayOfWeek}`;
    if (daysFromEaster >= -63 && daysFromEaster < -56) return `Quadp2-${dayOfWeek}`;
    if (daysFromEaster >= -56 && daysFromEaster < -46) return `Quadp3-${dayOfWeek}`;

    // Lent
    if (daysFromEaster >= -46 && daysFromEaster < -42) return `Quad1-${dayOfWeek}`;
    if (daysFromEaster >= -42 && daysFromEaster < -35) return `Quad1-${dayOfWeek}`;
    if (daysFromEaster >= -35 && daysFromEaster < -28) return `Quad2-${dayOfWeek}`;
    if (daysFromEaster >= -28 && daysFromEaster < -21) return `Quad3-${dayOfWeek}`;
    if (daysFromEaster >= -21 && daysFromEaster < -14) return `Quad4-${dayOfWeek}`;
    if (daysFromEaster >= -14 && daysFromEaster < -7) return `Quad5-${dayOfWeek}`;
    if (daysFromEaster >= -7 && daysFromEaster < 0) return `Quad6-${dayOfWeek}`;

    // Easter
    if (daysFromEaster === 0) return `Pasc0-${dayOfWeek}`;
    if (daysFromEaster >= 1 && daysFromEaster <= 7) return `Pasc1-${dayOfWeek}`;
    if (daysFromEaster >= 8 && daysFromEaster < 14) return `Pasc2-${dayOfWeek}`;
    if (daysFromEaster >= 14 && daysFromEaster < 21) return `Pasc3-${dayOfWeek}`;
    if (daysFromEaster >= 21 && daysFromEaster < 28) return `Pasc4-${dayOfWeek}`;
    if (daysFromEaster >= 28 && daysFromEaster < 35) return `Pasc5-${dayOfWeek}`;
    if (daysFromEaster >= 35 && daysFromEaster < 42) return `Pasc6-${dayOfWeek}`;
    if (daysFromEaster >= 42 && daysFromEaster < 49) return `Pasc7-${dayOfWeek}`;

    // Pentecost
    if (daysFromEaster === 49) return `Pent0-${dayOfWeek}`;
    if (daysFromEaster >= 50 && daysFromEaster <= 56) return `Pent1-${dayOfWeek}`;
    if (daysFromEaster > 56) {
      const weeksAfterTrinity = Math.floor((daysFromEaster - 56) / 7) + 1;
      return `Pent${Math.min(weeksAfterTrinity, 24)}-${dayOfWeek}`;
    }

    // Advent
    const christmas = new Date(year, 11, 25);
    const christmasDayOfWeek = christmas.getDay();
    const advent1 = new Date(christmas);
    advent1.setDate(christmas.getDate() - 21 - christmasDayOfWeek - (christmasDayOfWeek === 0 ? 7 : 0));

    if (currentDate >= advent1 && currentDate < christmas) {
      const daysFromAdvent1 = Math.floor((currentDate.getTime() - advent1.getTime()) / (24 * 60 * 60 * 1000));
      const adventWeek = Math.floor(daysFromAdvent1 / 7) + 1;
      if (adventWeek >= 1 && adventWeek <= 4) return `Adv${adventWeek}-${dayOfWeek}`;
    }

    if (currentDate < advent1 && daysFromEaster > 56) {
      const weeksAfterTrinity = Math.floor((daysFromEaster - 56) / 7) + 1;
      return `Pent${Math.min(weeksAfterTrinity, 24)}-${dayOfWeek}`;
    }

    return `Pent1-${dayOfWeek}`;
  }
}

// ── Season helpers ─────────────────────────────────────────────────────────

function getSeasonNameFromWeekKey(weekKey: string): string {
  if (!weekKey) return 'Unknown';
  const prefix = weekKey.split(/[0-9]/)[0];
  const weekNum = weekKey.match(/[0-9]+/)?.[0] || '';
  const dayNum = weekKey.split('-')[1];
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayName = days[parseInt(dayNum)] || '';

  const seasons: Record<string, string> = {
    'Nat': 'Christmastide',
    'Epi': 'Time after Epiphany',
    'Quadp': 'Pre-Lent',
    'Quad': 'Lent',
    'Pasc': 'Paschaltide',
    'Pent': 'Time after Pentecost',
    'Adv': 'Advent'
  };

  return `${seasons[prefix] || prefix} Week ${weekNum}, ${dayName}`;
}

function getSeasonColor(weekKey: string): string {
  if (!weekKey) return 'green';
  const prefix = weekKey.split(/[0-9]/)[0];
  const colors: Record<string, string> = {
    'Adv': 'purple',
    'Nat': 'white',
    'Epi': 'white',
    'Quadp': 'purple',
    'Quad': 'purple',
    'Pasc': 'white',
    'Pent': 'green'
  };
  return colors[prefix] || 'green';
}

// ── Data loader (browser-compatible, uses fetch) ───────────────────────────

let cachedData: LiturgicalDataFile | null = null;

async function loadLiturgicalData(): Promise<LiturgicalDataFile> {
  if (cachedData) return cachedData;

  console.log('LiturgicalEngineInterface: Fetching liturgical data via HTTP...');
  const response = await fetch('/assets/liturgical-data.json');
  if (!response.ok) {
    throw new Error(`Failed to fetch liturgical data: ${response.status} ${response.statusText}`);
  }
  cachedData = await response.json();
  console.log(`LiturgicalEngineInterface: Loaded ${cachedData!.tables.kalendar_entries.length} kalendar entries, ${cachedData!.tables.mass_texts.length} mass texts`);
  return cachedData!;
}

function getCelebrationForDate(data: LiturgicalDataFile, dateStr: string) {
  const [year, month, day] = dateStr.split('-').map(Number);
  const monthDay = `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const weekKey = LiturgicalCalculator.getLiturgicalWeekKey(year, month, day);
  const dayOfWeek = LiturgicalCalculator.getDayOfWeek(year, month, day);

  // Look up in kalendar entries first (for fixed feasts)
  const kalendarEntry = data.tables.kalendar_entries.find(e => e.monthDay === monthDay);
  if (kalendarEntry && kalendarEntry.entries.length > 0) {
    if (dayOfWeek === 0 && kalendarEntry.entries[0].rank > 2) {
      return {
        path: `Tempora/${weekKey}`,
        name: `${kalendarEntry.entries[0].name} - Sunday`,
        rank: kalendarEntry.entries[0].rank,
        isCommemoration: false,
        allEntries: kalendarEntry.entries
      };
    }
    return { ...kalendarEntry.entries[0], allEntries: kalendarEntry.entries };
  }

  const seasonName = getSeasonNameFromWeekKey(weekKey);
  return {
    path: `Tempora/${weekKey}`,
    name: seasonName,
    rank: 0.5,
    isCommemoration: false,
    calculated: true,
    allEntries: []
  };
}

function getMassTextsForPath(data: LiturgicalDataFile, filePath: string): MassTextRecord[] {
  return data.tables.mass_texts.filter(t =>
    t.filePath === filePath ||
    t.filePath.endsWith(`/${filePath}`) ||
    t.filePath.replace(/\.txt$/, '') === filePath
  );
}

// ── Public API ─────────────────────────────────────────────────────────────

export class LiturgicalEngineInterface {
  static async getCalendarData(dateStr: string): Promise<LiturgicalData | null> {
    try {
      const data = await loadLiturgicalData();
      const celebration = getCelebrationForDate(data, dateStr);

      if (!celebration) {
        console.error(`No celebration found for ${dateStr}`);
        return null;
      }

      const [year, month, day] = dateStr.split('-').map(Number);
      const weekKey = LiturgicalCalculator.getLiturgicalWeekKey(year, month, day);

      // Get mass texts for this celebration
      const massTextRecords = getMassTextsForPath(data, celebration.path);
      const massTexts: Record<string, { latin: string; english?: string }> = {};
      const sorted = massTextRecords.sort((a, b) => a.sequence - b.sequence);
      for (const text of sorted) {
        if (!text.is_rubric) {
          massTexts[text.part_type] = {
            latin: text.latin,
            english: text.english || undefined
          };
        }
      }

      return {
        date: dateStr,
        calendar: {
          date: dateStr,
          celebration: celebration.name,
          rank: celebration.rank,
          season: weekKey?.split(/[0-9]/)[0] || 'Unknown',
          color: getSeasonColor(weekKey),
        },
        mass: { texts: massTexts },
        primaryCelebrationName: celebration.name,
        primaryCelebrationPath: celebration.path,
        massTexts,
        allEntries: celebration.allEntries?.map(e => ({ name: e.name, path: e.path, rank: e.rank })) || [],
        rawCalendarLine: `${dateStr} | ${weekKey} | ${celebration.name} (rank ${celebration.rank})`
      };
    } catch (err) {
      console.error('Failed to get calendar data:', err);
      return null;
    }
  }
}
