import React, { useState, useEffect } from 'react';
import './FullWebApp.css';

// Simple web-compatible implementations to access real data
interface LiturgicalDay {
  date: string;
  season?: string;
  celebration?: string;
  rank?: number;
  color?: string;
  commemorations?: string[];
}

interface CalendarDayItem {
  date: string;
  celebration: string | null;
  season?: string;
  color?: string;
  commemorations?: string;
  raw_kalendar_line?: string;
}

interface MassText {
  part_type: string;
  latin: string;
  english: string;
  is_rubric: boolean;
  sequence: number;
}

interface OfficeText {
  hour: string;
  part_type: string;
  latin: string;
  english: string;
  is_rubric: boolean;
  sequence: number;
}

interface JournalEntry {
  id: string;
  date: string;
  title: string;
  content: string;
  created_at: string;
}

type ViewMode = 'calendar' | 'mass' | 'office' | 'journal';

// Simple SQLite wrapper for web
class WebSQLiteDB {
  private SQL: any = null;
  private db: any = null;

  async initialize() {
    try {
      // Use dynamic import for sql.js
      const initSqlJs = (await import('sql.js')).default;
      this.SQL = await initSqlJs({
        locateFile: (file: string) => `/sql-wasm.wasm`
      });
      
      // Try to load existing database from IndexedDB
      const dbData = await this.loadFromIndexedDB();
      if (dbData) {
        this.db = new this.SQL.Database(dbData);
      } else {
        this.db = new this.SQL.Database();
        await this.createTables();
        await this.saveToIndexedDB();
      }
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }

  private async loadFromIndexedDB(): Promise<Uint8Array | null> {
    return new Promise((resolve) => {
      const request = indexedDB.open('SanctissiMissaDB', 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('database')) {
          db.createObjectStore('database');
        }
      };
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction('database', 'readonly');
        const store = transaction.objectStore('database');
        const getRequest = store.get('main');
        getRequest.onsuccess = () => {
          resolve(getRequest.result || null);
        };
        getRequest.onerror = () => resolve(null);
      };
      request.onerror = () => resolve(null);
    });
  }

  private async saveToIndexedDB() {
    if (!this.db) return;
    const data = this.db.export();
    
    return new Promise<void>((resolve, reject) => {
      const request = indexedDB.open('SanctissiMissaDB', 1);
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction('database', 'readwrite');
        const store = transaction.objectStore('database');
        const putRequest = store.put(data, 'main');
        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(putRequest.error);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async query(sql: string, params: any[] = []): Promise<any[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    try {
      const results: any[] = [];
      
      if (sql.trim().toUpperCase().startsWith('SELECT')) {
        const stmt = this.db.prepare(sql);
        if (params.length > 0) {
          stmt.bind(params);
        }
        while (stmt.step()) {
          results.push(stmt.getAsObject());
        }
        stmt.free();
      } else {
        this.db.run(sql, params);
        await this.saveToIndexedDB();
      }
      
      return results;
    } catch (error) {
      console.error('SQL Error:', error);
      return [];
    }
  }

  private async createTables() {
    await this.query(`
      CREATE TABLE IF NOT EXISTS calendar_days (
        date TEXT PRIMARY KEY NOT NULL,
        season TEXT,
        celebration TEXT,
        rank INTEGER,
        color TEXT,
        commemorations TEXT,
        raw_kalendar_line TEXT
      )
    `);

    await this.query(`
      CREATE TABLE IF NOT EXISTS mass_texts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        celebration_key TEXT NOT NULL,
        part_type TEXT NOT NULL,
        sequence INTEGER NOT NULL,
        latin TEXT NOT NULL,
        english TEXT NOT NULL,
        is_rubric BOOLEAN DEFAULT 0
      )
    `);

    await this.query(`
      CREATE TABLE IF NOT EXISTS office_texts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        celebration_key TEXT NOT NULL,
        hour TEXT NOT NULL,
        part_type TEXT NOT NULL,
        sequence INTEGER NOT NULL,
        latin TEXT NOT NULL,
        english TEXT NOT NULL,
        is_rubric BOOLEAN DEFAULT 0
      )
    `);

    await this.query(`
      CREATE TABLE IF NOT EXISTS journal_entries (
        id TEXT PRIMARY KEY NOT NULL,
        date TEXT NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TEXT NOT NULL
      )
    `);
  }
}

function RealDataApp(): React.JSX.Element {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<ViewMode>('calendar');
  const [db, setDb] = useState<WebSQLiteDB | null>(null);
  
  // Data states
  const [calendarDays, setCalendarDays] = useState<CalendarDayItem[]>([]);
  const [todayInfo, setTodayInfo] = useState<LiturgicalDay | null>(null);
  const [tomorrowInfo, setTomorrowInfo] = useState<LiturgicalDay | null>(null);
  const [massTexts, setMassTexts] = useState<MassText[]>([]);
  const [officeTexts, setOfficeTexts] = useState<OfficeText[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  
  // Journal form
  const [journalTitle, setJournalTitle] = useState('');
  const [journalContent, setJournalContent] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function initializeApp() {
      try {
        console.log('RealDataApp: Initializing database connection...');
        setIsLoading(true);
        
        const database = new WebSQLiteDB();
        await database.initialize();
        setDb(database);

        if (isMounted) {
          const today = new Date();
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          
          const todayStr = today.toISOString().split('T')[0];
          const tomorrowStr = tomorrow.toISOString().split('T')[0];

          // Get actual data from database
          const todayData = await database.query(
            "SELECT date, celebration, season, rank, color, commemorations FROM calendar_days WHERE date = ?",
            [todayStr]
          );

          const tomorrowData = await database.query(
            "SELECT date, celebration, season, rank, color, commemorations FROM calendar_days WHERE date = ?", 
            [tomorrowStr]
          );
          
          if (todayData.length > 0) {
            const row = todayData[0];
            setTodayInfo({
              date: row.date,
              season: row.season,
              celebration: row.celebration,
              rank: row.rank,
              color: row.color,
              commemorations: row.commemorations ? JSON.parse(row.commemorations) : []
            });
          }
          
          if (tomorrowData.length > 0) {
            const row = tomorrowData[0];
            setTomorrowInfo({
              date: row.date,
              season: row.season,
              celebration: row.celebration,
              rank: row.rank,
              color: row.color,
              commemorations: row.commemorations ? JSON.parse(row.commemorations) : []
            });
          }

          // Get recent calendar days
          const recentDays = await database.query(
            "SELECT date, celebration, season, color, commemorations, raw_kalendar_line FROM calendar_days ORDER BY date DESC LIMIT 30"
          );
          setCalendarDays(recentDays);

          // Get today's Mass texts
          const massResults = await database.query(
            "SELECT part_type, latin, english, is_rubric, sequence FROM mass_texts WHERE celebration_key = ? ORDER BY sequence",
            [todayStr]
          );
          setMassTexts(massResults);

          // Get today's Office texts
          const officeResults = await database.query(
            "SELECT hour, part_type, latin, english, is_rubric, sequence FROM office_texts WHERE celebration_key = ? ORDER BY hour, sequence",
            [todayStr]
          );
          setOfficeTexts(officeResults);

          // Get journal entries
          const journalResults = await database.query(
            "SELECT * FROM journal_entries ORDER BY created_at DESC LIMIT 20"
          );
          setJournalEntries(journalResults);

          setIsLoading(false);
        }
      } catch (e: any) {
        console.error('RealDataApp: Initialization error:', e);
        if (isMounted) {
          setError(e.message || 'Failed to initialize database.');
          setIsLoading(false);
        }
      }
    }

    initializeApp();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleAddJournalEntry = async () => {
    if (!db || !journalTitle.trim() || !journalContent.trim()) return;

    try {
      const id = `journal_${Date.now()}`;
      const now = new Date().toISOString();
      const today = new Date().toISOString().split('T')[0];

      await db.query(
        "INSERT INTO journal_entries (id, date, title, content, created_at) VALUES (?, ?, ?, ?, ?)",
        [id, today, journalTitle.trim(), journalContent.trim(), now]
      );

      // Refresh journal entries
      const journalResults = await db.query(
        "SELECT * FROM journal_entries ORDER BY created_at DESC LIMIT 20"
      );
      setJournalEntries(journalResults);
      
      setJournalTitle('');
      setJournalContent('');
    } catch (error) {
      console.error('Error adding journal entry:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Connecting to liturgical database...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <p className="error-text">Database Error: {error}</p>
      </div>
    );
  }

  const renderNavigation = () => (
    <nav className="navigation">
      <button 
        className={currentView === 'calendar' ? 'nav-button active' : 'nav-button'}
        onClick={() => setCurrentView('calendar')}
      >
        📅 Calendar
      </button>
      <button 
        className={currentView === 'mass' ? 'nav-button active' : 'nav-button'}
        onClick={() => setCurrentView('mass')}
      >
        ⛪ Mass
      </button>
      <button 
        className={currentView === 'office' ? 'nav-button active' : 'nav-button'}
        onClick={() => setCurrentView('office')}
      >
        📿 Office
      </button>
      <button 
        className={currentView === 'journal' ? 'nav-button active' : 'nav-button'}
        onClick={() => setCurrentView('journal')}
      >
        📖 Journal
      </button>
    </nav>
  );

  const renderCalendarView = () => (
    <div className="view-content">
      {(todayInfo || tomorrowInfo) && (
        <div className="today-info">
          {todayInfo && (
            <div className="day-card">
              <h3>Today - {todayInfo.date}</h3>
              {todayInfo.celebration && <p className="celebration">{todayInfo.celebration}</p>}
              {todayInfo.season && <p className="season">Season: {todayInfo.season}</p>}
              {todayInfo.rank !== undefined && (
                <p className="rank">Rank: {todayInfo.rank} | Color: {todayInfo.color}</p>
              )}
              {todayInfo.commemorations && todayInfo.commemorations.length > 0 && (
                <div className="commemorations">
                  <strong>Commemorations:</strong>
                  <ul>
                    {todayInfo.commemorations.map((comm, idx) => (
                      <li key={idx}>{comm}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          
          {tomorrowInfo && (
            <div className="day-card">
              <h3>Tomorrow - {tomorrowInfo.date}</h3>
              {tomorrowInfo.celebration && <p className="celebration">{tomorrowInfo.celebration}</p>}
              {tomorrowInfo.season && <p className="season">Season: {tomorrowInfo.season}</p>}
              {tomorrowInfo.rank !== undefined && (
                <p className="rank">Rank: {tomorrowInfo.rank} | Color: {tomorrowInfo.color}</p>
              )}
            </div>
          )}
        </div>
      )}

      <div className="calendar-list">
        <h3>Recent Calendar Days ({calendarDays.length} entries)</h3>
        {calendarDays.length > 0 ? (
          <div className="day-list">
            {calendarDays.map((item) => (
              <div key={item.date} className="day-item">
                <span className="date">{item.date}</span>
                <span className="celebration">{item.celebration || 'Feria'}</span>
                <span className="season">{item.season || ''}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-data">No calendar data found in database.</p>
        )}
      </div>
    </div>
  );

  const renderMassView = () => (
    <div className="view-content">
      <h2>Holy Mass - {todayInfo?.date || 'Today'}</h2>
      {todayInfo?.celebration && <h3 className="celebration-title">{todayInfo.celebration}</h3>}
      
      {massTexts.length > 0 ? (
        <div className="liturgical-texts">
          {massTexts.map((text, idx) => (
            <div key={idx} className={`text-part ${text.is_rubric ? 'rubric' : 'text'}`}>
              <h4>{text.part_type}</h4>
              {text.latin && (
                <div className="latin-text">
                  <strong>Latin:</strong> {text.latin}
                </div>
              )}
              {text.english && (
                <div className="english-text">
                  <strong>English:</strong> {text.english}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="no-data">No Mass texts found in database for today.</p>
      )}
    </div>
  );

  const renderOfficeView = () => (
    <div className="view-content">
      <h2>Divine Office - {todayInfo?.date || 'Today'}</h2>
      {todayInfo?.celebration && <h3 className="celebration-title">{todayInfo.celebration}</h3>}
      
      {officeTexts.length > 0 ? (
        <div className="office-hours">
          {['Matutinum', 'Laudes', 'Prima', 'Tertia', 'Sexta', 'Nona', 'Vespera', 'Completorium'].map(hour => {
            const hourTexts = officeTexts.filter(text => text.hour === hour);
            if (hourTexts.length === 0) return null;
            
            return (
              <div key={hour} className="office-hour">
                <h3 className="hour-title">{hour}</h3>
                <div className="liturgical-texts">
                  {hourTexts.map((text, idx) => (
                    <div key={idx} className={`text-part ${text.is_rubric ? 'rubric' : 'text'}`}>
                      <h4>{text.part_type}</h4>
                      {text.latin && (
                        <div className="latin-text">
                          <strong>Latin:</strong> {text.latin}
                        </div>
                      )}
                      {text.english && (
                        <div className="english-text">
                          <strong>English:</strong> {text.english}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="no-data">No Office texts found in database for today.</p>
      )}
    </div>
  );

  const renderJournalView = () => (
    <div className="view-content">
      <h2>Spiritual Journal</h2>
      
      <div className="journal-form">
        <h3>Add New Entry</h3>
        <input
          type="text"
          placeholder="Entry title..."
          value={journalTitle}
          onChange={(e) => setJournalTitle(e.target.value)}
          className="journal-title-input"
        />
        <textarea
          placeholder="Your reflection, prayer, or spiritual insight..."
          value={journalContent}
          onChange={(e) => setJournalContent(e.target.value)}
          className="journal-content-input"
          rows={6}
        />
        <button onClick={handleAddJournalEntry} className="add-entry-button">
          Add Entry
        </button>
      </div>

      <div className="journal-entries">
        <h3>Journal Entries ({journalEntries.length} total)</h3>
        {journalEntries.length > 0 ? (
          journalEntries.map((entry) => (
            <div key={entry.id} className="journal-entry">
              <h4>{entry.title}</h4>
              <p className="entry-date">{new Date(entry.created_at).toLocaleDateString()}</p>
              <p className="entry-content">{entry.content}</p>
            </div>
          ))
        ) : (
          <p className="no-entries">No journal entries found. Add your first spiritual reflection above.</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="app">
      <div className="header">
        <h1>SanctissiMissa</h1>
        <p>Traditional Latin Liturgical Companion (1962)</p>
      </div>
      
      {renderNavigation()}
      
      {currentView === 'calendar' && renderCalendarView()}
      {currentView === 'mass' && renderMassView()}
      {currentView === 'office' && renderOfficeView()}
      {currentView === 'journal' && renderJournalView()}
      
      <div className="footer">
        <p>Database: {calendarDays.length} calendar days, {massTexts.length} Mass texts, {officeTexts.length} Office texts, {journalEntries.length} journal entries</p>
      </div>
    </div>
  );
}

export default RealDataApp;