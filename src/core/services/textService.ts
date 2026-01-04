import { BilingualText } from '../types/liturgical';
import { DataManager } from './dataManager';

export class TextService {
  private dataManager: DataManager;

  constructor(dataManager: DataManager) {
    this.dataManager = dataManager;
  }

  async getMassProper(date: string): Promise<BilingualText[]> {
    console.log(`Fetching Mass Proper for date: ${date}`);
    
    try {
      const results = await this.dataManager.getMassTextsForDate(date);
      
      if (results && results.length > 0) {
        return results.map(row => ({
          latin: row.latin || '',
          english: row.english || '',
          isRubric: !!row.is_rubric,
        }));
      }
      
      // No data found - return empty array (no placeholders per user requirement)
      return [];
    } catch (error) {
      console.error(`Error fetching Mass Proper for ${date}:`, error);
      return [];
    }
  }
}
