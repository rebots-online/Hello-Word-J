import SQLite, { SQLiteDatabase, ResultSet, SQLError, Transaction } from 'react-native-sqlite-storage';
import { IStorageService } from '../../core/types/services';
import { Platform } from 'react-native';

// Enable promise support for the SQLite library with error handling
SQLite.enablePromise(true);

// Database configuration
const DATABASE_NAME = 'HelloWord.db';
const DATABASE_DISPLAY_NAME = 'HelloWord SQLite Database';
const DATABASE_SIZE = 200000; // 200KB initial size

// Platform-specific database location
const getDatabaseLocation = (): string => {
  if (Platform.OS === 'ios') {
    return 'Library';
  }
  return 'default';
};

export class NativeStorageService implements IStorageService {
  private db: SQLiteDatabase | null = null;
  private isInitialized: boolean = false;
  private initializationPromise: Promise<SQLiteDatabase> | null = null;

  constructor() {
    console.log('NativeStorageService initialized');
    // Prevents multiple initializations
    this.initializationPromise = this.initializeDatabase();
  }

  private async initializeDatabase(): Promise<SQLiteDatabase> {
    if (this.db) {
      return this.db;
    }

    console.log(`Initializing database: ${DATABASE_NAME}`);
    
    try {
      // Close any existing database connection
      if (this.db) {
        await this.db.close();
        this.db = null;
      }

      // Open the database
      const db = await SQLite.openDatabase({
        name: DATABASE_NAME,
        location: getDatabaseLocation(),
        createFromLocation: '~www/' + DATABASE_NAME, // For pre-populated DB
        key: 'your-secure-key-here', // For encrypted database
        // @ts-ignore - Android-specific options
        keyConfig: {
          // Android-specific encryption config
          // @ts-ignore
          key: 'your-secure-key-here',
          // @ts-ignore
          useClose: true,
        },
      });

      // Enable foreign key support
      await db.executeSql('PRAGMA foreign_keys = ON;');
      
      // Set busy timeout to handle concurrent access
      await db.executeSql('PRAGMA busy_timeout = 5000;');
      
      // Enable WAL mode for better concurrency
      if (Platform.OS === 'android') {
        await db.executeSql('PRAGMA journal_mode = WAL;');
      }
      
      this.db = db;
      this.isInitialized = true;
      console.log('Database initialized successfully');
      return db;
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw new Error(`Database initialization failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async initialize(): Promise<void> {
    try {
      // Ensure database is initialized
      await this.initializationPromise;
      
      // Verify the database is accessible
      if (!this.db) {
        throw new Error('Database connection not established');
      }
      
      // Verify we can execute a simple query
      await this.db.executeSql('SELECT 1');
      
      console.log('NativeStorageService: Database connection verified and ready for use.');
    } catch (error) {
      console.error('Failed to verify database connection:', error);
      throw new Error(`Database verification failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async executeQuery<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    try {
      // Ensure database is initialized
      const db = await this.initializationPromise;
      if (!db) {
        throw new Error('Database not initialized');
      }

      // Log the query (without sensitive data in production)
      if (__DEV__) {
        console.log(`[SQL] ${sql}`, params.length ? 'with params:' : '', params.length ? params : '');
      }

      // Execute the query
      const [results]: [ResultSet] = await db.executeSql(sql, params);
      
      // Convert results to array of objects
      const rows: T[] = [];
      if (results.rows && results.rows.length > 0) {
        for (let i = 0; i < results.rows.length; i++) {
          rows.push(results.rows.item(i) as T);
        }
      }

      if (__DEV__) {
        console.log(`[SQL] Query executed. Rows affected: ${results.rowsAffected}, Rows returned: ${rows.length}`);
      }

      return rows;
    } catch (error) {
      const err = error as SQLError;
      console.error(
        `[SQL Error] ${err.message}\n` +
        `  Query: ${sql}\n` +
        `  Params: ${JSON.stringify(params)}\n`,
        error
      );
      
      // Add more context to the error
      const enhancedError = new Error(
        `Database query failed: ${err.message}. Query: ${sql}`
      );
      enhancedError.name = 'DatabaseError';
      // @ts-ignore
      enhancedError.originalError = err;
      throw enhancedError;
    }
  }

  async transaction<T>(callback: (tx: any) => Promise<T>): Promise<T> {
    const db = await this.initializationPromise;
    if (!db) {
      throw new Error('Database not initialized');
    }

    if (__DEV__) {
      console.log('[SQL] Starting transaction');
    }

    try {
      return await new Promise<T>((resolve, reject) => {
        db.transaction(
          async (tx: Transaction) => {
            try {
              // Create a transaction context with executeQuery method
              const txContext = {
                executeQuery: <T = any>(sql: string, params: any[] = []): Promise<T[]> => {
                  if (__DEV__) {
                    console.log(`[SQL-TX] ${sql}`, params.length ? 'with params:' : '', params.length ? params : '');
                  }
                  
                  return new Promise((resolve, reject) => {
                    tx.executeSql(
                      sql,
                      params,
                      (_, results) => {
                        const rows: T[] = [];
                        for (let i = 0; i < results.rows.length; i++) {
                          rows.push(results.rows.item(i) as T);
                        }
                        resolve(rows);
                      },
                      (_, error) => {
                        reject(error);
                        return true; // Return true to signal error was handled
                      }
                    );
                  });
                },
              };

              // Execute the transaction callback with the context
              const result = await callback(txContext);
              resolve(result);
            } catch (error) {
              // Rollback the transaction on error
              if (__DEV__) {
                console.error('[SQL-TX] Error in transaction, rolling back:', error);
              }
              throw error; // This will trigger the transaction's error callback
            }
          },
          (error) => {
            // Transaction error callback
            console.error('[SQL-TX] Transaction failed:', error);
            reject(new Error(`Transaction failed: ${error.message}`));
          },
          () => {
            // Transaction success callback
            if (__DEV__) {
              console.log('[SQL-TX] Transaction completed successfully');
            }
            // The actual resolve happens in the transaction callback
          }
        );
      });
    } catch (error) {
      console.error('[SQL-TX] Error in transaction:', error);
      throw error;
    }
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

