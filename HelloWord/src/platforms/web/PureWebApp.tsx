import React, { useState, useEffect } from 'react';
import './PureWebApp.css';

// Define a simple type for the calendar day item we expect from the DB
interface CalendarDayItem {
  date: string;
  celebration: string | null;
}

function PureWebApp(): React.JSX.Element {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [calendarDays, setCalendarDays] = useState<CalendarDayItem[]>([]);

  useEffect(() => {
    let isMounted = true;

    async function initializeApp() {
      try {
        console.log('PureWebApp.tsx: Initializing web application...');
        
        // Mock data for now since we can't import React Native modules
        const mockData: CalendarDayItem[] = [
          { date: '2024-01-01', celebration: 'Circumcision of Our Lord' },
          { date: '2024-01-06', celebration: 'Epiphany of Our Lord' },
          { date: '2024-01-13', celebration: 'Baptism of Our Lord' },
          { date: '2024-01-20', celebration: 'St. Sebastian, Martyr' },
          { date: '2024-01-21', celebration: 'St. Agnes, Virgin and Martyr' },
          { date: '2024-01-22', celebration: 'St. Vincent, Deacon and Martyr' },
          { date: '2024-01-24', celebration: 'St. Timothy, Bishop and Martyr' },
          { date: '2024-01-25', celebration: 'Conversion of St. Paul, Apostle' },
          { date: '2024-01-28', celebration: 'St. Peter Nolasco, Confessor' },
          { date: '2024-01-31', celebration: 'St. John Bosco, Confessor' },
        ];

        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate loading

        if (isMounted) {
          setCalendarDays(mockData);
          setIsLoading(false);
        }
      } catch (e: any) {
        console.error('PureWebApp.tsx: Initialization error:', e);
        if (isMounted) {
          setError(e.message || 'An unexpected error occurred during initialization.');
          setIsLoading(false);
        }
      }
    }

    initializeApp();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading Database and Initial Data...</p>
        <p className="loading-text">This may take a few minutes on first run.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <p className="error-text">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="header">
        <h1>SanctissiMissa - Liturgical Calendar</h1>
        <p>Traditional Latin Mass Calendar (1962 Missal)</p>
      </div>
      
      <div className="calendar-list">
        {calendarDays.length === 0 && !isLoading ? (
          <div className="container">
            <p>No calendar data found. Database might be empty or import failed.</p>
          </div>
        ) : (
          <div className="day-list">
            {calendarDays.map((item) => (
              <div key={item.date} className="day-item">
                <span className="date">{item.date}</span>
                <span className="celebration">{item.celebration || 'Feria'}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="footer">
        <p>Web Version - React + Vite</p>
        <p>Status: ✅ Build System Operational</p>
      </div>
    </div>
  );
}

export default PureWebApp;