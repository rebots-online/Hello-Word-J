// HelloWord/src/core/services/CalendarService.ts

export interface KalendarDayInfo {
  date: string; // YYYY-MM-DD
  primaryCelebrationPath?: string;
  primaryCelebrationName?: string;
  rawCalendarLine?: string;
  allEntries?: Array<{path: string, name?: string, rank?: string}>; // Store all parsed entries
}

interface ParsedKalendarEntry {
    path: string;
    name?: string;
    rank?: string; // The simple rank string from Kalendar file, not the full one
}

export class CalendarService {
  private rawBaseUrl = "https://raw.githubusercontent.com/DivinumOfficium/divinum-officium/master/web/www/Tabulae/Kalendaria/";
  private kalendarData: Map<string, string> = new Map(); // MM-DD -> raw line from kalendar file

  private async fetchFile(fileName: string): Promise<string> {
    // In a real app, use a more robust fetching library or handle errors better.
    // For the agent environment, this direct fetch should work if network access is available.
    try {
      const response = await fetch(`${this.rawBaseUrl}${fileName}`);
      if (!response.ok) {
        console.error(`Failed to fetch ${fileName}: ${response.status} ${response.statusText}`);
        throw new Error(`Failed to fetch ${fileName}: ${response.statusText}`);
      }
      return await response.text();
    } catch (e) {
      console.error(`Network error fetching ${fileName}:`, e);
      throw e;
    }
  }

  private parseSingleKalendarLine(mmdd: string, rawLineContent: string): ParsedKalendarEntry[] {
    // Example lines:
    // 01-01=01-01=In Circumcisione Domini=3=
    // 01-18=01-18r=S Priscae Virginis=1=
    // 07-21=07-21r~07-21=S. Laurentii de Brundusio Confessoris et Ecclesiae Doctoris=3=S. Praxedis Virginis=1=
    // 06-28=06-28~06-28r~06-28oct=S. Irenaei Episcopi et Martyris=3=Vigilia Ss. Petri et Pauli Apostolorum=1.5=Quinta die infra Octavam Nativitatis S. Joannis Baptistae=2

    const parts = rawLineContent.split('='); // First part is always MM-DD (key)
    const contentParts = parts.slice(1);    // Actual content: Path1~Path2, Name1, Rank1, Name2, Rank2 ...

    const entries: ParsedKalendarEntry[] = [];
    if (contentParts.length === 0) return entries;

    const pathSegments = contentParts[0].split('~');
    let currentContentIndex = 1;

    for (const path of pathSegments) {
        if (!path) continue;

        const name = contentParts[currentContentIndex];
        const rank = contentParts[currentContentIndex + 1];

        entries.push({
            path: path, // This is the raw path string like "01-01" or "01-18r"
            name: name,
            rank: rank
        });
        currentContentIndex += 2; // Move past name and rank for the next path segment
    }
    return entries;
  }

  async initialize(): Promise<void> {
    if (this.kalendarData.size > 0) {
        console.log("CalendarService: Already initialized.");
        return;
    }
    const filesToParse = ["1570.txt", "1888.txt", "1906.txt", "1954.txt", "1955.txt", "1960.txt"];
    for (const fileName of filesToParse) {
      console.log(`CalendarService: Fetching and parsing ${fileName}...`);
      try {
        const content = await this.fetchFile(fileName);
        const lines = content.split('\\n'); // GitHub raw files use LF

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (trimmedLine.startsWith("#") || trimmedLine === "" || trimmedLine.startsWith("*")) continue;

          const parts = trimmedLine.split('=');
          const mmddWithSuffix = parts[0]; // e.g., 01-01, 01-18r, 02-23o

          // Basic validation for MM-DD key format. Handles common suffixes.
          if (mmddWithSuffix && mmddWithSuffix.match(/^\\d{2}-\\d{2}[rotcbmv]*$/)) {
            if (parts.length > 1 && parts[1] === "XXXXX") {
              this.kalendarData.delete(mmddWithSuffix);
            } else if (parts.length > 1) { // Ensure there's content after '='
              this.kalendarData.set(mmddWithSuffix, trimmedLine);
            }
          } else {
            // console.warn(`CalendarService: Skipping malformed line in ${fileName}: ${trimmedLine}`);
          }
        }
      } catch (error) {
        console.error(`CalendarService: Error processing ${fileName}. This might affect calendar accuracy.`, error);
        // Depending on policy, might want to re-throw or continue with partial data.
        // For now, continue to allow app to function with potentially partial calendar.
      }
    }
    console.log(`CalendarService: Initialized with ${this.kalendarData.size} unique MM-DD entries after merging.`);
  }

  public getDaysForYear(year: number): KalendarDayInfo[] {
    const days: KalendarDayInfo[] = [];
    // This loop correctly handles days in month, including for leap years if Date object is accurate.
    for (let month = 0; month < 12; month++) { // Date object months are 0-indexed
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      for (let day = 1; day <= daysInMonth; day++) {
        const mStr = (month + 1).toString().padStart(2, '0');
        const dStr = day.toString().padStart(2, '0');
        const mmddKey = `${mStr}-${dStr}`;

        const rawLine = this.kalendarData.get(mmddKey);
        let primaryPath: string | undefined = undefined;
        let primaryName: string | undefined = undefined;
        let allParsedEntries : ParsedKalendarEntry[] = [];

        if (rawLine) {
            allParsedEntries = this.parseSingleKalendarLine(mmddKey, rawLine);
            if (allParsedEntries.length > 0) {
                primaryPath = allParsedEntries[0].path;
                primaryName = allParsedEntries[0].name;
            }
        }

        days.push({
          date: `${year}-${mStr}-${dStr}`,
          primaryCelebrationPath: primaryPath,
          primaryCelebrationName: primaryName,
          rawCalendarLine: rawLine,
          allEntries: allParsedEntries.length > 0 ? allParsedEntries : undefined,
        });
      }
    }
    // TODO: Integrate movable feasts (Easter, Pentecost, etc.) This service currently ONLY handles fixed feasts.
    return days;
  }
}
