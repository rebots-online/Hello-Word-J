export interface IStorageService {
  initialize(): Promise<void>;
  executeQuery(sql: string, params?: any[]): Promise<any>;
  transaction(callback: () => Promise<void>): Promise<void>;
}

export interface IAudioRecorder {
  record(): Promise<void>;
  stop(): Promise<string | undefined>; // Returns the filePath of the recording
  play(filePath: string): Promise<void>;
}

export interface IDeviceInfo {
  getPlatform(): 'ios' | 'android' | 'web';
  isFoldable(): Promise<boolean>;
}
