import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { Layout } from '../Layout';
import type { Note } from '../../types';

// Mock child components
vi.mock('../Header', () => ({
  Header: ({ onMenuClick, hasUnsaved, onManualSave }: any) => (
    <header data-testid="header">
      <button onClick={onMenuClick}>Menu</button>
      {hasUnsaved && <span>Unsaved</span>}
      {onManualSave && <button onClick={onManualSave}>Save</button>}
    </header>
  ),
}));

vi.mock('../Sidebar', () => ({
  Sidebar: ({ isOpen, onClose, notes, onNoteSelect, onNewNote }: any) =>
    isOpen ? (
      <aside data-testid="sidebar">
        <button onClick={onClose}>Close</button>
        <button onClick={onNewNote}>New Note</button>
        {notes?.map((note: Note) => (
          <button key={note.id} onClick={() => onNoteSelect(note.id)}>
            {note.title}
          </button>
        ))}
      </aside>
    ) : null,
}));

// Mock the touch device hook
const mockTouchDevice = {
  deviceInfo: {
    isTouch: false,
    isMobile: false,
    isTablet: false,
    screenSize: 'desktop' as const,
  },
};

vi.mock('../../hooks/useTouchDevice', () => ({
  useTouchDevice: () => mockTouchDevice,
}));

describe('Layout', () => {
  const mockNotes: Note[] = [
    { id: '1', title: 'Note 1', content: 'Content 1', createdAt: new Date(), updatedAt: new Date() },
    { id: '2', title: 'Note 2', content: 'Content 2', createdAt: new Date(), updatedAt: new Date() },
  ];

  const defaultProps = {
    children: <div data-testid="main-content">Main Content</div>,
    notes: mockNotes,
    selectedNoteId: '1',
    onNoteSelect: vi.fn(),
    onNoteDelete: vi.fn(),
    onNewNote: vi.fn(),
    isLoading: false,
    hasUnsaved: false,
    isSaving: false,
    lastSaved: null,
    saveError: null,
    onClearSaveError: vi.fn(),
    onManualSave: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockTouchDevice.deviceInfo = {
      isTouch: false,
      isMobile: false,
      isTablet: false,
      screenSize: 'desktop',
    };
  });

  it('renders without crashing', () => {
    render(<Layout {...defaultProps} />);
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('main-content')).toBeInTheDocument();
  });

  it('renders children in main content area', () => {
    render(<Layout {...defaultProps} />);
    expect(screen.getByText('Main Content')).toBeInTheDocument();
  });

  it('toggles sidebar when menu button is clicked', () => {
    render(<Layout {...defaultProps} />);
    
    // Sidebar should not be visible initially
    expect(screen.queryByTestId('sidebar')).not.toBeInTheDocument();
    
    // Click menu button
    fireEvent.click(screen.getByText('Menu'));
    
    // Sidebar should now be visible
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
  });

  it('closes sidebar when close button is clicked', () => {
    render(<Layout {...defaultProps} />);
    
    // Open sidebar
    fireEvent.click(screen.getByText('Menu'));
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    
    // Close sidebar
    fireEvent.click(screen.getByText('Close'));
    expect(screen.queryByTestId('sidebar')).not.toBeInTheDocument();
  });

  it('passes props correctly to Header', () => {
    render(<Layout {...defaultProps} hasUnsaved={true} />);
    
    expect(screen.getByText('Unsaved')).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeInTheDocument();
  });

  it('passes props correctly to Sidebar', () => {
    render(<Layout {...defaultProps} />);
    
    // Open sidebar to see its content
    fireEvent.click(screen.getByText('Menu'));
    
    expect(screen.getByText('New Note')).toBeInTheDocument();
    expect(screen.getByText('Note 1')).toBeInTheDocument();
    expect(screen.getByText('Note 2')).toBeInTheDocument();
  });

  it('handles note selection from sidebar', () => {
    render(<Layout {...defaultProps} />);
    
    // Open sidebar
    fireEvent.click(screen.getByText('Menu'));
    
    // Click on a note
    fireEvent.click(screen.getByText('Note 2'));
    
    expect(defaultProps.onNoteSelect).toHaveBeenCalledWith('2');
  });

  it('handles new note creation from sidebar', () => {
    render(<Layout {...defaultProps} />);
    
    // Open sidebar
    fireEvent.click(screen.getByText('Menu'));
    
    // Click new note button
    fireEvent.click(screen.getByText('New Note'));
    
    expect(defaultProps.onNewNote).toHaveBeenCalled();
  });

  it('applies touch-optimized class when on touch device', () => {
    mockTouchDevice.deviceInfo.isTouch = true;
    
    render(<Layout {...defaultProps} />);
    
    const layout = screen.getByTestId('header').closest('.layout');
    expect(layout).toHaveClass('touch-optimized');
  });

  it('applies mobile-optimized class when on mobile device', () => {
    mockTouchDevice.deviceInfo.isMobile = true;
    
    render(<Layout {...defaultProps} />);
    
    const layout = screen.getByTestId('header').closest('.layout');
    expect(layout).toHaveClass('mobile-optimized');
  });

  it('applies tablet-optimized class when on tablet device', () => {
    mockTouchDevice.deviceInfo.isTablet = true;
    
    render(<Layout {...defaultProps} />);
    
    const layout = screen.getByTestId('header').closest('.layout');
    expect(layout).toHaveClass('tablet-optimized');
  });

  it('applies multiple device classes when appropriate', () => {
    mockTouchDevice.deviceInfo = {
      isTouch: true,
      isMobile: false,
      isTablet: true,
      screenSize: 'tablet',
    };
    
    render(<Layout {...defaultProps} />);
    
    const layout = screen.getByTestId('header').closest('.layout');
    expect(layout).toHaveClass('touch-optimized');
    expect(layout).toHaveClass('tablet-optimized');
    expect(layout).not.toHaveClass('mobile-optimized');
  });

  it('handles manual save from header', () => {
    render(<Layout {...defaultProps} />);
    
    fireEvent.click(screen.getByText('Save'));
    
    expect(defaultProps.onManualSave).toHaveBeenCalled();
  });
});