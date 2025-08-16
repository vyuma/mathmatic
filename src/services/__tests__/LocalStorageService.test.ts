import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { LocalStorageService, StorageError } from '../storage';
import { Note } from '../../types';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((index: number) => Object.keys(store)[index] || null)
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('LocalStorageService', () => {
  let service: LocalStorageService;
  let mockNote: Note;

  beforeEach(() => {
    service = new LocalStorageService();
    mockNote = {
      id: 'test-note-1',
      title: 'Test Note',
      content: '# Test Content\n\nThis is a test note with $x^2$ math.',
      createdAt: new Date('2024-01-01T10:00:00Z'),
      updatedAt: new Date('2024-01-02T15:30:00Z'),
      tags: ['test', 'math']
    };
    
    // Clear localStorage before each test
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorageMock.clear();
  });

  describe('saveNote', () => {
    it('should save a new note successfully', async () => {
      await service.saveNote(mockNote);

      expect(localStorageMock.setItem).toHaveBeenCalledTimes(2); // notes + metadata
      
      const savedNotes = await service.getAllNotes();
      expect(savedNotes).toHaveLength(1);
      expect(savedNotes[0]).toEqual(mockNote);
    });

    it('should update an existing note', async () => {
      // Save initial note
      await service.saveNote(mockNote);
      
      // Update the note
      const updatedNote = {
        ...mockNote,
        title: 'Updated Title',
        content: 'Updated content'
      };
      
      await service.saveNote(updatedNote);
      
      const savedNotes = await service.getAllNotes();
      expect(savedNotes).toHaveLength(1);
      expect(savedNotes[0].title).toBe('Updated Title');
      expect(savedNotes[0].content).toBe('Updated content');
    });

    it('should handle localStorage errors', async () => {
      localStorageMock.setItem.mockImplementationOnce(() => {
        throw new Error('Storage quota exceeded');
      });

      await expect(service.saveNote(mockNote)).rejects.toThrow(StorageError);
      await expect(service.saveNote(mockNote)).rejects.toThrow('Failed to save note with id: test-note-1');
    });
  });

  describe('getNote', () => {
    it('should retrieve an existing note', async () => {
      await service.saveNote(mockNote);
      
      const retrievedNote = await service.getNote('test-note-1');
      
      expect(retrievedNote).toEqual(mockNote);
    });

    it('should return null for non-existent note', async () => {
      const retrievedNote = await service.getNote('non-existent');
      
      expect(retrievedNote).toBeNull();
    });

    it('should handle localStorage errors', async () => {
      localStorageMock.getItem.mockImplementationOnce(() => {
        throw new Error('Storage access denied');
      });

      await expect(service.getNote('test-note-1')).rejects.toThrow(StorageError);
    });
  });

  describe('getAllNotes', () => {
    it('should return empty array when no notes exist', async () => {
      const notes = await service.getAllNotes();
      
      expect(notes).toEqual([]);
    });

    it('should return all saved notes', async () => {
      const note2 = {
        ...mockNote,
        id: 'test-note-2',
        title: 'Second Note'
      };
      
      await service.saveNote(mockNote);
      await service.saveNote(note2);
      
      const notes = await service.getAllNotes();
      
      expect(notes).toHaveLength(2);
      expect(notes.find(n => n.id === 'test-note-1')).toEqual(mockNote);
      expect(notes.find(n => n.id === 'test-note-2')).toEqual(note2);
    });

    it('should handle corrupted data gracefully', async () => {
      localStorageMock.getItem.mockReturnValueOnce('invalid json');
      
      await expect(service.getAllNotes()).rejects.toThrow(StorageError);
    });

    it('should handle non-array data', async () => {
      localStorageMock.getItem.mockReturnValueOnce('{"not": "array"}');
      
      const notes = await service.getAllNotes();
      expect(notes).toEqual([]);
    });
  });

  describe('deleteNote', () => {
    it('should delete an existing note', async () => {
      await service.saveNote(mockNote);
      
      await service.deleteNote('test-note-1');
      
      const notes = await service.getAllNotes();
      expect(notes).toHaveLength(0);
      
      const metadata = await service.getAllNotesMetadata();
      expect(metadata).toHaveLength(0);
    });

    it('should throw error when deleting non-existent note', async () => {
      await expect(service.deleteNote('non-existent')).rejects.toThrow(StorageError);
      await expect(service.deleteNote('non-existent')).rejects.toThrow('Note with id non-existent not found');
    });

    it('should handle localStorage errors', async () => {
      await service.saveNote(mockNote);
      
      localStorageMock.setItem.mockImplementationOnce(() => {
        throw new Error('Storage error');
      });

      await expect(service.deleteNote('test-note-1')).rejects.toThrow(StorageError);
    });
  });

  describe('updateNote', () => {
    it('should update an existing note', async () => {
      await service.saveNote(mockNote);
      
      const updatedNote = {
        ...mockNote,
        title: 'Updated Title'
      };
      
      await service.updateNote(updatedNote);
      
      const retrievedNote = await service.getNote('test-note-1');
      expect(retrievedNote?.title).toBe('Updated Title');
    });

    it('should throw error when updating non-existent note', async () => {
      await expect(service.updateNote(mockNote)).rejects.toThrow(StorageError);
      await expect(service.updateNote(mockNote)).rejects.toThrow('Note with id test-note-1 not found');
    });
  });

  describe('exists', () => {
    it('should return true for existing note', async () => {
      await service.saveNote(mockNote);
      
      const exists = await service.exists('test-note-1');
      
      expect(exists).toBe(true);
    });

    it('should return false for non-existent note', async () => {
      const exists = await service.exists('non-existent');
      
      expect(exists).toBe(false);
    });
  });

  describe('clear', () => {
    it('should clear all notes and metadata', async () => {
      await service.saveNote(mockNote);
      
      await service.clear();
      
      const notes = await service.getAllNotes();
      const metadata = await service.getAllNotesMetadata();
      
      expect(notes).toHaveLength(0);
      expect(metadata).toHaveLength(0);
      expect(localStorageMock.removeItem).toHaveBeenCalledTimes(2);
    });
  });

  describe('metadata operations', () => {
    it('should create metadata when saving note', async () => {
      await service.saveNote(mockNote);
      
      const metadata = await service.getNoteMetadata('test-note-1');
      
      expect(metadata).toEqual({
        id: 'test-note-1',
        title: 'Test Note',
        createdAt: mockNote.createdAt,
        updatedAt: mockNote.updatedAt,
        wordCount: 8, // "This is a test note with math"
        mathCount: 1  // $x^2$
      });
    });

    it('should return all notes metadata', async () => {
      const note2 = {
        ...mockNote,
        id: 'test-note-2',
        title: 'Second Note',
        content: 'Simple content'
      };
      
      await service.saveNote(mockNote);
      await service.saveNote(note2);
      
      const allMetadata = await service.getAllNotesMetadata();
      
      expect(allMetadata).toHaveLength(2);
      expect(allMetadata.find(m => m.id === 'test-note-1')).toBeDefined();
      expect(allMetadata.find(m => m.id === 'test-note-2')).toBeDefined();
    });

    it('should return null for non-existent metadata', async () => {
      const metadata = await service.getNoteMetadata('non-existent');
      
      expect(metadata).toBeNull();
    });
  });

  describe('date serialization', () => {
    it('should properly serialize and deserialize dates', async () => {
      await service.saveNote(mockNote);
      
      const retrievedNote = await service.getNote('test-note-1');
      
      expect(retrievedNote?.createdAt).toBeInstanceOf(Date);
      expect(retrievedNote?.updatedAt).toBeInstanceOf(Date);
      expect(retrievedNote?.createdAt.toISOString()).toBe('2024-01-01T10:00:00.000Z');
      expect(retrievedNote?.updatedAt.toISOString()).toBe('2024-01-02T15:30:00.000Z');
    });

    it('should handle ISO date strings for backward compatibility', async () => {
      // Simulate old format with ISO strings
      const oldFormatData = JSON.stringify([{
        ...mockNote,
        createdAt: '2024-01-01T10:00:00.000Z',
        updatedAt: '2024-01-02T15:30:00.000Z'
      }]);
      
      localStorageMock.setItem('math-notepad-notes', oldFormatData);
      
      const notes = await service.getAllNotes();
      
      expect(notes[0].createdAt).toBeInstanceOf(Date);
      expect(notes[0].updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('word and math counting', () => {
    it('should count words correctly', async () => {
      const noteWithWords = {
        ...mockNote,
        content: 'This is a test with five words'
      };
      
      await service.saveNote(noteWithWords);
      
      const metadata = await service.getNoteMetadata(noteWithWords.id);
      expect(metadata?.wordCount).toBe(8); // "This is a test with five words"
    });

    it('should count math expressions correctly', async () => {
      const noteWithMath = {
        ...mockNote,
        content: 'Inline $x^2$ and block $$\\sum_{i=1}^n x_i$$ math'
      };
      
      await service.saveNote(noteWithMath);
      
      const metadata = await service.getNoteMetadata(noteWithMath.id);
      expect(metadata?.mathCount).toBe(2);
    });

    it('should handle empty content', async () => {
      const emptyNote = {
        ...mockNote,
        content: ''
      };
      
      await service.saveNote(emptyNote);
      
      const metadata = await service.getNoteMetadata(emptyNote.id);
      expect(metadata?.wordCount).toBe(0);
      expect(metadata?.mathCount).toBe(0);
    });

    it('should handle whitespace-only content', async () => {
      const whitespaceNote = {
        ...mockNote,
        content: '   \n\t  '
      };
      
      await service.saveNote(whitespaceNote);
      
      const metadata = await service.getNoteMetadata(whitespaceNote.id);
      expect(metadata?.wordCount).toBe(0);
    });
  });
});