import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  FlatList,
  ActivityIndicator,
} from 'react-native';

import { DataManager } from '../../../../src/core/services/dataManager';
import { WebSqliteStorageService } from '../../../../src/platforms/web/webSqliteStorage';
import { IStorageService } from '../../../../src/core/types/services';

// Define a simple type for the calendar day item we expect from the DB
interface CalendarDayItem {
  date: string;
  celebration: string | null;
}

function WebApp(): React.JSX.Element {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [calendarDays, setCalendarDays] = useState<CalendarDayItem[]>([]);
  const [dataManager, setDataManager] = useState<DataManager | null>(null);

  useEffect(() => {
    let isMounted = true; // Flag to prevent state updates if component is unmounted

    async function initializeApp() {
      try {
        console.log('WebApp.tsx: Initializing web application...');
        const storageService: IStorageService = new WebSqliteStorageService();
        const dm = new DataManager(storageService);
        setDataManager(dm); // Set dataManager instance

        console.log('WebApp.tsx: DataManager created, initializing database...');
        await dm.initialize(); // This now handles table creation and data import
        console.log('WebApp.tsx: DataManager initialized.');

        // Fetch some data to display
        console.log('WebApp.tsx: Fetching calendar days from database...');
        const daysFromDb = await storageService.executeQuery(
          "SELECT date, celebration, raw_kalendar_line FROM calendar_days ORDER BY date LIMIT 30;"
        );

        console.log(`WebApp.tsx: Fetched ${daysFromDb.length} calendar days.`);

        if (isMounted) {
          // Map raw DB result to CalendarDayItem[]
          const formattedDays: CalendarDayItem[] = daysFromDb.map((row: any) => ({
            date: row.date,
            // Use celebration if available, otherwise show part of raw_kalendar_line or a default
            celebration: row.celebration || (row.raw_kalendar_line ? `Raw: ${row.raw_kalendar_line.substring(0,50)}...` : 'N/A'),
          }));
          setCalendarDays(formattedDays);
          setIsLoading(false);
        }
      } catch (e: any) {
        console.error('WebApp.tsx: Initialization error:', e);
        if (isMounted) {
          setError(e.message || 'An unexpected error occurred during initialization.');
          setIsLoading(false);
        }
      }
    }

    initializeApp();

    return () => {
      isMounted = false; // Cleanup function to set isMounted to false when unmounting
    };
  }, []); // Empty dependency array means this effect runs once on mount

  const backgroundStyle = {
    backgroundColor: '#FFF',
    flex: 1,
  };
  const textStyle = {
    color: '#000',
  };

  const renderItem = ({ item }: { item: CalendarDayItem }) => (
    <View style={styles.itemContainer}>
      <Text style={[styles.itemText, textStyle]}>{item.date}: {item.celebration || 'Feria'}</Text>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, backgroundStyle]}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={[styles.loadingText, textStyle]}>Loading Database and Initial Data...</Text>
        <Text style={[styles.loadingText, textStyle]}>This may take a few minutes on first run.</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.container, backgroundStyle]}>
        <Text style={[styles.errorText, textStyle]}>Error:</Text>
        <Text style={[styles.errorText, textStyle]}>{error}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={backgroundStyle}>
      <View style={styles.headerContainer}>
        <Text style={[styles.headerText, textStyle]}>Liturgical Calendar (Fixed Feasts)</Text>
      </View>
      {calendarDays.length === 0 && !isLoading ? (
         <View style={styles.container}>
            <Text style={[styles.itemText, textStyle]}>No calendar data found. Database might be empty or import failed.</Text>
         </View>
      ) : (
        <FlatList
            data={calendarDays}
            renderItem={renderItem}
            keyExtractor={(item) => item.date}
            contentContainerStyle={styles.listContentContainer}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
  headerContainer: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  listContentContainer: {
    paddingBottom: 20,
  },
  itemContainer: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  itemText: {
    fontSize: 16,
  },
});

export default WebApp;