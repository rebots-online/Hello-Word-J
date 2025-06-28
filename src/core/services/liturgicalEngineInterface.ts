/**
 * Interface to our working liturgical CLI engine
 * Bridges the gap between React app and Node.js CLI engine
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

export interface LiturgicalData {
  date: string;
  calculated_at: string;
  calendar: {
    season: string;
    celebration: string;
    rank: number;
    color: string;
    commemorations: string[];
    easter_date: string;
    feastContent?: string;
    feastFile?: string;
  };
  mass: {
    available: boolean;
    reason: string;
    texts: Record<string, {
      latin: string;
      english: string;
      is_rubric: boolean;
      source: string;
    }>;
    source_file?: string;
  };
  office: {
    available: boolean;
    reason: string;
    hours: Record<string, any>;
    source_file?: string;
  };
  files_attempted: string[];
  verification_status: string;
}

export class LiturgicalEngineInterface {
  private static cliPath = path.join(__dirname, '../../../scripts/liturgical-cli.js');

  /**
   * Get Mass texts for a specific date using our working CLI engine
   */
  static async getMassTexts(date: string): Promise<LiturgicalData | null> {
    try {
      console.log(`🔄 LiturgicalEngineInterface: Getting Mass texts for ${date}`);
      
      const { stdout, stderr } = await execAsync(`node "${this.cliPath}" mass ${date}`);
      
      if (stderr) {
        console.warn('CLI stderr:', stderr);
      }
      
      // Parse JSON from CLI output
      const lines = stdout.split('\n');
      const jsonLine = lines.find(line => line.startsWith('{'));
      
      if (jsonLine) {
        const liturgicalData = JSON.parse(jsonLine) as LiturgicalData;
        console.log(`✅ LiturgicalEngineInterface: Retrieved data for ${date}`, liturgicalData.calendar.celebration);
        return liturgicalData;
      }
      
      console.warn('No JSON data found in CLI output');
      return null;
      
    } catch (error) {
      console.error('LiturgicalEngineInterface error:', error);
      return null;
    }
  }

  /**
   * Get Office texts for a specific date and hour
   */
  static async getOfficeTexts(date: string, hour?: string): Promise<LiturgicalData | null> {
    try {
      console.log(`🔄 LiturgicalEngineInterface: Getting Office texts for ${date}${hour ? ` (${hour})` : ''}`);
      
      const command = hour 
        ? `node "${this.cliPath}" office ${date} ${hour}`
        : `node "${this.cliPath}" office ${date}`;
        
      const { stdout, stderr } = await execAsync(command);
      
      if (stderr) {
        console.warn('CLI stderr:', stderr);
      }
      
      // Parse JSON from CLI output
      const lines = stdout.split('\n');
      const jsonLine = lines.find(line => line.startsWith('{'));
      
      if (jsonLine) {
        const liturgicalData = JSON.parse(jsonLine) as LiturgicalData;
        console.log(`✅ LiturgicalEngineInterface: Retrieved Office data for ${date}`);
        return liturgicalData;
      }
      
      return null;
      
    } catch (error) {
      console.error('LiturgicalEngineInterface Office error:', error);
      return null;
    }
  }

  /**
   * Get liturgical calendar information for a date
   */
  static async getCalendarData(date: string): Promise<LiturgicalData | null> {
    // For now, use Mass command to get calendar info
    // In the future, we could add a dedicated calendar command
    return this.getMassTexts(date);
  }

  /**
   * Verify calculation against divinumofficium.com
   */
  static async verifyAgainstDivinumOfficium(date: string): Promise<any> {
    try {
      const { stdout } = await execAsync(`node "${this.cliPath}" verify ${date}`);
      const lines = stdout.split('\n');
      const jsonLine = lines.find(line => line.startsWith('{'));
      
      if (jsonLine) {
        return JSON.parse(jsonLine);
      }
      return null;
    } catch (error) {
      console.error('Verification error:', error);
      return null;
    }
  }
}