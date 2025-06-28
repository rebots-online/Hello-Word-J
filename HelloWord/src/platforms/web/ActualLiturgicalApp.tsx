import React, { useState, useEffect } from 'react';
import './FullWebApp.css';
import { LiturgicalEngineInterface, LiturgicalData } from '../../../../src/core/services/liturgicalEngineInterface';

interface JournalEntry {
  id: string;
  date: string;
  title: string;
  content: string;
  created_at: string;
}

type ViewMode = 'calendar' | 'mass' | 'office' | 'journal';

function ActualLiturgicalApp(): React.JSX.Element {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<ViewMode>('calendar');
  
  // Data states - ONLY real data from liturgical engine, no placeholders
  const [todayInfo, setTodayInfo] = useState<LiturgicalData | null>(null);
  const [tomorrowInfo, setTomorrowInfo] = useState<LiturgicalData | null>(null);
  const [currentWeekDays, setCurrentWeekDays] = useState<LiturgicalData[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  
  // Journal form
  const [journalTitle, setJournalTitle] = useState('');
  const [journalContent, setJournalContent] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function initializeApp() {
      try {
        console.log('ActualLiturgicalApp: Initializing REAL liturgical engine connection...');
        setIsLoading(true);

        if (isMounted) {
          const today = new Date();
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          
          const todayStr = today.toISOString().split('T')[0];
          const tomorrowStr = tomorrow.toISOString().split('T')[0];
          
          console.log(`Connecting to working liturgical CLI engine for ${todayStr}...`);
          
          // Get today's liturgical data from our WORKING CLI engine
          const todayData = await LiturgicalEngineInterface.getCalendarData(todayStr);
          if (todayData) {
            setTodayInfo(todayData);
            console.log(`Today (${todayStr}):`, todayData.calendar.celebration);
          }
          
          // Get tomorrow's liturgical data
          const tomorrowData = await LiturgicalEngineInterface.getCalendarData(tomorrowStr);
          if (tomorrowData) {
            setTomorrowInfo(tomorrowData);
            console.log(`Tomorrow (${tomorrowStr}):`, tomorrowData.calendar.celebration);
          }

          // Get the current week's liturgical information from CLI engine
          const weekStart = new Date(today);
          weekStart.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
          
          const weekDays: LiturgicalData[] = [];
          for (let i = 0; i < 7; i++) {
            const weekDay = new Date(weekStart);
            weekDay.setDate(weekStart.getDate() + i);
            const weekDayStr = weekDay.toISOString().split('T')[0];
            console.log(`Fetching liturgical data for ${weekDayStr}...`);
            const weekDayData = await LiturgicalEngineInterface.getCalendarData(weekDayStr);
            if (weekDayData) {
              weekDays.push(weekDayData);
            }
          }
          setCurrentWeekDays(weekDays);

          // Load journal entries from localStorage (real persistent storage for web)
          const savedEntries = localStorage.getItem('sanctissimissa_journal');
          if (savedEntries) {
            try {
              const entries = JSON.parse(savedEntries);
              setJournalEntries(entries);
            } catch (e) {
              console.error('Error loading saved journal entries:', e);
            }
          }

          setIsLoading(false);
          console.log('ActualLiturgicalApp: Initialization complete with REAL liturgical data');
        }
      } catch (e: any) {
        console.error('ActualLiturgicalApp: Initialization error:', e);
        if (isMounted) {
          setError(`Failed to load liturgical calendar: ${e.message}`);
          setIsLoading(false);
        }
      }
    }

    initializeApp();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleAddJournalEntry = () => {
    if (!journalTitle.trim() || !journalContent.trim()) return;

    const id = `journal_${Date.now()}`;
    const now = new Date().toISOString();
    const today = new Date().toISOString().split('T')[0];

    const newEntry: JournalEntry = {
      id,
      date: today,
      title: journalTitle.trim(),
      content: journalContent.trim(),
      created_at: now
    };

    const updatedEntries = [newEntry, ...journalEntries];
    setJournalEntries(updatedEntries);
    
    // Save to localStorage for persistence
    localStorage.setItem('sanctissimissa_journal', JSON.stringify(updatedEntries));
    
    setJournalTitle('');
    setJournalContent('');
  };

  if (isLoading) {
    return (
      <div className="container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading Traditional Latin Calendar from Divinum Officium...</p>
        <p className="loading-text">Calculating liturgical dates for {new Date().getFullYear()}...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <p className="error-text">Liturgical Calendar Error</p>
        <p className="error-text">{error}</p>
        <p className="loading-text">Unable to connect to Divinum Officium liturgical data source.</p>
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
      <div className="today-info">
        {todayInfo && (
          <div className="day-card">
            <h3>Today - {todayInfo.date}</h3>
            {todayInfo.primaryCelebrationName ? (
              <p className="celebration">{todayInfo.primaryCelebrationName}</p>
            ) : (
              <p className="celebration">Feria</p>
            )}
            {todayInfo.primaryCelebrationPath && (
              <p className="season">Path: {todayInfo.primaryCelebrationPath}</p>
            )}
            {todayInfo.allEntries && todayInfo.allEntries.length > 1 && (
              <div className="commemorations">
                <strong>Commemorations:</strong>
                <ul>
                  {todayInfo.allEntries.slice(1).map((entry, idx) => (
                    <li key={idx}>
                      {entry.name || entry.path}
                      {entry.rank && ` (${entry.rank})`}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {todayInfo.rawCalendarLine && (
              <details style={{marginTop: '1rem', fontSize: '0.8rem', color: '#6c757d'}}>
                <summary>Raw Calendar Data</summary>
                <pre>{todayInfo.rawCalendarLine}</pre>
              </details>
            )}
          </div>
        )}
        
        {tomorrowInfo && (
          <div className="day-card">
            <h3>Tomorrow - {tomorrowInfo.date}</h3>
            {tomorrowInfo.primaryCelebrationName ? (
              <p className="celebration">{tomorrowInfo.primaryCelebrationName}</p>
            ) : (
              <p className="celebration">Feria</p>
            )}
            {tomorrowInfo.primaryCelebrationPath && (
              <p className="season">Path: {tomorrowInfo.primaryCelebrationPath}</p>
            )}
          </div>
        )}
      </div>

      <div className="calendar-list">
        <h3>Current Week</h3>
        {currentWeekDays.length > 0 ? (
          <div className="day-list">
            {currentWeekDays.map((day) => (
              <div key={day.date} className="day-item">
                <span className="date">{day.date}</span>
                <span className="celebration">
                  {day.primaryCelebrationName || 'Feria'}
                </span>
                <span className="season">
                  {day.primaryCelebrationPath || ''}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-data">Unable to calculate current week liturgical data.</p>
        )}
      </div>
    </div>
  );

  const renderMassView = () => (
    <div className="view-content">
      <h2>Holy Mass - {todayInfo?.date || 'Today'}</h2>
      {todayInfo?.primaryCelebrationName && (
        <h3 className="celebration-title">{todayInfo.primaryCelebrationName}</h3>
      )}
      
      <div className="no-data">
        <p><strong>Mass Texts:</strong> Ready to connect to DataManager SQLite database.</p>
        <p>DataManager.getMassTextsForDate() will query pre-populated SQLite content.</p>
        <p>Content matches exactly what divinumofficium.com generates for this date.</p>
        <p>Includes: Introitus, Kyrie, Gloria, Collect, Epistle, Gradual, Gospel, Credo, Offertory, Secret, Preface, Canon, Communion, and Postcommunion.</p>
      </div>
    </div>
  );

  const renderOfficeView = () => (
    <div className="view-content">
      <h2>Divine Office - {todayInfo?.date || 'Today'}</h2>
      {todayInfo?.primaryCelebrationName && (
        <h3 className="celebration-title">{todayInfo.primaryCelebrationName}</h3>
      )}
      
      <div className="no-data">
        <p><strong>Office Texts:</strong> Ready to connect to DataManager SQLite database.</p>
        <p>DataManager.getOfficeTextsForDate() will query pre-populated SQLite content.</p>
        <p>Content matches exactly what divinumofficium.com generates for this date.</p>
        <p>Hours included: Matutinum, Laudes, Prima, Tertia, Sexta, Nona, Vespera, Completorium.</p>
      </div>
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
          <p className="no-entries">Start your spiritual journal! Add reflections on today's liturgy and prayers.</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="app">
      <div className="header">
        <h1>SanctissiMissa</h1>
        <p>Traditional Latin Liturgical Companion - Live Calendar from Divinum Officium</p>
      </div>
      
      {renderNavigation()}
      
      {currentView === 'calendar' && renderCalendarView()}
      {currentView === 'mass' && renderMassView()}
      {currentView === 'office' && renderOfficeView()}
      {currentView === 'journal' && renderJournalView()}
      
      <div className="footer">
        <p>Today: {todayInfo?.primaryCelebrationName || 'Feria'} | Tomorrow: {tomorrowInfo?.primaryCelebrationName || 'Feria'}</p>
        <p>Calendar: ✅ Live | Mass Texts: 🔧 Pending | Office: 🔧 Pending | Journal: ✅ Working ({journalEntries.length} entries)</p>
      </div>
    </div>
  );
}

export default ActualLiturgicalApp;