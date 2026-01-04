export enum LiturgicalSeason {
  ADVENT = 'ADVENT',
  CHRISTMASTIDE = 'CHRISTMASTIDE',
  SEPTUAGESIMA = 'SEPTUAGESIMA',
  LENT = 'LENT',
  PASCHALTIDE = 'PASCHALTIDE',
  TIME_AFTER_PENTECOST = 'TIME_AFTER_PENTECOST',
}

export interface BilingualText {
  latin: string;
  english: string;
  isRubric?: boolean;
}

export interface LiturgicalDay {
  date: string;
  season: LiturgicalSeason;
  celebration?: string;
  rank: number;
  color: string;
  commemorations: string[];
}

export interface VoiceNote {
  id: string;
  date: string;
  title: string;
  filePath: string;
  duration: number;
  transcription?: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  title: string;
  content: string;
  liturgicalContext?: string;
  tags: string[];
  created: string;
  modified: string;
}

export interface SaintInfo {
  name: string;
  feastDay: string;
  biography: string;
  patronage: string[];
  sources: string[];
}

export interface MartyrologicalEntry {
  date: string;
  entries: Array<{
    saint: string;
    location?: string;
    description: string;
    rank?: number;
  }>;
}

export interface ParishInfo {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  pastor: string;
  massSchedule: Array<{
    day: string;
    time: string;
    type: string;
  }>;
}

export interface ParishEvent {
  id: string;
  parishId: string;
  title: string;
  description: string;
  date: string;
  time?: string;
  location?: string;
  category: 'liturgical' | 'social' | 'educational' | 'charitable';
}

export interface Newsletter {
  id: string;
  parishId: string;
  title: string;
  content: string;
  publishDate: string;
  author: string;
}

export interface CachedLiturgicalData {
  date: string;
  massTexts?: { [key: string]: BilingualText };
  officeTexts?: { [hour: string]: { [key: string]: BilingualText } };
  liturgicalDay: LiturgicalDay;
  martyrology?: MartyrologicalEntry;
  saintInfo?: SaintInfo[];
  cachedAt: string;
  expiresAt: string;
}
