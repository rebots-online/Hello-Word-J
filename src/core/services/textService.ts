import { BilingualText } from '../types/liturgical';
import { DataManager } from './dataManager';

export class TextService {
  private dataManager: DataManager;

  constructor(dataManager: DataManager) {
    this.dataManager = dataManager;
  }

  async getMassProper(date: string): Promise<BilingualText[]> {
    const results = await this.dataManager.getMassTextsForDate(date);
    return results.map(row => ({
      latin: row.latin,
      english: row.english,
      isRubric: !!row.is_rubric,
    }));
  }
}
