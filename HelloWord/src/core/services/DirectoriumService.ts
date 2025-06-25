// HelloWord/src/core/services/DirectoriumService.ts

export interface VersionInfo {
  id: string; // e.g., "Rubrics 1960 - 1960"
  kalendarFile: string; // e.g., "1960" (implies 1960.txt)
  transferFileBase: string; // e.g., "1960" or "DA" (used to find transfer rule files)
  scriptureTransferFileBase: string; // e.g., "1960" or "DA"
  baseVersionId?: string; // Fallback version for Sanctoral
  temporalBaseVersionId?: string; // Fallback version for Tempora (Tabulae/Tempora files)
  // Add other fields from data.txt as needed
}

export interface KalendarEntryData {
  mmdd: string; // MM-DD key
  rawLine: string;
  // Parsed entries from the line, e.g. [{path: "01-01", name: "Circumcisio Domini", rank: "3"}, ...]
  // This detailed parsing can be done on demand or upfront.
  // For now, storing rawLine is primary.
  parsedEntries?: Array<{path: string, name?: string, rank?: string}>;
}

const TABULAE_BASE_URL = "https://raw.githubusercontent.com/DivinumOfficium/divinum-officium/master/web/www/Tabulae/";

export class DirectoriumService {
  private versions: Map<string, VersionInfo> = new Map();
  // Cache for merged Kalendar data: versionId -> Map<MMDD, KalendarEntryData>
  private kalendarCache: Map<string, Map<string, KalendarEntryData>> = new Map();
  // Cache for raw file contents: filePath (e.g., Kalendaria/1960.txt) -> content
  private rawFileCache: Map<string, string> = new Map();

  constructor() {}

  private async fetchRawFile(filePath: string): Promise<string> {
    if (this.rawFileCache.has(filePath)) {
      return this.rawFileCache.get(filePath)!;
    }
    const url = `${TABULAE_BASE_URL}${filePath}`;
    console.log(`DirectoriumService: Fetching ${url}`);
    try {
      const response = await fetch(url);
      if (!response.ok) {
        console.error(`DirectoriumService: Failed to fetch ${url}: ${response.statusText}`);
        throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
      }
      const text = await response.text();
      this.rawFileCache.set(filePath, text);
      return text;
    } catch (e) {
      console.error(`DirectoriumService: Network error fetching ${url}:`, e);
      throw e;
    }
  }

  public async initialize(): Promise<void> {
    if (this.versions.size > 0) {
      console.log("DirectoriumService: Already initialized.");
      return;
    }
    await this.loadDataTxt();
  }

  private async loadDataTxt(): Promise<void> {
    const dataTxtContent = await this.fetchRawFile("data.txt");
    const lines = dataTxtContent.split('\\n');
    // version,kalendar,transfer,stransfer,base,transferbase (header)
    const header = lines[0].split(',').map(h => h.trim());
    const versionIndex = header.indexOf('version');
    const kalendarIndex = header.indexOf('kalendar');
    const transferIndex = header.indexOf('transfer');
    const stransferIndex = header.indexOf('stransfer');
    const baseIndex = header.indexOf('base');
    const tbaseIndex = header.indexOf('transferbase'); // Note: data.txt header calls it 'transferbase'

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith("#") || line === "") continue;

      const parts = line.split(',').map(p => p.trim());
      const versionId = parts[versionIndex];
      if (!versionId) continue;

