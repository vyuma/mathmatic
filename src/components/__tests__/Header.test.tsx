import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { Header } from '../Header';

// Mock child components
vi.mock('../SaveStatus', () => ({
  SaveStatus: ({ isSaving, hasUnsaved, saveError, onClearError }: any) => (
    <div data-testid="save-status">
      {isSaving && <span>Saving...</span>}
      {hasUnsaved && <span>Unsaved changes</span>}
      {saveError && (
        <div>
          <span>Error: {saveError}</span>
          <button onClick={onClearError}>Clear Error</button>
        </div>
      )}
    </div>
  ),
}));

vi.mock('../SaveButton', () => ({
  SaveButton: ({ onSave, isSaving, hasUnsaved }: any) => (
    <button
      data-testid="save-button"
      onClick={onSave}
      disabled={isSaving || !hasUnsaved}
    >
      {isSaving ? 'Saving...' : 'Save'}
    </button>
  ),
}));

describe('Header', () => {
  const defaultProps = {
    onMenuClick: vi.fn(),
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
  });

  it('renders without crashing', () => {
    render(<Header {...defaultProps} />);
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByText('Math Markdown Notepad')).toBeInTheDocument();
  });

  it('renders menu button with correct accessibility', () => {
    render(<Header {...defaultProps} />);
    
    const menuButton = screen.getByLabelText('Toggle menu');
    expect(menuButton).toBeInTheDocument();
    expect(menuButton).toHaveTextContent('☰');
  });

  it('calls onMenuClick when menu button is clicked', () => {
    render(<Header {...defaultProps} />);
    
    fireEvent.click(screen.getByLabelText('Toggle menu'));
    
    expect(defaultProps.onMenuClick).toHaveBeenCalledTimes(1);
  });

  it('shows loading indicator when isLoading is true', () => {
    render(<Header {...defaultProps} isLoading={true} />);
    
    expect(screen.getByText('⏳', { exact: false })).toBeInTheDocument();
  });

  it('shows unsaved indicator when hasUnsaved is true', () => {
    render(<Header {...defaultProps} hasUnsaved={true} />);
    
    expect(screen.getByText('•', { exact: false })).toBeInTheDocument();
  });

  it('shows both loading and unsaved indicators when both are true', () => {
    render(<Header {...defaultProps} isLoading={true} hasUnsaved={true} />);
    
    expect(screen.getByText('⏳', { exact: false })).toBeInTheDocument();
    expect(screen.getByText('•', { exact: false })).toBeInTheDocument();
  });

  it('renders SaveStatus component with correct props', () => {
    render(<Header {...defaultProps} isSaving={true} hasUnsaved={true} />);
    
    expect(screen.getByTestId('save-status')).toBeInTheDocument();
    expect(screen.getByText('Saving...')).toBeInTheDocument();
    expect(screen.getByText('Unsaved changes')).toBeInTheDocument();
  });

  it('renders SaveButton when onManualSave is provided', () => {
    render(<Header {...defaultProps} hasUnsaved={true} />);
    
    expect(screen.getByTestId('save-button')).toBeInTheDocument();
  });

  it('does not render SaveButton when onManualSave is not provided', () => {
    const propsWithoutSave = { ...defaultProps };
    delete propsWithoutSave.onManualSave;
    
    render(<Header {...propsWithoutSave} />);
    
    expect(screen.queryByTestId('save-button')).not.toBeInTheDocument();
  });

  it('passes correct props to SaveButton', () => {
    render(<Header {...defaultProps} isSaving={true} hasUnsaved={true} />);
    
    const saveButton = screen.getByTestId('save-button');
    expect(saveButton).toHaveTextContent('Saving...');
    expect(saveButton).toBeDisabled();
  });

  it('handles save error display and clearing', () => {
    render(<Header {...defaultProps} saveError="Failed to save" />);
    
    expect(screen.getByText('Error: Failed to save')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('Clear Error'));
    
    expect(defaultProps.onClearSaveError).toHaveBeenCalledTimes(1);
  });

  it('renders settings button', () => {
    render(<Header {...defaultProps} />);
    
    const settingsButton = screen.getByLabelText('Settings');
    expect(settingsButton).toBeInTheDocument();
    expect(settingsButton).toHaveTextContent('⚙️');
  });

  it('has correct header structure and classes', () => {
    render(<Header {...defaultProps} />);
    
    const header = screen.getByRole('banner');
    expect(header).toHaveClass('header');
    
    expect(screen.getByText('Math Markdown Notepad').closest('.header-left')).toBeInTheDocument();
    expect(screen.getByTestId('save-status').closest('.header-right')).toBeInTheDocument();
  });

  it('handles all props being undefined gracefully', () => {
    const minimalProps = {
      onMenuClick: vi.fn(),
    };
    
    render(<Header {...minimalProps} />);
    
    expect(screen.getByText('Math Markdown Notepad')).toBeInTheDocument();
    expect(screen.getByTestId('save-status')).toBeInTheDocument();
  });
});