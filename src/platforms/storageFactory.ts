import { Platform } from 'react-native';
import { IStorageService } from '../core/types/services';
import { WebSqliteStorageService } from './web/webSqliteStorage';

let storageServiceInstance: IStorageService | null = null;

export async function createStorageService(): Promise<IStorageService> {
  if (storageServiceInstance) {
    return storageServiceInstance;
  }

  if (Platform.OS === 'android' || Platform.OS === 'ios') {
    console.log('Creating NativeStorageService (SQLite) for mobile platform.');
    const { NativeStorageService } = await import('./native/sqliteStorage');
    storageServiceInstance = new NativeStorageService();
  } else if (Platform.OS === 'web') {
    console.log('Creating WebSqliteStorageService (sql.js) for web platform.');
    storageServiceInstance = new WebSqliteStorageService();
  } else {
    // Fallback or error for unsupported platforms
    console.warn(`Unsupported platform: ${Platform.OS}. Defaulting to web storage or consider a mock.`);
    storageServiceInstance = new WebSqliteStorageService();
  }

  return storageServiceInstance;
}

// Optional: A function to get the already created instance,
// ensuring it's a singleton managed by the factory.
export async function getStorageService(): Promise<IStorageService> {
  if (!storageServiceInstance) {
    // Initialize it if called before explicit creation,
    // though typically createStorageService would be called at app startup.
    return await createStorageService();
  }
  return storageServiceInstance;
}
