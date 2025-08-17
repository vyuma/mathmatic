import type { Note, NoteMetadata, MathNode } from '../types';

// Validation error class
export class ValidationError extends Error {
  public field?: string;

  constructor(message: string, field?: string) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
  }
}

// Note validation functions
export const validateNote = (note: Partial<Note>): note is Note => {
  if (!note.id || typeof note.id !== 'string' || note.id.trim() === '') {
    throw new ValidationError('Note ID is required and must be a non-empty string', 'id');
  }

  if (!note.title || typeof note.title !== 'string') {
    throw new ValidationError('Note title is required and must be a string', 'title');
  }

  if (typeof note.content !== 'string') {
    throw new ValidationError('Note content must be a string', 'content');
  }

  if (!note.createdAt || !(note.createdAt instanceof Date)) {
    throw new ValidationError('Note createdAt is required and must be a Date', 'createdAt');
  }

  if (!note.updatedAt || !(note.updatedAt instanceof Date)) {
    throw new ValidationError('Note updatedAt is required and must be a Date', 'updatedAt');
  }

  if (note.tags && !Array.isArray(note.tags)) {
    throw new ValidationError('Note tags must be an array of strings', 'tags');
  }

  if (note.tags && !note.tags.every(tag => typeof tag === 'string')) {
    throw new ValidationError('All note tags must be strings', 'tags');
  }

  return true;
};

// Note metadata validation
export const validateNoteMetadata = (metadata: Partial<NoteMetadata>): metadata is NoteMetadata => {
  if (!metadata.id || typeof metadata.id !== 'string' || metadata.id.trim() === '') {
    throw new ValidationError('Metadata ID is required and must be a non-empty string', 'id');
  }

  if (!metadata.title || typeof metadata.title !== 'string') {
    throw new ValidationError('Metadata title is required and must be a string', 'title');
  }

  if (!metadata.createdAt || !(metadata.createdAt instanceof Date)) {
    throw new ValidationError('Metadata createdAt is required and must be a Date', 'createdAt');
  }

  if (!metadata.updatedAt || !(metadata.updatedAt instanceof Date)) {
    throw new ValidationError('Metadata updatedAt is required and must be a Date', 'updatedAt');
  }

  if (typeof metadata.wordCount !== 'number' || metadata.wordCount < 0) {
    throw new ValidationError('Metadata wordCount must be a non-negative number', 'wordCount');
  }

  if (typeof metadata.mathCount !== 'number' || metadata.mathCount < 0) {
    throw new ValidationError('Metadata mathCount must be a non-negative number', 'mathCount');
  }

  return true;
};

// Math node validation
export const validateMathNode = (node: Partial<MathNode>): node is MathNode => {
  if (!node.id || typeof node.id !== 'string' || node.id.trim() === '') {
    throw new ValidationError('MathNode ID is required and must be a non-empty string', 'id');
  }

  if (!node.latex || typeof node.latex !== 'string') {
    throw new ValidationError('MathNode latex is required and must be a string', 'latex');
  }

  if (!node.position || typeof node.position !== 'object') {
    throw new ValidationError('MathNode position is required and must be an object', 'position');
  }

  if (typeof node.position.start !== 'number' || node.position.start < 0) {
    throw new ValidationError('MathNode position.start must be a non-negative number', 'position.start');
  }

  if (typeof node.position.end !== 'number' || node.position.end < node.position.start) {
    throw new ValidationError('MathNode position.end must be a number greater than or equal to start', 'position.end');
  }

  if (!node.display || (node.display !== 'inline' && node.display !== 'block')) {
    throw new ValidationError('MathNode display must be either "inline" or "block"', 'display');
  }

  return true;
};

// Utility functions for creating valid objects
export const createNote = (data: {
  title: string;
  content?: string;
  tags?: string[];
}): Note => {
  const now = new Date();
  const note: Note = {
    id: generateNoteId(),
    title: data.title,
    content: data.content || '',
    createdAt: now,
    updatedAt: now,
    tags: data.tags
  };

  validateNote(note);
  return note;
};

export const createNoteMetadata = (note: Note): NoteMetadata => {
  const wordCount = countWords(note.content);
  const mathCount = countMathExpressions(note.content);

  const metadata: NoteMetadata = {
    id: note.id,
    title: note.title,
    createdAt: note.createdAt,
    updatedAt: note.updatedAt,
    wordCount,
    mathCount
  };

  validateNoteMetadata(metadata);
  return metadata;
};

export const createMathNode = (data: {
  latex: string;
  start: number;
  end: number;
  display: 'inline' | 'block';
}): MathNode => {
  const node: MathNode = {
    id: generateMathNodeId(),
    latex: data.latex,
    position: {
      start: data.start,
      end: data.end
    },
    display: data.display
  };

  validateMathNode(node);
  return node;
};

// Helper functions
const generateNoteId = (): string => {
  return `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const generateMathNodeId = (): string => {
  return `math_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const countWords = (content: string): number => {
  if (!content.trim()) return 0;
  return content.trim().split(/\s+/).length;
};

const countMathExpressions = (content: string): number => {
  const mathRegex = /\$\$[^$]+\$\$|\$[^$]+\$/g;
  const matches = content.match(mathRegex);
  return matches ? matches.length : 0;
};