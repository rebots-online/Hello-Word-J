// HelloWord/src/core/services/LiturgicalEngineService.ts

import { DirectoriumService, KalendarEntryData } from './DirectoriumService';
import { DateUtils } from '../utils/DateUtils'; // Assuming DateUtils is in core/utils

// Context that will be built up and used by TextParsingService
// This might be refined or moved to a central types file later.
export interface LiturgicalContext {
  year: number;
  month: number; // 1-indexed
  day: number;   // 1-indexed
  date: Date;    // JavaScript Date object
  dayOfWeek: number; // 0 = Sunday, ..., 6 = Saturday
  version: string;
  liturgicalSeason?: string; // e.g., "Adventus", "Paschalis" - From DateUtils.getLiturgicalWeekKey or more advanced logic
  temporaPath?: string; // Path to the determined Tempora file, e.g., "Tempora/Adv1-0.txt"
  weekKey?: string; // e.g., "Adv1-0", "Quad3-4"
  primaryFeastName?: string;
  primaryFeastRank?: number; // Numeric rank (1=highest, 4=lowest feria)
  liturgicalColor?: string; // White, Red, Green, Violet, Black, Rose
  commemorations?: string[]; // List of commemorated feasts
  // More fields to be added as logic expands: hora, missa, commemorationsList etc.
}

// Rank definitions per 1962 Rubrics
export const RANKS = {
  DOUBLE_I_CLASS: 1,      // Duplex I classis (e.g., Christmas, Easter)
  DOUBLE_II_CLASS: 2,     // Duplex II classis (e.g., major feasts)
  DOUBLE_MAJOR: 3,        // Duplex majus
  DOUBLE: 4,              // Duplex
  SEMIDOUBLE: 5,          // Semiduplex
  SIMPLE: 6,              // Simplex
  COMMEMORATION: 7,       // Commemoratio
  FERIA_PRIVILEGED: 8,    // Feria privilegiata (Ember Days, Rogation)
  FERIA: 9,               // Feria
} as const;

export interface OfficeComponentPaths {
  winnerPath?: string; // e.g., "Sancti/01-01.txt" or "Tempora/Adv1-0.txt"
  winnerRank?: number; // Numeric rank of the winner
  winnerType?: 'sanctoral' | 'temporal'; // Type of winning office
  commemorationPaths?: string[];
  commonPath?: string; // If proper texts are supplemented by a Common
  scripturaPath?: string; // If scripture readings are taken from a different source
  color?: string; // Liturgical color
}

export class LiturgicalEngineService {
  private directoriumService: DirectoriumService;
  // DateUtils contains static methods, no instance needed.

  constructor(directoriumService: DirectoriumService) {
    this.directoriumService = directoriumService;
  }

  private async buildInitialContext(date: Date, versionId: string): Promise<LiturgicalContext> {
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // JS month is 0-indexed
    const day = date.getDate();
    const dayOfWeek = date.getDay(); // 0 for Sunday

    // Get liturgical week key from DateUtils (now fully implemented)
    const weekKey = DateUtils.getLiturgicalWeekKey(year, month, day, versionId);
    let liturgicalSeason: string | undefined = undefined;
    let temporaPath: string | undefined = undefined;
    let liturgicalColor: string = 'Green'; // Default

    if (weekKey) {
      // Extract season from weekKey prefix
      const prefix = weekKey.split(/[0-9]/)[0];
      
      switch (prefix) {
        case 'Nat':
          liturgicalSeason = 'Christmastide';
          liturgicalColor = 'White';
          break;
        case 'Epi':
          liturgicalSeason = 'Epiphanytide';
          liturgicalColor = 'White';
          break;
        case 'Quadp':
          liturgicalSeason = 'Pre-Lent';
          liturgicalColor = 'Violet';
          break;
        case 'Quad':
          liturgicalSeason = 'Lent';
          liturgicalColor = 'Violet';
          break;
        case 'Pasc':
          liturgicalSeason = 'Paschaltide';
          liturgicalColor = 'White';
          break;
        case 'Pent':
          // Pentecost Sunday is red, octave and after is green
          if (weekKey === 'Pent0-0') {
            liturgicalSeason = 'Pentecost';
            liturgicalColor = 'Red';
          } else if (weekKey.startsWith('Pent1')) {
            liturgicalSeason = 'Pentecost Octave';
            liturgicalColor = 'Red';
          } else {
            liturgicalSeason = 'Time after Pentecost';
            liturgicalColor = 'Green';
          }
          break;
        case 'Adv':
          liturgicalSeason = 'Advent';
          liturgicalColor = 'Violet';
          break;
        default:
          liturgicalSeason = 'Ordinary Time';
          liturgicalColor = 'Green';
      }

      // Use DirectoriumService to get the actual Tempora path
      temporaPath = await this.directoriumService.getTemporaPath(versionId, weekKey);
    }

    return {
      year,
      month,
      day,
      date,
      dayOfWeek,
      version: versionId,
      weekKey: weekKey || undefined,
      liturgicalSeason,
      temporaPath,
      liturgicalColor,
      commemorations: [],
    };
  }

