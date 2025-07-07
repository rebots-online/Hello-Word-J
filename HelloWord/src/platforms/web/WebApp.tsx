import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MassTexts } from '../../../../src/components/MassTexts';
import { ThemeProvider } from '../../../../src/shared/themes/ThemeProvider';

function WebApp(): React.JSX.Element {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'calendar' | 'journal' | 'saints' | 'mass'>('mass');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    // Simulate initialization
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.title}>SanctissiMissa</Text>
        <Text style={styles.subtitle}>Traditional Catholic Liturgy</Text>
        <Text style={styles.loadingText}>Initializing...</Text>
        <Text style={styles.copyright}>
          Copyright © 2025 Robin L. M. Cheung, MBA. All rights reserved.
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.title}>SanctissiMissa</Text>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <ThemeProvider initialVariant="brutalist" initialMode="light">
      <View style={styles.container}>
      {/* App Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.appTitle}>SanctissiMissa</Text>
          <Text style={styles.appSubtitle}>Traditional Catholic Liturgy</Text>
          <Text style={styles.liturgicalDate}>
            Sabbato infra Octavam Corporis Christi
          </Text>
        </View>
        <Text style={styles.selectedDate}>
          {new Date().toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
          })}
        </Text>
      </View>

      {/* Tab Content */}
      <View style={styles.content}>
        {activeTab === 'mass' && (
          <MassTexts date={selectedDate} />
        )}
        
        {activeTab === 'calendar' && (
          <View style={styles.tabContent}>
            <Text style={styles.contentTitle}>📅 Liturgical Calendar</Text>
            <Text style={styles.contentText}>Today's liturgical celebration according to the 1962 Missal</Text>
            <Text style={styles.contentText}>• Sabbato infra Octavam Corporis Christi</Text>
            <Text style={styles.contentText}>• Totum Duplex (within the Octave)</Text>
            <Text style={styles.contentText}>• White vestments</Text>
          </View>
        )}
        
        {activeTab === 'journal' && (
          <View style={styles.tabContent}>
            <Text style={styles.contentTitle}>📝 Spiritual Journal</Text>
            <Text style={styles.contentText}>Record your spiritual reflections and prayers</Text>
            <Text style={styles.contentText}>• Personal prayer notes</Text>
            <Text style={styles.contentText}>• Liturgical reflections</Text>
            <Text style={styles.contentText}>• Daily spiritual insights</Text>
          </View>
        )}
        
        {activeTab === 'saints' && (
          <View style={styles.tabContent}>
            <Text style={styles.contentTitle}>✨ Saints & Martyrology</Text>
            <Text style={styles.contentText}>Lives of saints and daily martyrology</Text>
            <Text style={styles.contentText}>• Saint biographies</Text>
            <Text style={styles.contentText}>• Daily martyrology entries</Text>
            <Text style={styles.contentText}>• Feast day information</Text>
          </View>
        )}
      </View>

      {/* Bottom Tab Navigation */}
      <View style={styles.tabBar}>
        {(['mass', 'calendar', 'journal', 'saints'] as const).map((tab) => (
          <TouchableOpacity 
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabIcon, activeTab === tab && styles.activeTabIcon]}>
              {tab === 'mass' ? '⛪' : tab === 'calendar' ? '📅' : tab === 'journal' ? '📝' : '✨'}
            </Text>
            <Text style={[styles.tabLabel, activeTab === tab && styles.activeTabLabel]}>
              {tab === 'mass' ? 'Mass' : tab === 'calendar' ? 'Calendar' : tab === 'journal' ? 'Journal' : 'Saints'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Copyright Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Copyright © 2025 Robin L. M. Cheung, MBA. All rights reserved.
        </Text>
        <Text style={styles.versionText}>
          v1.0.0.{Math.floor(Date.now() / 1000)}
        </Text>
      </View>
      </View>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  headerContent: {
    flex: 1,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  appSubtitle: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 4,
  },
  liturgicalDate: {
    fontSize: 12,
    color: '#8e44ad',
    fontStyle: 'italic',
  },
  selectedDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3498db',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  tabContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
    textAlign: 'center',
  },
  contentText: {
    fontSize: 16,
    color: '#6c757d',
    marginBottom: 8,
    textAlign: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    paddingVertical: 12,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  activeTab: {
    // Active tab styling handled by text color changes
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  activeTabIcon: {
    // Active styling will be applied via color
  },
  tabLabel: {
    fontSize: 12,
    color: '#6c757d',
  },
  activeTabLabel: {
    color: '#3498db',
    fontWeight: '600',
  },
  footer: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 10,
    color: '#adb5bd',
    textAlign: 'center',
  },
  versionText: {
    fontSize: 9,
    color: '#dee2e6',
    marginTop: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6c757d',
    marginBottom: 40,
  },
  loadingText: {
    fontSize: 18,
    color: '#3498db',
    marginBottom: 60,
  },
  copyright: {
    fontSize: 12,
    color: '#adb5bd',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 40,
  },
  errorText: {
    fontSize: 16,
    color: '#dc3545',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default WebApp;