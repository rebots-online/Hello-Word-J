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
  primaryFeastName?: string;
  primaryFeastRank?: number; // Simplified rank for now
  // More fields to be added as logic expands: hora, missa, commemorationsList etc.
}

export interface OfficeComponentPaths {
  winnerPath?: string; // e.g., "Sancti/01-01.txt" or "Tempora/Adv1-0.txt"
  commemorationPaths?: string[];
  commonPath?: string; // If proper texts are supplemented by a Common
  scripturaPath?: string; // If scripture readings are taken from a different source
  // Additional metadata like effective rank, color, etc. could be here too.
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

    // Get basic seasonal info (this is still very simplified from DateUtils)
    // TODO: Enhance DateUtils.getLiturgicalWeekKey to return more structured info or a season key
    const weekKey = DateUtils.getLiturgicalWeekKey(year, month, day, versionId);
    let liturgicalSeason: string | undefined = undefined;
    let temporaPath: string | undefined = undefined;

    if (weekKey) {
        // Crude season extraction from weekKey, e.g. "Adv1-0" -> "Adventus"
        // This needs to be much more robust based on how getLiturgicalWeekKey is implemented.
        if (weekKey.startsWith("Nat")) liturgicalSeason = "Nativitatis";
        else if (weekKey.startsWith("Epi")) liturgicalSeason = "Epiphaniae";
        else if (weekKey.startsWith("Pasc")) liturgicalSeason = "Paschalis";
        else if (weekKey.startsWith("Adv")) liturgicalSeason = "Adventus";
        else if (weekKey.startsWith("Quad")) liturgicalSeason = "Quadragesimae";
        else if (weekKey.startsWith("Sept")) liturgicalSeason = "Septuagesimae"; // For pre-Lent
        else if (weekKey.startsWith("Pent")) liturgicalSeason = "Pentecostes"; // For week of Pentecost or Time after Pentecost

        // Assuming weekKey can be directly used or mapped to a Tempora file path fragment
        // This is a simplification; horascommon.pl has more logic to form the actual tempora file name.
        // E.g. "Adv1-0" -> "Tempora/Adv1-0.txt"
        // For now, let's assume DateUtils.getLiturgicalWeekKey returns a usable path fragment for Tempora.
        if (!weekKey.includes('/')) { // If not already a path
            temporaPath = `${weekKey}.txt`; // Needs prefixing by TextParsingService or here
        } else {
            temporaPath = weekKey;
        }
    }

    return {
      year,
      month,
      day,
      date,
      dayOfWeek,
      version: versionId,
      liturgicalSeason,
      temporaPath, // This is the *potential* Tempora file path fragment
    };
  }

  /**
   * Determines the primary office components for a given day.
   * This is a highly simplified version of DivinumOfficium's `occurrence` logic.
   * It does not yet handle full precedence, transfers, commemorations, commons, etc.
   */
  public async determineOfficeForDay(targetDate: Date, versionId: string): Promise<{ context: LiturgicalContext, components: OfficeComponentPaths }> {
    await this.directoriumService.initialize(); // Ensure it's loaded

    const context = await this.buildInitialContext(targetDate, versionId);
    const components: OfficeComponentPaths = {};

    const mmdd = DateUtils.getSanctoralDayKey(context.month, context.day);
    const kalendar = await this.directoriumService.getKalendar(versionId);
    const kalendarEntry = kalendar.get(mmdd); // Gets the KalendarEntryData (raw line + parsed)

    let sanctoralFeastPath: string | undefined = undefined;
    let sanctoralFeastName: string | undefined = undefined;
    // let sanctoralFeastRankSimple: number | undefined = undefined; // Simple rank from Kalendar if available

    if (kalendarEntry && kalendarEntry.parsedEntries && kalendarEntry.parsedEntries.length > 0) {
      // Use the first entry from the Kalendar for now as the primary Sanctoral feast
      const primaryFixedFeast = kalendarEntry.parsedEntries[0];
      sanctoralFeastPath = primaryFixedFeast.path; // This is a fragment like "01-01" or "01-18r"
      sanctoralFeastName = primaryFixedFeast.name;
      // Simple rank from Kalendar (e.g., "=3=" -> 3). This is not the full rank string from the file.
      // const rankNum = primaryFixedFeast.rank ? parseInt(primaryFixedFeast.rank, 10) : 0;
      // if (!isNaN(rankNum)) sanctoralFeastRankSimple = rankNum;
      context.primaryFeastName = sanctoralFeastName;
      // context.primaryFeastRank = sanctoralFeastRankSimple;
    }

    // Simplified Precedence:
    // 1. If there's a Sanctoral feast, assume it takes precedence over a basic Feria.
    //    (Full logic needs rank comparison from actual files, transfer checks etc.)
    // 2. If no Sanctoral, or if Tempora is of higher importance (e.g. Sunday, major Feria), use Tempora.
    // This is extremely basic and will be wrong for many cases.

    // TODO: Implement actual rank fetching from files (Rank: line) and comparison.
    // For now, if a sanctoral feast exists, it's likely the winner unless context.temporaPath points to a major Tempora day.
    // A proper implementation needs to fetch Rank lines from potential sanctoral and temporal files.

    if (sanctoralFeastPath) {
        // Basic heuristic: If it's a Sunday (dayOfWeek 0) or a major calculated Tempora event, Tempora might win.
        // The current `context.temporaPath` from simplified `getLiturgicalWeekKey` is not reliable enough for this.
        // For now, let's assume Sanctoral wins if present.
        // This is a placeholder for real precedence.
        components.winnerPath = sanctoralFeastPath; // This is a path fragment, needs prefixing
        context.primaryFeastName = sanctoralFeastName || context.primaryFeastName;
    } else if (context.temporaPath) {
        components.winnerPath = context.temporaPath; // Path fragment
        // Try to get a name for the Tempora if not a specific feast
        // This would typically come from the Tempora file's [Rank] or [Name] section
        // For now, context.liturgicalSeason might give a hint if no specific feast name.
        context.primaryFeastName = context.liturgicalSeason || 'Feria';
    } else {
        // Fallback, should ideally not happen if getLiturgicalWeekKey is robust
        context.primaryFeastName = 'Feria';
    }

    // TODO: Implement logic for commemorations, commons, scripture paths based on full rules.
    // components.commemorationPaths = [];
    // components.commonPath = undefined;
    // components.scripturaPath = undefined;

    // console.log(`LiturgicalEngineService: For ${context.year}-${context.month}-${context.day}, Winner path fragment: ${components.winnerPath}, Context Season: ${context.liturgicalSeason}`);
    return { context, components };
  }

  // calculateLiturgicalContext will be more involved, building on buildInitialContext
  // and incorporating results from precedence logic. For now, buildInitialContext serves as a starting point.
}