  /**
   * Parse rank from a Kalendar entry rank string.
   * Returns numeric rank (1=highest, 9=feria).
   */
  private parseRank(rankString?: string): number {
    if (!rankString) return RANKS.FERIA;
    
    const rank = parseInt(rankString, 10);
    if (!isNaN(rank) && rank >= 1 && rank <= 9) {
      return rank;
    }
    
    // Parse text-based ranks (from some Kalendar files)
    const lower = rankString.toLowerCase();
    if (lower.includes('i cl') || lower.includes('1 cl')) return RANKS.DOUBLE_I_CLASS;
    if (lower.includes('ii cl') || lower.includes('2 cl')) return RANKS.DOUBLE_II_CLASS;
    if (lower.includes('duplex majus')) return RANKS.DOUBLE_MAJOR;
    if (lower.includes('duplex')) return RANKS.DOUBLE;
    if (lower.includes('semiduplex')) return RANKS.SEMIDOUBLE;
    if (lower.includes('simplex')) return RANKS.SIMPLE;
    
    return RANKS.FERIA;
  }

  /**
   * Get the rank of a Tempora day based on weekKey.
   * Sundays and privileged days have higher ranks.
   */
  private getTemporaRank(weekKey: string, dayOfWeek: number): number {
    // Sundays always have higher precedence
    if (dayOfWeek === 0) {
      // Major Sundays (Advent, Lent, Easter) are I or II class
      if (weekKey.startsWith('Adv1') || weekKey.startsWith('Quad1') || 
          weekKey.startsWith('Pasc0') || weekKey.startsWith('Pent0')) {
        return RANKS.DOUBLE_I_CLASS;
      }
      // Other Sundays are typically II class
      return RANKS.DOUBLE_II_CLASS;
    }
    
    // Holy Week days are I class
    if (weekKey.startsWith('Quad6-')) {
      return RANKS.DOUBLE_I_CLASS;
    }
    
    // Easter Octave is I class
    if (weekKey.startsWith('Pasc1-')) {
      return RANKS.DOUBLE_I_CLASS;
    }
    
    // Ember Days (Wednesdays, Fridays, Saturdays of Ember weeks)
    if ((weekKey.includes('Adv3') || weekKey.includes('Quad1') || 
         weekKey.includes('Pent1') || weekKey.includes('Quad4')) &&
        (dayOfWeek === 3 || dayOfWeek === 5 || dayOfWeek === 6)) {
      return RANKS.FERIA_PRIVILEGED;
    }
    
    // Lenten feriae have higher rank
    if (weekKey.startsWith('Quad')) {
      return RANKS.SEMIDOUBLE; // Lenten ferias are privileged
    }
    
    // Advent feriae after Dec 17
    if (weekKey.startsWith('Adv4')) {
      return RANKS.SEMIDOUBLE;
    }
    
    // Regular feria
    return RANKS.FERIA;
  }