      this.versions.set(versionId, {
        id: versionId,
        kalendarFile: parts[kalendarIndex],
        transferFileBase: parts[transferIndex],
        scriptureTransferFileBase: parts[stransferIndex],
        baseVersionId: parts[baseIndex] || undefined,
        temporalBaseVersionId: parts[tbaseIndex] || undefined,
      });
    }
    console.log(`DirectoriumService: Loaded ${this.versions.size} version definitions from data.txt.`);
  }

  public getVersionInfo(versionId: string): VersionInfo | undefined {
    return this.versions.get(versionId);
  }

  private parseKalendarFileContent(content: string): Map<string, KalendarEntryData> {
    const entries = new Map<string, KalendarEntryData>();
    const lines = content.split('\\n');
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith("#") || trimmedLine === "" || trimmedLine.startsWith("*")) continue;

      const parts = trimmedLine.split('=');
      const mmddWithSuffix = parts[0];

      if (mmddWithSuffix && mmddWithSuffix.match(/^\\d{2}-\\d{2}[rotcbmv]*$/)) {
        entries.set(mmddWithSuffix, { mmdd: mmddWithSuffix, rawLine: trimmedLine });
      }
    }
    return entries;
  }

  // Parses a single Kalendar line into structured entries.
  // Moved from old CalendarService, can be enhanced.
  public static parseKalendarRawLine(mmdd: string, rawLineContent: string): Array<{path: string, name?: string, rank?: string}> {
    const parts = rawLineContent.split('=');
    const contentParts = parts.slice(1);

    const entries: Array<{path: string, name?: string, rank?: string}> = [];
    if (contentParts.length === 0) return entries;

    const pathSegments = contentParts[0].split('~');
    let currentContentIndex = 1;

    for (const path of pathSegments) {
        if (!path) continue;
        const name = contentParts[currentContentIndex];
        const rank = contentParts[currentContentIndex + 1];
        entries.push({ path, name, rank });
        currentContentIndex += 2;
    }
    return entries;
  }


  public async getKalendar(versionId: string): Promise<Map<string, KalendarEntryData>> {
    if (this.kalendarCache.has(versionId)) {
      return this.kalendarCache.get(versionId)!;
    }
    if (this.versions.size === 0) {
        await this.initialize(); // Ensure data.txt is loaded
    }

    const versionInfo = this.versions.get(versionId);
    if (!versionInfo) {
      throw new Error(`DirectoriumService: Version '${versionId}' not found in data.txt.`);
    }

    let mergedKalendar = new Map<string, KalendarEntryData>();

    // Load base version's Kalendar first, if it exists
    if (versionInfo.baseVersionId) {
      // console.log(`DirectoriumService: Version '${versionId}' has base version '${versionInfo.baseVersionId}'. Loading base Kalendar.`);
      mergedKalendar = await this.getKalendar(versionInfo.baseVersionId); // Recursive call
    } else {
      // console.log(`DirectoriumService: Version '${versionId}' has no base. Starting with empty Kalendar map.`);
    }

    // Clone map to avoid modifying cached base Kalendar
    const currentVersionKalendar = new Map(mergedKalendar);

    // Load and merge current version's Kalendar file
    const kalendarFilePath = `Kalendaria/${versionInfo.kalendarFile}.txt`;
    // console.log(`DirectoriumService: Loading Kalendar file for '${versionId}': ${kalendarFilePath}`);
    const fileContent = await this.fetchRawFile(kalendarFilePath);
    const specificEntries = this.parseKalendarFileContent(fileContent);

    specificEntries.forEach((value, key) => {
      if (value.rawLine.split('=')[1] === "XXXXX") {
        currentVersionKalendar.delete(key);
      } else {
        // Enhance entry with parsed paths/names immediately
        value.parsedEntries = DirectoriumService.parseKalendarRawLine(key, value.rawLine);
        currentVersionKalendar.set(key, value);
      }
    });

    this.kalendarCache.set(versionId, currentVersionKalendar);
    // console.log(`DirectoriumService: Kalendar for '${versionId}' loaded and merged. Total entries: ${currentVersionKalendar.size}`);
    return currentVersionKalendar;
  }

  // Stub for transfer rule fetching
  public async getTransferRules(versionId: string, year: number): Promise<any> {
    // This will involve complex logic based on Easter date and specific rule files
    // (e.g., Tabulae/Transfer/a.txt, Tabulae/Transfer/DA_Easter_dependent.txt)
    console.warn(`DirectoriumService: getTransferRules for ${versionId}, ${year} - NOT IMPLEMENTED YET.`);
    return {};
  }

  // Stub for fixed temporal assignments
  public async getFixedTemporalAssignments(versionId: string): Promise<any> {
    // This would load files like Tabulae/Tempora/1960.txt (if it exists and is defined in data.txt)
    console.warn(`DirectoriumService: getFixedTemporalAssignments for ${versionId} - NOT IMPLEMENTED YET.`);
    return {};
  }
}
