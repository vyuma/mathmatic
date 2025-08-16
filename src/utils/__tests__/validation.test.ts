import { describe, it, expect } from 'vitest';
import { 
  validateNote, 
  validateNoteMetadata,
  validateMathNode,
  createNote,
  createNoteMetadata,
  createMathNode,
  ValidationError
} from '../validation';
import type { Note } from '../../types';

describe('validation utilities', () => {
  const validNote: Note = {
    id: 'valid-note-123',
    title: 'Valid Note Title',
    content: '# Valid Content\n\nThis is valid content with $x^2$ math.',
    createdAt: new Date('2024-01-01T10:00:00Z'),
    updatedAt: new Date('2024-01-02T15:30:00Z'),
    tags: ['test', 'math']
  };

  describe('validateNote', () => {
    it('should validate a correct note', () => {
      expect(() => validateNote(validNote)).not.toThrow();
      expect(validateNote(validNote)).toBe(true);
    });

    it('should reject note with invalid id', () => {
      const invalidNote = { ...validNote, id: '' };
      expect(() => validateNote(invalidNote)).toThrow(ValidationError);
      expect(() => validateNote(invalidNote)).toThrow('Note ID is required');
    });

    it('should reject note with missing title', () => {
      const invalidNote = { ...validNote, title: undefined as any };
      expect(() => validateNote(invalidNote)).toThrow(ValidationError);
      expect(() => validateNote(invalidNote)).toThrow('Note title is required');
    });

    it('should reject note with invalid content type', () => {
      const invalidNote = { ...validNote, content: undefined as any };
      expect(() => validateNote(invalidNote)).toThrow(ValidationError);
      expect(() => validateNote(invalidNote)).toThrow('Note content must be a string');
    });

    it('should reject note with invalid dates', () => {
      const invalidNote = { 
        ...validNote, 
        createdAt: 'invalid' as any
      };
      expect(() => validateNote(invalidNote)).toThrow(ValidationError);
      expect(() => validateNote(invalidNote)).toThrow('Note createdAt is required and must be a Date');
    });

    it('should reject note with invalid tags', () => {
      const invalidNote = { 
        ...validNote, 
        tags: 'not-array' as any
      };
      expect(() => validateNote(invalidNote)).toThrow(ValidationError);
      expect(() => validateNote(invalidNote)).toThrow('Note tags must be an array of strings');
    });
  });

  describe('validateNoteMetadata', () => {
    it('should validate correct metadata', () => {
      const metadata = {
        id: 'test-id',
        title: 'Test Title',
        createdAt: new Date(),
        updatedAt: new Date(),
        wordCount: 10,
        mathCount: 2
      };
      
      expect(() => validateNoteMetadata(metadata)).not.toThrow();
      expect(validateNoteMetadata(metadata)).toBe(true);
    });

    it('should reject metadata with invalid word count', () => {
      const metadata = {
        id: 'test-id',
        title: 'Test Title',
        createdAt: new Date(),
        updatedAt: new Date(),
        wordCount: -1,
        mathCount: 2
      };
      
      expect(() => validateNoteMetadata(metadata)).toThrow(ValidationError);
      expect(() => validateNoteMetadata(metadata)).toThrow('wordCount must be a non-negative number');
    });
  });

  describe('validateMathNode', () => {
    it('should validate correct math node', () => {
      const mathNode = {
        id: 'math-1',
        latex: 'x^2',
        position: { start: 0, end: 5 },
        display: 'inline' as const
      };
      
      expect(() => validateMathNode(mathNode)).not.toThrow();
      expect(validateMathNode(mathNode)).toBe(true);
    });

    it('should reject math node with invalid position', () => {
      const mathNode = {
        id: 'math-1',
        latex: 'x^2',
        position: { start: 10, end: 5 }, // end before start
        display: 'inline' as const
      };
      
      expect(() => validateMathNode(mathNode)).toThrow(ValidationError);
      expect(() => validateMathNode(mathNode)).toThrow('position.end must be a number greater than or equal to start');
    });
  });

  describe('createNote', () => {
    it('should create a valid note', () => {
      const noteData = {
        title: 'Test Note',
        content: 'Test content',
        tags: ['test']
      };
      
      const note = createNote(noteData);
      
      expect(note.id).toBeDefined();
      expect(note.title).toBe('Test Note');
      expect(note.content).toBe('Test content');
      expect(note.tags).toEqual(['test']);
      expect(note.createdAt).toBeInstanceOf(Date);
      expect(note.updatedAt).toBeInstanceOf(Date);
    });

    it('should create note with default content', () => {
      const noteData = { title: 'Test Note' };
      const note = createNote(noteData);
      
      expect(note.content).toBe('');
      expect(note.tags).toBeUndefined();
    });
  });

  describe('createNoteMetadata', () => {
    it('should create metadata from note', () => {
      const note = createNote({
        title: 'Test Note',
        content: 'This is a test with $x^2$ math'
      });
      
      const metadata = createNoteMetadata(note);
      
      expect(metadata.id).toBe(note.id);
      expect(metadata.title).toBe(note.title);
      expect(metadata.wordCount).toBe(6); // "This is a test with math"
      expect(metadata.mathCount).toBe(1); // $x^2$
    });
  });

  describe('createMathNode', () => {
    it('should create a valid math node', () => {
      const mathData = {
        latex: 'x^2',
        start: 0,
        end: 5,
        display: 'inline' as const
      };
      
      const mathNode = createMathNode(mathData);
      
      expect(mathNode.id).toBeDefined();
      expect(mathNode.latex).toBe('x^2');
      expect(mathNode.position.start).toBe(0);
      expect(mathNode.position.end).toBe(5);
      expect(mathNode.display).toBe('inline');
    });
  });
});