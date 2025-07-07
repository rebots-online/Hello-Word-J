/**
 * Journal Component - Personal liturgical journaling and note-taking
 * Copyright (C) 2025 Robin L. M. Cheung, MBA. All rights reserved.
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { JournalEntry, CachedLiturgicalData } from '../core/types/liturgical';
import { DataManager } from '../core/services/dataManager';

interface JournalProps {
  dataManager: DataManager;
  selectedDate: string;
  liturgicalData?: CachedLiturgicalData;
}

export const Journal: React.FC<JournalProps> = ({ dataManager, selectedDate, liturgicalData }) => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [newEntryTitle, setNewEntryTitle] = useState('');
  const [newEntryContent, setNewEntryContent] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    loadJournalEntries();
  }, [selectedDate]);

  const loadJournalEntries = async () => {
    try {
      const journalEntries = await dataManager.getJournalEntries(selectedDate);
      setEntries(journalEntries);
    } catch (error) {
      console.error('Failed to load journal entries:', error);
    }
  };

  const createEntry = async () => {
    if (!newEntryTitle.trim() || !newEntryContent.trim()) return;

    try {
      const liturgicalContext = liturgicalData 
        ? `${liturgicalData.liturgicalDay.celebration} (${liturgicalData.liturgicalDay.season})`
        : undefined;

      const newEntry = await dataManager.createJournalEntry({
        date: selectedDate,
        title: newEntryTitle.trim(),
        content: newEntryContent.trim(),
        liturgicalContext,
        tags: tags
      });

      setEntries([newEntry, ...entries]);
      setNewEntryTitle('');
      setNewEntryContent('');
      setTags([]);
      setIsCreating(false);
    } catch (error) {
      console.error('Failed to create journal entry:', error);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Journal - {formatDate(selectedDate)}</Text>
        {liturgicalData && (
          <Text style={styles.liturgicalContext}>
            {liturgicalData.liturgicalDay.celebration} ({liturgicalData.liturgicalDay.season})
          </Text>
        )}
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setIsCreating(!isCreating)}
        >
          <Text style={styles.addButtonText}>
            {isCreating ? '✕ Cancel' : '+ New Entry'}
          </Text>
        </TouchableOpacity>
      </View>

      {isCreating && (
        <View style={styles.createForm}>
          <TextInput
            style={styles.titleInput}
            placeholder="Entry title..."
            value={newEntryTitle}
            onChangeText={setNewEntryTitle}
          />
          
          <View style={styles.tagSection}>
            <View style={styles.tagInputRow}>
              <TextInput
                style={styles.tagInput}
                placeholder="Add tag..."
                value={tagInput}
                onChangeText={setTagInput}
                onSubmitEditing={addTag}
              />
              <TouchableOpacity style={styles.tagAddButton} onPress={addTag}>
                <Text style={styles.tagAddButtonText}>+</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.tagList}>
              {tags.map((tag, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={styles.tag}
                  onPress={() => removeTag(tag)}
                >
                  <Text style={styles.tagText}>{tag} ✕</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TextInput
            style={styles.contentInput}
            placeholder="Your thoughts and reflections..."
            value={newEntryContent}
            onChangeText={setNewEntryContent}
            multiline
            numberOfLines={6}
          />
          
          <TouchableOpacity style={styles.saveButton} onPress={createEntry}>
            <Text style={styles.saveButtonText}>Save Entry</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView style={styles.entriesList}>
        {entries.map((entry) => (
          <View key={entry.id} style={styles.entryCard}>
            <View style={styles.entryHeader}>
              <Text style={styles.entryTitle}>{entry.title}</Text>
              <Text style={styles.entryDate}>
                {new Date(entry.created).toLocaleString()}
              </Text>
            </View>
            
            {entry.liturgicalContext && (
              <Text style={styles.entryLiturgicalContext}>
                📿 {entry.liturgicalContext}
              </Text>
            )}
            
            <Text style={styles.entryContent}>{entry.content}</Text>
            
            {entry.tags.length > 0 && (
              <View style={styles.entryTags}>
                {entry.tags.map((tag, index) => (
                  <View key={index} style={styles.entryTag}>
                    <Text style={styles.entryTagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}
        
        {entries.length === 0 && !isCreating && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No journal entries for this date.</Text>
            <Text style={styles.emptySubtext}>
              Tap "New Entry" to record your thoughts and reflections.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  liturgicalContext: {
    fontSize: 14,
    color: '#7f8c8d',
    fontStyle: 'italic',
    marginBottom: 12,
  },
  addButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  createForm: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  titleInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  tagSection: {
    marginBottom: 12,
  },
  tagInputRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  tagInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginRight: 8,
  },
  tagAddButton: {
    backgroundColor: '#95a5a6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
  },
  tagAddButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  tagList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#ecf0f1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#2c3e50',
  },
  contentInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    height: 120,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  saveButton: {
    backgroundColor: '#27ae60',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  entriesList: {
    flex: 1,
  },
  entryCard: {
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
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  entryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    flex: 1,
    marginRight: 8,
  },
  entryDate: {
    fontSize: 12,
    color: '#95a5a6',
  },
  entryLiturgicalContext: {
    fontSize: 14,
    color: '#8e44ad',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  entryContent: {
    fontSize: 16,
    lineHeight: 24,
    color: '#34495e',
    marginBottom: 12,
  },
  entryTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  entryTag: {
    backgroundColor: '#ecf0f1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  entryTagText: {
    fontSize: 11,
    color: '#7f8c8d',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#7f8c8d',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#95a5a6',
    textAlign: 'center',
  },
});