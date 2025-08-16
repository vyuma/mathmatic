import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MarkdownEditor } from '../MarkdownEditor';

// Mock MathLive since it requires DOM APIs not available in test environment
jest.mock('mathlive', () => ({
  MathfieldElement: class MockMathfieldElement extends HTMLElement {
    value = '';
    
    setOptions() {}
    focus() {}
    blur() {}
    insert() {}
    
    addEventListener(event: string, handler: EventListener) {
      super.addEventListener(event, handler);
    }
    
    removeEventListener(event: string, handler: EventListener) {
      super.removeEventListener(event, handler);
    }
  }
}));

describe('MarkdownEditor', () => {
  const defaultProps = {
    content: '',
    onChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<MarkdownEditor {...defaultProps} />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('displays the provided content', () => {
    const content = 'Hello, world!';
    render(<MarkdownEditor {...defaultProps} content={content} />);
    expect(screen.getByDisplayValue(content)).toBeInTheDocument();
  });

  it('calls onChange when content is modified', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    
    render(<MarkdownEditor {...defaultProps} onChange={onChange} />);
    
    const textarea = screen.getByRole('textbox');
    await user.type(textarea, 'Hello');
    
    expect(onChange).toHaveBeenCalled();
  });

  it('shows math editor when inline math button is clicked', async () => {
    const user = userEvent.setup();
    
    render(<MarkdownEditor {...defaultProps} />);
    
    const mathButton = screen.getByTitle('Inline Math (Ctrl+M)');
    await user.click(mathButton);
    
    // Math editor should be visible
    await waitFor(() => {
      expect(document.querySelector('.math-editor-overlay')).toBeInTheDocument();
    });
  });

  it('shows math editor when Ctrl+M is pressed', async () => {
    const user = userEvent.setup();
    
    render(<MarkdownEditor {...defaultProps} />);
    
    const textarea = screen.getByRole('textbox');
    textarea.focus();
    
    await user.keyboard('{Control>}m{/Control}');
    
    // Math editor should be visible
    await waitFor(() => {
      expect(document.querySelector('.math-editor-overlay')).toBeInTheDocument();
    });
  });

  it('shows math block editor when Ctrl+Shift+M is pressed', async () => {
    const user = userEvent.setup();
    
    render(<MarkdownEditor {...defaultProps} />);
    
    const textarea = screen.getByRole('textbox');
    textarea.focus();
    
    await user.keyboard('{Control>}{Shift>}M{/Shift}{/Control}');
    
    // Math editor should be visible
    await waitFor(() => {
      expect(document.querySelector('.math-editor-overlay')).toBeInTheDocument();
    });
  });

  it('applies math-mode class when math editor is active', async () => {
    const user = userEvent.setup();
    
    render(<MarkdownEditor {...defaultProps} />);
    
    const mathButton = screen.getByTitle('Inline Math (Ctrl+M)');
    await user.click(mathButton);
    
    await waitFor(() => {
      const editor = document.querySelector('.markdown-editor');
      expect(editor).toHaveClass('math-mode');
    });
  });

  it('inserts bold formatting when bold button is clicked', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    
    render(<MarkdownEditor {...defaultProps} onChange={onChange} />);
    
    const boldButton = screen.getByTitle('Bold (Ctrl+B)');
    await user.click(boldButton);
    
    expect(onChange).toHaveBeenCalledWith('****');
  });

  it('displays placeholder text', () => {
    const placeholder = 'Start typing...';
    render(<MarkdownEditor {...defaultProps} placeholder={placeholder} />);
    
    expect(screen.getByPlaceholderText(placeholder)).toBeInTheDocument();
  });

  it('shows editor status information', () => {
    const content = 'Line 1\nLine 2\nLine 3';
    render(<MarkdownEditor {...defaultProps} content={content} />);
    
    expect(screen.getByText('Lines: 3')).toBeInTheDocument();
    expect(screen.getByText(`Characters: ${content.length}`)).toBeInTheDocument();
  });
});