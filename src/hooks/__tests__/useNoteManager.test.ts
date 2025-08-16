import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useNoteManager } from '../useNoteManager';
import { Note } from '../../types';

// Mock storage service
const mockStorageService = {
  saveNote: vi.fn(),
  getNote: vi.fn(),
  getAllNotes: vi.fn(),
  deleteNote: vi.fn(),
  updateNote: vi.fn(),
  getNoteMetadata: vi.fn(),
  getAllNotesMetadata: vi.fn(),
  exists: vi.fn(),
  clear: vi.fn()
};

// Mock the storage service
vi.mock('../../services/storage', () => ({
  LocalStorageService: vi.fn(() => mockStorageService)
}));

describe('useNoteManager', () => {
  let mockNote: Note;

  beforeEach(() => {
    mockNote = {
      id: 'test-note-1',
      title: 'Test Note',
      content: '# Test Content\n\nThis is a test note.',
      createdAt: new Date('2024-01-01T10:00:00Z'),
      updatedAt: new Date('2024-01-02T15:30:00Z'),
      tags: ['test']
    };

    vi.clearAllMocks();
    mockStorageService.getAllNotes.mockResolvedValue([]);
    mockStorageService.getAllNotesMetadata.mockResolvedValue([]);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with empty state', async () => {
    const { result } = renderHook(() => useNoteManager());

    expect(result.current.notes).toEqual([]);
    expect(result.current.currentNote).toBeNull();
    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBeNull();

    // Wait for initialization to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.isLoading).toBe(false);
  });

  it('should load notes on initialization', async () => {
    mockStorageService.getAllNotes.mockResolvedValue([mockNote]);

    const { result } = renderHook(() => useNoteManager());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.notes).toEqual([mockNote]);
    expect(result.current.isLoading).toBe(false);
    expect(mockStorageService.getAllNotes).toHaveBeenCalled();
  });

  it('should handle loading errors', async () => {
    const error = new Error('Failed to load notes');
    mockStorageService.getAllNotes.mockRejectedValue(error);

    const { result } = renderHook(() => useNoteManager());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.error).toBe('Failed to load notes');
    expect(result.current.isLoading).toBe(false);
  });

  it('should create a new note', async () => {
    mockStorageService.saveNote.mockResolvedValue(undefined);

    const { result } = renderHook(() => useNoteManager());

    await act(async () => {
      await result.current.createNote();
    });

    expect(mockStorageService.saveNote).toHaveBeenCalled();
    expect(result.current.currentNote).toBeDefined();
    expect(result.current.currentNote?.title).toBe('');
    expect(result.current.currentNote?.content).toBe('');
  });

  it('should save a note', async () => {
    mockStorageService.saveNote.mockResolvedValue(undefined);

    const { result } = renderHook(() => useNoteManager());

    await act(async () => {
      await result.current.saveNote(mockNote);
    });

    expect(mockStorageService.saveNote).toHaveBeenCalledWith(mockNote);
    expect(result.current.notes).toContain(mockNote);
  });

  it('should update an existing note in the list', async () => {
    mockStorageService.getAllNotes.mockResolvedValue([mockNote]);
    mockStorageService.saveNote.mockResolvedValue(undefined);

    const { result } = renderHook(() => useNoteManager());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    const updatedNote = { ...mockNote, title: 'Updated Title' };

    await act(async () => {
      await result.current.saveNote(updatedNote);
    });

    expect(result.current.notes[0].title).toBe('Updated Title');
  });

  it('should load a specific note', async () => {
    mockStorageService.getNote.mockResolvedValue(mockNote);

    const { result } = renderHook(() => useNoteManager());

    await act(async () => {
      await result.current.loadNote('test-note-1');
    });

    expect(mockStorageService.getNote).toHaveBeenCalledWith('test-note-1');
    expect(result.current.currentNote).toEqual(mockNote);
  });

  it('should handle loading non-existent note', async () => {
    mockStorageService.getNote.mockResolvedValue(null);

    const { result } = renderHook(() => useNoteManager());

    await act(async () => {
      await result.current.loadNote('non-existent');
    });

    expect(result.current.error).toBe('Note not found');
    expect(result.current.currentNote).toBeNull();
  });

  it('should delete a note', async () => {
    mockStorageService.getAllNotes.mockResolvedValue([mockNote]);
    mockStorageService.deleteNote.mockResolvedValue(undefined);

    const { result } = renderHook(() => useNoteManager());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await act(async () => {
      await result.current.deleteNote('test-note-1');
    });

    expect(mockStorageService.deleteNote).toHaveBeenCalledWith('test-note-1');
    expect(result.current.notes).toEqual([]);
  });

  it('should clear current note if deleted note is current', async () => {
    mockStorageService.getAllNotes.mockResolvedValue([mockNote]);
    mockStorageService.getNote.mockResolvedValue(mockNote);
    mockStorageService.deleteNote.mockResolvedValue(undefined);

    const { result } = renderHook(() => useNoteManager());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await act(async () => {
      await result.current.loadNote('test-note-1');
    });

    expect(result.current.currentNote).toEqual(mockNote);

    await act(async () => {
      await result.current.deleteNote('test-note-1');
    });

    expect(result.current.currentNote).toBeNull();
  });

  it('should update current note content', async () => {
    mockStorageService.getNote.mockResolvedValue(mockNote);

    const { result } = renderHook(() => useNoteManager());

    await act(async () => {
      await result.current.loadNote('test-note-1');
    });

    act(() => {
      result.current.updateCurrentNoteContent('New content');
    });

    expect(result.current.currentNote?.content).toBe('New content');
    expect(result.current.hasUnsavedChanges).toBe(true);
  });

  it('should update current note title', async () => {
    mockStorageService.getNote.mockResolvedValue(mockNote);

    const { result } = renderHook(() => useNoteManager());

    await act(async () => {
      await result.current.loadNote('test-note-1');
    });

    act(() => {
      result.current.updateCurrentNoteTitle('New Title');
    });

    expect(result.current.currentNote?.title).toBe('New Title');
    expect(result.current.hasUnsavedChanges).toBe(true);
  });

  it('should track unsaved changes', async () => {
    mockStorageService.getNote.mockResolvedValue(mockNote);

    const { result } = renderHook(() => useNoteManager());

    await act(async () => {
      await result.current.loadNote('test-note-1');
    });

    expect(result.current.hasUnsavedChanges).toBe(false);

    act(() => {
      result.current.updateCurrentNoteContent('Modified content');
    });

    expect(result.current.hasUnsavedChanges).toBe(true);
  });

  it('should clear unsaved changes after save', async () => {
    mockStorageService.getNote.mockResolvedValue(mockNote);
    mockStorageService.saveNote.mockResolvedValue(undefined);

    const { result } = renderHook(() => useNoteManager());

    await act(async () => {
      await result.current.loadNote('test-note-1');
    });

    act(() => {
      result.current.updateCurrentNoteContent('Modified content');
    });

    expect(result.current.hasUnsavedChanges).toBe(true);

    await act(async () => {
      if (result.current.currentNote) {
        await result.current.saveNote(result.current.currentNote);
      }
    });

    expect(result.current.hasUnsavedChanges).toBe(false);
  });

  it('should handle save errors', async () => {
    const error = new Error('Save failed');
    mockStorageService.saveNote.mockRejectedValue(error);

    const { result } = renderHook(() => useNoteManager());

    await act(async () => {
      try {
        await result.current.saveNote(mockNote);
      } catch (e) {
        // Expected to throw
      }
    });

    expect(result.current.error).toBe('Save failed');
  });

  it('should handle delete errors', async () => {
    const error = new Error('Delete failed');
    mockStorageService.deleteNote.mockRejectedValue(error);

    const { result } = renderHook(() => useNoteManager());

    await act(async () => {
      try {
        await result.current.deleteNote('test-note-1');
      } catch (e) {
        // Expected to throw
      }
    });

    expect(result.current.error).toBe('Delete failed');
  });

  it('should clear errors', async () => {
    const error = new Error('Test error');
    mockStorageService.getAllNotes.mockRejectedValue(error);

    const { result } = renderHook(() => useNoteManager());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.error).toBe('Test error');

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
  });

  it('should refresh notes list', async () => {
    mockStorageService.getAllNotes.mockResolvedValue([mockNote]);

    const { result } = renderHook(() => useNoteManager());

    await act(async () => {
      await result.current.refreshNotes();
    });

    expect(mockStorageService.getAllNotes).toHaveBeenCalled();
    expect(result.current.notes).toEqual([mockNote]);
  });

  it('should sort notes by update date (newest first)', async () => {
    const note1 = { ...mockNote, id: 'note-1', updatedAt: new Date('2024-01-01') };
    const note2 = { ...mockNote, id: 'note-2', updatedAt: new Date('2024-01-03') };
    const note3 = { ...mockNote, id: 'note-3', updatedAt: new Date('2024-01-02') };

    mockStorageService.getAllNotes.mockResolvedValue([note1, note2, note3]);

    const { result } = renderHook(() => useNoteManager());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.notes[0].id).toBe('note-2'); // newest
    expect(result.current.notes[1].id).toBe('note-3'); // middle
    expect(result.current.notes[2].id).toBe('note-1'); // oldest
  });
});