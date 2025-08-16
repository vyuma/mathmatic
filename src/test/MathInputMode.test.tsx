import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MarkdownEditor } from '../components/MarkdownEditor';
import { getMathExpressionAtPosition, insertMathExpression, replaceMathExpression } from '../utils/mathUtils';

// Mock MathEditor component since it depends on MathLive
jest.mock('../components/MathEditor', () => ({
  MathEditor: ({ value, onChange, onComplete, onCancel, isVisible }: any) => {
    if (!isVisible) return null;
    return (
      <div data-testid="math-editor">
        <input
          data-testid="math-input"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
        />
        <button data-testid="math-complete" onClick={() => onComplete?.()}>
          Complete
        </button>
        <button data-testid="math-cancel" onClick={() => onCancel?.()}>
          Cancel
        </button>
      </div>
    );
  }
}));

describe('Math Input Mode', () => {
  const defaultProps = {
    content: '',
    onChange: jest.fn(),
    onCursorPositionChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Math Input Triggers', () => {
    it('should trigger inline math input with Ctrl+M', async () => {
      const user = userEvent.setup();
      render(<MarkdownEditor {...defaultProps} />);
      
      const textarea = screen.getByRole('textbox');
      await user.click(textarea);
      
      // Trigger inline math input
      await user.keyboard('{Control>}m{/Control}');
      
      // Math editor should be visible
      expect(screen.getByTestId('math-editor')).toBeInTheDocument();
    });

    it('should trigger block math input with Ctrl+Shift+M', async () => {
      const user = userEvent.setup();
      render(<MarkdownEditor {...defaultProps} />);
      
      const textarea = screen.getByRole('textbox');
      await user.click(textarea);
      
      // Trigger block math input
      await user.keyboard('{Control>}{Shift>}M{/Shift}{/Control}');
      
      // Math editor should be visible
      expect(screen.getByTestId('math-editor')).toBeInTheDocument();
    });

    it('should trigger inline math input from toolbar button', async () => {
      const user = userEvent.setup();
      render(<MarkdownEditor {...defaultProps} />);
      
      const inlineMathButton = screen.getByTitle('Inline Math (Ctrl+M)');
      await user.click(inlineMathButton);
      
      // Math editor should be visible
      expect(screen.getByTestId('math-editor')).toBeInTheDocument();
    });

    it('should trigger block math input from toolbar button', async () => {
      const user = userEvent.setup();
      render(<MarkdownEditor {...defaultProps} />);
      
      const blockMathButton = screen.getByTitle('Math Block (Ctrl+Shift+M)');
      await user.click(blockMathButton);
      
      // Math editor should be visible
      expect(screen.getByTestId('math-editor')).toBeInTheDocument();
    });
  });

  describe('Math Expression Insertion', () => {
    it('should insert inline math expression when completed', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      render(<MarkdownEditor {...defaultProps} onChange={onChange} />);
      
      const textarea = screen.getByRole('textbox');
      await user.click(textarea);
      
      // Trigger inline math input
      await user.keyboard('{Control>}m{/Control}');
      
      // Enter LaTeX expression
      const mathInput = screen.getByTestId('math-input');
      await user.type(mathInput, 'x^2 + y^2 = z^2');
      
      // Complete the math input
      const completeButton = screen.getByTestId('math-complete');
      await user.click(completeButton);
      
      // Should call onChange with the math expression inserted
      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith('$x^2 + y^2 = z^2$');
      });
      
      // Math editor should be hidden
      expect(screen.queryByTestId('math-editor')).not.toBeInTheDocument();
    });

    it('should insert block math expression when completed', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      render(<MarkdownEditor {...defaultProps} onChange={onChange} />);
      
      const textarea = screen.getByRole('textbox');
      await user.click(textarea);
      
      // Trigger block math input
      await user.keyboard('{Control>}{Shift>}M{/Shift}{/Control}');
      
      // Enter LaTeX expression
      const mathInput = screen.getByTestId('math-input');
      await user.type(mathInput, '\\sum_{i=1}^{n} x_i');
      
      // Complete the math input
      const completeButton = screen.getByTestId('math-complete');
      await user.click(completeButton);
      
      // Should call onChange with the block math expression inserted
      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith('\n$$\n\\sum_{i=1}^{n} x_i\n$$\n');
      });
    });

    it('should cancel math input without inserting anything', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      render(<MarkdownEditor {...defaultProps} onChange={onChange} />);
      
      const textarea = screen.getByRole('textbox');
      await user.click(textarea);
      
      // Trigger inline math input
      await user.keyboard('{Control>}m{/Control}');
      
      // Enter LaTeX expression
      const mathInput = screen.getByTestId('math-input');
      await user.type(mathInput, 'x^2');
      
      // Cancel the math input
      const cancelButton = screen.getByTestId('math-cancel');
      await user.click(cancelButton);
      
      // Should not call onChange
      expect(onChange).not.toHaveBeenCalled();
      
      // Math editor should be hidden
      expect(screen.queryByTestId('math-editor')).not.toBeInTheDocument();
    });
  });

  describe('Math Expression Editing', () => {
    it('should edit existing inline math expression on double-click', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      const content = 'Here is some math: $x^2 + y^2$ and more text.';
      
      render(<MarkdownEditor {...defaultProps} content={content} onChange={onChange} />);
      
      const textarea = screen.getByRole('textbox');
      
      // Position cursor inside the math expression and double-click
      fireEvent.click(textarea);
      textarea.setSelectionRange(25, 25); // Inside "$x^2 + y^2$"
      fireEvent.doubleClick(textarea);
      
      // Math editor should be visible with existing LaTeX
      await waitFor(() => {
        expect(screen.getByTestId('math-editor')).toBeInTheDocument();
        expect(screen.getByTestId('math-input')).toHaveValue('x^2 + y^2');
      });
    });

    it('should replace existing math expression when edited', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      const content = 'Math: $x^2$ here.';
      
      render(<MarkdownEditor {...defaultProps} content={content} onChange={onChange} />);
      
      const textarea = screen.getByRole('textbox');
      
      // Position cursor inside the math expression and double-click
      fireEvent.click(textarea);
      textarea.setSelectionRange(8, 8); // Inside "$x^2$"
      fireEvent.doubleClick(textarea);
      
      await waitFor(() => {
        expect(screen.getByTestId('math-editor')).toBeInTheDocument();
      });
      
      // Clear and enter new LaTeX
      const mathInput = screen.getByTestId('math-input');
      await user.clear(mathInput);
      await user.type(mathInput, 'y^3');
      
      // Complete the edit
      const completeButton = screen.getByTestId('math-complete');
      await user.click(completeButton);
      
      // Should replace the existing math expression
      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith('Math: $y^3$ here.');
      });
    });
  });

  describe('Math Utilities', () => {
    describe('getMathExpressionAtPosition', () => {
      it('should detect inline math expression at cursor position', () => {
        const content = 'Text $x^2 + y^2$ more text';
        const position = 8; // Inside the math expression
        
        const result = getMathExpressionAtPosition(content, position);
        
        expect(result).toEqual({
          latex: 'x^2 + y^2',
          start: 5,
          end: 16,
          isInline: true,
          raw: '$x^2 + y^2$'
        });
      });

      it('should detect block math expression at cursor position', () => {
        const content = 'Text $$\\sum_{i=1}^n x_i$$ more';
        const position = 10; // Inside the math expression
        
        const result = getMathExpressionAtPosition(content, position);
        
        expect(result).toEqual({
          latex: '\\sum_{i=1}^n x_i',
          start: 5,
          end: 25,
          isInline: false,
          raw: '$$\\sum_{i=1}^n x_i$$'
        });
      });

      it('should return null when cursor is not in math expression', () => {
        const content = 'Text $x^2$ more text';
        const position = 0; // Before math expression
        
        const result = getMathExpressionAtPosition(content, position);
        
        expect(result).toBeNull();
      });
    });

    describe('insertMathExpression', () => {
      it('should insert inline math expression', () => {
        const content = 'Hello world';
        const position = 6; // After "Hello "
        const latex = 'x^2';
        
        const result = insertMathExpression(content, position, latex, true);
        
        expect(result.content).toBe('Hello $x^2$world');
        expect(result.newCursorPosition).toBe(11); // After the inserted math
      });

      it('should insert block math expression', () => {
        const content = 'Hello world';
        const position = 6; // After "Hello "
        const latex = '\\sum x_i';
        
        const result = insertMathExpression(content, position, latex, false);
        
        expect(result.content).toBe('Hello \n$$\n\\sum x_i\n$$\nworld');
        expect(result.newCursorPosition).toBe(23); // After the inserted math block
      });
    });

    describe('replaceMathExpression', () => {
      it('should replace inline math expression', () => {
        const content = 'Text $x^2$ more';
        const expression = {
          latex: 'x^2',
          start: 5,
          end: 10,
          isInline: true,
          raw: '$x^2$'
        };
        const newLatex = 'y^3';
        
        const result = replaceMathExpression(content, expression, newLatex);
        
        expect(result).toBe('Text $y^3$ more');
      });

      it('should replace block math expression', () => {
        const content = 'Text $$x^2$$ more';
        const expression = {
          latex: 'x^2',
          start: 5,
          end: 12,
          isInline: false,
          raw: '$$x^2$$'
        };
        const newLatex = '\\sum y_i';
        
        const result = replaceMathExpression(content, expression, newLatex);
        
        expect(result).toBe('Text $$\n\\sum y_i\n$$ more');
      });
    });
  });

  describe('Math Input State Management', () => {
    it('should show math editor at correct position', async () => {
      const user = userEvent.setup();
      render(<MarkdownEditor {...defaultProps} />);
      
      const textarea = screen.getByRole('textbox');
      await user.click(textarea);
      
      // Trigger math input
      await user.keyboard('{Control>}m{/Control}');
      
      // Math editor should be positioned as overlay
      const mathEditor = screen.getByTestId('math-editor');
      expect(mathEditor.parentElement).toHaveStyle({
        position: 'fixed',
        zIndex: '1000'
      });
    });

    it('should update math input state when typing', async () => {
      const user = userEvent.setup();
      render(<MarkdownEditor {...defaultProps} />);
      
      const textarea = screen.getByRole('textbox');
      await user.click(textarea);
      
      // Trigger math input
      await user.keyboard('{Control>}m{/Control}');
      
      // Type in math input
      const mathInput = screen.getByTestId('math-input');
      await user.type(mathInput, 'x^2');
      
      // Math input should reflect the typed value
      expect(mathInput).toHaveValue('x^2');
    });

    it('should focus back to textarea after math completion', async () => {
      const user = userEvent.setup();
      render(<MarkdownEditor {...defaultProps} />);
      
      const textarea = screen.getByRole('textbox');
      await user.click(textarea);
      
      // Trigger math input
      await user.keyboard('{Control>}m{/Control}');
      
      // Complete math input
      const completeButton = screen.getByTestId('math-complete');
      await user.click(completeButton);
      
      // Textarea should be focused again
      await waitFor(() => {
        expect(textarea).toHaveFocus();
      });
    });
  });
});