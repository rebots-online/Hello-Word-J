import React, { useState, useEffect } from 'react';
import './FullWebApp.css';
import { LiturgicalEngineInterface, LiturgicalData } from '@core/services/liturgicalEngineInterface.web';

const VERSION = '0.2.0';
const BUILD_NUMBER = Math.floor(Date.now() / 60000) % 100000;
const COPYRIGHT = 'Copyright (C) 2025 Robin L. M. Cheung, MBA. All rights reserved.';

interface JournalEntry {
  id: string;
  date: string;
  title: string;
  content: string;
  created_at: string;
}

type ViewMode = 'calendar' | 'mass' | 'office' | 'journal' | 'settings';

// Material icon helper
const Icon = ({ name, className = '' }: { name: string; className?: string }) => (
  <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

function ActualLiturgicalApp(): React.JSX.Element {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<ViewMode>('calendar');
  const [todayInfo, setTodayInfo] = useState<LiturgicalData | null>(null);
  const [tomorrowInfo, setTomorrowInfo] = useState<LiturgicalData | null>(null);
  const [currentWeekDays, setCurrentWeekDays] = useState<LiturgicalData[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [journalTitle, setJournalTitle] = useState('');
  const [journalContent, setJournalContent] = useState('');
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function initializeApp() {
      try {
        setIsLoading(true);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const todayStr = today.toISOString().split('T')[0];
        const tomorrowStr = tomorrow.toISOString().split('T')[0];

        const todayData = await LiturgicalEngineInterface.getCalendarData(todayStr);
        if (isMounted && todayData) setTodayInfo(todayData);

        const tomorrowData = await LiturgicalEngineInterface.getCalendarData(tomorrowStr);
        if (isMounted && tomorrowData) setTomorrowInfo(tomorrowData);

        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        const weekDays: LiturgicalData[] = [];
        for (let i = 0; i < 7; i++) {
          const wd = new Date(weekStart);
          wd.setDate(weekStart.getDate() + i);
          const data = await LiturgicalEngineInterface.getCalendarData(wd.toISOString().split('T')[0]);
          if (data) weekDays.push(data);
        }
        if (isMounted) setCurrentWeekDays(weekDays);

        const saved = localStorage.getItem('sanctissimissa_journal');
        if (saved) try { setJournalEntries(JSON.parse(saved)); } catch {}

        if (isMounted) setIsLoading(false);
      } catch (e: any) {
        if (isMounted) { setError(e.message); setIsLoading(false); }
      }
    }
    initializeApp();
    return () => { isMounted = false; };
  }, []);

  const handleAddJournalEntry = () => {
    if (!journalTitle.trim() || !journalContent.trim()) return;
    const newEntry: JournalEntry = {
      id: `journal_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      title: journalTitle.trim(),
      content: journalContent.trim(),
      created_at: new Date().toISOString()
    };
    const updated = [newEntry, ...journalEntries];
    setJournalEntries(updated);
    localStorage.setItem('sanctissimissa_journal', JSON.stringify(updated));
    setJournalTitle('');
    setJournalContent('');
  };

  // ── Splash Screen ────────────────────────────────────────────────────────
  if (showSplash) {
    return (
      <div className="min-h-screen bg-background-dark flex flex-col items-center justify-center cursor-pointer relative overflow-hidden" onClick={() => setShowSplash(false)}>
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-liturgical-gold/5 rounded-full blur-[100px]" />
        <h1 className="font-display text-5xl md:text-6xl font-bold text-white mb-3 tracking-tight relative z-10">SanctissiMissa</h1>
        <p className="font-display text-lg text-liturgical-gold text-neon mb-8 italic relative z-10">Traditional Latin Liturgical Companion</p>
        <div className="text-center text-gray-500 text-xs space-y-1 relative z-10">
          <p>{COPYRIGHT}</p>
          <p>Version {VERSION} (Build {BUILD_NUMBER})</p>
        </div>
        <p className="mt-12 text-gray-600 text-sm animate-pulse relative z-10">Click anywhere to continue...</p>
      </div>
    );
  }

  // ── Loading ──────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-dark flex flex-col items-center justify-center">
        <div className="loading-spinner mb-4" />
        <p className="text-gray-400 text-sm">Loading Traditional Latin Calendar...</p>
        <p className="text-gray-600 text-xs mt-1">Calculating liturgical dates for {new Date().getFullYear()}</p>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen bg-background-dark flex flex-col items-center justify-center px-6">
        <Icon name="error" className="text-4xl text-red-400 mb-4" />
        <p className="text-red-400 text-lg font-bold mb-2">Liturgical Calendar Error</p>
        <p className="text-gray-400 text-sm text-center max-w-md">{error}</p>
      </div>
    );
  }

  // ── Mass section icon map ────────────────────────────────────────────────
  const massIcons: Record<string, string> = {
    introit: 'library_music', collect: 'folded_hands', epistle: 'menu_book',
    gradual: 'queue_music', gospel: 'auto_stories', offertory: 'volunteer_activism',
    secret: 'lock', communion: 'wine_bar', postcommunion: 'check_circle',
  };

  // ── Calendar View ────────────────────────────────────────────────────────
  const renderCalendarView = () => (
    <div className="px-6 py-6 space-y-6">
      {/* Today Card */}
      {todayInfo && (
        <div className="glass-panel rounded-xl p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-liturgical-gold/5 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2" />
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold tracking-[0.15em] text-liturgical-gold uppercase">Today</span>
            <span className="text-[10px] text-gray-500">{todayInfo.date}</span>
          </div>
          <h3 className="font-display text-xl font-bold text-white mb-2">{todayInfo.primaryCelebrationName || 'Feria'}</h3>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider bg-white/5 px-2 py-0.5 rounded">{todayInfo.calendar.season}</span>
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: todayInfo.calendar.color === 'white' ? '#f0f0f0' : todayInfo.calendar.color }} />
          </div>
          {todayInfo.allEntries && todayInfo.allEntries.length > 1 && (
            <div className="mt-3 pt-3 border-t border-white/10">
              <span className="text-[10px] text-gray-500 uppercase tracking-wider">Commemorations</span>
              {todayInfo.allEntries.slice(1).map((e, i) => (
                <p key={i} className="text-xs text-gray-400 mt-1">• {e.name || e.path}</p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tomorrow Card */}
      {tomorrowInfo && (
        <div className="bg-surface-dark/50 border border-white/5 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold tracking-[0.15em] text-gray-500 uppercase">Tomorrow</span>
            <span className="text-[10px] text-gray-600">{tomorrowInfo.date}</span>
          </div>
          <h4 className="font-display text-base text-white">{tomorrowInfo.primaryCelebrationName || 'Feria'}</h4>
        </div>
      )}

      {/* Week */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="h-px bg-gradient-to-r from-transparent via-liturgical-gold/30 to-transparent flex-1" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">This Week</h3>
          <div className="h-px bg-gradient-to-r from-transparent via-liturgical-gold/30 to-transparent flex-1" />
        </div>
        <div className="space-y-2">
          {currentWeekDays.map((day) => {
            const isToday = day.date === todayInfo?.date;
            return (
              <div key={day.date} className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${isToday ? 'bg-liturgical-gold/10 border border-liturgical-gold/20' : 'bg-surface-dark/30 border border-white/5 hover:bg-surface-dark/50'}`}>
                <span className={`text-xs font-mono w-20 ${isToday ? 'text-liturgical-gold font-bold' : 'text-gray-500'}`}>{day.date.slice(5)}</span>
                <span className={`text-sm flex-1 ${isToday ? 'text-white font-medium' : 'text-gray-300'}`}>{day.primaryCelebrationName || 'Feria'}</span>
                {isToday && <div className="w-2 h-2 rounded-full bg-liturgical-gold station-pulse" />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  // ── Mass View (Subway-style) ─────────────────────────────────────────────
  const renderMassView = () => {
    const massTexts = todayInfo?.massTexts || {};
    const sections = Object.entries(massTexts);

    return (
      <div className="px-6 py-6">
        <div className="text-center mb-6">
          <h2 className="font-display text-2xl font-bold text-white mb-1">Holy Mass</h2>
          <p className="text-liturgical-gold text-neon font-display italic">{todayInfo?.primaryCelebrationName || 'Feria'}</p>
          <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest">{todayInfo?.date}</p>
        </div>

        {sections.length > 0 ? (
          <div className="space-y-0 relative">
            {/* Subway line */}
            <div className="absolute left-[19px] top-6 bottom-6 w-[2px] bg-gradient-to-b from-liturgical-gold/40 via-liturgical-gold/20 to-transparent" />

            {sections.map(([section, content], idx) => {
              const icon = massIcons[section.toLowerCase()] || 'article';
              const isFirst = idx === 0;
              const isRubric = content.latin.startsWith('!') || content.latin.startsWith('V.');

              return (
                <div key={section} className="relative pl-12 pb-6 group">
                  {/* Station dot */}
                  <div className={`absolute left-0 top-1 w-10 h-10 rounded-full flex items-center justify-center z-10 transition-all ${
                    isFirst
                      ? 'bg-surface-dark border-2 border-liturgical-gold shadow-neon station-pulse'
                      : 'bg-surface-dark border border-white/20 group-hover:border-liturgical-gold'
                  }`}>
                    <Icon name={icon} className={`text-sm ${isFirst ? 'text-liturgical-gold' : 'text-gray-400 group-hover:text-liturgical-gold'}`} />
                  </div>

                  {/* Card */}
                  <div className="bg-surface-dark/50 border border-white/5 rounded-lg p-4 hover:bg-surface-dark transition-colors hover:border-liturgical-gold/30">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-white font-bold text-sm uppercase tracking-wider">{section}</h4>
                      {isRubric && <span className="text-[9px] text-liturgical-red uppercase tracking-wider border border-liturgical-red/30 px-1.5 py-0.5 rounded bg-liturgical-red/10">Rubric</span>}
                    </div>
                    <div className="font-display text-base text-white/90 leading-relaxed italic">
                      {content.latin.split('\n').slice(0, 6).map((line, i) => (
                        <p key={i} className={`mb-1 ${
                          line.startsWith('!') || line.startsWith('V.') || line.startsWith('R.')
                            ? 'text-liturgical-red text-sm not-italic'
                            : ''
                        }`}>
                          {line.replace(/^!/, '')}
                        </p>
                      ))}
                      {content.latin.split('\n').length > 6 && (
                        <p className="text-xs text-gray-500 not-italic mt-2">... ({content.latin.split('\n').length} lines total)</p>
                      )}
                    </div>
                    {content.english && (
                      <div className="mt-3 pt-3 border-t border-white/5">
                        <p className="text-xs text-gray-400 leading-relaxed">{content.english}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="glass-panel rounded-xl p-8 text-center">
            <Icon name="menu_book" className="text-4xl text-liturgical-gold/50 mb-3" />
            <p className="text-gray-400 text-sm">Mass texts loading from liturgical database...</p>
            <p className="text-gray-600 text-xs mt-1">5,924 sections available</p>
          </div>
        )}
      </div>
    );
  };

  // ── Office View ──────────────────────────────────────────────────────────
  const renderOfficeView = () => {
    const hours = ['Matutinum', 'Laudes', 'Prima', 'Tertia', 'Sexta', 'Nona', 'Vesperae', 'Completorium'];
    return (
      <div className="px-6 py-6">
        <div className="text-center mb-6">
          <h2 className="font-display text-2xl font-bold text-white mb-1">Divine Office</h2>
          <p className="text-liturgical-gold font-display italic">{todayInfo?.primaryCelebrationName || 'Feria'}</p>
        </div>
        <div className="space-y-3">
          {hours.map((hour, idx) => (
            <div key={hour} className="bg-surface-dark/50 border border-white/5 rounded-lg p-4 hover:border-liturgical-gold/30 transition-colors group cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-surface-highlight border border-white/10 flex items-center justify-center group-hover:border-liturgical-gold/50">
                  <span className="text-[10px] font-bold text-gray-500 group-hover:text-liturgical-gold">{idx + 1}</span>
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-medium text-sm">{hour}</h4>
                  <p className="text-[10px] text-gray-500">Coming soon</p>
                </div>
                <Icon name="chevron_right" className="text-gray-600 group-hover:text-liturgical-gold text-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ── Journal View ─────────────────────────────────────────────────────────
  const renderJournalView = () => (
    <div className="px-6 py-6 space-y-6">
      <h2 className="font-display text-2xl font-bold text-white">Spiritual Journal</h2>

      {/* Form */}
      <div className="glass-panel rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-bold text-liturgical-gold uppercase tracking-wider">New Entry</h3>
        <input
          type="text"
          placeholder="Entry title..."
          value={journalTitle}
          onChange={(e) => setJournalTitle(e.target.value)}
          className="w-full bg-surface-dark border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-liturgical-gold/50 transition-colors"
        />
        <textarea
          placeholder="Your reflection, prayer, or spiritual insight..."
          value={journalContent}
          onChange={(e) => setJournalContent(e.target.value)}
          rows={4}
          className="w-full bg-surface-dark border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-liturgical-gold/50 transition-colors resize-none"
        />
        <button
          onClick={handleAddJournalEntry}
          className="bg-liturgical-gold text-black font-bold text-sm px-6 py-2.5 rounded-lg shadow-neon hover:scale-[1.02] active:scale-95 transition-transform"
        >
          Add Entry
        </button>
      </div>

      {/* Entries */}
      <div>
        <h3 className="text-sm text-gray-500 mb-3">{journalEntries.length} entries</h3>
        {journalEntries.length > 0 ? (
          <div className="space-y-3">
            {journalEntries.map((entry) => (
              <div key={entry.id} className="bg-surface-dark/50 border border-white/5 rounded-lg p-4 border-l-2 border-l-liturgical-gold/50">
                <h4 className="text-white font-medium text-sm mb-1">{entry.title}</h4>
                <p className="text-[10px] text-gray-500 mb-2">{new Date(entry.created_at).toLocaleDateString()}</p>
                <p className="text-gray-400 text-sm leading-relaxed">{entry.content}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-600 text-sm italic">
            Start your spiritual journal...
          </div>
        )}
      </div>
    </div>
  );

  // ── Settings View ────────────────────────────────────────────────────────
  const renderSettingsView = () => (
    <div className="px-6 py-6 space-y-6">
      <h2 className="font-display text-2xl font-bold text-white">Settings</h2>

      <div className="glass-panel rounded-xl p-5">
        <h3 className="text-sm font-bold text-liturgical-gold uppercase tracking-wider mb-4">About</h3>
        <div className="space-y-2 text-sm">
          <p className="text-white font-display text-lg">SanctissiMissa</p>
          <p className="text-gray-400">Traditional Latin Liturgical Companion</p>
          <p className="text-gray-500 text-xs">Version {VERSION} (Build {BUILD_NUMBER})</p>
          <p className="text-gray-500 text-xs">{COPYRIGHT}</p>
          <p className="text-gray-500 text-xs">Target: 1962 Missal and Breviary (Extraordinary Form)</p>
        </div>
      </div>

      <div className="glass-panel rounded-xl p-5">
        <h3 className="text-sm font-bold text-liturgical-gold uppercase tracking-wider mb-4">Sancta Nocte Palette</h3>
        <div className="flex gap-4">
          {[
            { color: '#d4af37', label: 'Gold' },
            { color: '#05080f', label: 'Onyx' },
            { color: '#FF0000', label: 'Rubric' },
            { color: '#ffffff', label: 'Text' },
          ].map(({ color, label }) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <div className="w-10 h-10 rounded-full border border-white/20" style={{ backgroundColor: color }} />
              <span className="text-[10px] text-gray-500">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── Main Layout ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background-dark flex flex-col max-w-lg mx-auto border-x border-white/5 relative">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background-dark/95 backdrop-blur-md border-b border-white/10 px-4 py-3">
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-bold tracking-[0.2em] text-liturgical-gold uppercase">Sanctissimissa</span>
          <h1 className="text-white text-sm font-semibold">Traditional Latin Liturgy</h1>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto no-scrollbar pb-24">
        {currentView === 'calendar' && renderCalendarView()}
        {currentView === 'mass' && renderMassView()}
        {currentView === 'office' && renderOfficeView()}
        {currentView === 'journal' && renderJournalView()}
        {currentView === 'settings' && renderSettingsView()}
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg z-50 bg-background-dark/95 backdrop-blur-xl border-t border-white/10 pb-safe pt-2 pb-4">
        <div className="flex justify-around items-center">
          {([
            { view: 'calendar' as ViewMode, icon: 'calendar_month', label: 'Calendar' },
            { view: 'mass' as ViewMode, icon: 'menu_book', label: 'Missal' },
            { view: 'office' as ViewMode, icon: 'schedule', label: 'Office' },
            { view: 'journal' as ViewMode, icon: 'edit_note', label: 'Journal' },
            { view: 'settings' as ViewMode, icon: 'settings', label: 'Settings' },
          ]).map(({ view, icon, label }) => (
            <button
              key={view}
              onClick={() => setCurrentView(view)}
              className={`flex flex-col items-center justify-center gap-1 w-16 transition-colors ${
                currentView === view
                  ? 'text-liturgical-gold drop-shadow-[0_0_5px_rgba(212,175,55,0.5)]'
                  : 'text-gray-500 hover:text-liturgical-gold'
              }`}
            >
              <Icon name={icon} className="text-[24px]" />
              <span className={`text-[10px] ${currentView === view ? 'font-bold' : 'font-medium'}`}>{label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

export default ActualLiturgicalApp;