import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LocalStorageService, StorageError } from '../storage';
import { Note } from '../../types';

// Mock localStorage
const localStorageMock = {
  store: {} as Record<string, string>,
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('LocalStorageService', () => {
  let storageService: LocalStorageService;
  let testNote: Note;

  beforeEach(() => {
    // Reset the mock store
    localStorageMock.clear();
    vi.clearAllMocks();
    
    // Reset mock implementations to default behavior
    localStorageMock.getItem.mockImplementation((key: string) => {
      const store = (localStorageMock as any).store || {};
      return store[key] || null;
    });
    localStorageMock.setItem.mockImplementation((key: string, value: string) => {
      if (!(localStorageMock as any).store) {
        (localStorageMock as any).store = {};
      }
      (localStorageMock as any).store[key] = value;
    });
    localStorageMock.removeItem.mockImplementation((key: string) => {
      if ((localStorageMock as any).store) {
        delete (localStorageMock as any).store[key];
      }
    });
    localStorageMock.clear.mockImplementation(() => {
      (localStorageMock as any).store = {};
    });

    storageService = new LocalStorageService();

    testNote = {
      id: 'test-note-1',
      title: 'Test Note',
      content: 'This is a test note with $x^2$ math',
      createdAt: new Date('2023-01-01T10:00:00Z'),
      updatedAt: new Date('2023-01-01T10:00:00Z'),
      tags: ['test']
    };
  });

  describe('saveNote', () => {
    it('should save a new note', async () => {
      await storageService.saveNote(testNote);

      expect(localStorageMock.setItem).toHaveBeenCalledTimes(2); // notes and metadata
      
      const savedNotes = await storageService.getAllNotes();
      expect(savedNotes).toHaveLength(1);
      expect(savedNotes[0].id).toBe(testNote.id);
      expect(savedNotes[0].title).toBe(testNote.title);
      expect(savedNotes[0].content).toBe(testNote.content);
      expect(savedNotes[0].createdAt).toBeInstanceOf(Date);
      expect(savedNotes[0].updatedAt).toBeInstanceOf(Date);
      expect(savedNotes[0].tags).toEqual(testNote.tags);
    });

    it('should update an existing note', async () => {
      await storageService.saveNote(testNote);
      
      const updatedNote = {
        ...testNote,
        title: 'Updated Test Note',
        updatedAt: new Date('2023-01-02T10:00:00Z')
      };
      
      await storageService.saveNote(updatedNote);
      
      const savedNotes = await storageService.getAllNotes();
      expect(savedNotes).toHaveLength(1);
      expect(savedNotes[0].title).toBe('Updated Test Note');
    });

    it('should handle localStorage errors', async () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });

      await expect(storageService.saveNote(testNote)).rejects.toThrow(StorageError);
    });
  });

  describe('getNote', () => {
    it('should retrieve an existing note', async () => {
      await storageService.saveNote(testNote);
      
      const retrievedNote = await storageService.getNote('test-note-1');
      
      expect(retrievedNote?.id).toBe(testNote.id);
      expect(retrievedNote?.title).toBe(testNote.title);
      expect(retrievedNote?.content).toBe(testNote.content);
      expect(retrievedNote?.createdAt).toBeInstanceOf(Date);
      expect(retrievedNote?.updatedAt).toBeInstanceOf(Date);
      expect(retrievedNote?.tags).toEqual(testNote.tags);
    });

    it('should return null for non-existent note', async () => {
      const retrievedNote = await storageService.getNote('non-existent');
      
      expect(retrievedNote).toBeNull();
    });

    it('should handle localStorage errors', async () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('Storage access denied');
      });

      await expect(storageService.getNote('test-note-1')).rejects.toThrow(StorageError);
    });
  });

  describe('getAllNotes', () => {
    it('should return empty array when no notes exist', async () => {
      const notes = await storageService.getAllNotes();
      
      expect(notes).toEqual([]);
    });

    it('should return all saved notes', async () => {
      const note2: Note = {
        id: 'test-note-2',
        title: 'Second Note',
        content: 'Another test note',
        createdAt: new Date('2023-01-02T10:00:00Z'),
        updatedAt: new Date('2023-01-02T10:00:00Z')
      };

      await storageService.saveNote(testNote);
      await storageService.saveNote(note2);
      
      const notes = await storageService.getAllNotes();
      
      expect(notes).toHaveLength(2);
      const savedTestNote = notes.find(n => n.id === 'test-note-1');
      const savedNote2 = notes.find(n => n.id === 'test-note-2');
      
      expect(savedTestNote?.id).toBe(testNote.id);
      expect(savedTestNote?.title).toBe(testNote.title);
      expect(savedTestNote?.createdAt).toBeInstanceOf(Date);
      
      expect(savedNote2?.id).toBe(note2.id);
      expect(savedNote2?.title).toBe(note2.title);
      expect(savedNote2?.createdAt).toBeInstanceOf(Date);
    });

    it('should handle corrupted data gracefully', async () => {
      localStorageMock.getItem.mockReturnValue('invalid json');

      await expect(storageService.getAllNotes()).rejects.toThrow(StorageError);
    });
  });

  describe('deleteNote', () => {
    it('should delete an existing note', async () => {
      await storageService.saveNote(testNote);
      
      await storageService.deleteNote('test-note-1');
      
      const notes = await storageService.getAllNotes();
      expect(notes).toHaveLength(0);
      
      const metadata = await storageService.getAllNotesMetadata();
      expect(metadata).toHaveLength(0);
    });

    it('should throw error when deleting non-existent note', async () => {
      await expect(storageService.deleteNote('non-existent')).rejects.toThrow(StorageError);
    });
  });

  describe('updateNote', () => {
    it('should update an existing note', async () => {
      await storageService.saveNote(testNote);
      
      const updatedNote = {
        ...testNote,
        title: 'Updated Title',
        content: 'Updated content with $$E=mc^2$$',
        updatedAt: new Date('2023-01-02T10:00:00Z')
      };
      
      await storageService.updateNote(updatedNote);
      
      const retrievedNote = await storageService.getNote('test-note-1');
      expect(retrievedNote?.title).toBe('Updated Title');
      expect(retrievedNote?.content).toBe('Updated content with $$E=mc^2$$');
    });

    it('should throw error when updating non-existent note', async () => {
      await expect(storageService.updateNote(testNote)).rejects.toThrow(StorageError);
    });
  });

  describe('getNoteMetadata', () => {
    it('should return metadata for existing note', async () => {
      await storageService.saveNote(testNote);
      
      const metadata = await storageService.getNoteMetadata('test-note-1');
      
      expect(metadata).toBeDefined();
      expect(metadata?.id).toBe('test-note-1');
      expect(metadata?.title).toBe('Test Note');
      expect(metadata?.wordCount).toBe(8);
      expect(metadata?.mathCount).toBe(1);
    });

    it('should return null for non-existent note', async () => {
      const metadata = await storageService.getNoteMetadata('non-existent');
      
      expect(metadata).toBeNull();
    });
  });

  describe('getAllNotesMetadata', () => {
    it('should return empty array when no notes exist', async () => {
      const metadata = await storageService.getAllNotesMetadata();
      
      expect(metadata).toEqual([]);
    });

    it('should return metadata for all notes', async () => {
      const note2: Note = {
        id: 'test-note-2',
        title: 'Math Note',
        content: 'Complex math: $\\int_0^1 x^2 dx$ and $$\\sum_{n=1}^{\\infty} \\frac{1}{n^2}$$',
        createdAt: new Date('2023-01-02T10:00:00Z'),
        updatedAt: new Date('2023-01-02T10:00:00Z')
      };

      await storageService.saveNote(testNote);
      await storageService.saveNote(note2);
      
      const metadata = await storageService.getAllNotesMetadata();
      
      expect(metadata).toHaveLength(2);
      
      const testNoteMetadata = metadata.find(m => m.id === 'test-note-1');
      expect(testNoteMetadata?.mathCount).toBe(1);
      
      const mathNoteMetadata = metadata.find(m => m.id === 'test-note-2');
      expect(mathNoteMetadata?.mathCount).toBe(2);
    });
  });

  describe('exists', () => {
    it('should return true for existing note', async () => {
      await storageService.saveNote(testNote);
      
      const exists = await storageService.exists('test-note-1');
      
      expect(exists).toBe(true);
    });

    it('should return false for non-existent note', async () => {
      const exists = await storageService.exists('non-existent');
      
      expect(exists).toBe(false);
    });
  });

  describe('clear', () => {
    it('should clear all notes and metadata', async () => {
      await storageService.saveNote(testNote);
      
      await storageService.clear();
      
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('math-notepad-notes');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('math-notepad-metadata');
      
      const notes = await storageService.getAllNotes();
      const metadata = await storageService.getAllNotesMetadata();
      
      expect(notes).toEqual([]);
      expect(metadata).toEqual([]);
    });
  });

  describe('Date serialization', () => {
    it('should properly serialize and deserialize Date objects', async () => {
      const noteWithDates: Note = {
        id: 'date-test',
        title: 'Date Test',
        content: 'Testing dates',
        createdAt: new Date('2023-01-01T10:30:45.123Z'),
        updatedAt: new Date('2023-01-02T15:45:30.456Z')
      };

      await storageService.saveNote(noteWithDates);
      const retrievedNote = await storageService.getNote('date-test');

      expect(retrievedNote?.createdAt).toBeInstanceOf(Date);
      expect(retrievedNote?.updatedAt).toBeInstanceOf(Date);
      expect(retrievedNote?.createdAt.toISOString()).toBe('2023-01-01T10:30:45.123Z');
      expect(retrievedNote?.updatedAt.toISOString()).toBe('2023-01-02T15:45:30.456Z');
    });
  });

  describe('StorageError', () => {
    it('should create StorageError with message and operation', () => {
      const error = new StorageError('Test error', 'testOperation');
      
      expect(error.name).toBe('StorageError');
      expect(error.message).toBe('Test error');
      expect(error.operation).toBe('testOperation');
    });

    it('should create StorageError with cause', () => {
      const cause = new Error('Original error');
      const error = new StorageError('Test error', 'testOperation', cause);
      
      expect(error.cause).toBe(cause);
    });
  });
});