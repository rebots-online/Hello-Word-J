import Dexie, { Table } from 'dexie';
import { IStorageService } from '../../core/types/services';

export class WebStorageService implements IStorageService {
  private db: Dexie;
  
  constructor() {
    this.db = new Dexie('HelloWordDB');
    this.initializeDatabase();
  }

  private initializeDatabase(): void {
    // Schema version 1 - initial setup
    this.db.version(1).stores({
      calendar_days: 'date, season, rank',
      mass_texts: 'id, date, type, [date+type]',
      office_texts: 'id, date, hour, [date+hour]',
      voice_notes: 'id, date, [date+createdAt]',
      settings: 'key',
      // Enable full-text search on relevant fields
      $: 'texts(*)',
    });

    // Add full-text search extension
    this.db.version(1).stores({
      texts: null, // Clear previous version if any
      texts_documents: '&id, [content+locale]',
      texts_terms: '[a+_], [d+loc+word+field], [f+field]',
      texts_ranking: '&[table+id], rank',
    });
  }

  async initialize(): Promise<void> {
    try {
      // Open the database and create tables if they don't exist
      await this.db.open();
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }

  async executeQuery<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    try {
      // Map SQL-like queries to Dexie operations
      const query = sql.trim().toUpperCase();
      
      if (query.startsWith('SELECT')) {
        return this.handleSelectQuery(sql, params);
      } else if (query.startsWith('INSERT')) {
        await this.handleInsertQuery(sql, params);
        return [];
      } else if (query.startsWith('UPDATE')) {
        await this.handleUpdateQuery(sql, params);
        return [];
      } else if (query.startsWith('DELETE')) {
        await this.handleDeleteQuery(sql, params);
        return [];
      }
      
      throw new Error(`Unsupported query type: ${sql.split(' ')[0]}`);
    } catch (error) {
      console.error('Query execution failed:', { sql, params, error });
      throw error;
    }
  }

  async transaction<T>(callback: (tx: any) => Promise<T>): Promise<T> {
    return this.db.transaction('rw', this.db.tables, async () => {
      return await callback({
        executeSql: async (sql: string, params: any[] = []) => {
          const result = await this.executeQuery(sql, params);
          return [{ rows: { _array: result, length: result.length } }];
        },
      });
    });
  }

  // Helper methods for query handling
  private async handleSelectQuery(sql: string, params: any[]): Promise<any[]> {
    // Simple SELECT * FROM table WHERE conditions
    const tableMatch = sql.match(/FROM\s+([^\s,;]+)/i);
    if (!tableMatch) throw new Error('Invalid SELECT query: missing FROM clause');
    
    const tableName = tableMatch[1].trim();
    const table = this.db.table(tableName);
    
    // Simple WHERE clause parsing (basic implementation)
    const whereMatch = sql.match(/WHERE\s+(.+?)(?:\s*(?:;|$|ORDER|LIMIT))/i);
    if (whereMatch) {
      const whereClause = whereMatch[1];
      // This is a simplified implementation - in production, you'd want a proper SQL parser
      if (whereClause.includes('=')) {
        const [field, value] = whereClause.split('=').map(s => s.trim().replace(/'/g, ''));
        return table.where(field).equals(value).toArray();
      }
    }
    
    return table.toArray();
  }

  private async handleInsertQuery(sql: string, params: any[]): Promise<void> {
    const tableMatch = sql.match(/INSERT\s+INTO\s+([^\s(,;]+)/i);
    if (!tableMatch) throw new Error('Invalid INSERT query');
    
    const tableName = tableMatch[1].trim();
    const table = this.db.table(tableName);
    
    // Extract column names and values (simplified)
    const valuesMatch = sql.match(/\(([^)]+)\)\s*VALUES\s*\(([^)]+)\)/i);
    if (!valuesMatch) throw new Error('Invalid INSERT query format');
    
    const columns = valuesMatch[1].split(',').map(s => s.trim());
    const values = valuesMatch[2].split(',').map(s => s.trim().replace(/'/g, ''));
    
    const record: Record<string, any> = {};
    columns.forEach((col, index) => {
      record[col] = values[index];
    });
    
    await table.add(record);
  }

  private async handleUpdateQuery(sql: string, params: any[]): Promise<void> {
    const tableMatch = sql.match(/UPDATE\s+([^\s,;]+)/i);
    if (!tableMatch) throw new Error('Invalid UPDATE query');
    
    const tableName = tableMatch[1].trim();
    const table = this.db.table(tableName);
    
    // Extract SET clause (simplified)
    const setMatch = sql.match(/SET\s+(.+?)(?:\s+WHERE|;|$)/i);
    if (!setMatch) throw new Error('Invalid UPDATE query: missing SET clause');
    
    const updates: Record<string, any> = {};
    setMatch[1].split(',').forEach(pair => {
      const [key, value] = pair.split('=').map(s => s.trim().replace(/'/g, ''));
      updates[key] = value;
    });
    
    // Extract WHERE clause (simplified)
    const whereMatch = sql.match(/WHERE\s+(.+?)(?:\s*;|$)/i);
    if (!whereMatch) throw new Error('UPDATE query requires WHERE clause');
    
    const [whereField, whereValue] = whereMatch[1].split('=').map(s => s.trim().replace(/'/g, ''));
    
    await table.where(whereField).equals(whereValue).modify(updates);
  }

  private async handleDeleteQuery(sql: string, params: any[]): Promise<void> {
    const tableMatch = sql.match(/DELETE\s+FROM\s+([^\s,;]+)/i);
    if (!tableMatch) throw new Error('Invalid DELETE query');
    
    const tableName = tableMatch[1].trim();
    const table = this.db.table(tableName);
    
    // Extract WHERE clause (simplified)
    const whereMatch = sql.match(/WHERE\s+(.+?)(?:\s*;|$)/i);
    if (!whereMatch) {
      // No WHERE clause - delete all records
      await table.clear();
      return;
    }
    
    const [whereField, whereValue] = whereMatch[1].split('=').map(s => s.trim().replace(/'/g, ''));
    
    await table.where(whereField).equals(whereValue).delete();
  }

  // Full-text search implementation
  async searchText(query: string, table: string, fields: string[]): Promise<any[]> {
    // This is a simplified implementation - in production, you'd want to use a proper full-text search solution
    // like Elasticsearch, MeiliSearch, or SQLite FTS5 with a WebAssembly build
    
    const tableRef = this.db.table(table);
    const allItems = await tableRef.toArray();
    
    return allItems.filter(item => {
      return fields.some(field => {
        const value = item[field];
        if (typeof value !== 'string') return false;
        return value.toLowerCase().includes(query.toLowerCase());
      });
    });
  }
}
