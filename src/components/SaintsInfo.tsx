/**
 * Saints Info Component - Background information on saints and martyrology
 * Copyright (C) 2025 Robin L. M. Cheung, MBA. All rights reserved.
 */

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { SaintInfo, MartyrologicalEntry, CachedLiturgicalData } from '../core/types/liturgical';
import { DataManager } from '../core/services/dataManager';

interface SaintsInfoProps {
  dataManager: DataManager;
  selectedDate: string;
  liturgicalData?: CachedLiturgicalData;
}

export const SaintsInfo: React.FC<SaintsInfoProps> = ({ dataManager, selectedDate, liturgicalData }) => {
  const [martyrology, setMartyrology] = useState<MartyrologicalEntry | null>(null);
  const [saints, setSaints] = useState<SaintInfo[]>([]);
  const [selectedSaint, setSelectedSaint] = useState<SaintInfo | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSaintsInfo();
  }, [selectedDate]);

  const loadSaintsInfo = async () => {
    setLoading(true);
    try {
      // Load martyrology for the date
      const martyrologyEntry = await dataManager.getMartyrologicalEntry(selectedDate);
      setMartyrology(martyrologyEntry);

      // Load detailed saint information
      const saintsList = await dataManager.getSaintInfoForDate(selectedDate);
      setSaints(saintsList);
    } catch (error) {
      console.error('Failed to load saints info:', error);
    } finally {
      setLoading(false);
    }
  };

  const openSaintDetails = (saint: SaintInfo) => {
    setSelectedSaint(saint);
    setModalVisible(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading saints information...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Saints & Martyrology</Text>
        <Text style={styles.subtitle}>{formatDate(selectedDate)}</Text>
        {liturgicalData && (
          <Text style={styles.liturgicalContext}>
            {liturgicalData.liturgicalDay.celebration}
          </Text>
        )}
      </View>

      <ScrollView style={styles.content}>
        {/* Martyrology Section */}
        {martyrology && martyrology.entries.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📿 Martyrology</Text>
            <Text style={styles.sectionSubtitle}>
              Saints and blessed commemorated on this day
            </Text>
            
            {martyrology.entries.map((entry, index) => (
              <View key={index} style={styles.martyrologyEntry}>
                <Text style={styles.martyrologyName}>{entry.saint}</Text>
                {entry.location && (
                  <Text style={styles.martyrologyLocation}>📍 {entry.location}</Text>
                )}
                <Text style={styles.martyrologyDescription}>{entry.description}</Text>
                {entry.rank && (
                  <Text style={styles.martyrologyRank}>Rank: {entry.rank}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Detailed Saints Information */}
        {saints.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>✨ Featured Saints</Text>
            <Text style={styles.sectionSubtitle}>
              Tap for detailed biographies and patronage
            </Text>
            
            {saints.map((saint, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.saintCard}
                onPress={() => openSaintDetails(saint)}
              >
                <Text style={styles.saintName}>{saint.name}</Text>
                <Text style={styles.saintFeastDay}>Feast Day: {saint.feastDay}</Text>
                
                {saint.patronage.length > 0 && (
                  <View style={styles.patronageContainer}>
                    <Text style={styles.patronageLabel}>Patron of:</Text>
                    <Text style={styles.patronageText}>
                      {saint.patronage.slice(0, 3).join(', ')}
                      {saint.patronage.length > 3 && '...'}
                    </Text>
                  </View>
                )}
                
                <Text style={styles.saintBiographyPreview}>
                  {saint.biography.substring(0, 150)}
                  {saint.biography.length > 150 && '...'}
                </Text>
                
                <Text style={styles.tapHint}>Tap to read more →</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* No Data State */}
        {(!martyrology || martyrology.entries.length === 0) && saints.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📿</Text>
            <Text style={styles.emptyTitle}>No Saints Information</Text>
            <Text style={styles.emptyText}>
              No martyrology or detailed saint information is available for this date.
            </Text>
            <Text style={styles.emptySubtext}>
              This may be updated as more data becomes available.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Saint Details Modal */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {selectedSaint?.name}
            </Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {selectedSaint && (
              <>
                <Text style={styles.modalFeastDay}>
                  Feast Day: {selectedSaint.feastDay}
                </Text>

                {selectedSaint.patronage.length > 0 && (
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>🛡️ Patronage</Text>
                    <View style={styles.patronageList}>
                      {selectedSaint.patronage.map((item, index) => (
                        <View key={index} style={styles.patronageItem}>
                          <Text style={styles.patronageItemText}>{item}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>📖 Biography</Text>
                  <Text style={styles.modalBiography}>
                    {selectedSaint.biography}
                  </Text>
                </View>

                {selectedSaint.sources.length > 0 && (
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>📚 Sources</Text>
                    {selectedSaint.sources.map((source, index) => (
                      <Text key={index} style={styles.modalSource}>
                        • {source}
                      </Text>
                    ))}
                  </View>
                )}
              </>
            )}
          </ScrollView>
        </View>
      </Modal>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6c757d',
    marginBottom: 4,
  },
  liturgicalContext: {
    fontSize: 14,
    color: '#8e44ad',
    fontStyle: 'italic',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 16,
  },
  martyrologyEntry: {
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
  martyrologyName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  martyrologyLocation: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 8,
  },
  martyrologyDescription: {
    fontSize: 16,
    lineHeight: 24,
    color: '#495057',
    marginBottom: 8,
  },
  martyrologyRank: {
    fontSize: 12,
    color: '#8e44ad',
    fontWeight: '500',
  },
  saintCard: {
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
  saintName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  saintFeastDay: {
    fontSize: 14,
    color: '#8e44ad',
    marginBottom: 8,
  },
  patronageContainer: {
    marginBottom: 12,
  },
  patronageLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 4,
  },
  patronageText: {
    fontSize: 14,
    color: '#6c757d',
  },
  saintBiographyPreview: {
    fontSize: 16,
    lineHeight: 24,
    color: '#495057',
    marginBottom: 8,
  },
  tapHint: {
    fontSize: 12,
    color: '#3498db',
    fontStyle: 'italic',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6c757d',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#adb5bd',
    textAlign: 'center',
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
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    backgroundColor: 'white',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e9ecef',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#6c757d',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  modalFeastDay: {
    fontSize: 16,
    color: '#8e44ad',
    marginBottom: 24,
    fontWeight: '600',
  },
  modalSection: {
    marginBottom: 24,
  },
  modalSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
  },
  patronageList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  patronageItem: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  patronageItemText: {
    fontSize: 14,
    color: '#1976d2',
  },
  modalBiography: {
    fontSize: 16,
    lineHeight: 26,
    color: '#495057',
  },
  modalSource: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 4,
  },
});