import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MarkdownPreview } from '../MarkdownPreview';
import { ErrorProvider } from '../../contexts/ErrorContext';
import React from 'react';

// Mock the error context
const mockHandleMathError = vi.fn();
vi.mock('../../contexts/ErrorContext', async () => {
  const actual = await vi.importActual('../../contexts/ErrorContext');
  return {
    ...actual,
    useMathError: () => ({
      handleMathError: mockHandleMathError
    })
  };
});

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ErrorProvider>
    {children}
  </ErrorProvider>
);

describe('MarkdownPreview', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  it('renders empty state when no content', () => {
    render(
      <TestWrapper>
        <MarkdownPreview content="" />
      </TestWrapper>
    );

    expect(screen.getByText('Start typing to see your markdown preview...')).toBeInTheDocument();
  });

  it('renders markdown content correctly', async () => {
    const content = '# Hello World\n\nThis is a **bold** text.';
    
    render(
      <TestWrapper>
        <MarkdownPreview content={content} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Hello World')).toBeInTheDocument();
      expect(screen.getByText('bold')).toBeInTheDocument();
    });
  });

  it('renders headings with correct classes', async () => {
    const content = '# H1\n## H2\n### H3\n#### H4\n##### H5\n###### H6';
    
    render(
      <TestWrapper>
        <MarkdownPreview content={content} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(document.querySelector('.preview-h1')).toBeInTheDocument();
      expect(document.querySelector('.preview-h2')).toBeInTheDocument();
      expect(document.querySelector('.preview-h3')).toBeInTheDocument();
      expect(document.querySelector('.preview-h4')).toBeInTheDocument();
      expect(document.querySelector('.preview-h5')).toBeInTheDocument();
      expect(document.querySelector('.preview-h6')).toBeInTheDocument();
    });
  });

  it('renders lists with correct classes', async () => {
    const content = '- Item 1\n- Item 2\n\n1. Numbered 1\n2. Numbered 2';
    
    render(
      <TestWrapper>
        <MarkdownPreview content={content} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(document.querySelector('.preview-ul')).toBeInTheDocument();
      expect(document.querySelector('.preview-ol')).toBeInTheDocument();
      expect(document.querySelectorAll('.preview-list-item')).toHaveLength(4);
    });
  });

  it('renders inline code with correct class', async () => {
    const content = 'This is `inline code` in text.';
    
    render(
      <TestWrapper>
        <MarkdownPreview content={content} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(document.querySelector('.preview-code-inline')).toBeInTheDocument();
      expect(screen.getByText('inline code')).toBeInTheDocument();
    });
  });

  it('renders code blocks with language header', async () => {
    const content = '```javascript\nconsole.log("Hello");\n```';
    
    render(
      <TestWrapper>
        <MarkdownPreview content={content} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(document.querySelector('.preview-code-block')).toBeInTheDocument();
      expect(document.querySelector('.code-language')).toBeInTheDocument();
      expect(screen.getByText('javascript')).toBeInTheDocument();
    });
  });

  it('renders blockquotes with correct class', async () => {
    const content = '> This is a blockquote';
    
    render(
      <TestWrapper>
        <MarkdownPreview content={content} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(document.querySelector('.preview-blockquote')).toBeInTheDocument();
    });
  });

  it('renders tables with correct classes', async () => {
    const content = '| Header 1 | Header 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |';
    
    render(
      <TestWrapper>
        <MarkdownPreview content={content} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(document.querySelector('.preview-table-wrapper')).toBeInTheDocument();
      expect(document.querySelector('.preview-table')).toBeInTheDocument();
      expect(document.querySelector('.preview-table-header')).toBeInTheDocument();
      expect(document.querySelector('.preview-table-cell')).toBeInTheDocument();
    });
  });

  it('renders external links with target="_blank"', async () => {
    const content = '[External Link](https://example.com) and [Internal Link](/internal)';
    
    render(
      <TestWrapper>
        <MarkdownPreview content={content} />
      </TestWrapper>
    );

    await waitFor(() => {
      const links = document.querySelectorAll('.preview-link');
      expect(links).toHaveLength(2);
      
      const externalLink = Array.from(links).find(link => 
        link.getAttribute('href') === 'https://example.com'
      );
      const internalLink = Array.from(links).find(link => 
        link.getAttribute('href') === '/internal'
      );
      
      expect(externalLink?.getAttribute('target')).toBe('_blank');
      expect(externalLink?.getAttribute('rel')).toBe('noopener noreferrer');
      expect(internalLink?.getAttribute('target')).toBeNull();
    });
  });

  it('renders images with lazy loading', async () => {
    const content = '![Alt text](image.jpg)';
    
    render(
      <TestWrapper>
        <MarkdownPreview content={content} />
      </TestWrapper>
    );

    await waitFor(() => {
      const img = document.querySelector('.preview-image');
      expect(img?.getAttribute('loading')).toBe('lazy');
      expect(img?.getAttribute('alt')).toBe('Alt text');
    });
  });

  it('debounces content updates', async () => {
    const { rerender } = render(
      <TestWrapper>
        <MarkdownPreview content="Initial" debounceMs={100} />
      </TestWrapper>
    );

    // Change content multiple times quickly
    rerender(
      <TestWrapper>
        <MarkdownPreview content="Change 1" debounceMs={100} />
      </TestWrapper>
    );
    
    rerender(
      <TestWrapper>
        <MarkdownPreview content="Change 2" debounceMs={100} />
      </TestWrapper>
    );
    
    rerender(
      <TestWrapper>
        <MarkdownPreview content="Final" debounceMs={100} />
      </TestWrapper>
    );

    // Should still show initial content immediately
    expect(screen.getByText('Initial')).toBeInTheDocument();

    // After debounce delay, should show final content
    await waitFor(() => {
      expect(screen.getByText('Final')).toBeInTheDocument();
    }, { timeout: 200 });
  });

  it('shows updating indicator during debounce', async () => {
    const { rerender } = render(
      <TestWrapper>
        <MarkdownPreview content="Initial" debounceMs={100} />
      </TestWrapper>
    );

    rerender(
      <TestWrapper>
        <MarkdownPreview content="Updated" debounceMs={100} />
      </TestWrapper>
    );

    expect(screen.getByText('Updating...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText('Updating...')).not.toBeInTheDocument();
    }, { timeout: 200 });
  });

  it('handles math click events', async () => {
    const mockOnMathClick = vi.fn();
    
    // Mock a KaTeX element
    const content = 'Math: $x^2$';
    
    render(
      <TestWrapper>
        <MarkdownPreview content={content} onMathClick={mockOnMathClick} />
      </TestWrapper>
    );

    // Create a mock KaTeX element
    const mockKatexElement = document.createElement('span');
    mockKatexElement.className = 'katex';
    
    const mockAnnotation = document.createElement('annotation');
    mockAnnotation.setAttribute('encoding', 'application/x-tex');
    mockAnnotation.textContent = 'x^2';
    mockKatexElement.appendChild(mockAnnotation);
    
    // Mock getBoundingClientRect
    mockKatexElement.getBoundingClientRect = vi.fn().mockReturnValue({
      x: 10, y: 20, width: 30, height: 40
    });
    
    document.body.appendChild(mockKatexElement);

    // Simulate click on math element
    fireEvent.click(mockKatexElement);

    expect(mockOnMathClick).toHaveBeenCalledWith(
      'x^2',
      expect.objectContaining({ x: 10, y: 20, width: 30, height: 40 }),
      true // isInline
    );

    document.body.removeChild(mockKatexElement);
  });

  it('identifies block math correctly', async () => {
    const mockOnMathClick = vi.fn();
    
    render(
      <TestWrapper>
        <MarkdownPreview content="$$x^2$$" onMathClick={mockOnMathClick} />
      </TestWrapper>
    );

    // Create a mock KaTeX display element
    const mockKatexElement = document.createElement('span');
    mockKatexElement.className = 'katex katex-display';
    
    const mockAnnotation = document.createElement('annotation');
    mockAnnotation.setAttribute('encoding', 'application/x-tex');
    mockAnnotation.textContent = 'x^2';
    mockKatexElement.appendChild(mockAnnotation);
    
    mockKatexElement.getBoundingClientRect = vi.fn().mockReturnValue({
      x: 10, y: 20, width: 30, height: 40
    });
    
    document.body.appendChild(mockKatexElement);

    fireEvent.click(mockKatexElement);

    expect(mockOnMathClick).toHaveBeenCalledWith(
      'x^2',
      expect.objectContaining({ x: 10, y: 20, width: 30, height: 40 }),
      false // isInline (block math)
    );

    document.body.removeChild(mockKatexElement);
  });

  it('renders horizontal rules with correct class', async () => {
    const content = '---';
    
    render(
      <TestWrapper>
        <MarkdownPreview content={content} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(document.querySelector('.preview-hr')).toBeInTheDocument();
    });
  });

  it('renders emphasis elements with correct classes', async () => {
    const content = '**bold** and *italic*';
    
    render(
      <TestWrapper>
        <MarkdownPreview content={content} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(document.querySelector('.preview-strong')).toBeInTheDocument();
      expect(document.querySelector('.preview-em')).toBeInTheDocument();
    });
  });
});