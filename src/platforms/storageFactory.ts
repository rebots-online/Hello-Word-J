import { Platform } from 'react-native';
import { IStorageService } from '../core/types/services';
import { NativeStorageService } from './native/sqliteStorage';
import { WebSqliteStorageService } from './web/webSqliteStorage'; // Updated import

let storageServiceInstance: IStorageService | null = null;

export function createStorageService(): IStorageService {
  if (storageServiceInstance) {
    return storageServiceInstance;
  }

  if (Platform.OS === 'android' || Platform.OS === 'ios') {
    console.log('Creating NativeStorageService (SQLite) for mobile platform.');
    storageServiceInstance = new NativeStorageService();
  } else if (Platform.OS === 'web') {
    console.log('Creating WebSqliteStorageService (sql.js) for web platform.'); // Updated log message
    storageServiceInstance = new WebSqliteStorageService(); // Use the new service
  } else {
    // Fallback or error for unsupported platforms
    console.warn(`Unsupported platform: ${Platform.OS}. Defaulting to web storage or consider a mock.`);
    // For now, let's default to WebSqliteStorageService if platform is unknown but web-like
    // Or throw an error if strict platform support is required.
    // storageServiceInstance = new WebSqliteStorageService();
    throw new Error(`Unsupported platform: ${Platform.OS}. Cannot create a storage service.`);
  }

  return storageServiceInstance;
}

// Optional: A function to get the already created instance,
// ensuring it's a singleton managed by the factory.
export function getStorageService(): IStorageService {
  if (!storageServiceInstance) {
    // Initialize it if called before explicit creation,
    // though typically createStorageService would be called at app startup.
    return createStorageService();
  }
  return storageServiceInstance;
}