  /**
   * Determines the primary office components for a given day.
   * Implements occurrence/precedence logic based on 1962 rubrics.
   */
  public async determineOfficeForDay(targetDate: Date, versionId: string): Promise<{ context: LiturgicalContext, components: OfficeComponentPaths }> {
    await this.directoriumService.initialize();

    const context = await this.buildInitialContext(targetDate, versionId);
    const components: OfficeComponentPaths = {
      commemorationPaths: [],
    };

    // Get Sanctoral (fixed) feasts for this date
    const mmdd = DateUtils.getSanctoralDayKey(context.month, context.day);
    const kalendar = await this.directoriumService.getKalendar(versionId);
    const kalendarEntry = kalendar.get(mmdd);

    // Collect all occurring offices with their ranks
    interface OccurringOffice {
      type: 'sanctoral' | 'temporal';
      path: string;
      name?: string;
      rank: number;
    }
    
    const occurrences: OccurringOffice[] = [];

    // Add Sanctoral feasts
    if (kalendarEntry?.parsedEntries) {
      for (const entry of kalendarEntry.parsedEntries) {
        occurrences.push({
          type: 'sanctoral',
          path: `Sancti/${entry.path}`,
          name: entry.name,
          rank: this.parseRank(entry.rank),
        });
      }
    }

    // Add Temporal office
    if (context.weekKey) {
      const temporaRank = this.getTemporaRank(context.weekKey, context.dayOfWeek);
      occurrences.push({
        type: 'temporal',
        path: context.temporaPath || `Tempora/${context.weekKey}`,
        name: context.liturgicalSeason,
        rank: temporaRank,
      });
    }

    // Sort by rank (lower number = higher precedence)
    occurrences.sort((a, b) => a.rank - b.rank);

    // The winner is the first (highest precedence)
    if (occurrences.length > 0) {
      const winner = occurrences[0];
      components.winnerPath = winner.path;
      components.winnerRank = winner.rank;
      components.winnerType = winner.type;
      components.color = context.liturgicalColor;
      
      context.primaryFeastName = winner.name || context.liturgicalSeason || 'Feria';
      context.primaryFeastRank = winner.rank;

      // Remaining occurrences become commemorations (up to 3 per rubrics)
      const maxCommemorations = 3;
      for (let i = 1; i < Math.min(occurrences.length, maxCommemorations + 1); i++) {
        const comm = occurrences[i];
        // Only commemorate if rank allows (typically rank 6 or lower can be commemorated)
        if (comm.rank >= RANKS.SIMPLE) {
          components.commemorationPaths!.push(comm.path);
          if (comm.name) {
            context.commemorations = context.commemorations || [];
            context.commemorations.push(comm.name);
          }
        }
      }
    } else {
      // Fallback to feria
      context.primaryFeastName = 'Feria';
      context.primaryFeastRank = RANKS.FERIA;
    }

    console.log(`LiturgicalEngineService: ${context.year}-${String(context.month).padStart(2, '0')}-${String(context.day).padStart(2, '0')} -> ${context.primaryFeastName} (Rank ${context.primaryFeastRank})`);
    return { context, components };
  }

  /**
   * Get liturgical information for a date range.
   * Useful for generating calendar views.
   */
  public async getLiturgicalCalendar(
    startDate: Date, 
    endDate: Date, 
    versionId: string
  ): Promise<Array<{ date: string; context: LiturgicalContext; components: OfficeComponentPaths }>> {
    const results: Array<{ date: string; context: LiturgicalContext; components: OfficeComponentPaths }> = [];
    
    const current = new Date(startDate);
    while (current <= endDate) {
      const { context, components } = await this.determineOfficeForDay(current, versionId);
      results.push({
        date: current.toISOString().split('T')[0],
        context,
        components,
      });
      current.setDate(current.getDate() + 1);
    }
    
    return results;
  }
}
