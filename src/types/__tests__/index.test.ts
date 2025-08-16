import { describe, it, expect } from 'vitest';
import { Note, NoteMetadata, MathNode, MathContext, EditorState } from '../index';

describe('Type Definitions', () => {
  describe('Note interface', () => {
    it('should allow creating a valid Note object', () => {
      const note: Note = {
        id: 'test-id',
        title: 'Test Note',
        content: 'This is test content',
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: ['test']
      };

      expect(note.id).toBe('test-id');
      expect(note.title).toBe('Test Note');
      expect(note.content).toBe('This is test content');
      expect(note.createdAt).toBeInstanceOf(Date);
      expect(note.updatedAt).toBeInstanceOf(Date);
      expect(note.tags).toEqual(['test']);
    });

    it('should allow Note without tags', () => {
      const note: Note = {
        id: 'test-id',
        title: 'Test Note',
        content: 'Content',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      expect(note.tags).toBeUndefined();
    });
  });

  describe('NoteMetadata interface', () => {
    it('should allow creating a valid NoteMetadata object', () => {
      const metadata: NoteMetadata = {
        id: 'test-id',
        title: 'Test Note',
        createdAt: new Date(),
        updatedAt: new Date(),
        wordCount: 10,
        mathCount: 2
      };

      expect(metadata.id).toBe('test-id');
      expect(metadata.title).toBe('Test Note');
      expect(metadata.wordCount).toBe(10);
      expect(metadata.mathCount).toBe(2);
    });
  });

  describe('MathNode interface', () => {
    it('should allow creating inline math node', () => {
      const mathNode: MathNode = {
        id: 'math-1',
        latex: 'x^2',
        position: {
          start: 10,
          end: 15
        },
        display: 'inline'
      };

      expect(mathNode.display).toBe('inline');
      expect(mathNode.position.start).toBe(10);
      expect(mathNode.position.end).toBe(15);
    });

    it('should allow creating block math node', () => {
      const mathNode: MathNode = {
        id: 'math-1',
        latex: '\\int_0^1 x^2 dx',
        position: {
          start: 0,
          end: 20
        },
        display: 'block'
      };

      expect(mathNode.display).toBe('block');
    });
  });

  describe('MathContext interface', () => {
    it('should allow creating math context', () => {
      const mathContext: MathContext = {
        nodes: [
          {
            id: 'math-1',
            latex: 'x^2',
            position: { start: 0, end: 5 },
            display: 'inline'
          }
        ],
        activeNode: 'math-1',
        editMode: true
      };

      expect(mathContext.nodes).toHaveLength(1);
      expect(mathContext.activeNode).toBe('math-1');
      expect(mathContext.editMode).toBe(true);
    });

    it('should allow math context without active node', () => {
      const mathContext: MathContext = {
        nodes: [],
        editMode: false
      };

      expect(mathContext.activeNode).toBeUndefined();
      expect(mathContext.editMode).toBe(false);
    });
  });

  describe('EditorState interface', () => {
    it('should allow creating editor state', () => {
      const editorState: EditorState = {
        content: 'Test content',
        cursorPosition: 5,
        selectedText: 'Test',
        isEditing: true,
        mathEditMode: false
      };

      expect(editorState.content).toBe('Test content');
      expect(editorState.cursorPosition).toBe(5);
      expect(editorState.selectedText).toBe('Test');
      expect(editorState.isEditing).toBe(true);
      expect(editorState.mathEditMode).toBe(false);
    });
  });
});