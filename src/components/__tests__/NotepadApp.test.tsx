import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { NotepadApp } from '../NotepadApp';

// Mock all the hooks and components
vi.mock('../Layout', () => ({
  Layout: ({ children, onNoteSelect, onNewNote }: any) => (
    <div data-testid="layout">
      <button onClick={() => onNoteSelect('note-1')}>Select Note</button>
      <button onClick={onNewNote}>New Note</button>
      {children}
    </div>
  ),
}));

vi.mock('../MarkdownEditor', () => ({
  MarkdownEditor: ({ content, onChange }: any) => (
    <textarea
      data-testid="markdown-editor"
      value={content}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Start writing your markdown note with math support..."
    />
  ),
}));

vi.mock('../MarkdownPreview', () => ({
  MarkdownPreview: ({ content, onMathClick }: any) => (
    <div data-testid="markdown-preview">
      <div>{content}</div>
      <button onClick={() => onMathClick('\\alpha', { left: 100, top: 100, height: 20 }, true)}>
        Math Expression
      </button>
    </div>
  ),
}));

vi.mock('../MathEditor', () => ({
  MathEditor: ({ value, onChange, onComplete, onCancel, isVisible }: any) =>
    isVisible ? (
      <div data-testid="math-editor">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          data-testid="math-input"
        />
        <button onClick={onComplete}>Complete</button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    ) : null,
}));

vi.mock('../ConfirmDialog', () => ({
  ConfirmDialog: ({ isOpen, onConfirm, onCancel }: any) =>
    isOpen ? (
      <div data-testid="confirm-dialog">
        <button onClick={onConfirm}>Confirm</button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    ) : null,
}));

// Mock hooks
const mockNoteManager = {
  notes: [{ id: 'note-1', title: 'Test Note', content: 'Test content' }],
  currentNote: { id: 'note-1', title: 'Test Note', content: 'Test content' },
  currentContent: 'Test content',
  isLoading: false,
  hasUnsaved: false,
  isSaving: false,
  lastSaved: null,
  saveError: null,
  createNewNote: vi.fn(),
  selectNote: vi.fn(),
  updateContent: vi.fn(),
  saveCurrentNote: vi.fn(),
  deleteNote: vi.fn(),
  enableAutoSave: vi.fn(),
  clearSaveError: vi.fn(),
};

const mockMathEditing = {
  mathEditingState: {
    isEditing: false,
    latex: '',
    position: { x: 0, y: 0 },
    isInline: true,
  },
  startMathEditing: vi.fn(),
  stopMathEditing: vi.fn(),
  updateMathLatex: vi.fn(),
  completeMathEditing: vi.fn(() => 'updated content'),
};

const mockConfirmDialog = {
  dialogState: { isOpen: false },
  showConfirmDialog: vi.fn(),
  handleConfirm: vi.fn(),
  handleCancel: vi.fn(),
};

const mockStorageError = {
  handleStorageError: vi.fn(),
};

vi.mock('../../hooks/useNoteManager', () => ({
  useNoteManager: () => mockNoteManager,
}));

vi.mock('../../hooks/useMathEditing', () => ({
  useMathEditing: () => mockMathEditing,
}));

vi.mock('../../hooks/useConfirmDialog', () => ({
  useConfirmDialog: () => mockConfirmDialog,
}));

vi.mock('../../contexts/ErrorContext', () => ({
  useStorageError: () => mockStorageError,
}));

describe('NotepadApp', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockMathEditing.mathEditingState.isEditing = false;
    mockConfirmDialog.dialogState.isOpen = false;
  });

  it('renders without crashing', () => {
    render(<NotepadApp />);
    expect(screen.getByTestId('layout')).toBeInTheDocument();
    expect(screen.getByTestId('markdown-editor')).toBeInTheDocument();
    expect(screen.getByTestId('markdown-preview')).toBeInTheDocument();
  });

  it('displays current note content', () => {
    render(<NotepadApp />);
    expect(screen.getByDisplayValue('Test content')).toBeInTheDocument();
  });

  it('handles content changes', async () => {
    const user = userEvent.setup();
    render(<NotepadApp />);
    
    const editor = screen.getByTestId('markdown-editor');
    await user.clear(editor);
    await user.type(editor, 'New content');
    
    expect(mockNoteManager.updateContent).toHaveBeenCalledWith('New content');
  });

  it('handles note selection', async () => {
    render(<NotepadApp />);
    
    fireEvent.click(screen.getByText('Select Note'));
    
    expect(mockNoteManager.selectNote).toHaveBeenCalledWith('note-1');
  });

  it('handles new note creation', async () => {
    render(<NotepadApp />);
    
    fireEvent.click(screen.getByText('New Note'));
    
    expect(mockNoteManager.createNewNote).toHaveBeenCalled();
  });

  it('handles math expression clicks', async () => {
    render(<NotepadApp />);
    
    fireEvent.click(screen.getByText('Math Expression'));
    
    expect(mockMathEditing.startMathEditing).toHaveBeenCalledWith(
      '\\alpha',
      expect.any(Object),
      true,
      'Test content'
    );
  });

  it('shows math editor when editing math', () => {
    mockMathEditing.mathEditingState.isEditing = true;
    mockMathEditing.mathEditingState.latex = '\\alpha';
    
    render(<NotepadApp />);
    
    expect(screen.getByTestId('math-editor')).toBeInTheDocument();
    expect(screen.getByDisplayValue('\\alpha')).toBeInTheDocument();
  });

  it('handles math editing completion', async () => {
    mockMathEditing.mathEditingState.isEditing = true;
    
    render(<NotepadApp />);
    
    fireEvent.click(screen.getByText('Complete'));
    
    expect(mockMathEditing.completeMathEditing).toHaveBeenCalled();
    expect(mockNoteManager.updateContent).toHaveBeenCalledWith('updated content');
    expect(mockMathEditing.stopMathEditing).toHaveBeenCalled();
  });

  it('handles math editing cancellation', async () => {
    mockMathEditing.mathEditingState.isEditing = true;
    
    render(<NotepadApp />);
    
    fireEvent.click(screen.getByText('Cancel'));
    
    expect(mockMathEditing.stopMathEditing).toHaveBeenCalled();
  });

  it('shows confirm dialog when open', () => {
    mockConfirmDialog.dialogState.isOpen = true;
    
    render(<NotepadApp />);
    
    expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument();
  });

  it('handles keyboard shortcuts for save (Ctrl+S)', async () => {
    const user = userEvent.setup();
    mockNoteManager.hasUnsaved = true;
    
    render(<NotepadApp />);
    
    await user.keyboard('{Control>}s{/Control}');
    
    expect(mockNoteManager.saveCurrentNote).toHaveBeenCalled();
  });

  it('handles keyboard shortcuts for new note (Ctrl+N)', async () => {
    const user = userEvent.setup();
    
    render(<NotepadApp />);
    
    await user.keyboard('{Control>}n{/Control}');
    
    expect(mockNoteManager.createNewNote).toHaveBeenCalled();
  });

  it('handles storage errors gracefully', async () => {
    mockNoteManager.selectNote.mockRejectedValue(new Error('Storage error'));
    
    render(<NotepadApp />);
    
    fireEvent.click(screen.getByText('Select Note'));
    
    await waitFor(() => {
      expect(mockStorageError.handleStorageError).toHaveBeenCalledWith(
        expect.any(Error),
        'select note'
      );
    });
  });
});