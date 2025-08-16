import { describe, it, expect } from 'vitest';
import { 
  processMarkdownToHTML,
  generateHTMLDocument,
  getInlineKatexCSS
} from '../markdownProcessor';

describe('markdownProcessor', () => {
  describe('processMarkdownToHTML', () => {
    it('should process basic markdown correctly', async () => {
      const markdown = '# Heading\n\nThis is **bold** and *italic* text.';
      const html = await processMarkdownToHTML(markdown);
      
      expect(html).toContain('<h1>Heading</h1>');
      expect(html).toContain('<strong>bold</strong>');
      expect(html).toContain('<em>italic</em>');
    });

    it('should process math expressions', async () => {
      const markdown = 'Inline $x^2$ and block $$\\sum_{i=1}^n x_i$$';
      const html = await processMarkdownToHTML(markdown);
      
      // Should contain KaTeX rendered math
      expect(html).toContain('katex');
    });

    it('should handle empty markdown', async () => {
      const html = await processMarkdownToHTML('');
      
      expect(html).toBe('');
    });

    it('should handle GFM features', async () => {
      const markdown = '| Header 1 | Header 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |';
      const html = await processMarkdownToHTML(markdown);
      
      expect(html).toContain('<table>');
      expect(html).toContain('<th>Header 1</th>');
      expect(html).toContain('<td>Cell 1</td>');
    });

    it('should throw error for processing failures', async () => {
      // Mock a processing error by passing invalid input to unified
      await expect(processMarkdownToHTML(null as any)).rejects.toThrow('Failed to process markdown');
    });
  });

  describe('generateHTMLDocument', () => {
    it('should generate complete HTML document', () => {
      const title = 'Test Document';
      const content = '<h1>Test Content</h1><p>This is a test.</p>';
      
      const html = generateHTMLDocument(title, content);
      
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('<title>Test Document</title>');
      expect(html).toContain('<h1>Test Content</h1>');
      expect(html).toContain('katex.min.css');
    });

    it('should include metadata when requested', () => {
      const title = 'Test Document';
      const content = '<p>Content</p>';
      const note = {
        id: 'test-note',
        title: 'Test Note',
        content: 'Test content',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
        tags: ['test', 'example']
      };
      
      const html = generateHTMLDocument(title, content, {
        includeMetadata: true,
        note
      });
      
      expect(html).toContain('Document Information');
      expect(html).toContain('Test Note');
      expect(html).toContain('test, example');
      expect(html).toContain('test-note');
    });

    it('should use minimal styling when requested', () => {
      const title = 'Test Document';
      const content = '<p>Content</p>';
      
      const html = generateHTMLDocument(title, content, {
        styling: 'minimal'
      });
      
      expect(html).toContain('font-family: serif');
      expect(html).not.toContain('BlinkMacSystemFont'); // Full styling font stack
    });

    it('should escape HTML in title and metadata', () => {
      const title = 'Test <script>alert("xss")</script> Document';
      const content = '<p>Content</p>';
      
      const html = generateHTMLDocument(title, content);
      
      expect(html).toContain('&lt;script&gt;');
      expect(html).not.toContain('<script>alert("xss")</script>');
    });
  });

  describe('getInlineKatexCSS', () => {
    it('should return CSS string', async () => {
      const css = await getInlineKatexCSS();
      
      expect(typeof css).toBe('string');
      expect(css).toContain('KaTeX CSS');
    });
  });
});