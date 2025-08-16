import { useState, useCallback, useEffect } from 'react';
import { Note } from '../types';
import { LocalStorageService } from '../services/storage';
import { createBlankNote, prepareNoteForSave, hasUnsavedChanges } from '../utils/noteUtils';
import { useAutoSave } from './useAutoSave';

export interface UseNoteManagerReturn {
  // State
  notes: Note[];
  currentNote: Note | null;
  currentContent: string;
  isLoading: boolean;
  hasUnsaved: boolean;
  
  // Auto-save state
  isSaving: boolean;
  lastSaved: Date | null;
  saveError: string | null;
  
  // Actions
  createNewNote: () => Promise<void>;
  selectNote: (noteId: string) => Promise<void>;
  updateContent: (content: string) => void;
  saveCurrentNote: () => Promise<void>;
  deleteNote: (noteId: string) => Promise<void>;
  
  // Auto-save actions
  enableAutoSave: (enabled: boolean) => void;
  clearSaveError: () => void;
  
  // Utility
  refreshNotes: () => Promise<void>;
}

/**
 * Custom hook for managing notes with storage integration
 */
export const useNoteManager = (): UseNoteManagerReturn => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [currentContent, setCurrentContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  
  const storageService = new LocalStorageService();
  
  // Calculate if there are unsaved changes
  const hasUnsaved = currentNote ? hasUnsavedChanges(currentNote, currentContent) : false;

  /**
   * Load all notes from storage
   */
  const refreshNotes = useCallback(async () => {
    setIsLoading(true);
    try {
      const loadedNotes = await storageService.getAllNotes();
      // Sort by updatedAt descending (most recent first)
      const sortedNotes = loadedNotes.sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
      setNotes(sortedNotes);
    } catch (error) {
      console.error('Failed to load notes:', error);
      // Keep existing notes on error
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Create a new blank note and set it as current
   */
  const createNewNote = useCallback(async () => {
    setIsLoading(true);
    try {
      const newNote = createBlankNote();
      
      // Save the blank note to storage immediately
      await storageService.saveNote(newNote);
      
      // Update local state
      setNotes(prev => [newNote, ...prev]);
      setCurrentNote(newNote);
      setCurrentContent('');
      
    } catch (error) {
      console.error('Failed to create new note:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Select and load a note by ID
   */
  const selectNote = useCallback(async (noteId: string) => {
    setIsLoading(true);
    try {
      const note = await storageService.getNote(noteId);
      if (note) {
        setCurrentNote(note);
        setCurrentContent(note.content);
      } else {
        console.error(`Note with ID ${noteId} not found`);
      }
    } catch (error) {
      console.error('Failed to select note:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Update the current content (in memory only)
   */
  const updateContent = useCallback((content: string) => {
    setCurrentContent(content);
  }, []);

  /**
   * Save the current note to storage
   */
  const saveCurrentNote = useCallback(async () => {
    if (!currentNote) {
      throw new Error('No current note to save');
    }

    setIsLoading(true);
    try {
      const noteToSave = prepareNoteForSave(currentNote, currentContent);
      
      await storageService.saveNote(noteToSave);
      
      // Update local state
      setCurrentNote(noteToSave);
      setNotes(prev => prev.map(note => 
        note.id === noteToSave.id ? noteToSave : note
      ));
      
    } catch (error) {
      console.error('Failed to save note:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [currentNote, currentContent]);

  /**
   * Auto-save integration
   */
  const {
    autoSaveState,
    triggerSave,
    clearError
  } = useAutoSave(currentContent, {
    delay: 5000, // 5 seconds
    enabled: autoSaveEnabled && currentNote !== null,
    onSave: saveCurrentNote,
    onError: (error) => {
      console.error('Auto-save failed:', error);
    }
  });

  /**
   * Delete a note by ID
   */
  const deleteNote = useCallback(async (noteId: string) => {
    setIsLoading(true);
    try {
      await storageService.deleteNote(noteId);
      
      // Update local state
      setNotes(prev => prev.filter(note => note.id !== noteId));
      
      // If the deleted note was current, clear current note
      if (currentNote?.id === noteId) {
        setCurrentNote(null);
        setCurrentContent('');
      }
      
    } catch (error) {
      console.error('Failed to delete note:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [currentNote]);

  // Load notes on mount
  useEffect(() => {
    refreshNotes();
  }, [refreshNotes]);

  /**
   * Enable or disable auto-save
   */
  const enableAutoSave = useCallback((enabled: boolean) => {
    setAutoSaveEnabled(enabled);
  }, []);

  /**
   * Clear save error
   */
  const clearSaveError = useCallback(() => {
    clearError();
  }, [clearError]);

  /**
   * Manual save that uses the auto-save trigger
   */
  const manualSave = useCallback(async () => {
    await triggerSave();
  }, [triggerSave]);

  return {
    // State
    notes,
    currentNote,
    currentContent,
    isLoading: isLoading || autoSaveState.isSaving,
    hasUnsaved: hasUnsaved || autoSaveState.hasUnsavedChanges,
    
    // Auto-save state
    isSaving: autoSaveState.isSaving,
    lastSaved: autoSaveState.lastSaved,
    saveError: autoSaveState.saveError,
    
    // Actions
    createNewNote,
    selectNote,
    updateContent,
    saveCurrentNote: manualSave, // Use auto-save trigger for manual saves too
    deleteNote,
    
    // Auto-save actions
    enableAutoSave,
    clearSaveError,
    
    // Utility
    refreshNotes
  };
};