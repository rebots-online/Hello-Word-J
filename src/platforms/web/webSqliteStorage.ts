import initSqlJs, { Database, SqlValue, Statement } from 'sql.js';
import { IStorageService } from '../../core/types/services';

const DATABASE_NAME = 'HelloWordWeb.db'; // For IndexedDB storage key
const WASM_SQL_JS_PATH = '/sql-wasm.wasm'; // Path relative to public directory

export class WebSqliteStorageService implements IStorageService {
  private db: Database | null = null;
  private SQL: any = null; // Will hold the sql.js module instance

  constructor() {
    console.log('WebSqliteStorageService initialized');
  }

  private async loadDbFromIndexedDB(): Promise<Uint8Array | null> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('SqlJsDatabase', 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('files')) {
          db.createObjectStore('files');
        }
      };
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction('files', 'readonly');
        const store = transaction.objectStore('files');
        const getRequest = store.get(DATABASE_NAME);
        getRequest.onsuccess = () => {
          resolve(getRequest.result as Uint8Array | null);
        };
        getRequest.onerror = () => {
          console.error('Error fetching DB from IndexedDB:', getRequest.error);
          reject(getRequest.error);
        };
      };
      request.onerror = () => {
        console.error('Error opening IndexedDB:', request.error);
        reject(request.error);
      };
    });
  }

  private async saveDbToIndexedDB(data: Uint8Array): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('SqlJsDatabase', 1);
      // onupgradeneeded will be handled by loadDbFromIndexedDB or initial open
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction('files', 'readwrite');
        const store = transaction.objectStore('files');
        const putRequest = store.put(data, DATABASE_NAME);
        putRequest.onsuccess = () => {
          resolve();
        };
        putRequest.onerror = () => {
          console.error('Error saving DB to IndexedDB:', putRequest.error);
          reject(putRequest.error);
        };
      };
      request.onerror = () => {
        console.error('Error opening IndexedDB for saving:', request.error);
        reject(request.error);
      };
    });
  }

  private async persistDatabase(): Promise<void> {
    if (this.db) {
      const data = this.db.export();
      await this.saveDbToIndexedDB(data);
      console.log('WebSqliteStorageService: Database persisted to IndexedDB.');
    }
  }

  async initialize(): Promise<void> {
    try {
      console.log('WebSqliteStorageService: Initializing...');
      this.SQL = await initSqlJs({
        locateFile: (file: string) => {
          console.log(`WebSqliteStorageService: locating sql.js file: ${file}, using: ${WASM_SQL_JS_PATH}`);
          return WASM_SQL_JS_PATH;
        }
      });
      console.log('WebSqliteStorageService: SQL.js module loaded.');

      const dbData = await this.loadDbFromIndexedDB();
      if (dbData) {
        console.log('WebSqliteStorageService: Loaded database from IndexedDB.');
        this.db = new this.SQL.Database(dbData);
      } else {
        console.log('WebSqliteStorageService: No existing database found in IndexedDB. Creating new one.');
        this.db = new this.SQL.Database();
        // Persist the empty DB immediately so tables can be created and saved.
        await this.persistDatabase();
      }
      console.log('WebSqliteStorageService: Database connection established.');
    } catch (error) {
      console.error('WebSqliteStorageService: Error initializing SQL.js database:', error);
      throw error;
    }
  }

  async executeQuery(sql: string, params?: any[]): Promise<any[]> {
    if (!this.db) {
      throw new Error('Database not initialized. Call initialize() first.');
    }

    console.log(`WebSqliteStorageService: Executing SQL: ${sql} with params: ${JSON.stringify(params)}`);
    let results: any[] = [];
    try {
      // For statements like SELECT that return data
      if (sql.trim().toUpperCase().startsWith('SELECT')) {
        const stmt: Statement | undefined = this.db.prepare(sql);
        if (!stmt) {
          throw new Error('Failed to prepare statement');
        }
        if (params) {
          stmt.bind(params);
        }

        while (stmt.step()) {
          results.push(stmt.getAsObject());
        }
        stmt.free();
      } else {
        // For statements like CREATE, INSERT, UPDATE, DELETE
        this.db.run(sql, params);
        // For these types of queries, sql.js doesn't directly return rows in the same way.
        // The number of affected rows can be obtained by `this.db.getRowsModified()`.
        // We'll return an empty array as per IStorageService for non-SELECT or handle based on needs.
        // If specific return values are needed (e.g., last inserted ID), this needs adjustment.
      }

      console.log(`WebSqliteStorageService: SQL executed successfully. Results count: ${results.length}`);
      await this.persistDatabase(); // Persist after every successful query
      return results;
    } catch (error) {
      console.error(`WebSqliteStorageService: SQL Error: ${(error as Error).message} while executing: ${sql}`, error);
      throw error;
    }
  }

  async transaction(callback: () => Promise<void>): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized. Call initialize() first.');
    }

    console.log('WebSqliteStorageService: Starting transaction');
    this.db.exec('BEGIN TRANSACTION;');
    try {
      await callback();
      this.db.exec('COMMIT;');
      console.log('WebSqliteStorageService: Transaction committed');
      await this.persistDatabase(); // Persist after successful transaction
    } catch (error) {
      this.db.exec('ROLLBACK;');
      console.error('WebSqliteStorageService: Transaction rolled back due to error:', error);
      throw error;
    }
  }

  // Optional: A method to close the database if needed, though sql.js handles memory internally.
  // async close(): Promise<void> {
  //   if (this.db) {
  //     await this.persistDatabase(); // Ensure final state is saved
  //     this.db.close();
  //     this.db = null;
  //     console.log('WebSqliteStorageService: Database closed.');
  //   }
  // }
}
