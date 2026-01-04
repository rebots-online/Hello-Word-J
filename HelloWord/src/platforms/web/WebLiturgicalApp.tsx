import React, { useState, useEffect } from 'react';
import './FullWebApp.css';

// Type definitions matching the actual system
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

interface VoiceNote {
  id: string;
  date: string;
  title: string;
  filePath: string;
  duration: number;
  transcription?: string;
}

type ViewMode = 'calendar' | 'mass' | 'office' | 'journal';

function WebLiturgicalApp(): React.JSX.Element {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<ViewMode>('calendar');
  
  // Data states
  const [calendarDays, setCalendarDays] = useState<CalendarDayItem[]>([]);
  const [todayInfo, setTodayInfo] = useState<LiturgicalDay | null>(null);
  const [tomorrowInfo, setTomorrowInfo] = useState<LiturgicalDay | null>(null);
  const [massTexts, setMassTexts] = useState<MassText[]>([]);
  const [officeTexts, setOfficeTexts] = useState<OfficeText[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [voiceNotes, setVoiceNotes] = useState<VoiceNote[]>([]);
  
  // Journal form
  const [journalTitle, setJournalTitle] = useState('');
  const [journalContent, setJournalContent] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function initializeApp() {
      try {
        console.log('WebLiturgicalApp: Initializing liturgical application...');
        setIsLoading(true);
        
        // Simulate loading time for database initialization
        await new Promise(resolve => setTimeout(resolve, 2000));

        if (isMounted) {
          const today = new Date();
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          
          const todayStr = today.toISOString().split('T')[0];
          const tomorrowStr = tomorrow.toISOString().split('T')[0];

          // For now, show that the system is ready but no data loaded yet
          // This will be replaced with actual database queries when services are connected
          setTodayInfo({
            date: todayStr,
            celebration: 'Loading from liturgical database...',
            season: '',
            rank: 0,
            color: '',
            commemorations: []
          });

          setTomorrowInfo({
            date: tomorrowStr,
            celebration: 'Loading from liturgical database...',
            season: '',
            rank: 0,
            color: '',
            commemorations: []
          });

          setIsLoading(false);
        }
      } catch (e: any) {
        console.error('WebLiturgicalApp: Initialization error:', e);
        if (isMounted) {
          setError(e.message || 'Failed to initialize liturgical database connection.');
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

    setJournalEntries(prev => [newEntry, ...prev]);
    setJournalTitle('');
    setJournalContent('');
    
    console.log('Journal entry added (stored locally for now):', newEntry);
  };

  const startVoiceRecording = async () => {
    try {
      setIsRecording(true);
      console.log('Voice recording would start here - requires MediaRecorder API implementation');
      
      // Voice recording requires MediaRecorder API - to be implemented with real audio capture
      console.log('Voice recording started - awaiting MediaRecorder implementation');
      // TODO: Implement real MediaRecorder capture when audio permissions are available
      setIsRecording(false);
    } catch (error) {
      console.error('Error starting voice recording:', error);
      setIsRecording(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Connecting to Liturgical Database...</p>
        <p className="loading-text">Loading Traditional Latin Mass Calendar & Texts...</p>
        <p className="loading-text">Initializing Divine Office...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <p className="error-text">Database Connection Error</p>
        <p className="error-text">{error}</p>
        <p className="loading-text">The liturgical services need to be properly connected to display real Mass and Office texts.</p>
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
        <div className="day-card">
          <h3>Today - {todayInfo?.date}</h3>
          <p className="celebration">{todayInfo?.celebration}</p>
          {todayInfo?.season && <p className="season">Season: {todayInfo.season}</p>}
          {todayInfo?.rank !== undefined && <p className="rank">Rank: {todayInfo.rank} | Color: {todayInfo.color}</p>}
          {todayInfo?.commemorations && todayInfo.commemorations.length > 0 && (
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
        
        <div className="day-card">
          <h3>Tomorrow - {tomorrowInfo?.date}</h3>
          <p className="celebration">{tomorrowInfo?.celebration}</p>
          {tomorrowInfo?.season && <p className="season">Season: {tomorrowInfo.season}</p>}
          {tomorrowInfo?.rank !== undefined && <p className="rank">Rank: {tomorrowInfo.rank} | Color: {tomorrowInfo.color}</p>}
        </div>
      </div>

      <div className="calendar-list">
        <h3>Liturgical Calendar</h3>
        {calendarDays.length > 0 ? (
          <div className="day-list">
            {calendarDays.map((item) => (
              <div key={item.date} className="day-item">
                <span className="date">{item.date}</span>
                <span className="celebration">{item.celebration}</span>
                <span className="season">{item.season}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-data">
            <p>Liturgical calendar data will appear here when database services are connected.</p>
            <p>This will show the traditional 1962 calendar with proper seasons, feasts, and commemorations.</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderMassView = () => (
    <div className="view-content">
      <h2>Holy Mass - {todayInfo?.date}</h2>
      <h3 className="celebration-title">{todayInfo?.celebration}</h3>
      
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
        <div className="no-data">
          <p>Mass texts will appear here when connected to the liturgical database.</p>
          <p>This will include: Introitus, Kyrie, Gloria, Collect, Epistle, Gradual, Gospel, Credo, Offertory, Secret, Preface, Canon, Communion, and Postcommunion.</p>
          <p>All texts will be provided in both Latin and English according to the 1962 Missale Romanum.</p>
        </div>
      )}
    </div>
  );

  const renderOfficeView = () => (
    <div className="view-content">
      <h2>Divine Office - {todayInfo?.date}</h2>
      <h3 className="celebration-title">{todayInfo?.celebration}</h3>
      
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
        <div className="no-data">
          <p>Divine Office texts will appear here when connected to the liturgical database.</p>
          <p>This will include all eight canonical hours:</p>
          <ul style={{textAlign: 'left', maxWidth: '500px', margin: '1rem auto'}}>
            <li><strong>Matutinum</strong> - Night prayer with lessons</li>
            <li><strong>Laudes</strong> - Morning prayer</li>
            <li><strong>Prima</strong> - First hour (6 AM)</li>
            <li><strong>Tertia</strong> - Third hour (9 AM)</li>
            <li><strong>Sexta</strong> - Sixth hour (12 PM)</li>
            <li><strong>Nona</strong> - Ninth hour (3 PM)</li>
            <li><strong>Vespera</strong> - Evening prayer</li>
            <li><strong>Completorium</strong> - Night prayer</li>
          </ul>
          <p>All texts according to the 1962 Breviarium Romanum.</p>
        </div>
      )}
    </div>
  );

  const renderJournalView = () => (
    <div className="view-content">
      <h2>Spiritual Journal & Voice Notes</h2>
      
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
        <div className="journal-actions">
          <button onClick={handleAddJournalEntry} className="add-entry-button">
            Add Entry
          </button>
          <button 
            onClick={startVoiceRecording} 
            className={`voice-button ${isRecording ? 'recording' : ''}`}
            disabled={isRecording}
          >
            🎤 {isRecording ? 'Recording...' : 'Voice Note'}
          </button>
        </div>
      </div>

      <div className="journal-entries">
        <h3>Recent Entries</h3>
        {journalEntries.length > 0 ? (
          journalEntries.map((entry) => (
            <div key={entry.id} className="journal-entry">
              <h4>{entry.title}</h4>
              <p className="entry-date">{new Date(entry.created_at).toLocaleDateString()}</p>
              <p className="entry-content">{entry.content}</p>
            </div>
          ))
        ) : (
          <p className="no-entries">Start writing your spiritual journey! Your reflections on the daily Mass readings, Divine Office, and personal prayers will be stored here.</p>
        )}
      </div>

      <div className="voice-notes">
        <h3>Voice Notes</h3>
        {voiceNotes.length > 0 ? (
          voiceNotes.map((note) => (
            <div key={note.id} className="voice-note">
              <h4>{note.title}</h4>
              <p className="note-date">{note.date}</p>
              <p className="note-duration">Duration: {note.duration}s</p>
              {note.transcription && (
                <p className="transcription">{note.transcription}</p>
              )}
            </div>
          ))
        ) : (
          <p className="no-notes">Record voice notes for quick spiritual insights and prayer requests. Audio will be transcribed automatically.</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="app">
      <div className="header">
        <h1>SanctissiMissa</h1>
        <p>Traditional Latin Liturgical Companion (1962 Missale & Breviarium)</p>
      </div>
      
      {renderNavigation()}
      
      {currentView === 'calendar' && renderCalendarView()}
      {currentView === 'mass' && renderMassView()}
      {currentView === 'office' && renderOfficeView()}
      {currentView === 'journal' && renderJournalView()}
      
      <div className="footer">
        <p>Web Version - React + Vite + SQL.js</p>
        <p>Status: 🔧 Ready for Liturgical Database Connection</p>
      </div>
    </div>
  );
}

export default WebLiturgicalApp;