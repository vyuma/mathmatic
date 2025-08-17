import type { Note, NoteMetadata } from '../types';

// Storage error class
export class StorageError extends Error {
  public operation?: string;
  public cause?: Error;
  
  constructor(message: string, operation?: string, cause?: Error) {
    super(message);
    this.name = 'StorageError';
    this.operation = operation;
    this.cause = cause;
  }
}

// Storage service interface
export interface StorageService {
  // Note operations
  saveNote(note: Note): Promise<void>;
  getNote(id: string): Promise<Note | null>;
  getAllNotes(): Promise<Note[]>;
  deleteNote(id: string): Promise<void>;
  updateNote(note: Note): Promise<void>;
  
  // Metadata operations
  getNoteMetadata(id: string): Promise<NoteMetadata | null>;
  getAllNotesMetadata(): Promise<NoteMetadata[]>;
  
  // Utility operations
  exists(id: string): Promise<boolean>;
  clear(): Promise<void>;
}

// LocalStorage implementation
export class LocalStorageService implements StorageService {
  private readonly NOTES_KEY = 'math-notepad-notes';
  private readonly METADATA_KEY = 'math-notepad-metadata';

  async saveNote(note: Note): Promise<void> {
    try {
      const notes = await this.getAllNotes();
      const existingIndex = notes.findIndex(n => n.id === note.id);
      
      if (existingIndex >= 0) {
        notes[existingIndex] = note;
      } else {
        notes.push(note);
      }
      
      localStorage.setItem(this.NOTES_KEY, JSON.stringify(notes, this.dateReplacer));
      
      // Update metadata
      await this.updateMetadata(note);
    } catch (error) {
      throw new StorageError(
        `Failed to save note with id: ${note.id}`,
        'saveNote',
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  async getNote(id: string): Promise<Note | null> {
    try {
      const notes = await this.getAllNotes();
      return notes.find(note => note.id === id) || null;
    } catch (error) {
      throw new StorageError(
        `Failed to get note with id: ${id}`,
        'getNote',
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  async getAllNotes(): Promise<Note[]> {
    try {
      const notesJson = localStorage.getItem(this.NOTES_KEY);
      if (!notesJson) {
        return [];
      }
      
      const notes = JSON.parse(notesJson, this.dateReviver);
      return Array.isArray(notes) ? notes : [];
    } catch (error) {
      throw new StorageError(
        'Failed to get all notes',
        'getAllNotes',
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  async deleteNote(id: string): Promise<void> {
    try {
      const notes = await this.getAllNotes();
      const filteredNotes = notes.filter(note => note.id !== id);
      
      if (notes.length === filteredNotes.length) {
        throw new StorageError(`Note with id ${id} not found`, 'deleteNote');
      }
      
      localStorage.setItem(this.NOTES_KEY, JSON.stringify(filteredNotes, this.dateReplacer));
      
      // Remove metadata
      await this.removeMetadata(id);
    } catch (error) {
      if (error instanceof StorageError) {
        throw error;
      }
      throw new StorageError(
        `Failed to delete note with id: ${id}`,
        'deleteNote',
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  async updateNote(note: Note): Promise<void> {
    try {
      const existingNote = await this.getNote(note.id);
      if (!existingNote) {
        throw new StorageError(`Note with id ${note.id} not found`, 'updateNote');
      }
      
      await this.saveNote(note);
    } catch (error) {
      if (error instanceof StorageError) {
        throw error;
      }
      throw new StorageError(
        `Failed to update note with id: ${note.id}`,
        'updateNote',
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  async getNoteMetadata(id: string): Promise<NoteMetadata | null> {
    try {
      const allMetadata = await this.getAllNotesMetadata();
      return allMetadata.find(metadata => metadata.id === id) || null;
    } catch (error) {
      throw new StorageError(
        `Failed to get metadata for note with id: ${id}`,
        'getNoteMetadata',
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  async getAllNotesMetadata(): Promise<NoteMetadata[]> {
    try {
      const metadataJson = localStorage.getItem(this.METADATA_KEY);
      if (!metadataJson) {
        return [];
      }
      
      const metadata = JSON.parse(metadataJson, this.dateReviver);
      return Array.isArray(metadata) ? metadata : [];
    } catch (error) {
      throw new StorageError(
        'Failed to get all notes metadata',
        'getAllNotesMetadata',
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  async exists(id: string): Promise<boolean> {
    try {
      const note = await this.getNote(id);
      return note !== null;
    } catch (error) {
      throw new StorageError(
        `Failed to check if note exists with id: ${id}`,
        'exists',
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  async clear(): Promise<void> {
    try {
      localStorage.removeItem(this.NOTES_KEY);
      localStorage.removeItem(this.METADATA_KEY);
    } catch (error) {
      throw new StorageError(
        'Failed to clear storage',
        'clear',
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  // Private helper methods
  private async updateMetadata(note: Note): Promise<void> {
    const allMetadata = await this.getAllNotesMetadata();
    const existingIndex = allMetadata.findIndex(m => m.id === note.id);
    
    const newMetadata: NoteMetadata = {
      id: note.id,
      title: note.title,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
      wordCount: this.countWords(note.content),
      mathCount: this.countMathExpressions(note.content)
    };
    
    if (existingIndex >= 0) {
      allMetadata[existingIndex] = newMetadata;
    } else {
      allMetadata.push(newMetadata);
    }
    
    localStorage.setItem(this.METADATA_KEY, JSON.stringify(allMetadata, this.dateReplacer));
  }

  private async removeMetadata(id: string): Promise<void> {
    const allMetadata = await this.getAllNotesMetadata();
    const filteredMetadata = allMetadata.filter(m => m.id !== id);
    localStorage.setItem(this.METADATA_KEY, JSON.stringify(filteredMetadata, this.dateReplacer));
  }

  private countWords(content: string): number {
    if (!content.trim()) return 0;
    return content.trim().split(/\s+/).length;
  }

  private countMathExpressions(content: string): number {
    const mathRegex = /\$\$[^$]+\$\$|\$[^$]+\$/g;
    const matches = content.match(mathRegex);
    return matches ? matches.length : 0;
  }

  // JSON serialization helpers for Date objects
  private dateReplacer(_key: string, value: any): any {
    if (value instanceof Date) {
      return { __type: 'Date', value: value.toISOString() };
    }
    return value;
  }

  private dateReviver(_key: string, value: any): any {
    if (value && typeof value === 'object' && value.__type === 'Date') {
      return new Date(value.value);
    }
    // Handle ISO date strings directly (for backward compatibility)
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/.test(value)) {
      return new Date(value);
    }
    return value;
  }
}