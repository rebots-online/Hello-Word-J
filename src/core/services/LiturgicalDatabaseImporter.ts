/**
 * LiturgicalDatabaseImporter.ts
 * First-run IndexedDB population from pre-built liturgical data
 * 
 * Copyright (C) 2025 Robin L. M. Cheung, MBA. All rights reserved.
 */

import { IStorageService } from '../types/services';

export interface ImportProgress {
  phase: 'downloading' | 'parsing' | 'importing' | 'complete';
  table?: string;
  current: number;
  total: number;
  percentage: number;
}

export interface ImportResult {
  success: boolean;
  tablesImported: string[];
  totalRecords: number;
  error?: string;
}

export interface DatabaseManifest {
  version: number;
  generatedAt: string;
  source: string;
  rubrics: string;
  databases: {
    sqlite: string | null;
    json: string;
  };
  stats: {
    kalendarEntries: number;
    transferRules: number;
    massTexts: number;
    officeTexts: number;
    prayers: number;
  };
  tables: string[];
}

/**
 * Checks if liturgical data needs to be imported
 */
export async function needsImport(storage: IStorageService): Promise<boolean> {
  try {
    // Check if we have the metadata table with version info
    const result = await storage.executeQuery(
      'SELECT value FROM metadata WHERE key = ?',
      ['liturgicalDataVersion']
    );
    
    if (result.length === 0) {
      return true; // No version stored, needs import
    }
    
    const currentVersion = parseInt(result[0].value, 10);
    
    // Fetch manifest to check version
    const manifest = await fetchDatabaseManifest();
    
    return currentVersion < manifest.version;
  } catch (e) {
    // If metadata table doesn't exist, we need import
    return true;
  }
}

/**
 * Fetches database manifest from assets
 */
async function fetchDatabaseManifest(): Promise<DatabaseManifest> {
  const response = await fetch('/assets/liturgical-db-manifest.json');
  if (!response.ok) {
    throw new Error('Failed to load database manifest');
  }
  return response.json();
}

/**
 * Imports liturgical data into IndexedDB
 */
export async function importLiturgicalData(
  storage: IStorageService,
  onProgress?: (progress: ImportProgress) => void
): Promise<ImportResult> {
  const result: ImportResult = {
    success: false,
    tablesImported: [],
    totalRecords: 0
  };
  
  try {
    // Fetch manifest
    onProgress?.({
      phase: 'downloading',
      current: 0,
      total: 1,
      percentage: 0
    });
    
    const manifest = await fetchDatabaseManifest();
    
    // Fetch database JSON
    onProgress?.({
      phase: 'downloading',
      current: 1,
      total: 2,
      percentage: 50
    });
    
    const dbResponse = await fetch(`/assets/${manifest.databases.json}`);
    if (!dbResponse.ok) {
      throw new Error('Failed to load database file');
    }
    
    const db = await dbResponse.json();
    
    onProgress?.({
      phase: 'downloading',
      current: 2,
      total: 2,
      percentage: 100
    });
    
    // Calculate total records for progress tracking
    const totalRecords: number = Object.values(db.tables).reduce(
      (sum: number, table: unknown) => sum + (Array.isArray(table) ? (table as any[]).length : 0),
      0
    );
    
    let importedCount: number = 0;
    
    // Import each table
    for (const [tableName, records] of Object.entries(db.tables)) {
      if (!Array.isArray(records)) continue;
      
      const progress: ImportProgress = {
        phase: 'importing',
        table: tableName,
        current: importedCount,
        total: totalRecords,
        percentage: Math.round((importedCount / totalRecords) * 100)
      };
      onProgress?.(progress);
      
      // Import records in batches for better performance
      const BATCH_SIZE = 100;
      for (let i = 0; i < records.length; i += BATCH_SIZE) {
        const batch = records.slice(i, i + BATCH_SIZE);
        
        for (const record of batch) {
          await insertRecord(storage, tableName, record);
        }
        
        importedCount += batch.length;
        
        onProgress?.({
          phase: 'importing',
          table: tableName,
          current: importedCount,
          total: totalRecords,
          percentage: Math.round((importedCount / totalRecords) * 100)
        });
      }
      
      result.tablesImported.push(tableName);
      result.totalRecords += records.length;
    }
    
    // Store version info
    await storage.executeQuery(
      `INSERT OR REPLACE INTO metadata (key, value) VALUES (?, ?)`,
      ['liturgicalDataVersion', db.version.toString()]
    );
    
    await storage.executeQuery(
      `INSERT OR REPLACE INTO metadata (key, value) VALUES (?, ?)`,
      ['liturgicalDataImportedAt', new Date().toISOString()]
    );
    
    onProgress?.({
      phase: 'complete',
      current: totalRecords,
      total: totalRecords,
      percentage: 100
    });
    
    result.success = true;
    
  } catch (error) {
    result.error = error instanceof Error ? error.message : 'Unknown error';
    console.error('Liturgical data import failed:', error);
  }
  
  return result;
}

/**
 * Insert a single record into the appropriate table
 */
async function insertRecord(
  storage: IStorageService,
  tableName: string,
  record: any
): Promise<void> {
  const columns = Object.keys(record);
  const values = Object.values(record);
  const placeholders = columns.map(() => '?').join(', ');
  
  await storage.executeQuery(
    `INSERT OR REPLACE INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders})`,
    values
  );
}

/**
 * Gets import status for display
 */
export async function getImportStatus(storage: IStorageService): Promise<{
  imported: boolean;
  version?: number;
  importedAt?: string;
}> {
  try {
    const [versionResult, dateResult] = await Promise.all([
      storage.executeQuery('SELECT value FROM metadata WHERE key = ?', ['liturgicalDataVersion']),
      storage.executeQuery('SELECT value FROM metadata WHERE key = ?', ['liturgicalDataImportedAt'])
    ]);
    
    if (versionResult.length === 0) {
      return { imported: false };
    }
    
    return {
      imported: true,
      version: parseInt(versionResult[0].value, 10),
      importedAt: dateResult[0]?.value
    };
  } catch (e) {
    return { imported: false };
  }
}
