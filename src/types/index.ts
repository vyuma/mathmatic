// Type definitions for the math-markdown notepad

// Core Note data model
export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
}

// Note metadata for efficient listing and searching
export interface NoteMetadata {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  wordCount: number;
  mathCount: number;
}

// Math node representation in markdown content
export interface MathNode {
  id: string;
  latex: string;
  position: {
    start: number;
    end: number;
  };
  display: 'inline' | 'block';
}

// Math context for editor state
export interface MathContext {
  nodes: MathNode[];
  activeNode?: string;
  editMode: boolean;
}

// Editor state management
export interface EditorState {
  content: string;
  cursorPosition: number;
  selectedText: string;
  isEditing: boolean;
  mathEditMode: boolean;
}

// Export functionality types
export interface ExportFormat {
  type: 'markdown' | 'html';
  options: ExportOptions;
}

export interface ExportOptions {
  includeMetadata: boolean;
  mathFormat: 'latex' | 'katex';
  styling: 'minimal' | 'full';
}

export interface ExportResult {
  blob: Blob;
  filename: string;
  mimeType: string;
}

// Error handling types
export interface ErrorInfo {
  componentStack: string | undefined;
  errorBoundary?: string;
}

export interface ErrorNotification {
  id: string;
  type: 'error' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  dismissible: boolean;
  autoHide?: boolean;
  duration?: number;
}

// Legacy interfaces for backward compatibility
export interface MathExpression {
  id: string;
  latex: string;
  position: {
    line: number;
    column: number;
  };
}

export interface NotepadDocument {
  id: string;
  title: string;
  content: string;
  mathExpressions: MathExpression[];
  createdAt: Date;
  updatedAt: Date;
}