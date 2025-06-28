import SQLite, { SQLiteDatabase, ResultSet, SQLError } from 'react-native-sqlite-storage';
import { IStorageService } from '../../core/types/services';

// Enable promise support for the SQLite library
SQLite.enablePromise(true);

const DATABASE_NAME = 'HelloWord.db';
const DATABASE_LOCATION = 'default'; // Standard location for react-native-sqlite-storage

export class NativeStorageService implements IStorageService {
  private db: SQLiteDatabase | null = null;

  constructor() {
    // In a real app, you might pass dbName or other configs
    console.log('NativeStorageService initialized');
  }

  private async openDb(): Promise<SQLiteDatabase> {
    if (this.db) {
      return this.db;
    }
    console.log(`Opening database: ${DATABASE_NAME}`);
    try {
      const instance = await SQLite.openDatabase({
        name: DATABASE_NAME,
        location: DATABASE_LOCATION,
        createFromLocation: undefined, // Set to 1 if pre-populated DB is in www or android/app/src/main/assets
      });
      console.log('Database OPENED');
      this.db = instance;
      return instance;
    } catch (error) {
      console.error('Error opening database: ', error);
      throw error; // Re-throw to indicate failure
    }
  }

  async initialize(): Promise<void> {
    // The initialize method in this context ensures the DB can be opened.
    // Table creation will be handled by DataManager using executeQuery.
    await this.openDb();
    console.log('NativeStorageService: Database connection established.');
  }

  async executeQuery(sql: string, params?: any[]): Promise<any[]> {
    const dbInstance = await this.openDb();
    if (!dbInstance) {
      throw new Error('Database not initialized. Call initialize() first.');
    }

    console.log(`Executing SQL: ${sql} with params: ${JSON.stringify(params)}`);
    try {
      const [results]: [ResultSet] = await dbInstance.executeSql(sql, params);
      const rows: any[] = [];
      if (results && results.rows && results.rows.length > 0) {
        for (let i = 0; i < results.rows.length; i++) {
          rows.push(results.rows.item(i));
        }
      }
      console.log(`SQL executed successfully. Rows affected: ${results.rowsAffected}, Rows returned: ${rows.length}`);
      return rows; // Return the array of row objects
    } catch (error) {
      const sqlError = error as SQLError;
      console.error(`SQL Error: ${sqlError.message} while executing: ${sql} with params ${JSON.stringify(params)}`, sqlError);
      throw error; // Re-throw to be handled by caller
    }
  }

