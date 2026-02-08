import React, { useState, useEffect } from 'react';
import './FullWebApp.css';
import { LiturgicalEngineInterface, LiturgicalData } from '@core/services/liturgicalEngineInterface.web';

// Version and build info per global-rules.md
const VERSION = '0.1.0';
const BUILD_NUMBER = Math.floor(Date.now() / 60000) % 100000; // Last 5 digits of epoch minutes
const COPYRIGHT = 'Copyright (C) 2025 Robin L. M. Cheung, MBA. All rights reserved.';

// Theme definitions per global-rules.md
const THEMES = {
  kinetic: { name: 'Kinetic', description: 'Colorful, dynamic, Gumroad-inspired' },
  brutalist: { name: 'Brutalist', description: 'Raw, honest, monospace aesthetic' },
  retro: { name: 'Retro', description: 'CRT terminal vibes with scanlines' },
  neumorphism: { name: 'Neumorphism', description: 'Soft shadows, extruded surfaces' },
  glassmorphism: { name: 'Glassmorphism', description: 'Frosted glass with depth' },
  y2k: { name: 'Y2K', description: 'Early 2000s web maximalism' },
  cyberpunk: { name: 'Cyberpunk', description: 'Neon-soaked dystopian future' },
  minimal: { name: 'Minimal', description: 'Clean Swiss design' },
} as const;

type ThemeMode = 'light' | 'dark' | 'system';
type ThemeName = keyof typeof THEMES;

interface JournalEntry {
  id: string;
  date: string;
  title: string;
  content: string;
  created_at: string;
}

