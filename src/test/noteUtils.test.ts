import { describe, it, expect } from 'vitest';
import { 
  generateNoteId, 
  createBlankNote, 
  generateNoteTitle, 
  updateNoteTimestamp,
  hasUnsavedChanges,
  prepareNoteForSave
} from '../utils/noteUtils';
import type { Note } from '../types';

describe('noteUtils', () => {
  describe('generateNoteId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateNoteId();
      const id2 = generateNoteId();
      
      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^\d+-[a-z0-9]{6}$/);
      expect(id2).toMatch(/^\d+-[a-z0-9]{6}$/);
    });
  });

  describe('createBlankNote', () => {
    it('should create a blank note with default values', () => {
      const note = createBlankNote();
      
      expect(note.id).toBeDefined();
      expect(note.title).toBe('');
      expect(note.content).toBe('');
      expect(note.createdAt).toBeInstanceOf(Date);
      expect(note.updatedAt).toBeInstanceOf(Date);
      expect(note.tags).toEqual([]);
    });

    it('should create notes with unique IDs', () => {
      const note1 = createBlankNote();
      const note2 = createBlankNote();
      
      expect(note1.id).not.toBe(note2.id);
    });
  });

  describe('generateNoteTitle', () => {
    it('should use first line as title', () => {
      const content = 'This is the title\nThis is the content';
      const title = generateNoteTitle(content);
      
      expect(title).toBe('This is the title');
    });

    it('should remove markdown heading markers', () => {
      const content = '# Heading Title\nContent here';
      const title = generateNoteTitle(content);
      
      expect(title).toBe('Heading Title');
    });

    it('should handle multiple heading levels', () => {
      const content = '### Deep Heading\nContent';
      const title = generateNoteTitle(content);
      
      expect(title).toBe('Deep Heading');
    });

    it('should use timestamp for empty content', () => {
      const title = generateNoteTitle('');
      
      expect(title).toMatch(/^Note \d{1,2}\/\d{1,2}\/\d{4}$/);
    });

    it('should use timestamp for very short content', () => {
      const title = generateNoteTitle('Hi');
      
      expect(title).toMatch(/^Note \d{1,2}\/\d{1,2}\/\d{4}$/);
    });

    it('should truncate long titles', () => {
      const longContent = 'This is a very long title that should be truncated because it exceeds the maximum length';
      const title = generateNoteTitle(longContent);
      
      expect(title.length).toBeLessThanOrEqual(50);
      expect(title).toMatch(/\.\.\.$/);
    });
  });

  describe('updateNoteTimestamp', () => {
    it('should update the updatedAt timestamp', () => {
      const originalDate = new Date('2024-01-01T00:00:00Z');
      const note: Note = {
        id: '1',
        title: 'Test',
        content: 'Content',
        createdAt: originalDate,
        updatedAt: originalDate
      };

      const updatedNote = updateNoteTimestamp(note);
      
      expect(updatedNote.updatedAt.getTime()).toBeGreaterThan(originalDate.getTime());
      expect(updatedNote.createdAt).toBe(originalDate);
      expect(updatedNote.id).toBe(note.id);
      expect(updatedNote.title).toBe(note.title);
      expect(updatedNote.content).toBe(note.content);
    });
  });

  describe('hasUnsavedChanges', () => {
    const note: Note = {
      id: '1',
      title: 'Test',
      content: 'Original content',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    it('should return false for unchanged content', () => {
      const result = hasUnsavedChanges(note, 'Original content');
      expect(result).toBe(false);
    });

    it('should return true for changed content', () => {
      const result = hasUnsavedChanges(note, 'Modified content');
      expect(result).toBe(true);
    });
  });

  describe('prepareNoteForSave', () => {
    it('should update timestamp and generate title if empty', () => {
      const originalDate = new Date('2024-01-01T00:00:00Z');
      const note: Note = {
        id: '1',
        title: '',
        content: 'Original content',
        createdAt: originalDate,
        updatedAt: originalDate
      };

      const content = '# New Title\nNew content';
      const prepared = prepareNoteForSave(note, content);
      
      expect(prepared.title).toBe('New Title');
      expect(prepared.content).toBe(content);
      expect(prepared.updatedAt.getTime()).toBeGreaterThan(originalDate.getTime());
      expect(prepared.createdAt).toBe(originalDate);
    });

    it('should keep existing title if not empty', () => {
      const note: Note = {
        id: '1',
        title: 'Existing Title',
        content: 'Original content',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const content = '# New Title\nNew content';
      const prepared = prepareNoteForSave(note, content);
      
      expect(prepared.title).toBe('Existing Title');
      expect(prepared.content).toBe(content);
    });
  });
});