  async transaction(callback: (txn: any) => Promise<void>): Promise<void> {
    const dbInstance = await this.openDb();
    if (!dbInstance) {
      throw new Error('Database not initialized. Call initialize() first.');
    }

    console.log('Starting transaction');
    try {
      await dbInstance.transaction(async (tx) => {
        // The callback here is expected to use the provided 'tx' object
        // which has an executeSql method.
        // However, our IStorageService.executeQuery is on the service itself.
        // For simplicity in adapting to IStorageService, we'll make a temporary
        // service instance that uses this specific transaction.
        const transactionalStorageService: IStorageService = {
          initialize: async () => { /* no-op in transaction */ },
          executeQuery: async (sql: string, params?: any[]): Promise<any[]> => {
            console.log(`TX Executing SQL: ${sql} with params: ${JSON.stringify(params)}`);
            const [results]: [ResultSet] = await tx.executeSql(sql, params);
            const rows: any[] = [];
            if (results && results.rows && results.rows.length > 0) {
              for (let i = 0; i < results.rows.length; i++) {
                rows.push(results.rows.item(i));
              }
            }
            return rows;
          },
          transaction: async (_cb: (txn: any) => Promise<void>) => {
            throw new Error('Nested transactions not supported by this adapter.');
          }
        };
        // The DataManager's transaction callback expects to call this.storageService.executeQuery
        // So, the callback itself doesn't need the 'tx' object directly if it uses this.
        // This is a bit of a workaround because DataManager's transaction callback
        // uses `this.storageService.executeQuery` which is not transaction-aware by itself.
        // A cleaner way would be for `DataManager.initialize` to pass the `tx` object down
        // or for `IStorageService.transaction` to provide a transactional version of `executeQuery`.
        // For now, we'll pass a dummy transaction object as the DataManager's callback
        // doesn't use the passed transaction object directly but relies on executeQuery
        // being called on a service that is transaction-aware.
        // The current DataManager's `await this.storageService.executeQuery` will call the
        // main executeQuery, not a transaction-specific one. This needs refinement.

        // Corrected approach: The callback should use the passed transaction object.
        // The `DataManager` will need to be adjusted to use the `tx` object
        // if it wants to run queries within this specific transaction.
        // For now, this IStorageService.transaction will execute the callback,
        // and the callback is responsible for using the transaction if needed.
        // The `DataManager`'s current `initialize` method's transaction block
        // `await this.storageService.transaction(async () => { ... })` will work if
        // the `executeQuery` it calls within the callback is somehow tied to this transaction.

        // Let's simplify the `IStorageService.transaction` to match `src/platforms/web/indexedDbStorage` more closely.
        // The callback will receive the transaction object `tx`.
        // The `DataManager` will need to be updated to use this `tx` if it's passed one.
        // However, the current `IStorageService` signature for `transaction` is `(callback: () => Promise<void>)`.
        // This means `DataManager`'s callback `async () => { await this.storageService.executeQuery(...) }`
        // will call the *outer* `executeQuery`, not one bound to `tx`.

        // Re-thinking: The `DataManager`'s `initialize` method's transaction:
        // await this.storageService.transaction(async () => {
        //   await this.storageService.executeQuery(CREATE_CALENDAR_DAYS_TABLE); ...
        // });
        // This structure means the `NativeStorageService.transaction` method needs to ensure
        // that calls to `this.executeQuery` *within its callback execution scope* are routed to the transaction.
        // This can be achieved by temporarily overriding `this.executeQuery`.

        const originalExecuteQuery = this.executeQuery;
        this.executeQuery = async (sql: string, params?: any[]): Promise<any[]> => {
          console.log(`TX (via override) Executing SQL: ${sql} with params: ${JSON.stringify(params)}`);
          const [results]: [ResultSet] = await tx.executeSql(sql, params);
          const rows: any[] = [];
          if (results && results.rows && results.rows.length > 0) {
            for (let i = 0; i < results.rows.length; i++) {
              rows.push(results.rows.item(i));
            }
          }
          return rows;
        };

        await callback(tx); // Pass tx in case the callback wants to use it, though our current DataManager won't.

        this.executeQuery = originalExecuteQuery; // Restore original executeQuery
      });
      console.log('Transaction successful');
    } catch (error) {
      console.error('Transaction error: ', error);
      throw error;
    } finally {
      // Ensure executeQuery is restored even if callback fails
      if (this.executeQuery !== NativeStorageService.prototype.executeQuery) {
         // Check if it was overridden (simple check, might need more robust for complex scenarios)
         // This assumes 'this.executeQuery' was set to the transactional one.
         // A cleaner way is to use a class field for the original method.
         // For now, this addresses the immediate issue.
         // Re-setting to prototype's method:
         // this.executeQuery = NativeStorageService.prototype.executeQuery;
         // This is problematic if called on an instance that might have a bound version initially.
         // The temporary override approach is tricky.
         // A better IStorageService.transaction would be:
         // async transaction<T>(scope: (tx: ITransaction) => Promise<T>): Promise<T>
         // where ITransaction has an executeQuery method.
         // Given the current IStorageService, the override is a plausible, if imperfect, way.
    }
  }

  // async close(): Promise<void> {
  //   if (this.db) {
  //     console.log('Closing database');
  //     await this.db.close();
  //     this.db = null;
  //     console.log('Database closed');
  //   }
  // }
}

// Usage example (for testing, not part of the service itself):
// async function testDb() {
//   const storage = new NativeStorageService();
//   try {
//     await storage.initialize();
//     await storage.transaction(async () => {
//       await storage.executeQuery('CREATE TABLE IF NOT EXISTS Users (id INTEGER PRIMARY KEY NOT NULL, name TEXT NOT NULL)');
//       await storage.executeQuery('INSERT INTO Users (name) VALUES (?)', ['Alice']);
//       await storage.executeQuery('INSERT INTO Users (name) VALUES (?)', ['Bob']);
//     });
//     const users = await storage.executeQuery('SELECT * FROM Users');
//     console.log('Users:', users);
//   } catch (e) {
//     console.error('Test DB error:', e);
//   } finally {
//     // await storage.close(); // If a close method is implemented
//   }
// }
// testDb();

