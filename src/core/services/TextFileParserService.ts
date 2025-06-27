// HelloWord/src/core/services/TextFileParserService.ts

export interface LiturgicalTextPart {
  part_type: string; // e.g., Introitus, Oratio, Antiphona1
  text_content: string;
  is_rubric: boolean;
  lang: 'Latin' | 'English'; // Or other supported languages
  sequence: number;
}

interface FileCacheEntry {
  content: string;
  parsedSections?: Map<string, string[]>; // Cache for parsed sections of a file
}

export class TextFileParserService {
  private rawBaseUrl = "https://raw.githubusercontent.com/DivinumOfficium/divinum-officium/master/web/www/";
  private fileCache: Map<string, FileCacheEntry> = new Map(); // path -> content
  private recursionDepth: Map<string, number> = new Map(); // To prevent infinite recursion in includes

  // Path prefixes based on typical Divinum Officium structure
  // These might need adjustment if paths from Kalendar are more specific
  private getPathPrefix(filePathFragment: string): string {
    if (filePathFragment.match(/^(C\d+[a-z]*P?asc?)\.txt$/i) || filePathFragment.startsWith("Commune/")) { // C1.txt, C10Pasc.txt etc.
      return "Commune/";
    } else if (filePathFragment.match(/^([A-Z0-9]+(\-[A-Z0-9]+)?)\.txt$/i) && filePathFragment.toUpperCase().startsWith("TEMPORA")) { // TEMPORAI/Adv1-0.txt - needs better regex
      return "Tempora/"; // This is a guess, Kalendar paths are like "Adv1-0"
    } else if (filePathFragment.match(/^\d{2}-\d{2}[rotcbmv]*\.txt$/i) || filePathFragment.startsWith("Sancti/")) { // 01-01.txt, 01-18r.txt
      return "Sancti/";
    }
    // Default or if path is already qualified
    if (filePathFragment.includes('/')) return "";
    // Defaulting to Sancti for simple MM-DD.txt style paths from Kalendar if no other hint
    if (filePathFragment.match(/^\d{2}-\d{2}[rotcbmv]*\.txt$/i)) {
        return "Sancti/";
    }
    // Fallback for Tempora files that are not fully qualified from Kalendar (e.g. "Adv1-0")
    // This is a heuristic and might need refinement.
    if (filePathFragment.match(/^[A-Za-z]+\d*(\-\d)*/i)) { // Adv1-0, Nat1, Epi0 etc.
        return "Tempora/";
    }
    console.warn(`TextFileParserService: Could not determine prefix for path fragment: ${filePathFragment}. Assuming direct path.`);
    return "";
  }


  private async fetchAndCacheFile(lang: string, filePath: string): Promise<string | null> {
    const fullPath = `${lang}/${filePath}`;
    if (this.fileCache.has(fullPath)) {
      return this.fileCache.get(fullPath)!.content;
    }

    // Normalize path to ensure it doesn't start with / if rawBaseUrl ends with /
    const normalizedFilePath = filePath.startsWith('/') ? filePath.substring(1) : filePath;
    const url = `${this.rawBaseUrl}${lang}/${normalizedFilePath}`;

    console.log(`TextFileParserService: Fetching ${url}`);
    try {
      const response = await fetch(url);
      if (!response.ok) {
        // console.warn(`Failed to fetch ${url}: ${response.statusText}`);
        return null; // Return null if file not found, for fallback logic
      }
      const text = await response.text();
      this.fileCache.set(fullPath, { content: text });
      return text;
    } catch (e) {
      console.error(`TextFileParserService: Network error fetching ${url}:`, e);
      return null;
    }
  }

  private parseSections(fileContent: string): Map<string, string[]> {
    const sections = new Map<string, string[]>();
    let currentSectionName: string | null = null;
    let currentSectionLines: string[] = [];

    fileContent.split('\\n').forEach(line => {
      const sectionMatch = line.match(/^\\[([\\w\\s-]+)\\]$/); // Matches [Section Name]
      if (sectionMatch) {
        if (currentSectionName) {
          sections.set(currentSectionName, currentSectionLines);
        }
        currentSectionName = sectionMatch[1].trim();
        currentSectionLines = [];
      } else if (currentSectionName) {
        currentSectionLines.push(line);
      }
    });

    if (currentSectionName) { // Save the last section
      sections.set(currentSectionName, currentSectionLines);
    }
    return sections;
  }

