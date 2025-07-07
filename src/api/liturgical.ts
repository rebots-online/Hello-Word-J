/**
 * API endpoint to serve liturgical data from the CLI
 * Copyright (C) 2025 Robin L. M. Cheung, MBA. All rights reserved.
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function getLiturgicalMass(date: string) {
  try {
    const { stdout, stderr } = await execAsync(`npm run liturgical-cli mass ${date}`);
    
    if (stderr) {
      console.error('CLI stderr:', stderr);
    }

    // Parse the CLI output - look for JSON output after the console messages
    const lines = stdout.split('\n');
    const jsonLine = lines.find(line => line.trim().startsWith('{'));
    
    if (!jsonLine) {
      console.warn('No JSON output from liturgical CLI - returning empty propers');
      return { propers: {} };
    }

    const result = JSON.parse(jsonLine);
    
    // Convert CLI format to component format
    if (result.texts) {
      return {
        propers: result.texts
      };
    }
    
    return { propers: {} };
  } catch (error) {
    console.error('Error calling liturgical CLI:', error);
    
    // Return empty propers on error so the component shows only the Ordinary
    return { propers: {} };
  }
}

export async function getLiturgicalOffice(date: string, hour: string) {
  try {
    const { stdout, stderr } = await execAsync(`npm run liturgical-cli office ${date} ${hour}`);
    
    if (stderr) {
      console.error('CLI stderr:', stderr);
    }

    // Parse the CLI output
    const lines = stdout.split('\n');
    const jsonLine = lines.find(line => line.trim().startsWith('{'));
    
    if (!jsonLine) {
      throw new Error('No JSON output from liturgical CLI');
    }

    const result = JSON.parse(jsonLine);
    return result;
  } catch (error) {
    console.error('Error calling liturgical CLI:', error);
    throw error;
  }
}