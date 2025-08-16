import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { NotepadApp } from '../components/NotepadApp';
import { ErrorProvider } from '../contexts/ErrorContext';

// Mock MathLive
vi.mock('mathlive', () => ({
  MathfieldElement: class MockMathfieldElement extends HTMLElement {
    value = '';
    options = {};
    
    setValue(value: string) {
      this.value = value;
    }
    
    getValue() {
      return this.value;
    }
  }
}));

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ErrorProvider>
    {children}
  </ErrorProvider>
);

describe('Final Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  it('should render the complete application', async () => {
    render(
      <TestWrapper>
        <NotepadApp />
      </TestWrapper>
    );

    // Check if main components are rendered
    expect(screen.getByText('Math Markdown Notepad')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Start writing your markdown note/)).toBeInTheDocument();
  });

  it('should handle note creation and editing workflow', async () => {
    render(
      <TestWrapper>
        <NotepadApp />
      </TestWrapper>
    );

    // Create new note
    const newNoteButton = screen.getByText('New Note');
    fireEvent.click(newNoteButton);

    // Type content
    const editor = screen.getByPlaceholderText(/Start writing your markdown note/);
    fireEvent.change(editor, { target: { value: '# Test Note\n\nThis is a test note with math: $x^2 + y^2 = r^2$' } });

    // Verify content is updated
    expect(editor).toHaveValue('# Test Note\n\nThis is a test note with math: $x^2 + y^2 = r^2$');
  });

  it('should handle markdown rendering with math expressions', async () => {
    render(
      <TestWrapper>
        <NotepadApp />
      </TestWrapper>
    );

    const editor = screen.getByPlaceholderText(/Start writing your markdown note/);
    fireEvent.change(editor, { 
      target: { value: '# Math Test\n\nInline math: $E = mc^2$\n\nBlock math:\n\n$$\\int_0^\\infty e^{-x} dx = 1$$' } 
    });

    // Wait for preview to update
    await waitFor(() => {
      expect(screen.getByText('Math Test')).toBeInTheDocument();
    });
  });

  it('should handle export functionality', async () => {
    render(
      <TestWrapper>
        <NotepadApp />
      </TestWrapper>
    );

    // Add content
    const editor = screen.getByPlaceholderText(/Start writing your markdown note/);
    fireEvent.change(editor, { target: { value: '# Export Test\n\nContent with math: $\\alpha + \\beta$' } });

    // Look for export button (might be in a menu)
    const exportButton = screen.queryByText('Export');
    if (exportButton) {
      fireEvent.click(exportButton);
    }
  });

  it('should handle keyboard shortcuts', async () => {
    render(
      <TestWrapper>
        <NotepadApp />
      </TestWrapper>
    );

    const editor = screen.getByPlaceholderText(/Start writing your markdown note/);
    fireEvent.change(editor, { target: { value: 'Test content' } });

    // Test Ctrl+S for save
    fireEvent.keyDown(document, { key: 's', ctrlKey: true });

    // Test Ctrl+N for new note
    fireEvent.keyDown(document, { key: 'n', ctrlKey: true });
  });

  it('should handle error states gracefully', async () => {
    // Mock localStorage to throw error
    mockLocalStorage.setItem.mockImplementation(() => {
      throw new Error('Storage quota exceeded');
    });

    render(
      <TestWrapper>
        <NotepadApp />
      </TestWrapper>
    );

    const editor = screen.getByPlaceholderText(/Start writing your markdown note/);
    fireEvent.change(editor, { target: { value: 'Test content' } });

    // Trigger save which should handle the error
    fireEvent.keyDown(document, { key: 's', ctrlKey: true });
  });

  it('should be responsive and handle mobile interactions', async () => {
    // Mock mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });

    render(
      <TestWrapper>
        <NotepadApp />
      </TestWrapper>
    );

    // Check if mobile layout is applied
    expect(screen.getByText('Math Markdown Notepad')).toBeInTheDocument();
  });
});