type ViewMode = 'calendar' | 'mass' | 'office' | 'journal' | 'settings' | 'about';

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
  
  // Theme and settings per global-rules.md
  const [showSplash, setShowSplash] = useState(true);
  const [currentTheme, setCurrentTheme] = useState<ThemeName>('minimal');
  const [themeMode, setThemeMode] = useState<ThemeMode>('system');

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
          
          // Get today's liturgical data including Mass texts from our WORKING CLI engine
          const todayData = await LiturgicalEngineInterface.getCalendarData(todayStr);
          if (todayData) {
            // Add Mass texts to the today info for the UI
            const enhancedTodayData = {
              ...todayData,
              massTexts: todayData.mass?.texts || {},
              primaryCelebrationName: todayData.calendar?.celebration || 'Feria'
            };
            setTodayInfo(enhancedTodayData);
            console.log(`Today (${todayStr}):`, todayData.calendar.celebration);
            console.log(`Mass texts available:`, Object.keys(todayData.mass?.texts || {}).length);
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

  // Copyright splash screen per global-rules.md
  if (showSplash) {
    return (
      <div className="splash-screen" onClick={() => setShowSplash(false)}>
        <div className="splash-content">
          <h1>SanctissiMissa</h1>
          <p className="splash-subtitle">Traditional Latin Liturgical Companion</p>
          <div className="splash-copyright">
            <p>{COPYRIGHT}</p>
            <p>Version {VERSION} (Build {BUILD_NUMBER})</p>
          </div>
          <p className="splash-continue">Click anywhere to continue...</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading Traditional Latin Calendar from Divinum Officium...</p>
        <p className="loading-text">Calculating liturgical dates for {new Date().getFullYear()}...</p>
        <p className="version-text">v{VERSION} (Build {BUILD_NUMBER})</p>
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

  const [showMenu, setShowMenu] = useState<string | null>(null);

  const handleMenuClick = (menu: string) => {
    setShowMenu(showMenu === menu ? null : menu);
  };

  const renderMenuBar = () => (
    <div className="menu-bar">
      <div className="menu-item" onClick={() => handleMenuClick('file')}>
        <span>File</span>
        {showMenu === 'file' && (
          <div className="menu-dropdown">
            <div className="menu-option" onClick={() => window.print()}>Print...</div>
            <div className="menu-option" onClick={() => setCurrentView('settings')}>Preferences</div>
            <div className="menu-divider" />
            <div className="menu-option" onClick={() => window.location.reload()}>Exit</div>
          </div>
        )}
      </div>
      <div className="menu-item" onClick={() => handleMenuClick('edit')}>
        <span>Edit</span>
        {showMenu === 'edit' && (
          <div className="menu-dropdown">
            <div className="menu-option" onClick={() => setCurrentView('journal')}>New Journal Entry</div>
            <div className="menu-option" onClick={() => setJournalTitle('')}>Clear Journal Title</div>
            <div className="menu-option" onClick={() => setJournalContent('')}>Clear Journal Content</div>
          </div>
        )}
      </div>
      <div className="menu-item" onClick={() => handleMenuClick('view')}>
        <span>View</span>
        {showMenu === 'view' && (
          <div className="menu-dropdown">
            <div className="menu-option" onClick={() => setCurrentView('calendar')}>Calendar</div>
            <div className="menu-option" onClick={() => setCurrentView('mass')}>Holy Mass</div>
            <div className="menu-option" onClick={() => setCurrentView('office')}>Divine Office</div>
            <div className="menu-option" onClick={() => setCurrentView('journal')}>Journal</div>
            <div className="menu-divider" />
            <div className="menu-option" onClick={() => setCurrentView('settings')}>Settings</div>
          </div>
        )}
      </div>
      <div className="menu-item" onClick={() => handleMenuClick('help')}>
        <span>Help</span>
        {showMenu === 'help' && (
          <div className="menu-dropdown">
            <div className="menu-option" onClick={() => setCurrentView('about')}>About SanctissiMissa</div>
            <div className="menu-option" onClick={() => window.open('https://github.com/rebots-online/sanctissimissa', '_blank')}>Documentation</div>
            <div className="menu-option" onClick={() => alert(`Version ${VERSION} (Build ${BUILD_NUMBER})\n${COPYRIGHT}`)}>Version Info</div>
          </div>
        )}
      </div>
    </div>
  );

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
      <button 
        className={currentView === 'settings' ? 'nav-button active' : 'nav-button'}
        onClick={() => setCurrentView('settings')}
      >
        ⚙️ Settings
      </button>
    </nav>
  );

  const renderSettingsView = () => (
    <div className="view-content settings-view">
      <h2>Settings</h2>
      
      <div className="settings-section">
        <h3>Theme Mode</h3>
        <div className="theme-mode-selector">
          {(['light', 'dark', 'system'] as ThemeMode[]).map((mode) => (
            <button
              key={mode}
              className={themeMode === mode ? 'theme-button active' : 'theme-button'}
              onClick={() => setThemeMode(mode)}
            >
              {mode === 'light' ? '☀️' : mode === 'dark' ? '🌙' : '🖥️'} {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>
      </div>
      
      <div className="settings-section">
        <h3>Theme Style</h3>
        <div className="theme-grid">
          {(Object.keys(THEMES) as ThemeName[]).map((themeName) => (
            <button
              key={themeName}
              className={currentTheme === themeName ? 'theme-card active' : 'theme-card'}
              onClick={() => setCurrentTheme(themeName)}
            >
              <strong>{THEMES[themeName].name}</strong>
              <span>{THEMES[themeName].description}</span>
            </button>
          ))}
        </div>
      </div>
      
      <div className="settings-section about-section">
        <h3>About</h3>
        <p><strong>SanctissiMissa</strong> - Traditional Latin Liturgical Companion</p>
        <p>Version {VERSION} (Build {BUILD_NUMBER})</p>
        <p>{COPYRIGHT}</p>
        <p>Target: 1962 Missal and Breviary (Extraordinary Form)</p>
      </div>
    </div>
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
      
      {todayInfo?.massTexts && Object.keys(todayInfo.massTexts).length > 0 ? (
        <div className="mass-texts">
          <p className="mass-intro"><strong>Mass Texts from 4MB Database (5,924 sections)</strong></p>
          {Object.entries(todayInfo.massTexts).map(([section, content]) => (
            <div key={section} className="mass-section">
              <h4 className="section-title">{section}</h4>
              <div className="latin-text">
                {content.latin.split('\n').map((line, idx) => (
                  <p key={idx} className={line.startsWith('!') || line.startsWith('V.') || line.startsWith('R.') ? 'rubric' : 'prayer'}>
                    {line}
                  </p>
                ))}
              </div>
              {content.english && (
                <div className="english-text">
                  <p className="translation">{content.english}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="loading-mass">
          <p>Loading Mass texts from liturgical database...</p>
        </div>
      )}
    </div>
  );

  const renderOfficeView = () => (
    <div className="view-content">
      <h2>Divine Office - {todayInfo?.date || 'Today'}</h2>
      {todayInfo?.primaryCelebrationName && (
        <h3 className="celebration-title">{todayInfo.primaryCelebrationName}</h3>
      )}
      
      <div className="office-notice">
        <p><strong>Divine Office:</strong> Office text extraction will be implemented next.</p>
        <p>The 4MB database contains all Office texts ready for extraction.</p>
        <p>Hours: Matutinum, Laudes, Prima, Tertia, Sexta, Nona, Vespera, Completorium</p>
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
      {renderMenuBar()}
      <div className="header">
        <h1>SanctissiMissa</h1>
        <p>Traditional Latin Liturgical Companion - Live Calendar from Divinum Officium</p>
      </div>
      
      {renderNavigation()}
      
      {currentView === 'calendar' && renderCalendarView()}
      {currentView === 'mass' && renderMassView()}
      {currentView === 'office' && renderOfficeView()}
      {currentView === 'journal' && renderJournalView()}
      {currentView === 'settings' && renderSettingsView()}
      
      <div className="footer">
        <p>Today: {todayInfo?.primaryCelebrationName || 'Feria'} | Tomorrow: {tomorrowInfo?.primaryCelebrationName || 'Feria'}</p>
        <p>Calendar: ✅ Live | Mass Texts: 🔧 Pending | Office: 🔧 Pending | Journal: ✅ Working ({journalEntries.length} entries)</p>
        <p className="version-footer">v{VERSION} (Build {BUILD_NUMBER})</p>
      </div>
    </div>
  );
}

export default ActualLiturgicalApp;