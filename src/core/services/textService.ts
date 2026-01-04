import { BilingualText } from '../types/liturgical';
import { IStorageService } from '../types/services';

export class TextService {
  private storageService: IStorageService;

  constructor(storageService: IStorageService) {
    this.storageService = storageService;
  }

  async getMassProper(date: string): Promise<BilingualText[]> {
    console.log(`Fetching Mass Proper for date: ${date}`);

    try {
      const query = `
        SELECT latin, english, is_rubric
        FROM mass_texts
        WHERE celebration_key = ?
        ORDER BY sequence ASC;
      `;
      const results = await this.storageService.executeQuery(query, [date]);
      
      if (results && results.length > 0) {
        return results.map((row: { latin: string; english: string; is_rubric: boolean | number }) => ({
          latin: row.latin || '',
          english: row.english || '',
          isRubric: !!row.is_rubric,
        }));
      }
      
      // No data found for this date - return empty array (no placeholders per user requirement)
      console.warn(`No Mass texts found for date: ${date}`);
      return [];
    } catch (error) {
      console.error(`Error fetching Mass Proper for ${date}:`, error);
      return [];
    }
  }
}
