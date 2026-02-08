/**
 * Liturgical Calendar Component - Interactive calendar for browsing liturgical dates
 * Copyright (C) 2025 Robin L. M. Cheung, MBA. All rights reserved.
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LiturgicalEngineInterface, LiturgicalData } from '../platforms/web/liturgicalEngineInterface.web';

interface LiturgicalDay {
  date: string;
  celebration: string;
  rank: number;
  color: string;
  season: string;
  commemorations?: string[];
  cached?: boolean;
  cacheExpiry?: string;
  hasGeneratedMass?: boolean;
  hasGeneratedOffice?: boolean;
}

interface LiturgicalCalendarProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  onGenerateMass: (date: string) => void;
  onGenerateOffice: (date: string, hour: string) => void;
  onClearCache?: () => void;
  onClearDateCache?: (date: string) => void;
}

export const LiturgicalCalendar: React.FC<LiturgicalCalendarProps> = ({
  selectedDate,
  onDateChange,
  onGenerateMass,
  onGenerateOffice,
  onClearCache,
  onClearDateCache
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [liturgicalDays, setLiturgicalDays] = useState<{ [date: string]: LiturgicalDay }>({});
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [cacheStats, setCacheStats] = useState({ totalEntries: 0, totalSize: 0 });
  const [showCacheInfo, setShowCacheInfo] = useState(false);

  useEffect(() => {
    loadLiturgicalData();
  }, [currentMonth]);

  const loadLiturgicalData = async () => {
    // Fetch real liturgical data from the working CLI engine
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const realData: { [date: string]: LiturgicalDay } = {};

    // Get days in month
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Fetch liturgical data for each day
    for (let day = 1; day <= daysInMonth; day++) {
      const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      
      try {
        const liturgicalData: LiturgicalData | null = await LiturgicalEngineInterface.getCalendarData(date);
        
        if (liturgicalData && liturgicalData.calendar) {
          realData[date] = {
            date,
            celebration: liturgicalData.calendar.celebration || 'Feria',
            rank: liturgicalData.calendar.rank || 1.0,
            color: liturgicalData.calendar.color || 'green',
            season: liturgicalData.calendar.season || 'per annum',
            commemorations: liturgicalData.calendar.commemorations || [],
            cached: liturgicalData.cached || false,
            cacheExpiry: liturgicalData.cacheExpiry,
            hasGeneratedMass: !!liturgicalData.mass && Object.keys(liturgicalData.mass).length > 0,
            hasGeneratedOffice: !!liturgicalData.office && Object.keys(liturgicalData.office).length > 0
          };
        } else {
          // Fallback for dates without data
          realData[date] = {
            date,
            celebration: 'Feria',
            rank: 1.0,
            color: 'green',
            season: 'per annum'
          };
        }
      } catch (error) {
        console.error(`Failed to fetch liturgical data for ${date}:`, error);
        // Fallback on error
        realData[date] = {
          date,
          celebration: 'Feria',
          rank: 1.0,
          color: 'green',
          season: 'per annum'
        };
      }
    }

    setLiturgicalDays(realData);
    
    // Update cache stats from real data
    const cachedCount = Object.values(realData).filter(day => day.cached).length;
    setCacheStats({
      totalEntries: cachedCount,
      totalSize: cachedCount * 24 // Approximate size calculation
    });
  };

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  };

  const getCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(firstDay.getDate() - firstDay.getDay()); // Start on Sunday

    const days = [];
    const current = new Date(startDate);

    while (current <= lastDay || current.getDay() !== 0) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return days;
  };

  const getDayStyle = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    const liturgicalDay = liturgicalDays[dateString];
    const isSelected = dateString === selectedDate;
    const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
    const isToday = dateString === new Date().toISOString().split('T')[0];

    let backgroundColor = 'transparent';
    if (isSelected) {
      backgroundColor = '#3498db';
    } else if (isToday) {
      backgroundColor = '#e3f2fd';
    } else if (liturgicalDay?.rank > 5) {
      backgroundColor = '#fff3e0'; // High rank feasts
    } else if (liturgicalDay?.color === 'red') {
      backgroundColor = '#ffebee'; // Martyrs
    }

    return {
      ...styles.calendarDay,
      backgroundColor,
      opacity: isCurrentMonth ? 1 : 0.3,
    };
  };

  const getTextColor = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    const isSelected = dateString === selectedDate;
    return isSelected ? 'white' : '#2c3e50';
  };

  const changeMonth = (increment: number) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + increment);
    setCurrentMonth(newMonth);
  };

  const selectDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    onDateChange(dateString);
  };

  const officeHours = [
    'Matutinum', 'Laudes', 'Prima', 'Tertia', 
    'Sexta', 'Nona', 'Vespera', 'Completorium'
  ];

  const renderCalendarView = () => (
    <View style={styles.calendarContainer}>
      {/* Month Navigation */}
      <View style={styles.monthHeader}>
        <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.navButton}>
          <Text style={styles.navText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.monthText}>{formatMonthYear(currentMonth)}</Text>
        <TouchableOpacity onPress={() => changeMonth(1)} style={styles.navButton}>
          <Text style={styles.navText}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Day Headers */}
      <View style={styles.dayHeaders}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <Text key={day} style={styles.dayHeader}>{day}</Text>
        ))}
      </View>

      {/* Calendar Grid */}
      <View style={styles.calendarGrid}>
        {getCalendarDays().map((date, index) => {
          const dateString = date.toISOString().split('T')[0];
          const liturgicalDay = liturgicalDays[dateString];
          
          return (
            <TouchableOpacity
              key={index}
              style={getDayStyle(date)}
              onPress={() => selectDate(date)}
            >
              <Text style={[styles.dayNumber, { color: getTextColor(date) }]}>
                {date.getDate()}
              </Text>
              
              {/* Cache and generation indicators */}
              <View style={styles.indicators}>
                {liturgicalDay?.cached && (
                  <View style={styles.cacheIndicator} />
                )}
                {liturgicalDay?.hasGeneratedMass && (
                  <View style={styles.massIndicator} />
                )}
                {liturgicalDay?.hasGeneratedOffice && (
                  <View style={styles.officeIndicator} />
                )}
                {liturgicalDay && liturgicalDay.rank > 3 && (
                  <View style={styles.feastIndicator} />
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const renderSelectedDayInfo = () => {
    const liturgicalDay = liturgicalDays[selectedDate];
    if (!liturgicalDay) return null;

    return (
      <View style={styles.selectedDayInfo}>
        <Text style={styles.selectedDate}>
          {new Date(selectedDate).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </Text>
        <Text style={styles.celebration}>{liturgicalDay.celebration}</Text>
        <Text style={styles.details}>
          Rank: {liturgicalDay.rank} • Color: {liturgicalDay.color} • Season: {liturgicalDay.season}
        </Text>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => onGenerateMass(selectedDate)}
          >
            <Text style={styles.actionButtonText}>📖 Generate Mass</Text>
          </TouchableOpacity>

          <View style={styles.officeButtons}>
            <Text style={styles.officeTitle}>Divine Office:</Text>
            <View style={styles.officeGrid}>
              {officeHours.map(hour => (
                <TouchableOpacity
                  key={hour}
                  style={styles.officeButton}
                  onPress={() => onGenerateOffice(selectedDate, hour)}
                >
                  <Text style={styles.officeButtonText}>{hour}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity style={styles.exportButton}>
            <Text style={styles.exportButtonText}>🖨️ Export for Print</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Liturgical Calendar</Text>
        <Text style={styles.subtitle}>1962 Roman Missal & Breviary</Text>
        
        <View style={styles.viewToggle}>
          <TouchableOpacity 
            style={[styles.toggleButton, viewMode === 'calendar' && styles.activeToggle]}
            onPress={() => setViewMode('calendar')}
          >
            <Text style={styles.toggleText}>Calendar</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.toggleButton, viewMode === 'list' && styles.activeToggle]}
            onPress={() => setViewMode('list')}
          >
            <Text style={styles.toggleText}>List</Text>
          </TouchableOpacity>
        </View>
      </View>

      {viewMode === 'calendar' ? renderCalendarView() : (
        <View style={styles.listView}>
          <Text style={styles.listTitle}>Upcoming Feasts & Celebrations</Text>
          {/* List view would show upcoming important liturgical days */}
        </View>
      )}

      {renderSelectedDayInfo()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 16,
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 4,
  },
  toggleButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  activeToggle: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleText: {
    fontSize: 14,
    color: '#6c757d',
  },
  calendarContainer: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    padding: 16,
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  navButton: {
    padding: 8,
  },
  navText: {
    fontSize: 24,
    color: '#3498db',
    fontWeight: 'bold',
  },
  monthText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
  },
  dayHeaders: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dayHeader: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    color: '#6c757d',
    fontWeight: '600',
    paddingVertical: 8,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDay: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginVertical: 2,
    position: 'relative',
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: '500',
  },
  feastIndicator: {
    position: 'absolute',
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#e74c3c',
  },
  selectedDayInfo: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    padding: 20,
  },
  selectedDate: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  celebration: {
    fontSize: 16,
    color: '#8e44ad',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  details: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 20,
  },
  actionButtons: {
    gap: 16,
  },
  actionButton: {
    backgroundColor: '#3498db',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  officeButtons: {
    gap: 8,
  },
  officeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  officeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  officeButton: {
    backgroundColor: '#8e44ad',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: '22%',
    alignItems: 'center',
  },
  officeButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  exportButton: {
    backgroundColor: '#27ae60',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  exportButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  listView: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    padding: 20,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
});