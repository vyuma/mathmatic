import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MarkdownPreview } from '../components/MarkdownPreview';
import { describe, it, expect, vi } from 'vitest';

// Mock KaTeX CSS import
vi.mock('katex/dist/katex.min.css', () => ({}));

describe('MarkdownPreview', () => {
  const sampleMarkdown = `# Heading 1

## Heading 2

This is a **bold** text and *italic* text.

### Code Examples

Inline code: \`console.log('hello')\`

\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}
\`\`\`

### Lists

- Item 1
- Item 2
  - Nested item
- Item 3

1. First item
2. Second item
3. Third item

### Math Examples

Inline math: $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$

Block math:

$$
\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}
$$

### Tables

| Name | Age | City |
|------|-----|------|
| John | 25  | NYC  |
| Jane | 30  | LA   |

### Links and Images

[GitHub](https://github.com)

> This is a blockquote
> with multiple lines

---

**Strong text** and _emphasized text_.
`;

  it('renders markdown content correctly', () => {
    render(<MarkdownPreview content={sampleMarkdown} />);
    
    // Check headings
    expect(screen.getByText('Heading 1')).toBeInTheDocument();
    expect(screen.getByText('Heading 2')).toBeInTheDocument();
    
    // Check formatted text
    expect(screen.getByText('bold')).toBeInTheDocument();
    expect(screen.getByText('italic')).toBeInTheDocument();
    
    // Check code
    expect(screen.getByText("console.log('hello')")).toBeInTheDocument();
    
    // Check lists
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('First item')).toBeInTheDocument();
    
    // Check table
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('John')).toBeInTheDocument();
    
    // Check link
    expect(screen.getByText('GitHub')).toBeInTheDocument();
    
    // Check blockquote
    expect(screen.getByText(/This is a blockquote/)).toBeInTheDocument();
  });

  it('shows empty state when content is empty', () => {
    render(<MarkdownPreview content="" />);
    expect(screen.getByText('Start typing to see your markdown preview...')).toBeInTheDocument();
  });

  it('shows empty state when content is only whitespace', () => {
    render(<MarkdownPreview content="   \n\n  \t  " />);
    expect(screen.getByText('Start typing to see your markdown preview...')).toBeInTheDocument();
  });

  it('debounces content updates', async () => {
    const { rerender } = render(<MarkdownPreview content="Initial" debounceMs={100} />);
    
    // Initial content should be rendered
    expect(screen.getByText('Initial')).toBeInTheDocument();
    
    // Update content quickly
    rerender(<MarkdownPreview content="Updated" debounceMs={100} />);
    
    // Should show updating indicator
    expect(screen.getByText('Updating...')).toBeInTheDocument();
    
    // Wait for debounce
    await waitFor(() => {
      expect(screen.getByText('Updated')).toBeInTheDocument();
    }, { timeout: 200 });
    
    // Updating indicator should be gone
    expect(screen.queryByText('Updating...')).not.toBeInTheDocument();
  });

  it('handles math click events', () => {
    const onMathClick = vi.fn();
    render(
      <MarkdownPreview 
        content="Math: $x^2 + y^2 = z^2$" 
        onMathClick={onMathClick}
      />
    );
    
    // Find and click on math element
    const mathElement = document.querySelector('.katex');
    if (mathElement) {
      // Mock getBoundingClientRect
      mathElement.getBoundingClientRect = vi.fn(() => ({
        x: 0, y: 0, width: 100, height: 20,
        top: 0, left: 0, bottom: 20, right: 100,
        toJSON: () => ({})
      }));
      
      // Mock annotation element
      const annotation = document.createElement('annotation');
      annotation.setAttribute('encoding', 'application/x-tex');
      annotation.textContent = 'x^2 + y^2 = z^2';
      mathElement.appendChild(annotation);
      
      fireEvent.click(mathElement);
      
      expect(onMathClick).toHaveBeenCalledWith(
        'x^2 + y^2 = z^2',
        expect.any(Object)
      );
    }
  });

  it('applies custom components correctly', () => {
    const content = `# Test Heading

**Bold text**

\`inline code\`

\`\`\`javascript
console.log('test');
\`\`\`

- List item

[Link](https://example.com)

> Blockquote

| Col1 | Col2 |
|------|------|
| A    | B    |
`;

    render(<MarkdownPreview content={content} />);
    
    // Check custom classes are applied
    const heading = screen.getByText('Test Heading');
    expect(heading).toHaveClass('preview-heading', 'preview-h1');
    
    const bold = screen.getByText('Bold text');
    expect(bold).toHaveClass('preview-strong');
    
    const inlineCode = screen.getByText('inline code');
    expect(inlineCode).toHaveClass('preview-code-inline');
    
    const link = screen.getByText('Link');
    expect(link).toHaveClass('preview-link');
    expect(link).toHaveAttribute('href', 'https://example.com');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('handles GFM features correctly', () => {
    const gfmContent = `# GFM Features

## Strikethrough
~~strikethrough text~~

## Task Lists
- [x] Completed task
- [ ] Incomplete task

## Tables
| Feature | Supported |
|---------|-----------|
| Tables  | ✓         |
| Tasks   | ✓         |

## Autolinks
https://github.com

## Footnotes
Here's a sentence with a footnote[^1].

[^1]: This is the footnote.
`;

    render(<MarkdownPreview content={gfmContent} />);
    
    // Check strikethrough
    expect(screen.getByText('strikethrough text')).toBeInTheDocument();
    
    // Check task lists
    expect(screen.getByText('Completed task')).toBeInTheDocument();
    expect(screen.getByText('Incomplete task')).toBeInTheDocument();
    
    // Check tables
    expect(screen.getByText('Feature')).toBeInTheDocument();
    expect(screen.getByText('Supported')).toBeInTheDocument();
  });

  it('renders math expressions correctly', () => {
    const mathContent = `# Math Examples

Inline math: $E = mc^2$

Block math:
$$
\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}
$$

Multiple inline: $a^2 + b^2 = c^2$ and $\\pi \\approx 3.14159$
`;

    render(<MarkdownPreview content={mathContent} />);
    
    // Math should be rendered (KaTeX elements should be present)
    const mathElements = document.querySelectorAll('.katex');
    expect(mathElements.length).toBeGreaterThan(0);
  });

  it('handles code blocks with language specification', () => {
    const codeContent = `# Code Examples

\`\`\`typescript
interface User {
  name: string;
  age: number;
}
\`\`\`

\`\`\`python
def hello(name):
    return f"Hello, {name}!"
\`\`\`

\`\`\`
// No language specified
console.log('test');
\`\`\`
`;

    render(<MarkdownPreview content={codeContent} />);
    
    // Check language headers
    expect(screen.getByText('TYPESCRIPT')).toBeInTheDocument();
    expect(screen.getByText('PYTHON')).toBeInTheDocument();
    
    // Check code content
    expect(screen.getByText('interface User {')).toBeInTheDocument();
    expect(screen.getByText('def hello(name):')).toBeInTheDocument();
  });

  it('handles image loading correctly', () => {
    const imageContent = `# Images

![Alt text](https://example.com/image.jpg)

![Local image](./local-image.png)
`;

    render(<MarkdownPreview content={imageContent} />);
    
    const images = screen.getAllByRole('img');
    expect(images).toHaveLength(2);
    
    images.forEach(img => {
      expect(img).toHaveClass('preview-image');
      expect(img).toHaveAttribute('loading', 'lazy');
    });
  });
});