  // Simplified conditional processing
  private processLineConditionals(line: string, lang: string, versionContext?: string): string | null {
    // Basic: (condition)text
    // Example: (Hebdomada I Adventus) antiphona propria.
    // Example: (Rubr. 1960) text specific to 1960
    // For now, we are not evaluating complex conditions.
    // A very simple strategy: if a condition is present, and we don't know how to evaluate it,
    // we might choose to include the text or exclude it.
    // Let's try to include text if condition is not obviously false.
    // This is a major simplification.
    const conditionalMatch = line.match(/^\\((.*?)\\)(.*)$/);
    if (conditionalMatch) {
        const condition = conditionalMatch[1].toLowerCase();
        const text = conditionalMatch[2];

        if (condition.includes("nisi") || condition.includes("non")) { // Very basic "not"
            // If it's a negative condition, we'd need to evaluate the positive part. Too complex for now.
            // Let's assume for now we exclude if "nisi" or "non" is present.
            return null;
        }
        if (condition.startsWith("lang=")) {
            return condition === `lang=${lang.toLowerCase()}` ? text : null;
        }
        if (versionContext && condition.startsWith("rubr.")) { // e.g. (Rubr. 1960)
            return condition.includes(versionContext.toLowerCase()) ? text : null;
        }
        // Default: include text if condition doesn't explicitly make it false for current context
        return text;
    }
    return line; // No conditional, return line as is
  }

  private isRubric(line: string): boolean {
    // Simple heuristic for rubrics. Divinum Officium uses red text, which translates to various markers.
    // Common markers: *, †, text in all caps if it's short, lines starting with R. V. etc.
    // This needs to be refined by observing actual file content.
    if (line.trim().startsWith("*") || line.trim().startsWith("†")) return true;
    if (line.match(/^R\\.\\s/) || line.match(/^V\\.\\s/)) return true; // R. V. for Response/Versicle
    // Color markers like <c>red</c> are not in the raw files typically.
    // Sometimes rubrics are just lines that are not part of prayers. This is hard to detect.
    return false;
  }

