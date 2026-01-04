/**
 * Parish Dashboard Component - Newsletter, events, and contact information
 * Copyright (C) 2025 Robin L. M. Cheung, MBA. All rights reserved.
 */

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { ParishInfo, ParishEvent, Newsletter, CachedLiturgicalData } from '../core/types/liturgical';
import { DataManager } from '../core/services/dataManager';

interface ParishDashboardProps {
  dataManager: DataManager;
  parishId: string;
  selectedDate: string;
  liturgicalData?: CachedLiturgicalData;
}

export const ParishDashboard: React.FC<ParishDashboardProps> = ({ 
  dataManager, 
  parishId, 
  selectedDate, 
  liturgicalData 
}) => {
  const [parishInfo, setParishInfo] = useState<ParishInfo | null>(null);
  const [events, setEvents] = useState<ParishEvent[]>([]);
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [selectedTab, setSelectedTab] = useState<'events' | 'newsletters' | 'contact'>('events');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadParishData();
  }, [parishId, selectedDate]);

  const loadParishData = async () => {
    setLoading(true);
    try {
      // Load parish information
      const parish = await dataManager.getParishInfo(parishId);
      setParishInfo(parish);

      // Load events for selected date and upcoming
      const parishEvents = await dataManager.getParishEvents(parishId, selectedDate);
      setEvents(parishEvents);

      // Load recent newsletters
      const parishNewsletters = await dataManager.getNewsletters(parishId);
      setNewsletters(parishNewsletters);
    } catch (error) {
      console.error('Failed to load parish data:', error);
    } finally {
      setLoading(false);
    }
  };

  const openPhone = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const openEmail = (email: string) => {
    Linking.openURL(`mailto:${email}`);
  };

  const openWebsite = (website: string) => {
    if (!website.startsWith('http')) {
      website = `https://${website}`;
    }
    Linking.openURL(website);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'liturgical': return '⛪';
      case 'social': return '🤝';
      case 'educational': return '📚';
      case 'charitable': return '❤️';
      default: return '📅';
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading parish information...</Text>
        </View>
      </View>
    );
  }

  if (!parishInfo) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Parish information not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Parish Header */}
      <View style={styles.header}>
        <Text style={styles.parishName}>{parishInfo.name}</Text>
        <Text style={styles.pastor}>Pastor: {parishInfo.pastor}</Text>
        {liturgicalData && (
          <Text style={styles.liturgicalContext}>
            Today: {liturgicalData.liturgicalDay.celebration}
          </Text>
        )}
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, selectedTab === 'events' && styles.activeTab]}
          onPress={() => setSelectedTab('events')}
        >
          <Text style={[styles.tabText, selectedTab === 'events' && styles.activeTabText]}>
            Events
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, selectedTab === 'newsletters' && styles.activeTab]}
          onPress={() => setSelectedTab('newsletters')}
        >
          <Text style={[styles.tabText, selectedTab === 'newsletters' && styles.activeTabText]}>
            Newsletters
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, selectedTab === 'contact' && styles.activeTab]}
          onPress={() => setSelectedTab('contact')}
        >
          <Text style={[styles.tabText, selectedTab === 'contact' && styles.activeTabText]}>
            Contact
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Events Tab */}
        {selectedTab === 'events' && (
          <View>
            <Text style={styles.sectionTitle}>📅 Parish Events</Text>
            {events.length > 0 ? (
              events.map((event) => (
                <View key={event.id} style={styles.eventCard}>
                  <View style={styles.eventHeader}>
                    <Text style={styles.eventIcon}>
                      {getCategoryIcon(event.category)}
                    </Text>
                    <View style={styles.eventInfo}>
                      <Text style={styles.eventTitle}>{event.title}</Text>
                      <Text style={styles.eventDateTime}>
                        {formatDate(event.date)}
                        {event.time && ` at ${formatTime(event.time)}`}
                      </Text>
                      {event.location && (
                        <Text style={styles.eventLocation}>📍 {event.location}</Text>
                      )}
                    </View>
                    <View style={styles.eventCategory}>
                      <Text style={styles.eventCategoryText}>
                        {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.eventDescription}>{event.description}</Text>
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No events scheduled</Text>
              </View>
            )}
          </View>
        )}

        {/* Newsletters Tab */}
        {selectedTab === 'newsletters' && (
          <View>
            <Text style={styles.sectionTitle}>📰 Parish Newsletters</Text>
            {newsletters.length > 0 ? (
              newsletters.map((newsletter) => (
                <View key={newsletter.id} style={styles.newsletterCard}>
                  <View style={styles.newsletterHeader}>
                    <Text style={styles.newsletterTitle}>{newsletter.title}</Text>
                    <Text style={styles.newsletterDate}>
                      {formatDate(newsletter.publishDate)}
                    </Text>
                  </View>
                  <Text style={styles.newsletterAuthor}>By {newsletter.author}</Text>
                  <Text style={styles.newsletterContent}>
                    {newsletter.content.substring(0, 200)}
                    {newsletter.content.length > 200 && '...'}
                  </Text>
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No newsletters available</Text>
              </View>
            )}
          </View>
        )}

        {/* Contact Tab */}
        {selectedTab === 'contact' && (
          <View>
            <Text style={styles.sectionTitle}>📞 Contact Information</Text>
            
            <View style={styles.contactCard}>
              <View style={styles.contactSection}>
                <Text style={styles.contactLabel}>Address</Text>
                <Text style={styles.contactValue}>{parishInfo.address}</Text>
              </View>

              <View style={styles.contactSection}>
                <Text style={styles.contactLabel}>Phone</Text>
                <TouchableOpacity onPress={() => openPhone(parishInfo.phone)}>
                  <Text style={styles.contactLink}>{parishInfo.phone}</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.contactSection}>
                <Text style={styles.contactLabel}>Email</Text>
                <TouchableOpacity onPress={() => openEmail(parishInfo.email)}>
                  <Text style={styles.contactLink}>{parishInfo.email}</Text>
                </TouchableOpacity>
              </View>

              {parishInfo.website && (
                <View style={styles.contactSection}>
                  <Text style={styles.contactLabel}>Website</Text>
                  <TouchableOpacity onPress={() => openWebsite(parishInfo.website!)}>
                    <Text style={styles.contactLink}>{parishInfo.website}</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Mass Schedule */}
            <Text style={styles.sectionTitle}>⛪ Mass Schedule</Text>
            <View style={styles.scheduleCard}>
              {parishInfo.massSchedule.map((mass, index) => (
                <View key={index} style={styles.scheduleItem}>
                  <Text style={styles.scheduleDay}>{mass.day}</Text>
                  <Text style={styles.scheduleTime}>{mass.time}</Text>
                  <Text style={styles.scheduleType}>{mass.type}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  parishName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  pastor: {
    fontSize: 16,
    color: '#6c757d',
    marginBottom: 4,
  },
  liturgicalContext: {
    fontSize: 14,
    color: '#8e44ad',
    fontStyle: 'italic',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#3498db',
  },
  tabText: {
    fontSize: 16,
    color: '#6c757d',
  },
  activeTabText: {
    color: '#3498db',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
  },
  eventCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  eventIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  eventDateTime: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 2,
  },
  eventLocation: {
    fontSize: 14,
    color: '#8e44ad',
  },
  eventCategory: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  eventCategoryText: {
    fontSize: 12,
    color: '#1976d2',
    fontWeight: '500',
  },
  eventDescription: {
    fontSize: 16,
    lineHeight: 24,
    color: '#495057',
  },
  newsletterCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  newsletterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  newsletterTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    flex: 1,
    marginRight: 8,
  },
  newsletterDate: {
    fontSize: 12,
    color: '#6c757d',
  },
  newsletterAuthor: {
    fontSize: 14,
    color: '#8e44ad',
    marginBottom: 8,
  },
  newsletterContent: {
    fontSize: 16,
    lineHeight: 24,
    color: '#495057',
  },
  contactCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  contactSection: {
    marginBottom: 16,
  },
  contactLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6c757d',
    marginBottom: 4,
  },
  contactValue: {
    fontSize: 16,
    color: '#2c3e50',
  },
  contactLink: {
    fontSize: 16,
    color: '#3498db',
    textDecorationLine: 'underline',
  },
  scheduleCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  scheduleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  scheduleDay: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    flex: 1,
  },
  scheduleTime: {
    fontSize: 16,
    color: '#495057',
    flex: 1,
    textAlign: 'center',
  },
  scheduleType: {
    fontSize: 14,
    color: '#6c757d',
    flex: 1,
    textAlign: 'right',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#6c757d',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6c757d',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#dc3545',
  },
});