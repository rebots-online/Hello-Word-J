import Dexie, { Table } from 'dexie';
import { IStorageService } from '../../core/types/services';
import { LiturgicalDay, BilingualText, VoiceNote } from '../../core/types/liturgical'; // Assuming these are needed for table definitions

// Define interfaces for table records based on SQL schema from DataManager
// These might need adjustment based on how we structure data in IndexedDB.
// For example, `commemorations` was a JSON string in SQL. Here it can be string[].
export interface CalendarDayRecord extends Omit<LiturgicalDay, 'commemorations'> {
  // date is primary key (string YYYY-MM-DD)
  commemorations?: string[]; // Stored directly as an array
}

export interface MassTextRecord {
  id?: number; // Auto-incremented primary key
  celebration_key: string; // Foreign key (e.g., date of CalendarDayRecord)
  part_type: string;
  sequence: number;
  latin: string;
  english: string;
  is_rubric?: boolean;
}

export interface OfficeTextRecord {
  id?: number; // Auto-incremented primary key
  celebration_key: string;
  hour: string;
  part_type: string;
  sequence: number;
  latin: string;
  english: string;
  is_rubric?: boolean;
}

export interface VoiceNoteRecord extends VoiceNote {
  // id is primary key (string)
}


// Define the Dexie database
class HelloWordDexieDb extends Dexie {
  calendar_days!: Table<CalendarDayRecord, string>; // string is the type of the primary key (date)
  mass_texts!: Table<MassTextRecord, number>;       // number is the type of the primary key (id)
  office_texts!: Table<OfficeTextRecord, number>;    // number is the type of the primary key (id)
  voice_notes!: Table<VoiceNoteRecord, string>;     // string is the type of the primary key (id)

  constructor() {
    super('HelloWordDexieDb');
    this.version(1).stores({
      calendar_days: 'date, season, celebration, rank, color', // 'date' is primary key. Others are indexed.
      mass_texts: '++id, celebration_key, part_type',          // '++id' is auto-incrementing primary key.
      office_texts: '++id, celebration_key, hour, part_type',
      voice_notes: 'id, date, title',                         // 'id' is primary key.
    });
    // Further versions and migrations would go here if schema evolves.
  }
}

export class WebStorageService implements IStorageService {
  private db: HelloWordDexieDb;

  constructor() {
    this.db = new HelloWordDexieDb();
    console.log('WebStorageService (Dexie) initialized');
  }

  async initialize(): Promise<void> {
    // Dexie's constructor and versioning handles DB opening and schema setup.
    // We can try a simple operation to ensure it's working.
    try {
      await this.db.open(); // Explicitly open the database
      console.log('WebStorageService: Dexie database opened successfully.');
      // Example: Count items in a table to confirm schema exists
      // const count = await this.db.calendar_days.count();
      // console.log(`Dexie: Found ${count} items in calendar_days.`);
    } catch (error) {
      console.error('WebStorageService: Error initializing Dexie database:', error);
      throw error;
    }
  }

  async executeQuery(sql: string, params?: any[]): Promise<any[]> {
    console.warn(`WebStorageService: executeQuery with raw SQL is not directly supported by Dexie. SQL: "${sql}", Params: ${JSON.stringify(params)}`);
    // This is where the complexity lies. Dexie uses object-based access, not SQL.
    // For full IStorageService compatibility with DataManager expecting SQL,
    // a SQL parser and Dexie query generator would be needed, which is a large task.

    // Option 1: Throw NotImplementedError (as planned for now)
    throw new Error('WebStorageService: Raw SQL execution is not implemented. Use specific data access methods.');

    // Option 2: Implement very basic, limited SQL parsing for specific cases (not recommended for general use)
    // e.g., if (sql.startsWith('SELECT * FROM calendar_days')) { return this.db.calendar_days.toArray(); }

    // Option 3: DataManager needs to be adapted for web to use Dexie-specific methods.
    // This means DataManager would have conditional logic or use a different interface for web.
  }

  async transaction<T_TransactionResult>(
    callback: () => Promise<T_TransactionResult> // The callback itself returns a promise now
  ): Promise<T_TransactionResult> {
    console.log('WebStorageService: Starting Dexie transaction');
    try {
      // Dexie's transaction block:
      // The mode ('rw' for read-write) and the tables involved are specified.
      // For a generic transaction wrapper like this, we might need to specify all tables
      // or have the DataManager provide the tables.
      // For now, let's assume the callback might touch any of the main tables.
      const result = await this.db.transaction(
        'rw', // Read-write mode
        [this.db.calendar_days, this.db.mass_texts, this.db.office_texts, this.db.voice_notes],
        async () => {
          // Inside this Dexie transaction scope, calls to Dexie methods are transactional.
          // The IStorageService.transaction's callback is `async () => Promise<void>`
          // The DataManager's callback `async () => { await this.storageService.executeQuery(...) }`
          // will call the `executeQuery` of this WebStorageService instance.
          // Since `executeQuery` throws an error, this transaction won't work as is with DataManager's SQL.

          // To make DataManager's `initialize` work with this, `executeQuery` would need to
          // interpret `CREATE TABLE` commands and map them to Dexie's schema definition,
          // which is typically done in the Dexie constructor's `this.version().stores()`.
          // So, for `DataManager.initialize`, the `CREATE TABLE` calls via `executeQuery` will fail.

          // The `initialize` method of `DataManager` should ideally not run `CREATE TABLE`
          // when using Dexie, as Dexie handles schema setup.
          // This highlights a divergence in how SQL-based vs NoSQL-like DBs handle schema.

          // For the purpose of this task, fulfilling the `IStorageService.transaction` signature:
          // The callback is executed. If it attempts `executeQuery`, it will fail as per above.
          // If the callback were to use Dexie-specific methods (which it can't via IStorageService),
          // those would be part of the transaction.

          // Let's assume for now the callback is what the DataManager provides.
          // It will call `this.executeQuery` which will throw.
          // This means `DataManager.initialize()` will fail for Web.
          // This is an important point to document.
          return await callback();
        }
      );
      console.log('WebStorageService: Dexie transaction completed successfully.');
      return result;
    } catch (error) {
      console.error('WebStorageService: Dexie transaction failed:', error);
      throw error;
    }
  }

  // Example of Dexie-specific methods (NOT part of IStorageService, but how Dexie is typically used)
  // async addCalendarDay(day: CalendarDayRecord): Promise<string> {
  //   return this.db.calendar_days.add(day);
  // }

  // async getCalendarDay(date: string): Promise<CalendarDayRecord | undefined> {
  //   return this.db.calendar_days.get(date);
  // }
}
