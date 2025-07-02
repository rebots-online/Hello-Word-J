import { IStorageService } from '../core/types/services';
import { WebStorageService } from './web/StorageService';

let storageServiceInstance: IStorageService | null = null;

// Detect if we're in a browser environment
const isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined';

export async function createStorageService(): Promise<IStorageService> {
  if (storageServiceInstance) {
    return storageServiceInstance;
  }

  if (isBrowser) {
    console.log('Creating WebStorageService (Dexie) for web platform.');
    storageServiceInstance = new WebStorageService();
  } else {
    // For non-browser environments (like server-side rendering or native)
    try {
      console.log('Attempting to create NativeStorageService for mobile platform.');
      const { NativeStorageService } = await import('./native/sqliteStorage');
      storageServiceInstance = new NativeStorageService();
    } catch (error) {
      console.warn('Failed to initialize native storage, falling back to WebStorageService', error);
      storageServiceInstance = new WebStorageService();
    }
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
