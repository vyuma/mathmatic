import type { Note } from '../types';

/**
 * Generate a unique ID for a new note
 * Uses timestamp + random string for uniqueness
 */
export const generateNoteId = (): string => {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${random}`;
};

/**
 * Create a new blank note with default values
 */
export const createBlankNote = (): Note => {
  const now = new Date();
  return {
    id: generateNoteId(),
    title: '',
    content: '',
    createdAt: now,
    updatedAt: now,
    tags: []
  };
};

/**
 * Generate a default title for a note based on its content
 * Uses the first line or a timestamp-based title
 */
export const generateNoteTitle = (content: string): string => {
  if (!content.trim()) {
    return `Note ${new Date().toLocaleDateString()}`;
  }

  // Extract first line and clean it up
  const firstLine = content.split('\n')[0].trim();
  
  // Remove markdown heading markers
  const cleanTitle = firstLine.replace(/^#+\s*/, '').trim();
  
  // If the cleaned title is too short or empty, use timestamp
  if (cleanTitle.length < 3) {
    return `Note ${new Date().toLocaleDateString()}`;
  }
  
  // Limit title length
  return cleanTitle.length > 50 
    ? cleanTitle.substring(0, 47) + '...'
    : cleanTitle;
};

/**
 * Update a note's updatedAt timestamp
 */
export const updateNoteTimestamp = (note: Note): Note => {
  return {
    ...note,
    updatedAt: new Date()
  };
};

/**
 * Check if a note has unsaved changes by comparing content
 */
export const hasUnsavedChanges = (originalNote: Note, currentContent: string): boolean => {
  return originalNote.content !== currentContent;
};

/**
 * Prepare a note for saving with updated title and timestamp
 */
export const prepareNoteForSave = (note: Note, content: string): Note => {
  const updatedNote = updateNoteTimestamp(note);
  
  // Auto-generate title if empty
  const title = note.title.trim() || generateNoteTitle(content);
  
  return {
    ...updatedNote,
    title,
    content
  };
};