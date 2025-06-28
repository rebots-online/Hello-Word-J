import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';

interface CalendarDay {
  date: string;
  dayNumber: number;
  celebration?: string;
  rank?: number;
  cached: boolean;
  lastGenerated?: Date;
}

interface CalendarDashboardProps {
  currentDate?: Date;
  onDateSelect?: (date: string) => void;
  onGenerateRange?: (startDate: string, endDate: string) => void;
}

export const CalendarDashboard: React.FC<CalendarDashboardProps> = ({
  currentDate = new Date(),
  onDateSelect,
  onGenerateRange
}) => {
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [calendarData, setCalendarData] = useState<CalendarDay[]>([]);
  const [cacheStats, setCacheStats] = useState({
    totalCached: 0,
    totalSize: 0,
    lastUpdate: new Date()
  });

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  useEffect(() => {
    loadCalendarData();
    loadCacheStats();
  }, [selectedMonth, selectedYear]);

  const loadCalendarData = async () => {
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const firstDayOfWeek = new Date(selectedYear, selectedMonth, 1).getDay();
    
    const days: CalendarDay[] = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push({
        date: '',
        dayNumber: 0,
        cached: false
      });
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${selectedYear}-${(selectedMonth + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      
      // Check cache status and liturgical data
      const cached = await checkCacheStatus(dateStr);
      const liturgicalInfo = await getLiturgicalInfo(dateStr);
      
      days.push({
        date: dateStr,
        dayNumber: day,
        celebration: liturgicalInfo?.celebration,
        rank: liturgicalInfo?.rank,
        cached,
        lastGenerated: cached ? await getLastGenerated(dateStr) : undefined
      });
    }
    
    setCalendarData(days);
  };

  const loadCacheStats = async () => {
    try {
      // Check localStorage for cached liturgical data
      const cacheKeys = Object.keys(localStorage).filter(key => 
        key.startsWith('liturgical-') || key.startsWith('mass-') || key.startsWith('office-')
      );
      
      let totalSize = 0;
      let lastUpdate = new Date(0);
      
      cacheKeys.forEach(key => {
        const data = localStorage.getItem(key);
        if (data) {
          totalSize += data.length;
          try {
            const parsed = JSON.parse(data);
            if (parsed.timestamp) {
              const timestamp = new Date(parsed.timestamp);
              if (timestamp > lastUpdate) {
                lastUpdate = timestamp;
              }
            }
          } catch (e) {
            // Non-JSON data, estimate size only
          }
        }
      });
      
      setCacheStats({
        totalCached: cacheKeys.length,
        totalSize: Math.round(totalSize / 1024), // KB
        lastUpdate
      });
    } catch (error) {
      console.error('Error loading cache stats:', error);
    }
  };

  const checkCacheStatus = async (date: string): Promise<boolean> => {
    // Check if liturgical data exists in localStorage or database
    const massKey = `mass-${date}`;
    const officeKey = `office-${date}`;
    
    return !!(localStorage.getItem(massKey) || localStorage.getItem(officeKey));
  };

  const getLiturgicalInfo = async (date: string) => {
    try {
      // Try to get from cache first
      const cached = localStorage.getItem(`liturgical-${date}`);
      if (cached) {
        return JSON.parse(cached);
      }
      
      // If not cached, could make a lightweight query to get basic info
      // For now, return null to avoid heavy calculations
      return null;
    } catch (error) {
      return null;
    }
  };

  const getLastGenerated = async (date: string): Promise<Date | undefined> => {
    try {
      const cached = localStorage.getItem(`liturgical-${date}`);
      if (cached) {
        const data = JSON.parse(cached);
        return data.timestamp ? new Date(data.timestamp) : undefined;
      }
    } catch (error) {
      return undefined;
    }
  };

  const getCellStyle = (day: CalendarDay) => {
    if (!day.date) return styles.emptyCell;
    
    let baseStyle = styles.dayCell;
    
    if (day.cached) {
      baseStyle = { ...baseStyle, ...styles.cachedDay };
    } else {
      baseStyle = { ...baseStyle, ...styles.uncachedDay };
    }
    
    if (day.rank && day.rank >= 6) {
      baseStyle = { ...baseStyle, ...styles.majorFeast };
    }
    
    // Highlight today
    const today = new Date().toISOString().split('T')[0];
    if (day.date === today) {
      baseStyle = { ...baseStyle, ...styles.today };
    }
    
    return baseStyle;
  };

  const handleDatePress = (day: CalendarDay) => {
    if (day.date && onDateSelect) {
      onDateSelect(day.date);
    }
  };

  const generateMonth = async () => {
    if (onGenerateRange) {
      const startDate = `${selectedYear}-${(selectedMonth + 1).toString().padStart(2, '0')}-01`;
      const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
      const endDate = `${selectedYear}-${(selectedMonth + 1).toString().padStart(2, '0')}-${daysInMonth.toString().padStart(2, '0')}`;
      
      onGenerateRange(startDate, endDate);
    }
  };

  const clearOldCache = async () => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 30); // Clear data older than 30 days
    
    const keysToRemove: string[] = [];
    
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('liturgical-') || key.startsWith('mass-') || key.startsWith('office-')) {
        try {
          const data = localStorage.getItem(key);
          if (data) {
            const parsed = JSON.parse(data);
            if (parsed.timestamp && new Date(parsed.timestamp) < cutoffDate) {
              keysToRemove.push(key);
            }
          }
        } catch (e) {
          // If we can't parse it, it might be old format - remove it
          keysToRemove.push(key);
        }
      }
    });
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    // Reload stats after cleanup
    loadCacheStats();
    loadCalendarData();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📅 Calendar Dashboard</Text>
        <View style={styles.cacheStats}>
          <Text style={styles.statText}>Cached: {cacheStats.totalCached} days</Text>
          <Text style={styles.statText}>Size: {cacheStats.totalSize} KB</Text>
          <Text style={styles.statText}>Updated: {cacheStats.lastUpdate.toLocaleDateString()}</Text>
        </View>
      </View>

      <View style={styles.controls}>
        <View style={styles.monthSelector}>
          <TouchableOpacity 
            style={styles.navButton}
            onPress={() => {
              if (selectedMonth === 0) {
                setSelectedMonth(11);
                setSelectedYear(selectedYear - 1);
              } else {
                setSelectedMonth(selectedMonth - 1);
              }
            }}
          >
            <Text style={styles.navButtonText}>‹</Text>
          </TouchableOpacity>
          
          <Text style={styles.monthYear}>
            {months[selectedMonth]} {selectedYear}
          </Text>
          
          <TouchableOpacity 
            style={styles.navButton}
            onPress={() => {
              if (selectedMonth === 11) {
                setSelectedMonth(0);
                setSelectedYear(selectedYear + 1);
              } else {
                setSelectedMonth(selectedMonth + 1);
              }
            }}
          >
            <Text style={styles.navButtonText}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.generateButton} onPress={generateMonth}>
            <Text style={styles.buttonText}>📦 Generate Month</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.cleanupButton} onPress={clearOldCache}>
            <Text style={styles.buttonText}>🧹 Clear Old</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.calendarContainer}>
        <View style={styles.weekHeader}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <Text key={day} style={styles.weekDay}>{day}</Text>
          ))}
        </View>

        <View style={styles.calendar}>
          {calendarData.map((day, index) => (
            <TouchableOpacity
              key={index}
              style={getCellStyle(day)}
              onPress={() => handleDatePress(day)}
              disabled={!day.date}
            >
              {day.date && (
                <>
                  <Text style={styles.dayNumber}>{day.dayNumber}</Text>
                  {day.celebration && (
                    <Text style={styles.celebration} numberOfLines={1}>
                      {day.celebration}
                    </Text>
                  )}
                  <View style={styles.indicators}>
                    {day.cached && <Text style={styles.indicator}>●</Text>}
                    {day.rank && day.rank >= 6 && <Text style={styles.feastIndicator}>✦</Text>}
                  </View>
                </>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Legend:</Text>
        <View style={styles.legendItems}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, styles.cachedDay]} />
            <Text style={styles.legendText}>Cached</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, styles.uncachedDay]} />
            <Text style={styles.legendText}>Not Cached</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, styles.majorFeast]} />
            <Text style={styles.legendText}>Major Feast</Text>
          </View>
          <View style={styles.legendItem}>
            <Text style={styles.indicator}>●</Text>
            <Text style={styles.legendText}>Has Data</Text>
          </View>
          <View style={styles.legendItem}>
            <Text style={styles.feastIndicator}>✦</Text>
            <Text style={styles.legendText}>High Rank</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  cacheStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statText: {
    fontSize: 12,
    color: '#666',
  },
  controls: {
    padding: 15,
    backgroundColor: '#fff',
    marginTop: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  navButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: '#007AFF',
    borderRadius: 6,
  },
  navButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  monthYear: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 20,
    color: '#333',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  generateButton: {
    backgroundColor: '#34C759',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  cleanupButton: {
    backgroundColor: '#FF9500',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  calendarContainer: {
    margin: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
  },
  weekHeader: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  weekDay: {
    flex: 1,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#666',
    paddingVertical: 8,
  },
  calendar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  emptyCell: {
    width: '14.28%',
    height: 60,
  },
  dayCell: {
    width: '14.28%',
    height: 60,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 4,
    justifyContent: 'space-between',
  },
  cachedDay: {
    backgroundColor: '#E8F5E8',
    borderColor: '#4CAF50',
  },
  uncachedDay: {
    backgroundColor: '#F5F5F5',
    borderColor: '#ccc',
  },
  majorFeast: {
    backgroundColor: '#FFE4E1',
    borderColor: '#DC143C',
  },
  today: {
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  dayNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  celebration: {
    fontSize: 8,
    color: '#666',
    lineHeight: 10,
  },
  indicators: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  indicator: {
    fontSize: 8,
    color: '#4CAF50',
  },
  feastIndicator: {
    fontSize: 8,
    color: '#DC143C',
  },
  legend: {
    margin: 15,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  legendItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
    marginBottom: 5,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 5,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
});

export default CalendarDashboard;