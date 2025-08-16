import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MarkdownEditor } from '../components/MarkdownEditor';

describe('MarkdownEditor', () => {
  it('renders with placeholder text', () => {
    const mockOnChange = vi.fn();
    render(
      <MarkdownEditor 
        content="" 
        onChange={mockOnChange} 
        placeholder="Test placeholder"
      />
    );
    
    expect(screen.getByPlaceholderText('Test placeholder')).toBeInTheDocument();
  });

  it('displays the provided content', () => {
    const mockOnChange = vi.fn();
    const testContent = 'Hello, world!';
    
    render(
      <MarkdownEditor 
        content={testContent} 
        onChange={mockOnChange} 
      />
    );
    
    expect(screen.getByDisplayValue(testContent)).toBeInTheDocument();
  });

  it('calls onChange when text is typed', () => {
    const mockOnChange = vi.fn();
    render(
      <MarkdownEditor 
        content="" 
        onChange={mockOnChange} 
      />
    );
    
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'New content' } });
    
    expect(mockOnChange).toHaveBeenCalledWith('New content');
  });

  it('renders toolbar buttons', () => {
    const mockOnChange = vi.fn();
    render(
      <MarkdownEditor 
        content="" 
        onChange={mockOnChange} 
      />
    );
    
    expect(screen.getByTitle('Bold (Ctrl+B)')).toBeInTheDocument();
    expect(screen.getByTitle('Italic (Ctrl+I)')).toBeInTheDocument();
    expect(screen.getByTitle('Inline Code')).toBeInTheDocument();
    expect(screen.getByTitle('Heading')).toBeInTheDocument();
    expect(screen.getByTitle('Inline Math')).toBeInTheDocument();
  });

  it('inserts bold formatting when bold button is clicked', () => {
    const mockOnChange = vi.fn();
    render(
      <MarkdownEditor 
        content="" 
        onChange={mockOnChange} 
      />
    );
    
    const boldButton = screen.getByTitle('Bold (Ctrl+B)');
    fireEvent.click(boldButton);
    
    expect(mockOnChange).toHaveBeenCalledWith('****');
  });

  it('shows editor status information', () => {
    const mockOnChange = vi.fn();
    const testContent = 'Line 1\nLine 2\nLine 3';
    
    render(
      <MarkdownEditor 
        content={testContent} 
        onChange={mockOnChange} 
      />
    );
    
    expect(screen.getByText('Lines: 3')).toBeInTheDocument();
    expect(screen.getByText(`Characters: ${testContent.length}`)).toBeInTheDocument();
  });
});