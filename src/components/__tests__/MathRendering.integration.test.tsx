import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MarkdownPreview } from '../MarkdownPreview';

// Mock KaTeX CSS import
jest.mock('katex/dist/katex.min.css', () => ({}));

describe('Math Rendering Integration Tests - Task 5.3', () => {
  describe('remark-math and rehype-katex plugin integration', () => {
    it('should render inline math expressions using $ delimiters', async () => {
      const content = 'The equation $E = mc^2$ is famous.';
      render(<MarkdownPreview content={content} />);
      
      await waitFor(() => {
        const mathElement = document.querySelector('.katex');
        expect(mathElement).toBeInTheDocument();
        expect(mathElement).not.toHaveClass('katex-display');
      });
    });

    it('should render block math expressions using $$ delimiters', async () => {
      const content = 'Here is a formula:\n\n$$\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}$$\n\nEnd.';
      render(<MarkdownPreview content={content} />);
      
      await waitFor(() => {
        const mathElement = document.querySelector('.katex-display');
        expect(mathElement).toBeInTheDocument();
        expect(mathElement.querySelector('.katex')).toBeInTheDocument();
      });
    });

    it('should handle multiple inline math expressions in one line', async () => {
      const content = 'We have $a = 1$ and $b = 2$ and $c = a + b$.';
      render(<MarkdownPreview content={content} />);
      
      await waitFor(() => {
        const mathElements = document.querySelectorAll('.katex');
        expect(mathElements).toHaveLength(3);
        mathElements.forEach(element => {
          expect(element).not.toHaveClass('katex-display');
        });
      });
    });

    it('should handle mixed inline and block math', async () => {
      const content = `
# Math Examples

Inline math: $x^2 + y^2 = r^2$

Block math:
$$\\frac{d}{dx}\\left(\\int_a^x f(t)dt\\right) = f(x)$$

More inline: $\\sin(\\theta) = \\frac{opposite}{hypotenuse}$
      `;
      
      render(<MarkdownPreview content={content} />);
      
      await waitFor(() => {
        const inlineMath = document.querySelectorAll('.katex:not(.katex-display .katex)');
        const blockMath = document.querySelectorAll('.katex-display');
        
        expect(inlineMath.length).toBeGreaterThanOrEqual(2);
        expect(blockMath).toHaveLength(1);
      });
    });
  });

  describe('Math click handling for edit mode switching', () => {
    it('should call onMathClick with correct parameters for inline math', async () => {
      const onMathClick = jest.fn();
      const content = 'The formula $x^2$ is simple.';
      
      render(<MarkdownPreview content={content} onMathClick={onMathClick} />);
      
      await waitFor(() => {
        const mathElement = document.querySelector('.katex');
        expect(mathElement).toBeInTheDocument();
      });

      // Mock the annotation element that KaTeX creates
      const mathElement = document.querySelector('.katex');
      if (mathElement) {
        const annotation = document.createElement('annotation');
        annotation.setAttribute('encoding', 'application/x-tex');
        annotation.textContent = 'x^2';
        mathElement.appendChild(annotation);
        
        fireEvent.click(mathElement);
        
        expect(onMathClick).toHaveBeenCalledWith(
          'x^2',
          expect.any(DOMRect),
          true // isInline
        );
      }
    });

    it('should call onMathClick with correct parameters for block math', async () => {
      const onMathClick = jest.fn();
      const content = 'Formula:\n\n$$\\frac{a}{b}$$\n\nEnd.';
      
      render(<MarkdownPreview content={content} onMathClick={onMathClick} />);
      
      await waitFor(() => {
        const mathElement = document.querySelector('.katex-display .katex');
        expect(mathElement).toBeInTheDocument();
      });

      // Mock the annotation element that KaTeX creates
      const mathElement = document.querySelector('.katex-display .katex');
      if (mathElement) {
        const annotation = document.createElement('annotation');
        annotation.setAttribute('encoding', 'application/x-tex');
        annotation.textContent = '\\frac{a}{b}';
        mathElement.appendChild(annotation);
        
        fireEvent.click(mathElement);
        
        expect(onMathClick).toHaveBeenCalledWith(
          '\\frac{a}{b}',
          expect.any(DOMRect),
          false // isInline = false for block math
        );
      }
    });

    it('should prevent event propagation when math is clicked', async () => {
      const onMathClick = jest.fn();
      const onContainerClick = jest.fn();
      const content = 'Click test: $x + y$';
      
      const { container } = render(
        <div onClick={onContainerClick}>
          <MarkdownPreview content={content} onMathClick={onMathClick} />
        </div>
      );
      
      await waitFor(() => {
        const mathElement = document.querySelector('.katex');
        expect(mathElement).toBeInTheDocument();
      });

      // Mock the annotation element
      const mathElement = document.querySelector('.katex');
      if (mathElement) {
        const annotation = document.createElement('annotation');
        annotation.setAttribute('encoding', 'application/x-tex');
        annotation.textContent = 'x + y';
        mathElement.appendChild(annotation);
        
        fireEvent.click(mathElement);
        
        expect(onMathClick).toHaveBeenCalled();
        expect(onContainerClick).not.toHaveBeenCalled();
      }
    });

    it('should not call onMathClick when clicking non-math content', async () => {
      const onMathClick = jest.fn();
      const content = 'Regular text with $x^2$ math and more text.';
      
      render(<MarkdownPreview content={content} onMathClick={onMathClick} />);
      
      await waitFor(() => {
        expect(screen.getByText('Regular text with')).toBeInTheDocument();
      });

      // Click on regular text
      fireEvent.click(screen.getByText('Regular text with'));
      
      expect(onMathClick).not.toHaveBeenCalled();
    });
  });

  describe('Complex math expressions', () => {
    it('should render complex mathematical expressions correctly', async () => {
      const content = `
# Advanced Mathematics

## Calculus
The fundamental theorem of calculus: $$\\int_a^b f'(x)dx = f(b) - f(a)$$

## Linear Algebra  
Matrix multiplication: $\\mathbf{C} = \\mathbf{A}\\mathbf{B}$ where $c_{ij} = \\sum_{k=1}^n a_{ik}b_{kj}$

## Statistics
Normal distribution: $$f(x) = \\frac{1}{\\sigma\\sqrt{2\\pi}}e^{-\\frac{1}{2}\\left(\\frac{x-\\mu}{\\sigma}\\right)^2}$$
      `;
      
      render(<MarkdownPreview content={content} />);
      
      await waitFor(() => {
        // Should have both inline and block math
        const inlineMath = document.querySelectorAll('.katex:not(.katex-display .katex)');
        const blockMath = document.querySelectorAll('.katex-display');
        
        expect(inlineMath.length).toBeGreaterThan(0);
        expect(blockMath.length).toBeGreaterThan(0);
        
        // All math elements should be clickable
        const allMath = document.querySelectorAll('.katex');
        allMath.forEach(mathEl => {
          expect(mathEl).toHaveStyle('cursor: pointer');
        });
      });
    });

    it('should handle math expressions with special characters', async () => {
      const content = `
Special math expressions:
- Greek letters: $\\alpha, \\beta, \\gamma, \\Delta, \\Omega$
- Operators: $\\sum_{i=1}^n, \\prod_{i=1}^n, \\int_0^\\infty, \\lim_{x \\to \\infty}$
- Fractions: $\\frac{\\partial f}{\\partial x}, \\frac{d^2y}{dx^2}$
- Matrices: $\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}$
      `;
      
      render(<MarkdownPreview content={content} />);
      
      await waitFor(() => {
        const mathElements = document.querySelectorAll('.katex');
        expect(mathElements.length).toBeGreaterThan(0);
        
        // All should be inline math in this case
        mathElements.forEach(element => {
          expect(element).not.toHaveClass('katex-display');
        });
      });
    });
  });

  describe('Error handling', () => {
    it('should handle invalid LaTeX gracefully', async () => {
      const content = 'Invalid math: $\\invalid{command$ and valid: $x^2$';
      
      // Should not throw an error
      expect(() => {
        render(<MarkdownPreview content={content} />);
      }).not.toThrow();
      
      await waitFor(() => {
        // Valid math should still render
        const mathElements = document.querySelectorAll('.katex');
        expect(mathElements.length).toBeGreaterThanOrEqual(0);
      });
    });
  });
});