  public async getResolvedTexts(
    lang: 'Latin' | 'English',
    filePathFragment: string, // e.g., "01-01.txt" or "Adv1-0.txt"
    targetVersion: string = "Rubrics 1960" // For context in conditionals, if ever used
  ): Promise<LiturgicalTextPart[]> {

    const parts: LiturgicalTextPart[] = [];
    let sequence = 0;

    const initialPathPrefix = this.getPathPrefix(filePathFragment);
    const initialFullFilePath = `${initialPathPrefix}${filePathFragment}`.replace(/\\/\\//g, '/');

    const processedIncludes = new Set<string>(); // To avoid processing the same include multiple times in one call stack

    const resolveFile = async (currentLang: 'Latin' | 'English', currentFilePath: string, depth: number = 0): Promise<void> => {
      if (depth > 10) { // Max recursion depth for includes
        console.warn(`TextFileParserService: Max recursion depth reached for include: ${currentFilePath}`);
        return;
      }

      const cacheKey = `${currentLang}/${currentFilePath}`;
      this.recursionDepth.set(cacheKey, (this.recursionDepth.get(cacheKey) || 0) + 1);


      let fileContent = await this.fetchAndCacheFile(currentLang, currentFilePath);
      let currentFileParsedSections: Map<string, string[]>;

      if (!fileContent) { // Try fallback language if primary lang file not found
        if (currentLang === 'English') {
          // console.log(`TextFileParserService: English file ${currentFilePath} not found, trying Latin fallback.`);
          fileContent = await this.fetchAndCacheFile('Latin', currentFilePath);
          if (fileContent) currentLang = 'Latin'; // Switch context if fallback is used
        }
      }
      if (!fileContent) {
        console.warn(`TextFileParserService: File not found after fallbacks: ${currentFilePath}`);
        this.recursionDepth.set(cacheKey, this.recursionDepth.get(cacheKey)! -1);
        return;
      }

      const cachedFile = this.fileCache.get(cacheKey);
      if (cachedFile?.parsedSections) {
        currentFileParsedSections = cachedFile.parsedSections;
      } else {
        currentFileParsedSections = this.parseSections(fileContent);
        if (cachedFile) cachedFile.parsedSections = currentFileParsedSections;
      }


      for (const [sectionName, lines] of currentFileParsedSections.entries()) {
        for (const line of lines) {
          // @[Filename]:Section:Substitutions
          const includeMatch = line.match(/^@([^:]*)?(?::([^:]+))?(?::(.*))?$/);
          if (includeMatch) {
            const inclFile = includeMatch[1] || currentFilePath; // If Filename is empty, self-reference
            const inclSection = includeMatch[2] || sectionName; // If Section is empty, same section
            // Substitutions (includeMatch[3]) are very complex, ignoring for now.

            const includePathPrefix = this.getPathPrefix(inclFile.endsWith(".txt") ? inclFile : `${inclFile}.txt`);
            const includeFullFile = `${includePathPrefix}${inclFile.endsWith(".txt") ? inclFile : `${inclFile}.txt`}`.replace(/\\/\\//g, '/');

            const includeKey = `${currentLang}/${includeFullFile}#${inclSection}`;
            if (processedIncludes.has(includeKey)) {
                // console.warn(`Skipping already processed include: ${includeKey}`);
                continue;
            }
            processedIncludes.add(includeKey);

            // Fetch the section from the included file
            const includedFileContent = await this.fetchAndCacheFile(currentLang, includeFullFile);
            if (includedFileContent) {
              const includedFileSections = this.parseSections(includedFileContent);
              const sectionToIncludeLines = includedFileSections.get(inclSection);
              if (sectionToIncludeLines) {
                // console.log(`Including ${currentLang}/${includeFullFile} section [${inclSection}] into ${currentFilePath} [${sectionName}]`);
                for (const includedLine of sectionToIncludeLines) {
                   // Recurse for includes within the included section (passing original language of request)
                  if (includedLine.startsWith("@")) {
                    // This recursive call for lines starting with @ inside an included section needs careful handling
                    // It should effectively re-process this line as an include directive
                    // For simplicity, we'll assume direct includes are handled by outer loop for now
                    // Proper handling would re-parse this line in the context of the included file.
                    // Let's process this as a new include directive.
                    await resolveIncludeLine(includedLine, currentLang, includeFullFile, inclSection, depth + 1);
                  } else {
                    const processedLine = this.processLineConditionals(includedLine, currentLang, targetVersion);
                    if (processedLine !== null) {
                      parts.push({
                        part_type: sectionName, // Use original section name where it's included
                        text_content: processedLine,
                        is_rubric: this.isRubric(processedLine),
                        lang: currentLang,
                        sequence: sequence++,
                      });
                    }
                  }
                }
              } else {
                // console.warn(`TextFileParserService: Section [${inclSection}] not found in included file ${includeFullFile}`);
              }
            } else {
                // console.warn(`TextFileParserService: Included file not found: ${includeFullFile}`);
            }
            processedIncludes.delete(includeKey); // Allow re-inclusion if explicitly called again (rare)
          } else { // Not an include line, process normally
            const processedLine = this.processLineConditionals(line, currentLang, targetVersion);
            if (processedLine !== null) {
              parts.push({
                part_type: sectionName,
                text_content: processedLine,
                is_rubric: this.isRubric(processedLine),
                lang: currentLang,
                sequence: sequence++,
              });
            }
          }
        }
      }
      this.recursionDepth.set(cacheKey, this.recursionDepth.get(cacheKey)! - 1);
    };

    // Helper for @-lines within included content
    const resolveIncludeLine = async (line: string, langContext: 'Latin' | 'English', fileContext: string, sectionContext: string, depth: number) => {
        const includeMatch = line.match(/^@([^:]*)?(?::([^:]+))?(?::(.*))?$/);
        if (includeMatch) {
            const inclFile = includeMatch[1] || fileContext;
            const inclSection = includeMatch[2] || sectionContext;
            const includePathPrefix = this.getPathPrefix(inclFile.endsWith(".txt") ? inclFile : `${inclFile}.txt`);
            const includeFullFile = `${includePathPrefix}${inclFile.endsWith(".txt") ? inclFile : `${inclFile}.txt`}`.replace(/\\/\\//g, '/');

            const includeKey = `${langContext}/${includeFullFile}#${inclSection}`;
            if (processedIncludes.has(includeKey)) return;
            processedIncludes.add(includeKey);

            await resolveFile(langContext, includeFullFile, depth +1); // Resolve this specific included section
            processedIncludes.delete(includeKey);
        }
    };

    await resolveFile(lang, initialFullFilePath, 0);
    return parts;
  }
}
